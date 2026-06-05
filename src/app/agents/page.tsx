import type { Metadata } from "next";
import { listRecentAgents } from "@/lib/db";
import { AgentsFeed } from "@/components/feeds";
import { BackLink } from "@/components/back-link";

export const revalidate = 30;
export const metadata: Metadata = { title: "Agents" };

export default async function AgentsPage() {
  const agents = await listRecentAgents(100);
  return (
    <div className="mx-auto max-w-7xl px-5 py-8">
      <BackLink fallback="/" />
      <div className="mt-4 mb-5 flex items-center gap-3">
        <h1 className="text-2xl font-semibold">Agents</h1>
        <span className="badge badge-amber">{agents.length}</span>
      </div>
      <section className="card overflow-hidden">
        <AgentsFeed items={agents} />
      </section>
    </div>
  );
}
