import {
  getNetworkStats,
  listAnchoredCompanies,
  listRecentAgents,
  listRecentTransactions,
  listRecentInvoices,
} from "@/lib/db";
import { formatLamports } from "@/lib/format";
import {
  CompaniesFeed,
  AgentsFeed,
  TransactionsFeed,
  InvoicesFeed,
  ViewAll,
} from "@/components/feeds";

export const revalidate = 30;

function StatCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="card px-5 py-4">
      <div className="label">{label}</div>
      <div className="mt-2 text-2xl font-semibold">{value}</div>
      {hint && <div className="mt-1 text-xs text-faint">{hint}</div>}
    </div>
  );
}

function SectionHead({ title, badge }: { title: string; badge: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
      <h2 className="text-sm font-medium">{title}</h2>
      <span className="badge badge-amber">{badge}</span>
    </div>
  );
}

export default async function Home() {
  const [stats, allCompanies, agents, txs, invoices] = await Promise.all([
    getNetworkStats(),
    listAnchoredCompanies(),
    listRecentAgents(5),
    listRecentTransactions(8),
    listRecentInvoices(8),
  ]);
  const companies = allCompanies.slice(0, 5);

  return (
    <div className="mx-auto max-w-7xl px-5 py-8">
      {/* Heading */}
      <div className="mb-7">
        <h1 className="text-2xl font-semibold">OCCA Explorer</h1>
        <p className="mt-1 text-sm text-muted">
          Where on-chain companies and their agents become legible.
        </p>
      </div>

      {/* Network KPIs */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Companies" value={stats.companies.toLocaleString()} hint="anchored on-chain" />
        <StatCard label="Agents" value={stats.agents.toLocaleString()} hint={`${stats.anchoredAgents} anchored`} />
        <StatCard label="Invoices" value={stats.invoices.toLocaleString()} hint={`${stats.paidInvoices} paid`} />
        <StatCard label="Disbursed" value={formatLamports(stats.disbursedLamports)} hint="paid out on-chain" />
      </div>

      {/* Companies + Agents */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="card overflow-hidden">
          <SectionHead title="Companies" badge={`${stats.companies}`} />
          <CompaniesFeed items={companies} />
          <ViewAll href="/companies" />
        </section>

        <section className="card overflow-hidden">
          <SectionHead title="Agents" badge={`${stats.anchoredAgents}`} />
          <AgentsFeed items={agents} />
          <ViewAll href="/agents" />
        </section>
      </div>

      {/* Recent transactions */}
      <section className="card overflow-hidden mt-6">
        <SectionHead title="Recent Transactions" badge={`latest ${txs.length}`} />
        <TransactionsFeed items={txs} />
        <ViewAll href="/transactions" />
      </section>

      {/* Recent invoices */}
      <section className="card overflow-hidden mt-6">
        <SectionHead title="Recent Invoices" badge={`latest ${invoices.length}`} />
        <InvoicesFeed items={invoices} />
        <ViewAll href="/invoices" />
      </section>
    </div>
  );
}
