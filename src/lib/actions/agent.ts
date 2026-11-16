"use server";

import Anthropic from "@anthropic-ai/sdk";

import { requireAdmin } from "@/lib/admin";
import { AGENT_TOOLS, TOOL_DEFINITIONS, ToolInputError } from "@/lib/agent/tools";
import { NewsletterError } from "@/lib/newsletter";

/**
 * Admin Agent: a manual tool-use loop. Read-only tools run as soon as the
 * model asks for them; any turn that contains a mutating tool call pauses and
 * returns the calls to the UI, where the admin confirms or declines each one.
 * The client holds the transcript and sends it back with each turn.
 */

type Message = Anthropic.Beta.BetaMessageParam;

export interface PendingCall {
  id: string;
  name: string;
  summary: string;
  input: Record<string, unknown>;
}

export type AgentResult =
  | { ok: true; messages: Message[]; pending: PendingCall[] }
  | { ok: false; error: string; messages: Message[] };

const MODEL = "claude-opus-5-5";
const MAX_STEPS = 12;

const SYSTEM = `You are "Agent", the operations assistant inside the admin dashboard of Yas Rise Community (YRC), a running community (website yasrise.run). The person talking to you is a signed-in YRC admin.

You manage the site through tools: events (create, edit, duplicate, delete, who registered / checked in), members and points, the scoring menu, admin seats, and the Resend newsletter (subscribers, broadcast drafts, sending, one-off emails, delivery stats).

How to work:
- Look things up with the read tools before changing anything; never guess slugs, ids or current values.
- If required details are missing (e.g. an event's date, city, cover image path), ask the admin for them instead of inventing content.
- Every change-making tool call is shown to the admin for confirmation before it runs. Call the tool directly when the request is clear; don't ask "shall I?" in text first. If a call comes back "Declined by the admin", don't retry it — ask what they want instead.
- For newsletters: draft first with create_broadcast_draft and summarise it; only send when the admin explicitly asks to send.
- Event covers are ImageKit paths like /YRC/Community/IMG_2469.JPG. Times are Europe/Berlin. Categories: race, training, social, camp.
- Reply briefly and plainly, in the admin's language. Use short lists for multiple items. After changes, say what changed and link pages as relative paths (e.g. /events/<slug>).`;

function client(): Anthropic {
  return new Anthropic(); // reads ANTHROPIC_API_KEY
}

function berlinToday(): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Berlin",
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date());
}

function toolUses(content: Message["content"]): Anthropic.Beta.BetaToolUseBlockParam[] {
  if (!content || typeof content === "string") return [];
  const calls: Anthropic.Beta.BetaToolUseBlockParam[] = [];
  for (const block of content) if (block.type === "tool_use") calls.push(block);
  return calls;
}

async function execute(
  call: Anthropic.Beta.BetaToolUseBlockParam,
  seatId: string,
): Promise<Anthropic.Beta.BetaToolResultBlockParam> {
  const tool = AGENT_TOOLS.get(call.name);
  if (!tool) {
    return { type: "tool_result", tool_use_id: call.id, is_error: true, content: `Unknown tool ${call.name}.` };
  }
  try {
    const result = await tool.run((call.input ?? {}) as Record<string, unknown>, { seatId });
    const text = JSON.stringify(result ?? { ok: true });
    return {
      type: "tool_result",
      tool_use_id: call.id,
      content: text.length > 60_000 ? `${text.slice(0, 60_000)}… (truncated)` : text,
    };
  } catch (error) {
    const known = error instanceof ToolInputError || error instanceof NewsletterError;
    if (!known) console.error(`agent tool ${call.name} failed:`, error);
    return {
      type: "tool_result",
      tool_use_id: call.id,
      is_error: true,
      content: error instanceof Error ? error.message : "Tool failed.",
    };
  }
}

function pendingFor(calls: Anthropic.Beta.BetaToolUseBlockParam[]): PendingCall[] {
  return calls
    .filter((c) => AGENT_TOOLS.get(c.name)?.mutates)
    .map((c) => {
      const input = (c.input ?? {}) as Record<string, unknown>;
      return { id: c.id, name: c.name, input, summary: AGENT_TOOLS.get(c.name)!.summarize(input) };
    });
}

/**
 * Advance the conversation. Pass the transcript (ending with a new user
 * message, or with an assistant turn awaiting approval plus `approvals`).
 */
export async function agentTurn(
  history: Message[],
  approvals?: Record<string, boolean>,
): Promise<AgentResult> {
  const { seat } = await requireAdmin();
  const messages = [...history];

  if (!process.env.ANTHROPIC_API_KEY) {
    return { ok: false, error: "ANTHROPIC_API_KEY isn't set in this environment.", messages };
  }

  try {
    // Resume a paused turn: run its reads and the approved writes.
    const last = messages.at(-1);
    if (last?.role === "assistant") {
      const calls = toolUses(last.content);
      if (calls.length === 0) {
        return { ok: false, error: "Nothing to resume.", messages };
      }
      const results = [];
      for (const call of calls) {
        const mutates = AGENT_TOOLS.get(call.name)?.mutates ?? true;
        if (mutates && approvals?.[call.id] !== true) {
          results.push({
            type: "tool_result" as const,
            tool_use_id: call.id,
            is_error: true,
            content: "Declined by the admin.",
          });
        } else {
          results.push(await execute(call, seat.id));
        }
      }
      messages.push({ role: "user", content: results });
    }

    const api = client();
    for (let step = 0; step < MAX_STEPS; step++) {
      const response = await api.beta.messages.create({
        model: MODEL,
        max_tokens: 16000,
        betas: ["server-side-fallback-2026-07-01"],
        fallbacks: "default",
        output_config: { effort: "medium" },
        system: [
          { type: "text", text: SYSTEM, cache_control: { type: "ephemeral" } },
          { type: "text", text: `Today is ${berlinToday()} (Europe/Berlin).` },
        ],
        tools: TOOL_DEFINITIONS,
        messages,
      });

      messages.push({ role: "assistant", content: response.content as Anthropic.Beta.BetaContentBlockParam[] });

      if (response.stop_reason !== "tool_use") {
        return { ok: true, messages, pending: [] };
      }

      const calls = toolUses(messages.at(-1)!.content);
      const pending = pendingFor(calls);
      if (pending.length > 0) {
        return { ok: true, messages, pending };
      }

      const results = [];
      for (const call of calls) results.push(await execute(call, seat.id));
      messages.push({ role: "user", content: results });
    }

    messages.push({
      role: "assistant",
      content: [{ type: "text", text: "I stopped after many steps — tell me how you'd like to continue." }],
    });
    return { ok: true, messages, pending: [] };
  } catch (error) {
    console.error("agent turn failed:", error);
    const message =
      error instanceof Anthropic.APIError
        ? `Claude API error (${error.status ?? "network"}): ${error.message}`
        : "The agent failed — check the server logs.";
    return { ok: false, error: message, messages: history };
  }
}
