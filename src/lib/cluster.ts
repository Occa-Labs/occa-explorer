// Resolves the active Solana cluster from SOLANA_RPC_URL.
// Used by header chips, og image, and solscan URL builders so the
// whole site flips when the env var swaps mainnet ↔ devnet.

export type Cluster = "mainnet" | "devnet" | "testnet";

export function getCluster(): Cluster {
  const url = process.env.SOLANA_RPC_URL;
  if (!url) return "devnet";
  if (url.includes("mainnet")) return "mainnet";
  if (url.includes("testnet")) return "testnet";
  return "devnet";
}

export function clusterLabel(): string {
  return `solana ${getCluster()}`;
}
