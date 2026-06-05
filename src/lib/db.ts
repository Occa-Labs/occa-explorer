// Postgres pool — direct read access to the OCCA DB. Same DATABASE_URL
// as the OCCA server; scan only reads, never writes. Use a read-only
// role on prod if you want hard guarantees.

import { Pool } from "pg";
import { getCluster } from "./cluster";

let cachedPool: Pool | null = null;

function getPool(): Pool {
  if (cachedPool) return cachedPool;
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL not set");
  cachedPool = new Pool({ connectionString: url, max: 5 });
  return cachedPool;
}

export interface CompanyRow {
  id: string;
  pda: string;
  name: string;
  ownerWallet: string;
  chainStatus: string | null;
  createdAt: Date;
}

export interface CompanyListItem extends CompanyRow {
  agentCount: number;
}

export async function listAnchoredCompanies(): Promise<CompanyListItem[]> {
  const sql = `
    SELECT
      c.id,
      c.company_pda AS pda,
      c.name,
      c.owner_wallet AS "ownerWallet",
      c.chain_status AS "chainStatus",
      c.created_at AS "createdAt",
      COALESCE(
        (SELECT COUNT(*) FROM deployments d WHERE d.company_id = c.id),
        0
      )::int AS "agentCount"
    FROM companies c
    WHERE c.kind = 'user' AND c.company_pda IS NOT NULL
    ORDER BY c.created_at DESC
  `;
  const { rows } = await getPool().query<CompanyListItem>(sql);
  return rows;
}

export async function getCompanyByPda(
  pda: string,
): Promise<CompanyRow | null> {
  const sql = `
    SELECT
      id, company_pda AS pda, name, owner_wallet AS "ownerWallet",
      chain_status AS "chainStatus", created_at AS "createdAt"
    FROM companies
    WHERE company_pda = $1
    LIMIT 1
  `;
  const { rows } = await getPool().query<CompanyRow>(sql, [pda]);
  return rows[0] ?? null;
}

export interface AgentDeployment {
  pda: string;
  role: string;
  name: string;
  companyPda: string;
  companyName: string;
  signature: string | null;
  anchoredAt: Date;
}

export async function getAgentByPda(
  pda: string,
): Promise<AgentDeployment | null> {
  const sql = `
    SELECT
      d.deployment_pda AS pda,
      d.role,
      ai.name,
      c.company_pda AS "companyPda",
      c.name AS "companyName",
      d.chain_tx_signature AS signature,
      d.created_at AS "anchoredAt"
    FROM deployments d
    JOIN agent_identities ai ON d.agent_identity_id = ai.id
    JOIN companies c ON d.company_id = c.id
    WHERE d.deployment_pda = $1
    LIMIT 1
  `;
  const { rows } = await getPool().query<AgentDeployment>(sql, [pda]);
  return rows[0] ?? null;
}

// Anchored deployment PDAs (real base58) for a company. Pre-anchor rows
// carry a `dep_pda_<hex>` sentinel that breaks `new PublicKey()` — filter
// them out the same way OCCA server does.
export async function listAnchoredDeploymentPdas(
  companyId: string,
): Promise<string[]> {
  const sql = `
    SELECT deployment_pda
    FROM deployments
    WHERE company_id = $1 AND chain_tx_signature IS NOT NULL
  `;
  const { rows } = await getPool().query<{ deployment_pda: string }>(sql, [
    companyId,
  ]);
  return rows.map((r) => r.deployment_pda);
}

export interface NetworkStats {
  companies: number;
  agents: number;
  anchoredAgents: number;
  invoices: number;
  paidInvoices: number;
  disbursedLamports: string;
  cluster: string;
}

