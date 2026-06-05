import { clusterLabel } from "@/lib/cluster";
import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "OCCA Explorer — on-chain companies, agents, transactions & invoices";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#070605",
          backgroundImage:
            "radial-gradient(900px 560px at 16% -10%, rgba(245,132,31,0.28), rgba(245,132,31,0) 70%)",
          color: "#f1f1f2",
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
          padding: "80px",
          justifyContent: "space-between",
        }}
      >
        {/* Top row: logo + wordmark */}
        <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
          <svg width="52" height="52" viewBox="0 0 81 83" xmlns="http://www.w3.org/2000/svg">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M11.9012 12.3751C20.6503 3.46784 32.4232 -0.638519 43.9599 0.0803293C50.1049 0.750285 57.784 3.57738 61.2465 10.8287C65.6467 20.0442 60.5032 28.3427 70.1951 33.6898C82.2021 40.3142 82.0318 51.031 79.8602 56.6885C79.8602 56.6885 79.8763 56.6766 79.9077 56.6536C77.9259 61.7298 74.9085 66.4956 70.8525 70.6249C54.815 86.9522 28.6173 87.1486 12.3384 71.0634C-3.94053 54.9782 -4.13625 28.7025 11.9012 12.3751ZM30.0882 22.2413C19.4765 28.4927 15.9268 42.1885 22.1596 52.8317C28.3924 63.4749 42.0476 67.0353 52.6592 60.7839C63.2708 54.5325 66.8206 40.8367 60.5878 30.1935C54.355 19.5503 40.6999 15.99 30.0882 22.2413Z"
              fill="#f1f1f2"
            />
            <path
              d="M77.033 22.6797C78.2915 24.8287 77.5748 27.594 75.4322 28.8562C73.2896 30.1184 70.5325 29.3995 69.274 27.2506C68.0156 25.1016 68.7323 22.3363 70.8749 21.0741C73.0175 19.8119 75.7746 20.5308 77.033 22.6797Z"
              fill="#f1f1f2"
            />
          </svg>
          <div style={{ fontSize: 26, letterSpacing: "0.06em", fontWeight: 600 }}>
            OCCA EXPLORER
          </div>
        </div>

        {/* Headline */}
        <div
          style={{
            fontSize: 86,
            lineHeight: 1.04,
            fontWeight: 600,
            letterSpacing: "-0.02em",
            maxWidth: "980px",
          }}
        >
          On-chain companies,
          <br />
          agents &amp; <span style={{ color: "#f5841f" }}>invoices.</span>
        </div>

        {/* Bottom row: tagline + cluster */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 22,
            letterSpacing: "0.04em",
            color: "#8d8d93",
          }}
        >
          <span>Public explorer · pulled live from chain</span>
          <span style={{ display: "flex", alignItems: "center", gap: "10px", color: "#f1f1f2" }}>
            <span style={{ width: 10, height: 10, borderRadius: 9999, backgroundColor: "#4ac97e" }} />
            {clusterLabel()}
          </span>
        </div>
      </div>
    ),
    { ...size },
  );
}
