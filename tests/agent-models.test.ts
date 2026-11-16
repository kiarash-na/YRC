import { describe, expect, it } from "vitest";

import { runAgentTurn } from "@/lib/agent/loop";
import { fixtureAgentTools, scriptedAgentModel } from "@/lib/agent/e2e-fixtures";
import { AGENT_MODELS, DEFAULT_AGENT_MODEL, isAgentModel } from "@/lib/agent/models";

describe("agent model allowlist", () => {
  it("offers Claude Haiku, Gemini Flash and DeepSeek through the gateway", () => {
    const ids = AGENT_MODELS.map((m) => m.id);
    expect(ids.some((id) => id.startsWith("anthropic/claude-haiku"))).toBe(true);
    expect(ids.some((id) => id.startsWith("google/gemini") && id.includes("flash"))).toBe(true);
    expect(ids.filter((id) => id.startsWith("deepseek/")).length).toBeGreaterThanOrEqual(1);
    for (const id of ids) expect(id).toMatch(/^[a-z]+\/[a-z0-9.-]+$/);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("only accepts listed ids", () => {
    expect(isAgentModel(DEFAULT_AGENT_MODEL)).toBe(true);
    expect(isAgentModel("openai/gpt-anything")).toBe(false);
    expect(isAgentModel(undefined)).toBe(false);
    expect(isAgentModel({ id: DEFAULT_AGENT_MODEL })).toBe(false);
  });
});

describe("scripted e2e model + fixture tools", () => {
  it("lists events through the read tool", async () => {
    const result = await runAgentTurn({
      model: scriptedAgentModel("google/gemini-3.8-flash"),
      instructions: "test",
      tools: fixtureAgentTools(),
      history: [{ role: "user", content: "list events" }],
    });
    if (!result.ok) throw new Error(result.error);
    const last = result.messages.at(-1)!;
    expect(JSON.stringify(last.content)).toContain("Loop of Love");
  });

  it("echoes the chosen model id", async () => {
    const result = await runAgentTurn({
      model: scriptedAgentModel("deepseek/deepseek-v4.1-flash"),
      instructions: "test",
      tools: fixtureAgentTools(),
      history: [{ role: "user", content: "which model are you?" }],
    });
    if (!result.ok) throw new Error(result.error);
    expect(JSON.stringify(result.messages.at(-1)!.content)).toContain("deepseek/deepseek-v4.1-flash");
  });
});
