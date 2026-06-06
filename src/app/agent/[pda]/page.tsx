import Link from "next/link";
import { notFound } from "next/navigation";
import { getPdaBalanceSol, listPdaSignatures } from "@/lib/chain";
import {
  getAgentByPda,
  listInvoicesForDeploymentPda,
  getInvoiceStatsForDeploymentPda,
} from "@/lib/db";
import {
  formatBalance,
  relativeTime,
  shortKey,
  solscanAccountUrl,
  solscanTxUrl,
} from "@/lib/format";
import { Tabs } from "@/components/tabs";
import { HashBar, MiniCard, MiniRow } from "@/components/detail";
import { InvoiceTable } from "@/components/invoice-table";
import { TxTable } from "@/components/tx-table";
import { Identicon } from "@/components/identicon";
import { CopyButton } from "@/components/copy-button";
import { BackLink } from "@/components/back-link";
import { SolscanLink } from "@/components/solscan-link";
import { IconInvoices, IconTx } from "@/components/icons";

export const revalidate = 30;
const PAGE_SIZE = 20;
const unix = (d: Date) => Math.floor(new Date(d).getTime() / 1000);

export default async function AgentPage({
  params,
  searchParams,
}: {
  params: Promise<{ pda: string }>;
  searchParams: Promise<{ before?: string }>;
}) {
  const { pda } = await params;
  const { before } = await searchParams;
  const agent = await getAgentByPda(pda);
  if (!agent) notFound();

  const [balanceSol, invoicePage, stats, txs] = await Promise.all([
    getPdaBalanceSol(agent.pda),
    listInvoicesForDeploymentPda(agent.pda, { limit: PAGE_SIZE, before }),
    getInvoiceStatsForDeploymentPda(agent.pda),
    listPdaSignatures(agent.pda, { limit: 25 }),
  ]);
  const { rows: invoices, hasMore } = invoicePage;
  const nextBefore = hasMore ? invoices[invoices.length - 1].id : null;

  return (
    <div className="mx-auto max-w-7xl px-5 py-8">
      <BackLink fallback={`/company/${agent.companyPda}`} />

      {/* Header */}
      <div className="mt-5 mb-6 flex items-start gap-4">
        <Identicon value={agent.pda} size={56} className="mt-1 shrink-0" />
        <div className="min-w-0">
          <div className="label mb-1">Agent</div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold">{agent.name}</h1>
            <CopyButton value={agent.pda} title="Copy PDA" />
            <span className="chip chip-amber">{agent.role}</span>
            {agent.signature && (
              <span className="badge badge-success">
                <span className="h-1.5 w-1.5 rounded-full bg-success" />
                anchored
              </span>
            )}
          </div>
        </div>
      </div>

      {/* PDA bar */}
      <div className="mb-6">
        <HashBar label="PDA" value={agent.pda} href={solscanAccountUrl(agent.pda)} />
      </div>

      {/* Overview — column cards (out of the tabs) */}
      <div className="mb-7 grid grid-cols-1 gap-4 md:grid-cols-3">
        <MiniCard title="Identity">
          <MiniRow k="Name">{agent.name}</MiniRow>
          <MiniRow k="Role"><span className="chip chip-amber !py-0.5">{agent.role}</span></MiniRow>
          <MiniRow k="Parent Company">
            <Link href={`/company/${agent.companyPda}`} className="text-accent hover:underline">
              {agent.companyName}
            </Link>
          </MiniRow>
        </MiniCard>

        <MiniCard title="On-chain">
          <MiniRow k="Balance"><span className="chip chip-amber !py-0.5">◎ {formatBalance(balanceSol)}</span></MiniRow>
          <MiniRow k="Anchored">{relativeTime(unix(agent.anchoredAt))}</MiniRow>
          <MiniRow k="Anchor Sig">
            {agent.signature ? (
              <span className="inline-flex items-center gap-1.5">
                <span className="mono text-sm">{shortKey(agent.signature, 4, 4)}</span>
                <SolscanLink href={solscanTxUrl(agent.signature)} />
              </span>
            ) : (
              "—"
            )}
          </MiniRow>
        </MiniCard>

        <MiniCard title="Invoices">
          <MiniRow k="Total">{stats.total}</MiniRow>
          <MiniRow k="Paid"><span className="text-success">{stats.paid}</span></MiniRow>
          <MiniRow k="Pending"><span className="text-accent-2">{stats.pending}</span></MiniRow>
        </MiniCard>
      </div>

      {/* Tabs — transactional lists only */}
      <Tabs
        tabs={[
          {
            key: "invoices",
            label: "Invoices",
            count: stats.total,
            icon: <IconInvoices />,
            content: (
              <InvoiceTable
                invoices={invoices}
                showAgent={false}
                basePath={`/agent/${agent.pda}`}
                before={before}
                nextBefore={nextBefore}
              />
            ),
          },
          {
            key: "transactions",
            label: "Transactions",
            count: txs.length,
            icon: <IconTx />,
            content: <TxTable txs={txs} />,
          },
        ]}
      />
    </div>
  );
}
