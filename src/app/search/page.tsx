import { redirect } from "next/navigation";
import type { Metadata } from "next";
import {
  getCompanyByPda,
  getAgentByPda,
  getInvoiceById,
  searchCompaniesByName,
  searchAgentsByName,
} from "@/lib/db";
import { CompaniesFeed, AgentsFeed } from "@/components/feeds";
import { BackLink } from "@/components/back-link";

export const metadata: Metadata = { title: "Search" };

const BASE58 = /^[1-9A-HJ-NP-Za-km-z]+$/;
const UUID = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = (q ?? "").trim();
  if (!query) redirect("/");

  // 1. Invoice ID (uuid) → invoice detail
  if (UUID.test(query)) {
    if (await getInvoiceById(query)) redirect(`/invoice/${query}`);
  }
  // 2. Tx signature (long base58) → transaction detail
  if (BASE58.test(query) && query.length >= 80) {
    redirect(`/tx/${query}`);
  }
  // 3. PDA (base58 32–44) → company, else agent
  if (BASE58.test(query) && query.length >= 32 && query.length <= 44) {
    if (await getCompanyByPda(query)) redirect(`/company/${query}`);
    if (await getAgentByPda(query)) redirect(`/agent/${query}`);
  }

  // 4. Otherwise treat it as a name search
  const [companies, agents] = await Promise.all([
    searchCompaniesByName(query),
    searchAgentsByName(query),
  ]);
  const total = companies.length + agents.length;

  return (
    <div className="mx-auto max-w-7xl px-5 py-8">
      <BackLink fallback="/" />
      <div className="mt-4 mb-6">
        <div className="label mb-1">Search</div>
        <h1 className="text-2xl font-semibold">
          “{query}”
          <span className="ml-3 text-sm font-normal text-faint">
            {total} result{total === 1 ? "" : "s"}
          </span>
        </h1>
      </div>

      {total === 0 && (
        <div className="card overflow-hidden px-5 py-12 text-center text-sm text-faint">
          Nothing matched. Try a company or agent name, a PDA, a tx signature, or an invoice ID.
        </div>
      )}

      {companies.length > 0 && (
        <section className="card overflow-hidden mb-6">
          <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
            <h2 className="text-sm font-medium">Companies</h2>
            <span className="badge badge-amber">{companies.length}</span>
          </div>
          <CompaniesFeed items={companies} />
        </section>
      )}

      {agents.length > 0 && (
        <section className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
            <h2 className="text-sm font-medium">Agents</h2>
            <span className="badge badge-amber">{agents.length}</span>
          </div>
          <AgentsFeed items={agents} />
        </section>
      )}
    </div>
  );
}
