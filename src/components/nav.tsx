"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { SearchBar } from "./search-bar";
import { Logo } from "./logo";
import { IconCompany, IconAgents, IconTx, IconInvoices } from "./icons";

const EXPLORE = [
  { href: "/companies", label: "Companies", icon: <IconCompany /> },
  { href: "/agents", label: "Agents", icon: <IconAgents /> },
  { href: "/transactions", label: "Transactions", icon: <IconTx /> },
  { href: "/invoices", label: "Invoices", icon: <IconInvoices /> },
];

function ExploreMenu() {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; right: number }>({ top: 0, right: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  function place() {
    const r = btnRef.current?.getBoundingClientRect();
    if (r) setPos({ top: r.bottom + 12, right: window.innerWidth - r.right });
  }

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (
        menuRef.current && !menuRef.current.contains(e.target as Node) &&
        btnRef.current && !btnRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    document.addEventListener("mousedown", onDoc);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
      document.removeEventListener("mousedown", onDoc);
    };
  }, [open]);

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={() => {
          place();
          setOpen((o) => !o);
        }}
        className="nav-link"
      >
        Explore
        <svg
          width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open &&
        createPortal(
          <div
            ref={menuRef}
            style={{ position: "fixed", top: pos.top, right: pos.right }}
            className="z-50 w-52 rounded-xl bg-white/[0.12] p-1.5 shadow-2xl backdrop-blur-2xl"
          >
            {EXPLORE.map((i) => (
              <Link
                key={i.href}
                href={i.href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted hover:bg-white/10 hover:text-foreground"
              >
                <span className="text-faint">{i.icon}</span>
                {i.label}
              </Link>
            ))}
          </div>,
          document.body,
        )}
    </>
  );
}

// Top navigation bar — transparent over the hero glow, frosts to a blurred
// background once the page is scrolled.
export function Nav({ cluster }: { cluster: string }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const clusterLabel = cluster.charAt(0).toUpperCase() + cluster.slice(1);

  return (
    <header
      className={`sticky top-0 z-30 transition-all duration-300 ${
        scrolled ? "bg-background/65 backdrop-blur-xl" : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center gap-2.5 px-4 sm:gap-4 sm:px-5 h-14">
        {/* Wordmark */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <Logo className="h-6 w-6 text-foreground" />
          <span className="hidden text-sm font-semibold tracking-wide sm:inline">Explorer</span>
        </Link>

        <SearchBar />

        <ExploreMenu />

        {/* Network selector */}
        <div className="pill text-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-success" />
          <span>{clusterLabel}</span>
        </div>
      </div>
    </header>
  );
}
