// On-chain helpers — single RPC per call. Pages should cache via
// `revalidate` so a hot page doesn't melt the public RPC.

import { Connection, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";

let cached: Connection | null = null;

function getConnection(): Connection {
  if (cached) return cached;
  const url = process.env.SOLANA_RPC_URL ?? "https://api.devnet.solana.com";
  cached = new Connection(url, { commitment: "confirmed" });
  return cached;
}

export async function getPdaBalanceSol(pda: string): Promise<number | null> {
  try {
    const key = new PublicKey(pda);
    const lamports = await getConnection().getBalance(key);
    return lamports / LAMPORTS_PER_SOL;
  } catch {
    return null;
  }
}

export interface TxDetail {
  slot: number;
  blockTime: number | null;
  feeLamports: number | null;
  err: unknown;
}

export async function getTransactionDetail(signature: string): Promise<TxDetail | null> {
  try {
    const tx = await getConnection().getTransaction(signature, {
      maxSupportedTransactionVersion: 0,
    });
    if (!tx) return null;
    return {
      slot: tx.slot,
      blockTime: tx.blockTime ?? null,
      feeLamports: tx.meta?.fee ?? null,
      err: tx.meta?.err ?? null,
    };
  } catch {
    return null;
  }
}

export interface SignatureInfo {
  signature: string;
  slot: number;
  blockTime: number | null;
  err: unknown;
}

export async function listPdaSignatures(
  pda: string,
  opts: { limit?: number; before?: string } = {},
): Promise<SignatureInfo[]> {
  const limit = opts.limit ?? 20;
  try {
    const key = new PublicKey(pda);
    const sigs = await getConnection().getSignaturesForAddress(key, {
      limit,
      before: opts.before,
    });
    return sigs.map((s) => ({
      signature: s.signature,
      slot: s.slot,
      blockTime: s.blockTime ?? null,
      err: s.err,
    }));
  } catch {
    return [];
  }
}
