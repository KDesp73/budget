"use client";

import { useState, useEffect } from "react";
import {
  searchExpenses,
  getCategories,
} from "@/app/actions/expenses";

import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Search } from "lucide-react";
import ExpenseList from "./expense-list";
import type { Expense } from "@/app/actions/expenses";

type DatePreset = "past_week" | "past_month" | "past_3_months" | "past_6_months" | "past_year" | "custom" | "all";

const DATE_PRESETS: { value: DatePreset; label: string }[] = [
  { value: "past_week", label: "Past week" },
  { value: "past_month", label: "Past month" },
  { value: "past_3_months", label: "Past 3 months" },
  { value: "past_6_months", label: "Past 6 months" },
  { value: "past_year", label: "Past year" },
  { value: "custom", label: "Custom" },
  { value: "all", label: "All time" },
];

function getDatesForPreset(preset: DatePreset): { start: string; end: string } | null {
  if (preset === "all" || preset === "custom") return null;

  const end = new Date();
  const start = new Date();

  switch (preset) {
    case "past_week":
      start.setDate(start.getDate() - 7);
      break;
    case "past_month":
      start.setMonth(start.getMonth() - 1);
      break;
    case "past_3_months":
      start.setMonth(start.getMonth() - 3);
      break;
    case "past_6_months":
      start.setMonth(start.getMonth() - 6);
      break;
    case "past_year":
      start.setFullYear(start.getFullYear() - 1);
      break;
  }

  return {
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10),
  };
}

export default function SearchTab() {
  const [loaded, setLoaded] = useState(false);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [type, setType] = useState<"all" | "daily" | "monthly" | "variable_monthly">("all");
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [datePreset, setDatePreset] = useState<DatePreset>("all");
  const [filterVersion, setFilterVersion] = useState(0);
  const [displayLimit, setDisplayLimit] = useState(20);

  const total = expenses.reduce((s, e) => s + e.amount, 0);
  const displayed = expenses.slice(0, displayLimit);
  const hasMore = displayLimit < expenses.length;

  useEffect(() => {
    getCategories().then(setCategories);
  }, []);

  const applyFilters = (updates: {
    search?: string;
    startDate?: string;
    endDate?: string;
    type?: "all" | "daily" | "monthly" | "variable_monthly";
    category?: string;
    datePreset?: DatePreset;
  }) => {
    if ("search" in updates) setSearch(updates.search ?? "");
    if ("type" in updates) setType(updates.type ?? "all");
    if ("category" in updates) setCategory(updates.category ?? "");
    if ("datePreset" in updates) {
      const preset = updates.datePreset ?? "all";
      setDatePreset(preset);
      if (preset !== "custom") {
        const dates = getDatesForPreset(preset);
        setStartDate(dates?.start ?? "");
        setEndDate(dates?.end ?? "");
      }
    }
    if ("startDate" in updates) setStartDate(updates.startDate ?? "");
    if ("endDate" in updates) setEndDate(updates.endDate ?? "");
    setDisplayLimit(20);
    setFilterVersion((v) => v + 1);
  };

  const runQuery = () => {
    const effectiveStart = datePreset !== "custom" && datePreset !== "all"
      ? getDatesForPreset(datePreset)?.start
      : startDate || undefined;
    const effectiveEnd = datePreset !== "custom" && datePreset !== "all"
      ? getDatesForPreset(datePreset)?.end
      : endDate || undefined;

    return searchExpenses({
      search: search || undefined,
      startDate: effectiveStart,
      endDate: effectiveEnd,
      type,
      category: category || undefined,
    });
  };

  useEffect(() => {
    (async () => {
      const result = await runQuery();
      setExpenses(result);
      setLoaded(true);
    })();
  }, [filterVersion]); // eslint-disable-line react-hooks/exhaustive-deps

  const refresh = () => {
    runQuery().then(setExpenses);
  };

  if (!loaded) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="rounded-xl border p-4">
          <div className="space-y-3">
            <div className="h-9 rounded bg-muted" />
            <div className="flex gap-2">
              <div className="h-9 flex-1 rounded bg-muted" />
              <div className="h-9 flex-1 rounded bg-muted" />
            </div>
          </div>
        </div>
        <div className="rounded-xl border p-4">
          <div className="mb-4 h-4 w-28 rounded bg-muted" />
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-10 rounded bg-muted" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => applyFilters({ search: e.target.value })}
              placeholder="Search expenses..."
              className="pl-9"
            />
          </div>

          <div className="flex flex-wrap gap-1">
            {DATE_PRESETS.map((p) => (
              <button
                key={p.value}
                type="button"
                onClick={() => applyFilters({ datePreset: p.value })}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  datePreset === p.value
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {datePreset === "custom" && (
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="mb-1 block text-xs text-muted-foreground">From</label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => applyFilters({ startDate: e.target.value })}
                />
              </div>
              <div className="flex-1">
                <label className="mb-1 block text-xs text-muted-foreground">To</label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => applyFilters({ endDate: e.target.value })}
                />
              </div>
            </div>
          )}

          <div className="flex gap-1">
            {(["all", "daily", "monthly", "variable_monthly"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => applyFilters({ type: t })}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  type === t
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {t === "all" ? "All" : t === "daily" ? "Daily" : t === "monthly" ? "Monthly" : "Variable"}
              </button>
            ))}
          </div>

          {categories.length > 0 && (
            <div className="flex flex-wrap gap-1">
              <button
                type="button"
                onClick={() => applyFilters({ category: "" })}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  category === ""
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                All categories
              </button>
              {categories.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => applyFilters({ category: c })}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                    category === c
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Expenses ({expenses.length})</CardTitle>
          <p className="text-xs text-muted-foreground">€{total.toFixed(2)} total</p>
        </CardHeader>
        {expenses.length === 0 ? (
          <CardContent>
            <p className="text-sm text-muted-foreground">No expenses match your filters</p>
          </CardContent>
        ) : (
          <CardContent className="space-y-1">
            <ExpenseList expenses={displayed} onChanged={refresh} />
            {hasMore && (
              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => setDisplayLimit((p) => p + 20)}
                  className="text-xs text-muted-foreground underline hover:text-foreground"
                >
                  Show more
                </button>
              </div>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  );
}