import Link from "next/link";
import type { Invoice } from "@/lib/db";
import {
  formatLamports,
  relativeTime,
  shortKey,
} from "@/lib/format";

const unix = (d: Date) => Math.floor(new Date(d).getTime() / 1000);

function StatusChip({ status }: { status: string }) {
  const cls =
    status === "paid"
      ? "chip-green"
      : status === "approved"
        ? "chip-amber"
        : "chip-neutral";
  return <span className={`chip ${cls} !py-0.5`}>{status}</span>;
}

// Shared invoice list for both company and agent detail pages.
export function InvoiceTable({
  invoices,
  showAgent,
  basePath,
  before,
  nextBefore,
}: {
  invoices: Invoice[];
  showAgent: boolean;
  basePath: string;
  before?: string;
  nextBefore: string | null;
}) {
  const cols = showAgent
    ? "grid-cols-[1.2fr_0.9fr_0.8fr_1fr_auto]"
    : "grid-cols-[1fr_0.8fr_1.2fr_auto]";

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
      <div className="min-w-[560px]">
      <div className={`grid ${cols} gap-3 px-5 py-2.5 label border-b border-border`}>
        {showAgent && <span>Agent</span>}
        <span>Amount</span>
        <span>Status</span>
        <span>Tx Signature</span>
        <span className="text-right">Age</span>
      </div>

      {invoices.length === 0 && (
        <div className="px-5 py-8 text-center text-sm text-faint">No invoices yet.</div>
      )}

      {invoices.map((inv) => (
        <div
          key={inv.id}
          className={`relative grid ${cols} items-center gap-3 px-5 py-3 border-b border-border last:border-0 hover:bg-surface-2/40`}
        >
          <Link href={`/invoice/${inv.id}`} className="absolute inset-0" aria-label="View invoice" />
          {showAgent && (
            <div className="min-w-0 truncate">
              <Link href={`/agent/${inv.deploymentPda}`} className="relative z-10 text-sm hover:text-accent">
                {inv.agentName}
              </Link>
            </div>
          )}
          <span className="tabular-nums text-sm">{formatLamports(inv.amountLamports)}</span>
          <span><StatusChip status={inv.status} /></span>
          <span className="min-w-0">
            {inv.txSignature ? (
              <Link href={`/tx/${inv.txSignature}`} className="relative z-10 mono text-sm text-accent hover:underline">
                {shortKey(inv.txSignature, 6, 6)}
              </Link>
            ) : (
              <span className="text-faint text-sm">—</span>
            )}
          </span>
          <span className="text-right text-sm text-faint">{relativeTime(unix(inv.createdAt))}</span>
        </div>
      ))}
      </div>
      </div>

      {(before !== undefined || nextBefore !== null) && (
        <div className="flex items-center justify-between border-t border-border px-5 py-3">
          {before ? (
            <Link href={basePath} className="text-sm text-muted hover:text-foreground">
              ← First page
            </Link>
          ) : (
            <span className="text-sm text-faint">·</span>
          )}
          {nextBefore ? (
            <Link href={`${basePath}?before=${nextBefore}`} className="text-sm text-accent hover:underline">
              Load more →
            </Link>
          ) : (
            <span className="text-sm text-faint">End of feed</span>
          )}
        </div>
      )}
    </div>
  );
}