export async function getNetworkStats(): Promise<NetworkStats> {
  const sql = `
    SELECT
      (SELECT COUNT(*) FROM companies WHERE kind = 'user' AND company_pda IS NOT NULL)::int AS companies,
      (SELECT COUNT(*) FROM deployments)::int AS agents,
      (SELECT COUNT(*) FROM deployments WHERE chain_tx_signature IS NOT NULL)::int AS "anchoredAgents",
      (SELECT COUNT(*) FROM invoices)::int AS invoices,
      (SELECT COUNT(*) FROM invoices WHERE status = 'paid')::int AS "paidInvoices",
      (SELECT COALESCE(SUM(amount_lamports), 0) FROM invoices WHERE status = 'paid')::text AS "disbursedLamports"
  `;
  const { rows } = await getPool().query<Omit<NetworkStats, "cluster">>(sql);
  return {
    ...rows[0],
    cluster: getCluster(),
  };
}

export interface RecentAgent {
  deploymentPda: string;
  agentName: string;
  role: string;
  companyName: string;
  companyPda: string;
  createdAt: Date;
}

export async function listRecentAgents(limit = 5): Promise<RecentAgent[]> {
  const sql = `
    SELECT
      d.deployment_pda AS "deploymentPda",
      ai.name AS "agentName",
      d.role,
      c.name AS "companyName",
      c.company_pda AS "companyPda",
      d.created_at AS "createdAt"
    FROM deployments d
    JOIN agent_identities ai ON d.agent_identity_id = ai.id
    JOIN companies c ON d.company_id = c.id
    WHERE d.chain_tx_signature IS NOT NULL AND c.company_pda IS NOT NULL
    ORDER BY d.created_at DESC
    LIMIT $1
  `;
  const { rows } = await getPool().query<RecentAgent>(sql, [limit]);
  return rows;
}

export interface RecentTransaction {
  signature: string;
  type: "register" | "payment";
  createdAt: Date;
  agentName: string;
  companyName: string;
  companyPda: string;
  deploymentPda: string;
}

// Network-wide on-chain transaction feed: agent registrations (anchor
// signatures) unioned with invoice payment signatures, newest first.
export async function listRecentTransactions(
  limit = 12,
): Promise<RecentTransaction[]> {
  const sql = `
    SELECT * FROM (
      SELECT DISTINCT ON (signature)
        signature, type, "createdAt", "agentName", "companyName", "companyPda", "deploymentPda"
      FROM (
        SELECT
          d.chain_tx_signature AS signature,
          'register' AS type,
          d.created_at AS "createdAt",
          ai.name AS "agentName",
          c.name AS "companyName",
          c.company_pda AS "companyPda",
          d.deployment_pda AS "deploymentPda"
        FROM deployments d
        JOIN agent_identities ai ON d.agent_identity_id = ai.id
        JOIN companies c ON d.company_id = c.id
        WHERE d.chain_tx_signature IS NOT NULL AND c.company_pda IS NOT NULL
        UNION ALL
        SELECT
          i.tx_signature AS signature,
          'payment' AS type,
          i.created_at AS "createdAt",
          ai.name AS "agentName",
          c.name AS "companyName",
          c.company_pda AS "companyPda",
          d.deployment_pda AS "deploymentPda"
        FROM invoices i
        JOIN deployments d ON i.deployment_id = d.id
        JOIN agent_identities ai ON d.agent_identity_id = ai.id
        JOIN companies c ON i.company_id = c.id
        WHERE i.tx_signature IS NOT NULL AND c.company_pda IS NOT NULL
      ) u
      ORDER BY signature, "createdAt" DESC
    ) d
    ORDER BY "createdAt" DESC
    LIMIT $1
  `;
  const { rows } = await getPool().query<RecentTransaction>(sql, [limit]);
  return rows;
}

export interface RecentInvoice {
  id: string;
  amountLamports: string;
  status: string;
  txSignature: string | null;
  createdAt: Date;
  agentName: string;
  role: string;
  deploymentPda: string;
  companyName: string;
  companyPda: string;
}

