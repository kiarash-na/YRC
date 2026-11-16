/**
 * Models the admin Agent may run on, all served through the Vercel AI
 * Gateway (ids are gateway "provider/model" ids). This list is the server-side
 * allowlist: a model id from the browser is only used if it appears here.
 */
export interface AgentModel {
  id: string;
  label: string;
  /** One short line for the picker. */
  note: string;
}

export const AGENT_MODELS: readonly AgentModel[] = [
  {
    id: "anthropic/claude-haiku-5.5",
    label: "Claude Haiku 5.5",
    note: "Anthropic · fast, careful with tools",
  },
  {
    id: "google/gemini-3.8-flash",
    label: "Gemini 3.8 Flash",
    note: "Google · latest Flash",
  },
  {
    id: "deepseek/deepseek-v4.1-flash",
    label: "DeepSeek V4.1 Flash",
    note: "DeepSeek · cheapest",
  },
  {
    id: "deepseek/deepseek-v4-pro",
    label: "DeepSeek V4 Pro",
    note: "DeepSeek · stronger reasoning",
  },
];

export const DEFAULT_AGENT_MODEL = AGENT_MODELS[0].id;

export function isAgentModel(id: unknown): id is string {
  return typeof id === "string" && AGENT_MODELS.some((m) => m.id === id);
}

export function agentModelLabel(id: string): string {
  return AGENT_MODELS.find((m) => m.id === id)?.label ?? id;
}
