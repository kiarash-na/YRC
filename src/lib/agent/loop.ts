import {
  APICallError,
  generateText,
  jsonSchema,
  tool,
  type JSONSchema7,
  type LanguageModel,
  type ModelMessage,
  type ToolCallPart,
  type ToolResultPart,
  type ToolSet,
} from "ai";

/**
 * The admin Agent's tool loop, provider-neutral (any AI SDK language model:
 * the AI Gateway in production, a scripted mock in tests).
 *
 * Tools are declared to the model WITHOUT an execute function, so every
 * generateText call is exactly one model step and we decide what runs:
 * read-only tools run immediately; a step that asks for any mutating tool
 * pauses and returns those calls for the admin to confirm. The transcript is
 * plain JSON (AI SDK ModelMessage[]) that the client keeps and sends back.
 */

export interface LoopTool {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  mutates: boolean;
  /** One line for the approval card. */
  summarize: (input: Record<string, unknown>) => string;
  run: (input: Record<string, unknown>) => Promise<unknown>;
}

export interface PendingCall {
  id: string;
  name: string;
  summary: string;
  input: Record<string, unknown>;
}

export type TurnResult =
  | { ok: true; messages: ModelMessage[]; pending: PendingCall[] }
  | { ok: false; error: string; messages: ModelMessage[] };

export interface TurnOptions {
  model: LanguageModel;
  instructions: string;
  tools: ReadonlyMap<string, LoopTool>;
  /** Transcript ending with a user message, or a paused assistant step. */
  history: ModelMessage[];
  /** For a paused step: tool call id → approved? Missing = declined. */
  approvals?: Record<string, boolean>;
  maxSteps?: number;
  /** Errors a tool may throw that are the model's fault (shown to it, not logged). */
  isExpectedToolError?: (error: unknown) => boolean;
}

export const DECLINED = "Declined by the admin.";
export const STEP_LIMIT_TEXT = "I stopped after many steps. Tell me how you'd like to continue.";
const MAX_RESULT_CHARS = 60_000;

