// Tiny formatters shared across scan UI.

export function shortKey(s: string | null | undefined, head = 4, tail = 4): string {
  if (!s) return "—";
  if (s.length <= head + tail + 1) return s;
  return `${s.slice(0, head)}…${s.slice(-tail)}`;
}

export function relativeTime(unixSec: number | null): string {
  if (!unixSec) return "—";
  const diff = Math.floor(Date.now() / 1000) - unixSec;
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export function absoluteTime(unixSec: number | null): string {
  if (!unixSec) return "—";
  return new Date(unixSec * 1000).toISOString().replace("T", " ").slice(0, 19) + " UTC";
}

import { getCluster } from "./cluster";

export function solscanTxUrl(signature: string): string {
  const cluster = getCluster();
  // Mainnet has no cluster query param on solscan.
  const suffix = cluster === "mainnet" ? "" : `?cluster=${cluster}`;
  return `https://solscan.io/tx/${signature}${suffix}`;
}

export function solscanAccountUrl(address: string): string {
  const cluster = getCluster();
  const suffix = cluster === "mainnet" ? "" : `?cluster=${cluster}`;
  return `https://solscan.io/account/${address}${suffix}`;
}

export function formatBalance(sol: number | null): string {
  if (sol === null) return "—";
  if (sol === 0) return "0 SOL";
  // Up to 4 decimals, trim trailing zeros.
  const fixed = sol.toFixed(4).replace(/\.?0+$/, "");
  return `${fixed} SOL`;
}

const LAMPORTS_PER_SOL = 1_000_000_000;

export function formatLamports(lamports: string | bigint | number): string {
  const asNumber =
    typeof lamports === "bigint"
      ? Number(lamports)
      : typeof lamports === "number"
        ? lamports
        : Number(lamports);
  return formatBalance(asNumber / LAMPORTS_PER_SOL);
}
