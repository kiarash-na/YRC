"use server";

import { createGateway, type LanguageModel, type ModelMessage } from "ai";

import { requireAdmin } from "@/lib/admin";
import { agentConfigured, gatewayApiKey } from "@/lib/agent/config";
import { runAgentTurn, type LoopTool, type PendingCall, type TurnResult } from "@/lib/agent/loop";
import { DEFAULT_AGENT_MODEL, isAgentModel } from "@/lib/agent/models";
import { agentLoopTools, ToolInputError } from "@/lib/agent/tools";
import { isE2ERequest } from "@/lib/e2e";
import { NewsletterError } from "@/lib/newsletter";

/**
 * Admin Agent server action. Runs the provider-neutral tool loop
 * (src/lib/agent/loop.ts) on the model the admin picked, through the Vercel
 * AI Gateway. Read-only tools run immediately; mutating tool calls pause the
 * turn and come back as `pending` for the admin to confirm.
 * The client holds the transcript (ModelMessage[]) and sends it back.
 */

export type AgentMessage = ModelMessage;
export type { PendingCall };
export type AgentResult = TurnResult;

const SYSTEM = `You are "Agent", the operations assistant inside the admin dashboard of Yas Rise Community (YRC), a running community (website yasrise.run). The person talking to you is a signed-in YRC admin.

You manage the site through tools: events (create, edit, duplicate, delete, who registered / checked in), members and points, the scoring menu, admin seats, and the Resend newsletter (subscribers, broadcast drafts, sending, one-off emails, delivery stats).

How to work:
- Look things up with the read tools before changing anything; never guess slugs, ids or current values.
- If required details are missing (e.g. an event's date, city, cover image path), ask the admin for them instead of inventing content.
- Every change-making tool call is shown to the admin for confirmation before it runs. Call the tool directly when the request is clear; don't ask "shall I?" in text first. If a call comes back "Declined by the admin", don't retry it — ask what they want instead.
- For newsletters: draft first with create_broadcast_draft and summarise it; only send when the admin explicitly asks to send.
- Event covers are ImageKit paths like /YRC/Community/IMG_2469.JPG. Times are Europe/Berlin. Categories: race, training, social, camp.
- Reply briefly and plainly, in the admin's language. Use short lists for multiple items. After changes, say what changed and link pages as relative paths (e.g. /events/<slug>).`;

function berlinToday(): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Berlin",
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date());
}

/**
 * Advance the conversation. Pass the transcript (ending with a new user
 * message, or with an assistant step awaiting approval plus `approvals`)
 * and the model id the admin picked.
 */
export async function agentTurn(
  history: AgentMessage[],
  approvals?: Record<string, boolean>,
  modelId?: string,
): Promise<AgentResult> {
  const { seat } = await requireAdmin();
  const id = isAgentModel(modelId) ? modelId : DEFAULT_AGENT_MODEL;

  let model: LanguageModel;
  let tools: Map<string, LoopTool>;
  if (await isE2ERequest()) {
    // Token-free test mode: scripted model + in-memory tools (no DB, no API).
    const fixtures = await import("@/lib/agent/e2e-fixtures");
    model = fixtures.scriptedAgentModel(id);
    tools = fixtures.fixtureAgentTools();
  } else {
    if (!(await agentConfigured())) {
      return {
        ok: false,
        error: "The AI Gateway isn't configured. Set VERCEL_AI_GATEWAY in this environment.",
        messages: history,
      };
    }
    model = createGateway({ apiKey: gatewayApiKey() })(id);
    tools = agentLoopTools({ seatId: seat.id });
  }

  return runAgentTurn({
    model,
    instructions: `${SYSTEM}\n\nToday is ${berlinToday()} (Europe/Berlin).`,
    tools,
    history,
    approvals,
    isExpectedToolError: (error) => error instanceof ToolInputError || error instanceof NewsletterError,
  });
}
