import Link from "next/link";
import { notFound } from "next/navigation";
import { getInvoiceById } from "@/lib/db";
import {
  formatLamports,
  relativeTime,
  shortKey,
  solscanTxUrl,
} from "@/lib/format";
import { HashBar, MiniCard, MiniRow } from "@/components/detail";
import { BackLink } from "@/components/back-link";
import { SolscanLink } from "@/components/solscan-link";

export const revalidate = 30;
const unix = (d: Date) => Math.floor(new Date(d).getTime() / 1000);

function statusClass(status: string): string {
  return status === "paid" ? "chip-green" : status === "approved" ? "chip-amber" : "chip-neutral";
}

export default async function InvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const inv = await getInvoiceById(id);
  if (!inv) notFound();

  return (
    <div className="mx-auto max-w-7xl px-5 py-8">
      <BackLink fallback={`/agent/${inv.deploymentPda}`} />

      {/* Header */}
      <div className="mt-5 mb-6">
        <div className="label mb-1">Invoice</div>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold tabular-nums">{formatLamports(inv.amountLamports)}</h1>
          <span className={`chip !py-0.5 ${statusClass(inv.status)}`}>{inv.status}</span>
        </div>
      </div>

      {/* Tx signature bar (settled invoices) */}
      {inv.txSignature && (
        <div className="mb-6">
          <HashBar label="Tx" value={inv.txSignature} href={solscanTxUrl(inv.txSignature)} />
        </div>
      )}

      {/* Overview cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <MiniCard title="Invoice">
          <MiniRow k="Amount"><span className="tabular-nums">{formatLamports(inv.amountLamports)}</span></MiniRow>
          <MiniRow k="Status"><span className={`chip !py-0.5 ${statusClass(inv.status)}`}>{inv.status}</span></MiniRow>
          <MiniRow k="Invoice ID"><span className="mono text-xs">{shortKey(inv.id, 4, 4)}</span></MiniRow>
        </MiniCard>

        <MiniCard title="Timeline">
          <MiniRow k="Created">{relativeTime(unix(inv.createdAt))}</MiniRow>
          <MiniRow k="Approved">{inv.approvedAt ? relativeTime(unix(inv.approvedAt)) : "—"}</MiniRow>
          <MiniRow k="Paid">{inv.paidAt ? relativeTime(unix(inv.paidAt)) : "—"}</MiniRow>
        </MiniCard>

        <MiniCard title="Related">
          <MiniRow k="Agent">
            <Link href={`/agent/${inv.deploymentPda}`} className="text-accent hover:underline">{inv.agentName}</Link>
          </MiniRow>
          <MiniRow k="Company">
            <Link href={`/company/${inv.companyPda}`} className="text-accent hover:underline">{inv.companyName}</Link>
          </MiniRow>
          <MiniRow k="Tx">
            {inv.txSignature ? (
              <span className="inline-flex items-center gap-1.5">
                <Link href={`/tx/${inv.txSignature}`} className="mono text-accent hover:underline">{shortKey(inv.txSignature, 4, 4)}</Link>
                <SolscanLink href={solscanTxUrl(inv.txSignature)} />
              </span>
            ) : (
              "—"
            )}
          </MiniRow>
        </MiniCard>
      </div>
    </div>
  );
}
