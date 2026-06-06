// Small "view on Solscan" external-link icon, placed next to any on-chain
// identifier (tx signature, PDA, wallet). relative z-10 so it stays
// clickable inside stretched-link rows.
export function SolscanLink({ href, className }: { href: string; className?: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      title="View on Solscan"
      aria-label="View on Solscan"
      className={`relative z-10 inline-flex shrink-0 text-faint transition-colors hover:text-accent ${className ?? ""}`}
    >
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 3h6v6" />
        <path d="M10 14 21 3" />
        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      </svg>
    </a>
  );
}
