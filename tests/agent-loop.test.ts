import type { LanguageModelV4Content, LanguageModelV4GenerateResult } from "@ai-sdk/provider";
import type { ModelMessage } from "ai";
import { MockLanguageModelV4 } from "ai/test";
import { describe, expect, it, vi } from "vitest";

import { DECLINED, openToolCalls, runAgentTurn, STEP_LIMIT_TEXT, type LoopTool } from "@/lib/agent/loop";

// ---------------------------------------------------------------------------
// helpers: a model that plays back a fixed list of steps, and spy tools
// ---------------------------------------------------------------------------

const usage = {
  inputTokens: { total: 1, noCache: 1, cacheRead: undefined, cacheWrite: undefined },
  outputTokens: { total: 1, text: 1, reasoning: undefined },
};

function step(...content: LanguageModelV4Content[]): LanguageModelV4GenerateResult {
  const calls = content.some((c) => c.type === "tool-call");
  return { content, finishReason: { unified: calls ? "tool-calls" : "stop", raw: undefined }, usage, warnings: [] };
}
const say = (text: string): LanguageModelV4Content => ({ type: "text", text });
const call = (id: string, toolName: string, input: object = {}): LanguageModelV4Content => ({
  type: "tool-call",
  toolCallId: id,
  toolName,
  input: JSON.stringify(input),
});

function playback(...steps: LanguageModelV4GenerateResult[]) {
  let i = 0;
  return new MockLanguageModelV4({
    doGenerate: async () => {
      if (i >= steps.length) throw new Error("model called more often than scripted");
      return steps[i++];
    },
  });
}

function makeTools() {
  const listRun = vi.fn(async () => [{ slug: "loop-of-love" }]);
  const createRun = vi.fn(async (input: Record<string, unknown>) => ({ created: input.title }));
  const tools = new Map<string, LoopTool>([
    [
      "list_events",
      {
        name: "list_events",
        description: "List events",
        inputSchema: { type: "object", properties: {} },
        mutates: false,
        summarize: () => "List events",
        run: listRun,
      },
    ],
    [
      "create_event",
      {
        name: "create_event",
        description: "Create an event",
        inputSchema: { type: "object", properties: { title: { type: "string" } }, required: ["title"] },
        mutates: true,
        summarize: (i) => `Create "${String(i.title)}"`,
        run: createRun,
      },
    ],
  ]);
  return { tools, listRun, createRun };
}

const user = (text: string): ModelMessage => ({ role: "user", content: text });

function toolResults(messages: ModelMessage[]) {
  return messages.flatMap((m) =>
    m.role === "tool" ? m.content.filter((p) => p.type === "tool-result") : [],
  );
}

function lastText(messages: ModelMessage[]): string {
  const last = messages.at(-1);
  if (!last || last.role !== "assistant") return "";
  if (typeof last.content === "string") return last.content;
  return last.content.map((p) => (p.type === "text" ? p.text : "")).join("");
}

// ---------------------------------------------------------------------------

