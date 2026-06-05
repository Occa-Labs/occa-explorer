import Link from "next/link";
import { notFound } from "next/navigation";
import { getPdaBalanceSol, listPdaSignatures } from "@/lib/chain";
import {
  getCompanyByPda,
  listCompanyDeployments,
  listInvoicesForCompany,
  getInvoiceStatsForCompany,
} from "@/lib/db";
import {
  formatBalance,
  relativeTime,
  shortKey,
  solscanAccountUrl,
} from "@/lib/format";
import { Tabs } from "@/components/tabs";
import { HashBar, MiniCard, MiniRow } from "@/components/detail";
import { InvoiceTable } from "@/components/invoice-table";
import { TxTable } from "@/components/tx-table";
import { Identicon } from "@/components/identicon";
import { CopyButton } from "@/components/copy-button";
import { BackLink } from "@/components/back-link";
import { IconAgents, IconInvoices, IconTx } from "@/components/icons";

export const revalidate = 30;
const PAGE_SIZE = 20;
const unix = (d: Date) => Math.floor(new Date(d).getTime() / 1000);

export default async function CompanyPage({
  params,
  searchParams,
}: {
  params: Promise<{ pda: string }>;
  searchParams: Promise<{ before?: string }>;
}) {
  const { pda } = await params;
  const { before } = await searchParams;
  const company = await getCompanyByPda(pda);
  if (!company) notFound();

  const [deployments, balanceSol, invoicePage, stats, txs] = await Promise.all([
    listCompanyDeployments(company.id),
    getPdaBalanceSol(company.pda),
    listInvoicesForCompany(company.id, { limit: PAGE_SIZE, before }),
    getInvoiceStatsForCompany(company.id),
    listPdaSignatures(company.pda, { limit: 25 }),
  ]);
  const { rows: invoices, hasMore } = invoicePage;
  const nextBefore = hasMore ? invoices[invoices.length - 1].id : null;

  const agentsPanel = (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
      <div className="min-w-[560px]">
      <div className="grid grid-cols-[1.3fr_0.8fr_1fr_auto] gap-3 px-5 py-2.5 label border-b border-border">
        <span>Agent</span>
        <span>Role</span>
        <span>Signature</span>
        <span className="text-right">Anchored</span>
      </div>
      {deployments.length === 0 && (
        <div className="px-5 py-8 text-center text-sm text-faint">No anchored agents yet.</div>
      )}
      {deployments.map((d) => (
        <Link
          key={d.deploymentPda}
          href={`/agent/${d.deploymentPda}`}
          className="grid grid-cols-[1.3fr_0.8fr_1fr_auto] items-center gap-3 px-5 py-3 border-b border-border last:border-0 hover:bg-surface-2/40"
        >
          <span className="flex items-center gap-2.5 min-w-0">
            <Identicon value={d.deploymentPda} size={24} className="shrink-0" />
            <span className="truncate text-sm font-medium">{d.agentName}</span>
          </span>
          <span><span className="chip chip-neutral !py-0.5 !px-2 text-[0.6875rem]">{d.role}</span></span>
          <span className="mono truncate text-sm text-accent">
            {d.signature ? shortKey(d.signature, 6, 6) : "—"}
          </span>
          <span className="text-right text-sm text-faint">{relativeTime(unix(d.anchoredAt))}</span>
        </Link>
      ))}
      </div>
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-5 py-8">
      <BackLink fallback="/" />

      {/* Header */}
      <div className="mt-5 mb-6 flex items-start gap-4">
        <Identicon value={company.pda} size={56} className="mt-1 shrink-0" />
        <div className="min-w-0">
          <div className="label mb-1">Company</div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold">{company.name}</h1>
            <CopyButton value={company.pda} title="Copy PDA" />
            <span className="badge badge-success">
              <span className="h-1.5 w-1.5 rounded-full bg-success" />
              {company.chainStatus ?? "anchored"}
            </span>
          </div>
        </div>
      </div>

      {/* PDA bar */}
      <div className="mb-6">
        <HashBar label="PDA" value={company.pda} href={solscanAccountUrl(company.pda)} />
      </div>

      {/* Overview — column cards */}
      <div className="mb-7 grid grid-cols-1 gap-4 md:grid-cols-3">
        <MiniCard title="Identity">
          <MiniRow k="Name">{company.name}</MiniRow>
          <MiniRow k="Owner">
            <a href={solscanAccountUrl(company.ownerWallet)} target="_blank" rel="noreferrer" className="mono text-accent hover:underline">
              {shortKey(company.ownerWallet, 4, 4)}
            </a>
          </MiniRow>
          <MiniRow k="Created">{relativeTime(unix(company.createdAt))}</MiniRow>
        </MiniCard>

        <MiniCard title="On-chain">
          <MiniRow k="Balance"><span className="chip chip-amber !py-0.5">◎ {formatBalance(balanceSol)}</span></MiniRow>
          <MiniRow k="Status"><span className="chip chip-green !py-0.5">{company.chainStatus ?? "anchored"}</span></MiniRow>
          <MiniRow k="Agents">{deployments.length}</MiniRow>
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
          { key: "agents", label: "Agents", count: deployments.length, icon: <IconAgents />, content: agentsPanel },
          {
            key: "invoices",
            label: "Invoices",
            count: stats.total,
            icon: <IconInvoices />,
            content: (
              <InvoiceTable
                invoices={invoices}
                showAgent
                basePath={`/company/${company.pda}`}
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
