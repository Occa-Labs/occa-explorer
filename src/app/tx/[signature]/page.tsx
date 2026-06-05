import Link from "next/link";
import { notFound } from "next/navigation";
import { getTransactionContext } from "@/lib/db";
import { getTransactionDetail } from "@/lib/chain";
import {
  absoluteTime,
  formatLamports,
  relativeTime,
  shortKey,
  solscanTxUrl,
} from "@/lib/format";
import { HashBar, MiniCard, MiniRow } from "@/components/detail";
import { CopyButton } from "@/components/copy-button";
import { BackLink } from "@/components/back-link";

export const revalidate = 30;
const unix = (d: Date) => Math.floor(new Date(d).getTime() / 1000);

export default async function TxPage({
  params,
}: {
  params: Promise<{ signature: string }>;
}) {
  const { signature } = await params;
  const [ctx, detail] = await Promise.all([
    getTransactionContext(signature),
    getTransactionDetail(signature),
  ]);
  if (!ctx && !detail) notFound();

  const failed = detail?.err != null;
  const ts = ctx?.createdAt ? unix(ctx.createdAt) : detail?.blockTime ?? null;

  return (
    <div className="mx-auto max-w-7xl px-5 py-8">
      <BackLink fallback="/transactions" />

      {/* Header */}
      <div className="mt-5 mb-6">
        <div className="label mb-1">Transaction</div>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="mono text-xl font-semibold">{shortKey(signature, 8, 8)}</h1>
          <CopyButton value={signature} title="Copy signature" />
          {ctx && (
            <span className={`chip !py-0.5 ${ctx.type === "payment" ? "chip-green" : "chip-amber"}`}>{ctx.type}</span>
          )}
          {detail && (
            <span className={`badge ${failed ? "badge-amber" : "badge-success"}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${failed ? "bg-accent-2" : "bg-success"}`} />
              {failed ? "failed" : "success"}
            </span>
          )}
        </div>
      </div>

      {/* Signature bar */}
      <div className="mb-6">
        <HashBar label="Signature" value={signature} href={solscanTxUrl(signature)} />
      </div>

      {/* Overview cards */}
      <div className="mb-7 grid grid-cols-1 gap-4 md:grid-cols-3">
        <MiniCard title="Transaction">
          <MiniRow k="Type">
            {ctx ? (
              <span className={`chip !py-0.5 ${ctx.type === "payment" ? "chip-green" : "chip-amber"}`}>{ctx.type}</span>
            ) : (
              "—"
            )}
          </MiniRow>
          <MiniRow k="Status">
            {detail ? (
              failed ? <span className="text-accent-2">failed</span> : <span className="text-success">success</span>
            ) : (
              "—"
            )}
          </MiniRow>
          <MiniRow k="Age">{ts ? relativeTime(ts) : "—"}</MiniRow>
        </MiniCard>

        <MiniCard title="On-chain">
          <MiniRow k="Slot">{detail ? detail.slot.toLocaleString() : "—"}</MiniRow>
          <MiniRow k="Block Time">{detail?.blockTime ? absoluteTime(detail.blockTime) : "—"}</MiniRow>
          <MiniRow k="Fee">{detail?.feeLamports != null ? formatLamports(detail.feeLamports) : "—"}</MiniRow>
        </MiniCard>

        <MiniCard title="Related">
          {ctx ? (
            <>
              <MiniRow k="Agent">
                <Link href={`/agent/${ctx.deploymentPda}`} className="text-accent hover:underline">{ctx.agentName}</Link>
              </MiniRow>
              <MiniRow k="Company">
                <Link href={`/company/${ctx.companyPda}`} className="text-accent hover:underline">{ctx.companyName}</Link>
              </MiniRow>
              <MiniRow k="Role"><span className="chip chip-neutral !py-0.5">{ctx.role}</span></MiniRow>
            </>
          ) : (
            <MiniRow k="Indexed">not in OCCA index</MiniRow>
          )}
        </MiniCard>
      </div>

      {/* Settled invoices (payment transactions) */}
      {ctx?.type === "payment" && ctx.invoices.length > 0 && (
        <section className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
            <h2 className="text-sm font-medium">Settled Invoices</h2>
            <span className="badge badge-amber">{ctx.invoices.length}</span>
          </div>
          <div className="grid grid-cols-[1fr_0.8fr_auto] gap-3 px-5 py-2.5 label border-b border-border">
            <span>Invoice</span>
            <span>Amount</span>
            <span className="text-right">Status</span>
          </div>
          {ctx.invoices.map((inv) => (
            <Link
              key={inv.id}
              href={`/invoice/${inv.id}`}
              className="grid grid-cols-[1fr_0.8fr_auto] items-center gap-3 px-5 py-3 border-b border-border last:border-0 hover:bg-surface-2/40"
            >
              <span className="mono truncate text-sm text-accent">{shortKey(inv.id, 6, 6)}</span>
              <span className="tabular-nums text-sm">{formatLamports(inv.amountLamports)}</span>
              <span className="text-right">
                <span className={`chip !py-0.5 ${inv.status === "paid" ? "chip-green" : inv.status === "approved" ? "chip-amber" : "chip-neutral"}`}>
                  {inv.status}
                </span>
              </span>
            </Link>
          ))}
        </section>
      )}
    </div>
  );
}
