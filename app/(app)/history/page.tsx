"use client";

import { useState } from "react";
import SearchTab from "./search-tab";
import MonthTab from "./month-tab";
import CompareTab from "./compare-tab";

type Tab = "search" | "month" | "compare";

const TABS: { value: Tab; label: string }[] = [
  { value: "search", label: "Search" },
  { value: "month", label: "By Month" },
  { value: "compare", label: "Compare" },
];

export default function HistoryPage() {
  const [tab, setTab] = useState<Tab>("search");

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-4">
      <h1 className="text-lg font-semibold">History</h1>

      <div className="flex gap-1">
        {TABS.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => setTab(t.value)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              tab === t.value
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "search" && <SearchTab />}
      {tab === "month" && <MonthTab />}
      {tab === "compare" && <CompareTab />}
    </div>
  );
}