import "server-only";

import { isE2ERequest } from "@/lib/e2e";

/** Gateway key: the project's VERCEL_AI_GATEWAY, or the SDK's standard name. */
export function gatewayApiKey(): string | undefined {
  return process.env.VERCEL_AI_GATEWAY || process.env.AI_GATEWAY_API_KEY || undefined;
}

/** Whether the Agent can reach a model here (a key, or Vercel's OIDC token). */
export async function agentConfigured(): Promise<boolean> {
  if (await isE2ERequest()) return true;
  return Boolean(gatewayApiKey() || process.env.VERCEL);
}