export async function listRecentInvoices(limit = 8): Promise<RecentInvoice[]> {
  const sql = `
    SELECT
      i.id,
      i.amount_lamports::text AS "amountLamports",
      i.status,
      i.tx_signature AS "txSignature",
      i.created_at AS "createdAt",
      ai.name AS "agentName",
      d.role,
      d.deployment_pda AS "deploymentPda",
      c.name AS "companyName",
      c.company_pda AS "companyPda"
    FROM invoices i
    JOIN deployments d ON i.deployment_id = d.id
    JOIN agent_identities ai ON d.agent_identity_id = ai.id
    JOIN companies c ON i.company_id = c.id
    WHERE d.chain_tx_signature IS NOT NULL AND c.company_pda IS NOT NULL
    ORDER BY i.created_at DESC
    LIMIT $1
  `;
  const { rows } = await getPool().query<RecentInvoice>(sql, [limit]);
  return rows;
}

export interface CompanyDeployment {
  deploymentPda: string;
  role: string;
  agentName: string;
  signature: string | null;
  anchoredAt: Date;
}

export async function listCompanyDeployments(
  companyId: string,
): Promise<CompanyDeployment[]> {
  const sql = `
    SELECT
      d.deployment_pda AS "deploymentPda",
      d.role,
      ai.name AS "agentName",
      d.chain_tx_signature AS signature,
      d.created_at AS "anchoredAt"
    FROM deployments d
    JOIN agent_identities ai ON d.agent_identity_id = ai.id
    WHERE d.company_id = $1 AND d.chain_tx_signature IS NOT NULL
    ORDER BY d.created_at DESC
  `;
  const { rows } = await getPool().query<CompanyDeployment>(sql, [companyId]);
  return rows;
}

export interface RecentAnchor {
  signature: string;
  role: string;
  agentName: string;
  companyName: string;
  companyPda: string;
  deploymentPda: string;
  anchoredAt: Date;
}

export async function listRecentAnchors(limit = 20): Promise<RecentAnchor[]> {
  const sql = `
    SELECT
      d.chain_tx_signature AS signature,
      d.role,
      ai.name AS "agentName",
      c.name AS "companyName",
      c.company_pda AS "companyPda",
      d.deployment_pda AS "deploymentPda",
      d.created_at AS "anchoredAt"
    FROM deployments d
    JOIN companies c ON d.company_id = c.id
    JOIN agent_identities ai ON d.agent_identity_id = ai.id
    WHERE d.chain_tx_signature IS NOT NULL
    ORDER BY d.created_at DESC
    LIMIT $1
  `;
  const { rows } = await getPool().query<RecentAnchor>(sql, [limit]);
  return rows;
}

export interface Invoice {
  id: string;
  amountLamports: string; // bigint serializes as string from pg
  status: string;
  txSignature: string | null;
  approvedAt: Date | null;
  paidAt: Date | null;
  createdAt: Date;
  agentName: string;
  role: string;
  deploymentPda: string;
}

export async function listInvoicesForDeploymentPda(
  pda: string,
  opts: { limit?: number; before?: string } = {},
): Promise<{ rows: Invoice[]; hasMore: boolean }> {
  const limit = opts.limit ?? 20;
  const before = opts.before ?? null;
  const sql = `
    SELECT
      i.id,
      i.amount_lamports::text AS "amountLamports",
      i.status,
      i.tx_signature AS "txSignature",
      i.approved_at AS "approvedAt",
      i.paid_at AS "paidAt",
      i.created_at AS "createdAt",
      ai.name AS "agentName",
      d.role,
      d.deployment_pda AS "deploymentPda"
    FROM invoices i
    JOIN deployments d ON i.deployment_id = d.id
    JOIN agent_identities ai ON d.agent_identity_id = ai.id
    WHERE d.deployment_pda = $1
      AND ($2::uuid IS NULL OR i.created_at < (SELECT created_at FROM invoices WHERE id = $2))
    ORDER BY i.created_at DESC
    LIMIT $3
  `;
  const { rows } = await getPool().query<Invoice>(sql, [pda, before, limit + 1]);
  const hasMore = rows.length > limit;
  return { rows: rows.slice(0, limit), hasMore };
}

