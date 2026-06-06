import Link from "next/link";
import type { SignatureInfo } from "@/lib/chain";
import { relativeTime, shortKey, solscanTxUrl } from "@/lib/format";
import { SolscanLink } from "./solscan-link";

// On-chain signature history for a PDA, pulled live from the Solana RPC.
export function TxTable({ txs }: { txs: SignatureInfo[] }) {
  const cols = "grid-cols-[1.5fr_1fr_0.8fr_auto]";
  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
      <div className="min-w-[560px]">
      <div className={`grid ${cols} gap-3 px-5 py-2.5 label border-b border-border`}>
        <span>Signature</span>
        <span>Slot</span>
        <span>Status</span>
        <span className="text-right">Age</span>
      </div>

      {txs.length === 0 && (
        <div className="px-5 py-8 text-center text-sm text-faint">No on-chain transactions.</div>
      )}

      {txs.map((t) => (
        <div
          key={t.signature}
          className={`relative grid ${cols} items-center gap-3 px-5 py-3 border-b border-border last:border-0 hover:bg-surface-2/40`}
        >
          <Link href={`/tx/${t.signature}`} className="absolute inset-0" aria-label="View transaction" />
          <span className="flex items-center gap-1.5 min-w-0">
            <span className="mono truncate text-sm text-accent">{shortKey(t.signature, 6, 6)}</span>
            <SolscanLink href={solscanTxUrl(t.signature)} />
          </span>
          <span className="tabular-nums text-sm text-muted">{t.slot.toLocaleString()}</span>
          <span>
            {t.err ? (
              <span className="chip chip-amber !py-0.5">failed</span>
            ) : (
              <span className="chip chip-green !py-0.5">success</span>
            )}
          </span>
          <span className="text-right text-sm text-faint">{relativeTime(t.blockTime)}</span>
        </div>
      ))}
      </div>
      </div>
    </div>
  );
}
