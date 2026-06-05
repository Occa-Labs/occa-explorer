import type { ReactNode } from "react";
import { CopyButton } from "./copy-button";

// Full-width address bar — the wide pill under the title in Voyager.
export function HashBar({
  label,
  value,
  href,
}: {
  label: string;
  value: string;
  href?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-surface-2 px-4 py-2.5">
      <div className="flex items-center gap-3 min-w-0">
        <span className="label shrink-0">{label}</span>
        {href ? (
          <a
            href={href}
            target="_blank"
            rel="noreferrer"
            className="mono truncate text-sm text-foreground hover:text-accent"
          >
            {value}
          </a>
        ) : (
          <span className="mono truncate text-sm text-foreground">{value}</span>
        )}
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        <CopyButton value={value} />
        {href && (
          <a href={href} target="_blank" rel="noreferrer" className="icon-btn" aria-label="View on solscan">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="16 18 22 12 16 6" />
              <polyline points="8 6 2 12 8 18" />
            </svg>
          </a>
        )}
      </div>
    </div>
  );
}

// The circular "?" glyph + label cell, then the value — one "Block Details" row.
export function DetailRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="detail-row">
      <span className="row-label">
        <span className="help-dot">?</span>
        {label}
      </span>
      <div className="row-value flex items-center gap-2">{children}</div>
    </div>
  );
}

// Compact overview column card — a small title + key/value rows. Used for
// the 3-up overview grid above the tabs.
export function MiniCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="card p-5">
      <div className="label-xs mb-3.5">{title}</div>
      <dl className="space-y-3">{children}</dl>
    </div>
  );
}

export function MiniRow({ k, children }: { k: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-sm text-muted shrink-0">{k}</dt>
      <dd className="min-w-0 truncate text-right text-sm">{children}</dd>
    </div>
  );
}

// A card titled like Voyager's "Block Details" panel, rows inside.
export function DetailCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="card overflow-hidden">
      <div className="border-b border-border px-5 py-3.5">
        <h3 className="text-sm font-medium">{title}</h3>
      </div>
      {children}
    </div>
  );
}

// Mono value with a copy square — used for PDAs, wallets, signatures.
export function MonoCopy({
  value,
  href,
  truncate,
}: {
  value: string;
  href?: string;
  truncate?: boolean;
}) {
  const text = truncate
    ? `${value.slice(0, 8)}…${value.slice(-8)}`
    : value;
  return (
    <span className="value-pill max-w-full">
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className="mono truncate text-sm text-accent hover:underline"
        >
          {text}
        </a>
      ) : (
        <span className="mono truncate text-sm">{text}</span>
      )}
      <CopyButton value={value} />
    </span>
  );
}
