import Link from "next/link";
import { clusterLabel } from "@/lib/cluster";
import { Logo } from "./logo";

function Col({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div className="flex flex-col gap-3">
      <span className="text-sm font-medium text-foreground">{title}</span>
      {links.map((l) => (
        <Link key={l.label} href={l.href} className="text-sm text-muted hover:text-foreground">
          {l.label}
        </Link>
      ))}
    </div>
  );
}

// Footer — wordmark + columns, mirrors the Voyager three-column layout.
export function Footer() {
  return (
    <footer className="mt-20 border-t border-border">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-5 py-12 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Logo className="h-6 w-6 text-foreground" />
            <span className="text-sm font-semibold tracking-wide">Explorer</span>
          </div>
          <p className="max-w-xs text-sm text-muted">
            Public explorer for OCCA on-chain activity. Companies, agents and
            invoices, pulled live from chain.
          </p>
        </div>

        <Col
          title="OCCA"
          links={[
            { label: "What is OCCA?", href: "https://occaai.com" },
            { label: "OCCA OS", href: "https://os.occaai.com" },
            { label: "Documentation", href: "https://occaai.com" },
          ]}
        />
        <Col
          title="Resources"
          links={[
            { label: "Companies", href: "/" },
            { label: "Agents", href: "/" },
            { label: "Recent anchors", href: "/" },
          ]}
        />
        <Col
          title="Legal"
          links={[
            { label: "Terms of Use", href: "https://occaai.com" },
            { label: "Privacy Policy", href: "https://occaai.com" },
          ]}
        />
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-5 text-xs text-faint sm:flex-row sm:items-center sm:justify-between">
          <span>© 2026 OCCA. All Rights Reserved.</span>
          <span>Reading {clusterLabel()} live from chain.</span>
        </div>
      </div>
    </footer>
  );
}
