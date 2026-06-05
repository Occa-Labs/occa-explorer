import Link from "next/link";
import {
  formatLamports,
  relativeTime,
  shortKey,
} from "@/lib/format";
import { CopyButton } from "./copy-button";
import { Identicon } from "./identicon";
import type {
  CompanyListItem,
  RecentAgent,
  RecentInvoice,
  RecentTransaction,
} from "@/lib/db";

const unix = (d: Date) => Math.floor(new Date(d).getTime() / 1000);

function Empty({ label }: { label: string }) {
  return <div className="px-5 py-8 text-center text-sm text-faint">{label}</div>;
}

function StatusChip({ status }: { status: string }) {
  const cls =
    status === "paid" ? "chip-green" : status === "approved" ? "chip-amber" : "chip-neutral";
  return <span className={`chip ${cls} !py-0.5`}>{status}</span>;
}

// "View all →" footer for a home card, links to the full list page.
export function ViewAll({ href }: { href: string }) {
  return (
    <Link
      href={href}
      className="flex items-center justify-center gap-1.5 border-t border-border px-5 py-3 text-sm text-accent hover:bg-surface-2/40"
    >
      View all
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12h14M13 6l6 6-6 6" />
      </svg>
    </Link>
  );
}

export function CompaniesFeed({ items }: { items: CompanyListItem[] }) {
  if (!items.length) return <Empty label="No companies yet." />;
  return (
    <>
      {items.map((c) => (
        <Link
          key={c.pda}
          href={`/company/${c.pda}`}
          className="flex items-center justify-between gap-3 px-5 py-3 border-b border-border last:border-0 hover:bg-surface-2/40"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <Identicon value={c.pda} size={28} className="shrink-0" />
            <div className="min-w-0">
              <div className="truncate text-sm font-medium">{c.name}</div>
              <div className="mono truncate text-xs text-faint">{shortKey(c.pda, 6, 6)}</div>
            </div>
          </div>
          <span className="chip chip-amber shrink-0">{c.agentCount} agents</span>
        </Link>
      ))}
    </>
  );
}

export function AgentsFeed({ items }: { items: RecentAgent[] }) {
  if (!items.length) return <Empty label="No agents yet." />;
  return (
    <>
      {items.map((a) => (
        <Link
          key={a.deploymentPda}
          href={`/agent/${a.deploymentPda}`}
          className="flex items-center justify-between gap-3 px-5 py-3 border-b border-border last:border-0 hover:bg-surface-2/40"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <Identicon value={a.deploymentPda} size={28} className="shrink-0" />
            <div className="min-w-0">
              <div className="truncate text-sm font-medium">{a.agentName}</div>
              <div className="truncate text-xs text-faint">{a.companyName}</div>
            </div>
          </div>
          <span className="chip chip-neutral shrink-0 !py-0.5">{a.role}</span>
        </Link>
      ))}
    </>
  );
}

export function TransactionsFeed({ items }: { items: RecentTransaction[] }) {
  const cols = "grid-cols-[1.3fr_0.7fr_1.1fr_0.9fr_auto]";
  return (
    <div className="overflow-x-auto">
      <div className="min-w-[640px]">
      <div className={`grid ${cols} gap-3 px-5 py-2.5 label border-b border-border`}>
        <span>Signature</span>
        <span>Type</span>
        <span>Agent</span>
        <span>Company</span>
        <span className="text-right">Age</span>
      </div>
      {!items.length && <Empty label="No transactions yet." />}
      {items.map((t) => (
        <div
          key={t.signature}
          className={`relative grid ${cols} items-center gap-3 px-5 py-3 border-b border-border last:border-0 hover:bg-surface-2/40`}
        >
          <Link href={`/tx/${t.signature}`} className="absolute inset-0" aria-label="View transaction" />
          <div className="flex items-center gap-2 min-w-0">
            <span className="mono truncate text-sm text-accent">{shortKey(t.signature, 6, 6)}</span>
            <span className="relative z-10"><CopyButton value={t.signature} title="Copy signature" /></span>
          </div>
          <span>
            <span className={`chip !py-0.5 ${t.type === "payment" ? "chip-green" : "chip-amber"}`}>{t.type}</span>
          </span>
          <div className="flex items-center gap-2 min-w-0">
            <Identicon value={t.deploymentPda} size={20} className="shrink-0" />
            <Link href={`/agent/${t.deploymentPda}`} className="relative z-10 min-w-0 truncate text-sm hover:text-accent">{t.agentName}</Link>
          </div>
          <div className="min-w-0 truncate text-sm text-muted">
            <Link href={`/company/${t.companyPda}`} className="relative z-10 hover:text-foreground">{t.companyName}</Link>
          </div>
          <span className="text-right text-sm text-faint">{relativeTime(unix(t.createdAt))}</span>
        </div>
      ))}
      </div>
    </div>
  );
}

export function InvoicesFeed({ items }: { items: RecentInvoice[] }) {
  const cols = "grid-cols-[0.8fr_1.2fr_1fr_0.9fr_0.7fr_auto]";
  return (
    <div className="overflow-x-auto">
      <div className="min-w-[680px]">
      <div className={`grid ${cols} gap-3 px-5 py-2.5 label border-b border-border`}>
        <span>ID</span>
        <span>Agent</span>
        <span>Company</span>
        <span>Amount</span>
        <span>Status</span>
        <span className="text-right">Age</span>
      </div>
      {!items.length && <Empty label="No invoices yet." />}
      {items.map((inv) => (
        <div key={inv.id} className={`relative grid ${cols} items-center gap-3 px-5 py-3 border-b border-border last:border-0 hover:bg-surface-2/40`}>
          <Link href={`/invoice/${inv.id}`} className="absolute inset-0" aria-label="View invoice" />
          <span className="mono truncate text-sm text-accent">{shortKey(inv.id, 4, 4)}</span>
          <div className="flex items-center gap-2 min-w-0">
            <Identicon value={inv.deploymentPda} size={20} className="shrink-0" />
            <Link href={`/agent/${inv.deploymentPda}`} className="relative z-10 min-w-0 truncate text-sm hover:text-accent">{inv.agentName}</Link>
          </div>
          <div className="min-w-0 truncate text-sm text-muted">
            <Link href={`/company/${inv.companyPda}`} className="relative z-10 hover:text-foreground">{inv.companyName}</Link>
          </div>
          <span className="tabular-nums text-sm">{formatLamports(inv.amountLamports)}</span>
          <span><StatusChip status={inv.status} /></span>
          <span className="text-right text-sm text-faint">{relativeTime(unix(inv.createdAt))}</span>
        </div>
      ))}
      </div>
    </div>
  );
}
