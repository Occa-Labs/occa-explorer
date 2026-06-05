import type { Metadata } from "next";
import { listRecentTransactions } from "@/lib/db";
import { TransactionsFeed } from "@/components/feeds";
import { BackLink } from "@/components/back-link";

export const revalidate = 30;
export const metadata: Metadata = { title: "Transactions" };

export default async function TransactionsPage() {
  const txs = await listRecentTransactions(100);
  return (
    <div className="mx-auto max-w-7xl px-5 py-8">
      <BackLink fallback="/" />
      <div className="mt-4 mb-5 flex items-center gap-3">
        <h1 className="text-2xl font-semibold">Transactions</h1>
        <span className="badge badge-amber">{txs.length}</span>
      </div>
      <section className="card overflow-hidden">
        <TransactionsFeed items={txs} />
      </section>
    </div>
  );
}