export interface InvoiceStats {
  total: number;
  paid: number;
  pending: number;
}

export async function getInvoiceStatsForDeploymentPda(
  pda: string,
): Promise<InvoiceStats> {
  const sql = `
    SELECT
      COUNT(*)::int AS total,
      COUNT(*) FILTER (WHERE i.status = 'paid')::int AS paid
    FROM invoices i
    JOIN deployments d ON i.deployment_id = d.id
    WHERE d.deployment_pda = $1
  `;
  const { rows } = await getPool().query<{ total: number; paid: number }>(sql, [pda]);
  const total = rows[0]?.total ?? 0;
  const paid = rows[0]?.paid ?? 0;
  return { total, paid, pending: total - paid };
}

export async function getInvoiceStatsForCompany(
  companyId: string,
): Promise<InvoiceStats> {
  const sql = `
    SELECT
      COUNT(*)::int AS total,
      COUNT(*) FILTER (WHERE status = 'paid')::int AS paid
    FROM invoices
    WHERE company_id = $1
  `;
  const { rows } = await getPool().query<{ total: number; paid: number }>(sql, [companyId]);
  const total = rows[0]?.total ?? 0;
  const paid = rows[0]?.paid ?? 0;
  return { total, paid, pending: total - paid };
}

export async function listInvoicesForCompany(
  companyId: string,
  opts: { limit?: number; before?: string } = {},
): Promise<{ rows: Invoice[]; hasMore: boolean }> {
  const limit = opts.limit ?? 20;
  const before = opts.before ?? null;
  const sql = `
    SELECT
      i.id,
      i.amount_lamports::text AS "amountLamports",
      i.status,
      i.tx_signature AS "txSignature",
      i.approved_at AS "approvedAt",
      i.paid_at AS "paidAt",
      i.created_at AS "createdAt",
      ai.name AS "agentName",
      d.role,
      d.deployment_pda AS "deploymentPda"
    FROM invoices i
    JOIN deployments d ON i.deployment_id = d.id
    JOIN agent_identities ai ON d.agent_identity_id = ai.id
    WHERE i.company_id = $1
      AND ($2::uuid IS NULL OR i.created_at < (SELECT created_at FROM invoices WHERE id = $2))
    ORDER BY i.created_at DESC
    LIMIT $3
  `;
  const { rows } = await getPool().query<Invoice>(sql, [companyId, before, limit + 1]);
  const hasMore = rows.length > limit;
  return { rows: rows.slice(0, limit), hasMore };
}

export interface InvoiceDetail {
  id: string;
  amountLamports: string;
  status: string;
  txSignature: string | null;
  approvedAt: Date | null;
  paidAt: Date | null;
  createdAt: Date;
  agentName: string;
  role: string;
  deploymentPda: string;
  companyName: string;
  companyPda: string;
}

export async function getInvoiceById(id: string): Promise<InvoiceDetail | null> {
  const sql = `
    SELECT
      i.id,
      i.amount_lamports::text AS "amountLamports",
      i.status,
      i.tx_signature AS "txSignature",
      i.approved_at AS "approvedAt",
      i.paid_at AS "paidAt",
      i.created_at AS "createdAt",
      ai.name AS "agentName",
      d.role,
      d.deployment_pda AS "deploymentPda",
      c.name AS "companyName",
      c.company_pda AS "companyPda"
    FROM invoices i
    JOIN deployments d ON i.deployment_id = d.id
    JOIN agent_identities ai ON d.agent_identity_id = ai.id
    JOIN companies c ON i.company_id = c.id
    WHERE i.id = $1::uuid
    LIMIT 1
  `;
  try {
    const { rows } = await getPool().query<InvoiceDetail>(sql, [id]);
    return rows[0] ?? null;
  } catch {
    // malformed uuid → treat as not found
    return null;
  }
}

