"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  searchExpenses,
  deleteExpense,
  updateExpense,
  getCategories,
} from "@/app/actions/expenses";

import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { X, Check, Pencil, Search } from "lucide-react";
import { useConfirm } from "@/components/confirm-dialog";
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

export default function HistoryPage() {
  const { confirm } = useConfirm();
  const [loaded, setLoaded] = useState(false);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [type, setType] = useState<"all" | "daily" | "monthly" | "variable_monthly">("all");
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [datePreset, setDatePreset] = useState<DatePreset>("all");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editAmount, setEditAmount] = useState("");
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

  useEffect(() => {
    (async () => {
      const effectiveStart = datePreset !== "custom" && datePreset !== "all"
        ? getDatesForPreset(datePreset)?.start
        : startDate || undefined;
      const effectiveEnd = datePreset !== "custom" && datePreset !== "all"
        ? getDatesForPreset(datePreset)?.end
        : endDate || undefined;

      const result = await searchExpenses({
        search: search || undefined,
        startDate: effectiveStart,
        endDate: effectiveEnd,
        type,
        category: category || undefined,
      });
      setExpenses(result);
      setLoaded(true);
    })();
  }, [filterVersion]); // eslint-disable-line react-hooks/exhaustive-deps

  const refresh = () => {
    const effectiveStart = datePreset !== "custom" && datePreset !== "all"
      ? getDatesForPreset(datePreset)?.start
      : startDate || undefined;
    const effectiveEnd = datePreset !== "custom" && datePreset !== "all"
      ? getDatesForPreset(datePreset)?.end
      : endDate || undefined;

    searchExpenses({
      search: search || undefined,
      startDate: effectiveStart,
      endDate: effectiveEnd,
      type,
      category: category || undefined,
    }).then(setExpenses);
  };

  const startEdit = (e: Expense) => {
    setEditingId(e.id);
    setEditName(e.name);
    setEditAmount(String(e.amount));
  };

  const saveEdit = async () => {
    if (!editingId) return;
    await updateExpense(editingId, {
      name: editName,
      amount: Number(editAmount),
    });
    setEditingId(null);
    toast.success("Expense updated");
    refresh();
  };

  const handleDelete = async (id: number) => {
    if (!(await confirm({ title: "Delete expense", message: "Delete this expense?", destructive: true, confirmLabel: "Delete" }))) return;
    const fd = new FormData();
    fd.set("id", String(id));
    await deleteExpense(fd);
    toast.success("Expense deleted");
    refresh();
  };

  if (!loaded) {
    return (
      <div className="mx-auto flex w-full max-w-2xl animate-pulse flex-col gap-6 p-4">
        <div className="h-6 w-20 rounded bg-muted" />
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
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 p-4">
      <h1 className="text-lg font-semibold">History</h1>

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
            {displayed.map((expense) => (
              <div
                key={expense.id}
                className="flex items-center justify-between rounded-lg border px-3 py-2.5"
              >
                {editingId === expense.id ? (
                  <div className="flex flex-1 items-center gap-2">
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="h-8 flex-1"
                    />
                    <Input
                      type="number"
                      step="0.01"
                      value={editAmount}
                      onChange={(e) => setEditAmount(e.target.value)}
                      className="h-8 w-24"
                    />
                    <button
                      type="button"
                      onClick={saveEdit}
                      className="text-green-600 hover:text-green-500"
                    >
                      <Check className="size-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{expense.name}</span>
                      <span className="text-[11px] text-muted-foreground">
                        {expense.date ?? "—"}
                        {expense.type === "monthly" && (
                          <span className="ml-1.5 rounded bg-muted px-1 py-0.5 text-[10px]">
                            monthly
                          </span>
                        )}
                        {expense.type === "variable_monthly" && (
                          <span className="ml-1.5 rounded bg-muted px-1 py-0.5 text-[10px]">
                            variable
                          </span>
                        )}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold tabular-nums">
                        €{expense.amount.toFixed(2)}
                      </span>
                      <button
                        type="button"
                        onClick={() => startEdit(expense)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <Pencil className="size-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(expense.id)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <X className="size-3.5" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
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