describe("runAgentTurn", () => {
  it("answers plainly when no tool is needed", async () => {
    const { tools } = makeTools();
    const result = await runAgentTurn({
      model: playback(step(say("Hi!"))),
      instructions: "test",
      tools,
      history: [user("hello")],
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.pending).toEqual([]);
    expect(lastText(result.messages)).toBe("Hi!");
  });

  it("runs read-only tools immediately and continues", async () => {
    const { tools, listRun } = makeTools();
    const result = await runAgentTurn({
      model: playback(step(call("c1", "list_events")), step(say("One event."))),
      instructions: "test",
      tools,
      history: [user("what's on?")],
    });
    expect(listRun).toHaveBeenCalledOnce();
    expect(result.ok && result.pending).toEqual([]);
    expect(lastText(result.messages)).toBe("One event.");
    const [res] = toolResults(result.messages);
    expect(res.toolCallId).toBe("c1");
    expect(res.output).toEqual({ type: "text", value: JSON.stringify([{ slug: "loop-of-love" }]) });
  });

  it("pauses on a mutating tool without running it", async () => {
    const { tools, createRun } = makeTools();
    const result = await runAgentTurn({
      model: playback(step(say("Creating it."), call("c1", "create_event", { title: "Night Run" }))),
      instructions: "test",
      tools,
      history: [user('create "Night Run"')],
    });
    expect(createRun).not.toHaveBeenCalled();
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.pending).toEqual([
      { id: "c1", name: "create_event", input: { title: "Night Run" }, summary: 'Create "Night Run"' },
    ]);
    expect(openToolCalls(result.messages).map((c) => c.toolCallId)).toEqual(["c1"]);
  });

  it("runs an approved call when resumed, then lets the model finish", async () => {
    const { tools, createRun } = makeTools();
    const paused = await runAgentTurn({
      model: playback(step(call("c1", "create_event", { title: "Night Run" }))),
      instructions: "test",
      tools,
      history: [user("create")],
    });
    if (!paused.ok) throw new Error(paused.error);

    const resumed = await runAgentTurn({
      model: playback(step(say("Created."))),
      instructions: "test",
      tools,
      history: paused.messages,
      approvals: { c1: true },
    });
    expect(createRun).toHaveBeenCalledWith({ title: "Night Run" });
    expect(resumed.ok && resumed.pending).toEqual([]);
    expect(lastText(resumed.messages)).toBe("Created.");
  });

  it("declines unapproved calls and tells the model", async () => {
    const { tools, createRun } = makeTools();
    const paused = await runAgentTurn({
      model: playback(step(call("c1", "create_event", { title: "A" }), call("c2", "create_event", { title: "B" }))),
      instructions: "test",
      tools,
      history: [user("create two")],
    });
    if (!paused.ok) throw new Error(paused.error);
    expect(paused.pending.map((p) => p.id)).toEqual(["c1", "c2"]);

    const resumed = await runAgentTurn({
      model: playback(step(say("Made A only."))),
      instructions: "test",
      tools,
      history: paused.messages,
      approvals: { c1: true, c2: false },
    });
    expect(createRun).toHaveBeenCalledTimes(1);
    expect(createRun).toHaveBeenCalledWith({ title: "A" });
    const results = toolResults(resumed.messages);
    expect(results.find((r) => r.toolCallId === "c2")?.output).toEqual({ type: "error-text", value: DECLINED });
  });

  it("runs reads in a mixed step only after approval, alongside the writes", async () => {
    const { tools, listRun, createRun } = makeTools();
    const paused = await runAgentTurn({
      model: playback(step(call("r1", "list_events"), call("w1", "create_event", { title: "X" }))),
      instructions: "test",
      tools,
      history: [user("list and create")],
    });
    if (!paused.ok) throw new Error(paused.error);
    expect(listRun).not.toHaveBeenCalled();
    expect(paused.pending.map((p) => p.id)).toEqual(["w1"]);

    await runAgentTurn({
      model: playback(step(say("ok"))),
      instructions: "test",
      tools,
      history: paused.messages,
      approvals: { w1: true },
    });
    expect(listRun).toHaveBeenCalledOnce();
    expect(createRun).toHaveBeenCalledOnce();
  });

  it("returns tool errors to the model instead of failing the turn", async () => {
    const { tools } = makeTools();
    tools.get("list_events")!.run = async () => {
      throw new Error("bad filter");
    };
    const result = await runAgentTurn({
      model: playback(step(call("c1", "list_events")), step(say("That failed."))),
      instructions: "test",
      tools,
      history: [user("list")],
      isExpectedToolError: () => true,
    });
    expect(result.ok).toBe(true);
    expect(toolResults(result.messages)[0].output).toEqual({ type: "error-text", value: "bad filter" });
  });

  it("never runs unknown tools; the model sees the error and answers", async () => {
    const { tools, listRun, createRun } = makeTools();
    const result = await runAgentTurn({
      model: playback(step(call("c1", "drop_database")), step(say("I can't do that."))),
      instructions: "test",
      tools,
      history: [user("do something odd")],
    });
    expect(listRun).not.toHaveBeenCalled();
    expect(createRun).not.toHaveBeenCalled();
    expect(result.ok && result.pending).toEqual([]);
    const [res] = toolResults(result.messages);
    expect(res.output.type).toBe("error-text");
    expect(lastText(result.messages)).toBe("I can't do that.");
  });

  it("keeps one tool message per step when valid and invalid calls mix", async () => {
    const { tools, listRun } = makeTools();
    const result = await runAgentTurn({
      model: playback(step(call("ok", "list_events"), call("bad", "nope")), step(say("done"))),
      instructions: "test",
      tools,
      history: [user("mixed")],
    });
    expect(listRun).toHaveBeenCalledOnce();
    const toolMessages = result.messages.filter((m) => m.role === "tool");
    expect(toolMessages).toHaveLength(1);
    expect(toolResults(result.messages).map((r) => r.toolCallId).sort()).toEqual(["bad", "ok"]);
  });

  it("stops after maxSteps of read-only tool calls", async () => {
    const { tools } = makeTools();
    const result = await runAgentTurn({
      model: playback(step(call("a", "list_events")), step(call("b", "list_events"))),
      instructions: "test",
      tools,
      history: [user("loop")],
      maxSteps: 2,
    });
    expect(result.ok).toBe(true);
    expect(lastText(result.messages)).toBe(STEP_LIMIT_TEXT);
  });

  it("reports a model failure and keeps the original history", async () => {
    const { tools } = makeTools();
    const history = [user("hello")];
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const result = await runAgentTurn({
      model: new MockLanguageModelV4({
        doGenerate: async () => {
          throw new Error("boom");
        },
      }),
      instructions: "test",
      tools,
      history,
    });
    spy.mockRestore();
    expect(result).toEqual({ ok: false, error: "The agent failed. Check the server logs.", messages: history });
  });

  it("refuses to resume when nothing is waiting", async () => {
    const { tools } = makeTools();
    const result = await runAgentTurn({
      model: playback(),
      instructions: "test",
      tools,
      history: [user("hi"), { role: "assistant", content: [{ type: "text", text: "hello" }] }],
    });
    expect(result).toMatchObject({ ok: false, error: "Nothing to resume." });
  });
});
