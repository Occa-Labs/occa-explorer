"use client";

import { useState, type ReactNode } from "react";

export interface TabSpec {
  key: string;
  label: string;
  count?: number;
  icon?: ReactNode;
  content: ReactNode;
}

// Voyager-style tabs — icon + label, active tab is a filled pill. Panels
// are server-rendered upstream and passed as `content`; this toggles them.
export function Tabs({ tabs }: { tabs: TabSpec[] }) {
  const [active, setActive] = useState(tabs[0]?.key);

  return (
    // Tab strip + card scroll together: on narrow screens the inner block
    // keeps a min-width so the card stays wide enough for the morph, and the
    // whole thing scrolls horizontally instead of squeezing the tabs.
    <div className="overflow-x-auto md:overflow-visible">
      <div className="min-w-[640px] md:min-w-0">
        <div className="flex items-end gap-1.5">
          {tabs.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setActive(t.key)}
              className={`tab ${active === t.key ? "tab-active" : ""}`}
            >
              {t.icon && <span className="tab-ico">{t.icon}</span>}
              <span>
                {t.label}
                {t.count !== undefined && (
                  <span className="text-faint"> ({t.count})</span>
                )}
              </span>
            </button>
          ))}
        </div>

        <div className={`tab-body ${active === tabs[0]?.key ? "first-active" : ""}`}>
          {tabs.map((t) => (
            <div key={t.key} hidden={active !== t.key}>
              {t.content}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
