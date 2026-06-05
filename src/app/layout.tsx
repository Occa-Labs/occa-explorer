import { clusterLabel, getCluster } from "@/lib/cluster";
import type { Metadata } from "next";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import "./globals.css";

export function generateMetadata(): Metadata {
  const cluster = clusterLabel();
  const url = "https://scan.occaai.com";
  const desc = `Explore on-chain OCCA companies, agents, transactions, and invoices on ${cluster}. Public block explorer for the OCCA network, pulled live from chain.`;
  return {
    metadataBase: new URL(url),
    title: {
      default: "OCCA Explorer · On-chain Companies, Agents & Invoices",
      template: "%s · OCCA Explorer",
    },
    description: desc,
    applicationName: "OCCA Explorer",
    keywords: [
      "OCCA",
      "OCCA Explorer",
      "block explorer",
      "Solana",
      "on-chain companies",
      "AI agents",
      "agent invoices",
      "OCCA network",
      cluster,
    ],
    alternates: { canonical: url },
    robots: { index: true, follow: true },
    openGraph: {
      title: "OCCA Explorer",
      description: desc,
      url,
      siteName: "OCCA Explorer",
      type: "website",
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: "OCCA Explorer",
      description: desc,
    },
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col">
        <Nav cluster={getCluster()} />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
