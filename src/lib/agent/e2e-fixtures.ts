import type { LanguageModelV4, LanguageModelV4CallOptions, LanguageModelV4Content } from "@ai-sdk/provider";
import { MockLanguageModelV4 } from "ai/test";

import { DECLINED, type LoopTool } from "@/lib/agent/loop";

/**
 * Deterministic stand-ins for the Agent in token-free tests:
 *  - scriptedAgentModel(): a mock language model that picks its reply from
 *    the latest message with simple rules (below), echoing its model id;
 *  - fixtureAgentTools(): in-memory tools with the same shape as the real
 *    ones (a read tool and mutating tools), touching no database.
 *
 * Script (latest user message → model action):
 *   "upcoming" / "list events"          → call list_events
 *   create … event called "<title>"     → call create_event {title}
 *   "two changes"                       → call create_event twice in one step
 *   "which model"                       → reply with the model id
 *   "crash"                             → the model call fails
 *   anything else                       → a short help reply
 * After tool results arrive, it summarises them in one text reply.
 */

type Prompt = LanguageModelV4CallOptions["prompt"];

const usage = {
  inputTokens: { total: 0, noCache: 0, cacheRead: undefined, cacheWrite: undefined },
  outputTokens: { total: 0, text: 0, reasoning: undefined },
};

let callCounter = 0;
const nextCallId = () => `call_e2e_${++callCounter}`;

function text(value: string): LanguageModelV4Content {
  return { type: "text", text: value };
}

function toolCall(toolName: string, input: Record<string, unknown>): LanguageModelV4Content {
  return { type: "tool-call", toolCallId: nextCallId(), toolName, input: JSON.stringify(input) };
}

function lastUserText(prompt: Prompt): string {
  for (let i = prompt.length - 1; i >= 0; i--) {
    const m = prompt[i];
    if (m.role === "user") {
      return m.content.map((p) => (p.type === "text" ? p.text : "")).join(" ");
    }
  }
  return "";
}

type ResultOutput = { type: string; value?: unknown };

function summarise(prompt: Prompt): string {
  const last = prompt.at(-1);
  if (!last || last.role !== "tool") return "Done.";
  const lines: string[] = [];
  for (const part of last.content) {
    if (part.type !== "tool-result") continue;
    const output = part.output as ResultOutput;
    const value = typeof output.value === "string" ? output.value : JSON.stringify(output.value);
    if (output.type === "error-text" && value === DECLINED) {
      lines.push(`Okay, I didn't run ${part.toolName}.`);
    } else if (output.type.startsWith("error")) {
      lines.push(`${part.toolName} failed: ${value}`);
    } else if (part.toolName === "list_events") {
      const events = JSON.parse(value) as { title: string; slug: string }[];
      lines.push(
        events.length === 0
          ? "There are no upcoming events."
          : `Upcoming events:\n${events.map((e) => `- ${e.title} (/events/${e.slug})`).join("\n")}`,
      );
    } else if (part.toolName === "create_event") {
      const created = JSON.parse(value) as { title: string; slug: string };
      lines.push(`Created **${created.title}**: /events/${created.slug}`);
    } else {
      lines.push(`${part.toolName} done.`);
    }
  }
  return lines.join("\n");
}

function respond(prompt: Prompt, modelId: string): LanguageModelV4Content[] {
  if (prompt.at(-1)?.role === "tool") return [text(summarise(prompt))];

  const message = lastUserText(prompt);
  const lower = message.toLowerCase();
  if (lower.includes("crash")) throw new Error("Scripted model failure (e2e).");
  if (lower.includes("which model")) return [text(`Running on ${modelId}.`)];
  if (lower.includes("two changes")) {
    return [
      text("Two drafts coming up."),
      toolCall("create_event", { title: "Alpha Run" }),
      toolCall("create_event", { title: "Beta Run" }),
    ];
  }
  const create = message.match(/event called "([^"]+)"/i);
  if (create) return [toolCall("create_event", { title: create[1] })];
  if (lower.includes("upcoming") || lower.includes("list events")) return [toolCall("list_events", {})];
  return [text('Mock agent. Try "list events" or: create an event called "Test Run".')];
}

export function scriptedAgentModel(modelId: string): LanguageModelV4 {
  return new MockLanguageModelV4({
    provider: "e2e",
    modelId,
    doGenerate: async (options) => {
      const content = respond(options.prompt, modelId);
      const calls = content.some((c) => c.type === "tool-call");
      return {
        content,
        finishReason: { unified: calls ? "tool-calls" : "stop", raw: undefined },
        usage,
        warnings: [],
      };
    },
  });
}

// ---------------------------------------------------------------------------
// fixture tools (in-memory; reset per server process)
// ---------------------------------------------------------------------------

const fixtureEvents: { title: string; slug: string }[] = [
  { title: "Loop of Love", slug: "loop-of-love" },
  { title: "Track Thursdays", slug: "track-thursdays" },
];

const slugify = (title: string) =>
  title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "event";

export function fixtureAgentTools(): Map<string, LoopTool> {
  const tools: LoopTool[] = [
    {
      name: "list_events",
      description: "List upcoming events.",
      inputSchema: { type: "object", properties: {}, additionalProperties: false },
      mutates: false,
      summarize: () => "List events",
      run: async () => fixtureEvents,
    },
    {
      name: "create_event",
      description: "Create an event.",
      inputSchema: {
        type: "object",
        properties: { title: { type: "string" } },
        required: ["title"],
        additionalProperties: false,
      },
      mutates: true,
      summarize: (input) => `Create event "${String(input.title)}"`,
      run: async (input) => {
        const title = String(input.title ?? "").trim();
        if (!title) throw new Error('"title" is required.');
        const event = { title, slug: slugify(title) };
        fixtureEvents.push(event);
        return event;
      },
    },
  ];
  return new Map(tools.map((t) => [t.name, t]));
}