export interface TxContext {
  signature: string;
  type: "register" | "payment";
  createdAt: Date;
  agentName: string;
  role: string;
  deploymentPda: string;
  companyName: string;
  companyPda: string;
  invoices: { id: string; amountLamports: string; status: string }[];
}

// Resolve OCCA's view of a transaction signature: an agent registration
// (deployment anchor) or an invoice payment (may settle several invoices).
export async function getTransactionContext(
  signature: string,
): Promise<TxContext | null> {
  const reg = await getPool().query<Omit<TxContext, "signature" | "type" | "invoices">>(
    `
      SELECT
        d.created_at AS "createdAt",
        ai.name AS "agentName",
        d.role,
        d.deployment_pda AS "deploymentPda",
        c.name AS "companyName",
        c.company_pda AS "companyPda"
      FROM deployments d
      JOIN agent_identities ai ON d.agent_identity_id = ai.id
      JOIN companies c ON d.company_id = c.id
      WHERE d.chain_tx_signature = $1
      LIMIT 1
    `,
    [signature],
  );
  if (reg.rows[0]) {
    return { signature, type: "register", invoices: [], ...reg.rows[0] };
  }

  const pay = await getPool().query<{
    id: string;
    amountLamports: string;
    status: string;
    createdAt: Date;
    agentName: string;
    role: string;
    deploymentPda: string;
    companyName: string;
    companyPda: string;
  }>(
    `
      SELECT
        i.id,
        i.amount_lamports::text AS "amountLamports",
        i.status,
        i.created_at AS "createdAt",
        ai.name AS "agentName",
        d.role,
        d.deployment_pda AS "deploymentPda",
        c.name AS "companyName",
        c.company_pda AS "companyPda"
      FROM invoices i
      JOIN deployments d ON i.deployment_id = d.id
      JOIN agent_identities ai ON d.agent_identity_id = ai.id
      JOIN companies c ON i.company_id = c.id
      WHERE i.tx_signature = $1
      ORDER BY i.created_at DESC
    `,
    [signature],
  );
  if (pay.rows.length) {
    const f = pay.rows[0];
    return {
      signature,
      type: "payment",
      createdAt: f.createdAt,
      agentName: f.agentName,
      role: f.role,
      deploymentPda: f.deploymentPda,
      companyName: f.companyName,
      companyPda: f.companyPda,
      invoices: pay.rows.map((r) => ({ id: r.id, amountLamports: r.amountLamports, status: r.status })),
    };
  }

  return null;
}


export async function searchCompaniesByName(q: string): Promise<CompanyListItem[]> {
  const sql = `
    SELECT
      c.id,
      c.company_pda AS pda,
      c.name,
      c.owner_wallet AS "ownerWallet",
      c.chain_status AS "chainStatus",
      c.created_at AS "createdAt",
      COALESCE((SELECT COUNT(*) FROM deployments d WHERE d.company_id = c.id), 0)::int AS "agentCount"
    FROM companies c
    WHERE c.kind = 'user' AND c.company_pda IS NOT NULL AND c.name ILIKE $1
    ORDER BY c.name
    LIMIT 25
  `;
  const { rows } = await getPool().query<CompanyListItem>(sql, [`%${q}%`]);
  return rows;
}

export async function searchAgentsByName(q: string): Promise<RecentAgent[]> {
  const sql = `
    SELECT
      d.deployment_pda AS "deploymentPda",
      ai.name AS "agentName",
      d.role,
      c.name AS "companyName",
      c.company_pda AS "companyPda",
      d.created_at AS "createdAt"
    FROM deployments d
    JOIN agent_identities ai ON d.agent_identity_id = ai.id
    JOIN companies c ON d.company_id = c.id
    WHERE d.chain_tx_signature IS NOT NULL AND c.company_pda IS NOT NULL AND ai.name ILIKE $1
    ORDER BY d.created_at DESC
    LIMIT 25
  `;
  const { rows } = await getPool().query<RecentAgent>(sql, [`%${q}%`]);
  return rows;
}