function asInput(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

/** Tool calls in the trailing assistant message(s) that have no result yet. */
export function openToolCalls(messages: ModelMessage[]): ToolCallPart[] {
  const answered = new Set<string>();
  const calls: ToolCallPart[] = [];
  for (let i = messages.length - 1; i >= 0; i--) {
    const message = messages[i];
    if (message.role === "user") break;
    if (typeof message.content === "string") continue;
    if (message.role === "tool") {
      for (const part of message.content) {
        if (part.type === "tool-result") answered.add(part.toolCallId);
      }
    } else if (message.role === "assistant") {
      const open = message.content.filter(
        (part): part is ToolCallPart =>
          part.type === "tool-call" && !part.providerExecuted && !answered.has(part.toolCallId),
      );
      calls.unshift(...open);
    }
  }
  return calls;
}

function toolSetFor(tools: ReadonlyMap<string, LoopTool>): ToolSet {
  const set: ToolSet = {};
  for (const t of tools.values()) {
    // No execute (we run tools ourselves) and no SDK-side validation: our
    // executors validate and return readable errors the model can fix.
    set[t.name] = tool({
      description: t.description,
      inputSchema: jsonSchema(t.inputSchema as JSONSchema7),
    });
  }
  return set;
}

async function execute(
  call: ToolCallPart,
  tools: ReadonlyMap<string, LoopTool>,
  isExpected: (error: unknown) => boolean,
): Promise<ToolResultPart> {
  const base = { type: "tool-result" as const, toolCallId: call.toolCallId, toolName: call.toolName };
  const t = tools.get(call.toolName);
  if (!t) return { ...base, output: { type: "error-text", value: `Unknown tool ${call.toolName}.` } };
  try {
    const result = await t.run(asInput(call.input));
    const text = JSON.stringify(result ?? { ok: true });
    return {
      ...base,
      output: {
        type: "text",
        value: text.length > MAX_RESULT_CHARS ? `${text.slice(0, MAX_RESULT_CHARS)}… (truncated)` : text,
      },
    };
  } catch (error) {
    if (!isExpected(error)) console.error(`agent tool ${call.toolName} failed:`, error);
    return {
      ...base,
      output: { type: "error-text", value: error instanceof Error ? error.message : "Tool failed." },
    };
  }
}

/**
 * Append tool results. The SDK itself answers invalid calls (unknown tool,
 * malformed input) in a trailing tool message; merge into it so the results
 * of one step stay in one message, as providers expect.
 */
function pushToolResults(messages: ModelMessage[], results: ToolResultPart[]) {
  const last = messages.at(-1);
  if (last?.role === "tool") {
    messages[messages.length - 1] = { ...last, content: [...last.content, ...results] };
  } else {
    messages.push({ role: "tool", content: results });
  }
}

export function pendingFor(calls: ToolCallPart[], tools: ReadonlyMap<string, LoopTool>): PendingCall[] {
  return calls
    .filter((c) => tools.get(c.toolName)?.mutates ?? true)
    .map((c) => {
      const input = asInput(c.input);
      const t = tools.get(c.toolName);
      return {
        id: c.toolCallId,
        name: c.toolName,
        input,
        summary: t ? t.summarize(input) : `Unknown tool ${c.toolName}`,
      };
    });
}

function describeError(error: unknown): string {
  if (APICallError.isInstance(error)) {
    const status = error.statusCode ?? "network";
    if (status === 401 || status === 403) {
      return "The AI Gateway rejected the request. Check VERCEL_AI_GATEWAY (or AI_GATEWAY_API_KEY).";
    }
    return `Model error (${status}): ${error.message}`;
  }
  if (error instanceof Error && /api key|oidc|unauthori[sz]ed/i.test(error.message)) {
    return "No AI Gateway credentials. Set VERCEL_AI_GATEWAY (or AI_GATEWAY_API_KEY).";
  }
  return "The agent failed. Check the server logs.";
}

/** Advance the conversation by one admin turn (or one approval round). */
export async function runAgentTurn({
  model,
  instructions,
  tools,
  history,
  approvals,
  maxSteps = 12,
  isExpectedToolError = () => false,
}: TurnOptions): Promise<TurnResult> {
  const messages = [...history];

  try {
    // Resume a paused step: run its reads and the approved writes.
    const last = messages.at(-1);
    if (last && last.role !== "user") {
      const calls = openToolCalls(messages);
      if (calls.length === 0) return { ok: false, error: "Nothing to resume.", messages: history };
      const results: ToolResultPart[] = [];
      for (const call of calls) {
        const mutates = tools.get(call.toolName)?.mutates ?? true;
        if (mutates && approvals?.[call.toolCallId] !== true) {
          results.push({
            type: "tool-result",
            toolCallId: call.toolCallId,
            toolName: call.toolName,
            output: { type: "error-text", value: DECLINED },
          });
        } else {
          results.push(await execute(call, tools, isExpectedToolError));
        }
      }
      pushToolResults(messages, results);
    }

    const toolSet = toolSetFor(tools);
    for (let step = 0; step < maxSteps; step++) {
      const response = await generateText({
        model,
        instructions,
        messages,
        tools: toolSet,
        maxOutputTokens: 8000,
        maxRetries: 2,
      });
      messages.push(...response.response.messages);

      const calls = openToolCalls(messages);
      if (calls.length === 0) {
        // Only SDK-answered invalid calls: let the model see the errors.
        if (messages.at(-1)?.role === "tool") continue;
        return { ok: true, messages, pending: [] };
      }

      const pending = pendingFor(calls, tools);
      if (pending.length > 0) return { ok: true, messages, pending };

      const results: ToolResultPart[] = [];
      for (const call of calls) results.push(await execute(call, tools, isExpectedToolError));
      pushToolResults(messages, results);
    }

    messages.push({ role: "assistant", content: [{ type: "text", text: STEP_LIMIT_TEXT }] });
    return { ok: true, messages, pending: [] };
  } catch (error) {
    console.error("agent turn failed:", error);
    return { ok: false, error: describeError(error), messages: history };
  }
}
