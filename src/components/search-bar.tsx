"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

// Submits to /search, which resolves the query server-side:
//   invoice ID (uuid) → invoice · tx signature → transaction ·
//   PDA → company/agent · anything else → name search.
export function SearchBar() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // "/" focuses the search, like the Shortcut badge advertises.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "/" && document.activeElement !== inputRef.current) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const v = q.trim();
    if (!v) return;
    router.push(`/search?q=${encodeURIComponent(v)}`);
  }

  return (
    <form onSubmit={submit} className="flex-1">
      <div className="flex items-center gap-2.5 rounded-xl bg-surface-2 px-3.5 h-10">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-faint shrink-0">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <input
          ref={inputRef}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by name, PDA, tx signature, or invoice ID"
          className="flex-1 bg-transparent text-sm text-foreground placeholder:text-faint outline-none"
        />
        <span className="hidden sm:inline-flex items-center rounded-md bg-surface px-1.5 py-0.5 text-[0.6875rem] text-muted">
          Shortcut /
        </span>
      </div>
    </form>
  );
}
