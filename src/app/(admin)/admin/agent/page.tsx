import { AgentChat } from "@/components/admin-agent";
import { agentConfigured } from "@/lib/agent/config";
import { requireAdmin } from "@/lib/admin";

// Agent turns can chain several model + tool calls.
export const maxDuration = 300;

export default async function AdminAgentPage() {
  await requireAdmin();

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <h1 className="text-h2">Agent</h1>
      <AgentChat configured={await agentConfigured()} />
    </div>
  );
}
