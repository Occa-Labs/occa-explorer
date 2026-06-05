import type { Metadata } from "next";
import { listAnchoredCompanies } from "@/lib/db";
import { CompaniesFeed } from "@/components/feeds";
import { BackLink } from "@/components/back-link";

export const revalidate = 30;
export const metadata: Metadata = { title: "Companies" };

export default async function CompaniesPage() {
  const companies = await listAnchoredCompanies();
  return (
    <div className="mx-auto max-w-7xl px-5 py-8">
      <BackLink fallback="/" />
      <div className="mt-4 mb-5 flex items-center gap-3">
        <h1 className="text-2xl font-semibold">Companies</h1>
        <span className="badge badge-amber">{companies.length}</span>
      </div>
      <section className="card overflow-hidden">
        <CompaniesFeed items={companies} />
      </section>
    </div>
  );
}
