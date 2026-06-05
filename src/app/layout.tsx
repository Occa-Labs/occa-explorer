import { clusterLabel, getCluster } from "@/lib/cluster";
import type { Metadata } from "next";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import "./globals.css";

export function generateMetadata(): Metadata {
  const desc = `Explore any OCCA company, agent, or invoice on ${clusterLabel()}. Pulled live from chain.`;
  const title = "OCCA Explorer";
  return {
    metadataBase: new URL("https://scan.occaai.com"),
    title: {
      default: title,
      template: "%s · OCCA Explorer",
    },
    description: desc,
    openGraph: {
      title,
      description: desc,
      url: "https://scan.occaai.com",
      siteName: "OCCA Explorer",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
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
