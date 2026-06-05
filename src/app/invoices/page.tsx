import type { Metadata } from "next";
import { listRecentInvoices } from "@/lib/db";
import { InvoicesFeed } from "@/components/feeds";
import { BackLink } from "@/components/back-link";

export const revalidate = 30;
export const metadata: Metadata = { title: "Invoices" };

export default async function InvoicesPage() {
  const invoices = await listRecentInvoices(100);
  return (
    <div className="mx-auto max-w-7xl px-5 py-8">
      <BackLink fallback="/" />
      <div className="mt-4 mb-5 flex items-center gap-3">
        <h1 className="text-2xl font-semibold">Invoices</h1>
        <span className="badge badge-amber">{invoices.length}</span>
      </div>
      <section className="card overflow-hidden">
        <InvoicesFeed items={invoices} />
      </section>
    </div>
  );
}
