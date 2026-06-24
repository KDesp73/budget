"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  searchExpenses,
  deleteExpense,
  updateExpense,
} from "@/app/actions/expenses";

import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { X, Check, Pencil, Search } from "lucide-react";
import type { Expense } from "@/app/actions/expenses";

export default function HistoryPage() {
  const [loaded, setLoaded] = useState(false);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [type, setType] = useState<"all" | "daily" | "monthly">("all");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const [filterVersion, setFilterVersion] = useState(0);
  const [displayLimit, setDisplayLimit] = useState(20);

  const total = expenses.reduce((s, e) => s + e.amount, 0);
  const displayed = expenses.slice(0, displayLimit);
  const hasMore = displayLimit < expenses.length;

  const setFilter = (updates: Partial<{ search: string; startDate: string; endDate: string; type: "all" | "daily" | "monthly" }>) => {
    if ("search" in updates) setSearch(updates.search ?? "");
    if ("startDate" in updates) setStartDate(updates.startDate ?? "");
    if ("endDate" in updates) setEndDate(updates.endDate ?? "");
    if ("type" in updates) setType(updates.type ?? "all");
    setDisplayLimit(20);
    setFilterVersion((v) => v + 1);
  };

  useEffect(() => {
    (async () => {
      const result = await searchExpenses({
        search: search || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        type,
      });
      setExpenses(result);
      setLoaded(true);
    })();
  }, [filterVersion]); // eslint-disable-line react-hooks/exhaustive-deps

  const refresh = () => {
    searchExpenses({
      search: search || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      type,
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
    if (!window.confirm("Delete this expense?")) return;
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
              onChange={(e) => setFilter({ search: e.target.value })}
              placeholder="Search expenses..."
              className="pl-9"
            />
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="mb-1 block text-xs text-muted-foreground">From</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setFilter({ startDate: e.target.value })}
              />
            </div>
            <div className="flex-1">
              <label className="mb-1 block text-xs text-muted-foreground">To</label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setFilter({ endDate: e.target.value })}
              />
            </div>
          </div>
          <div className="flex gap-1">
            {(["all", "daily", "monthly"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setFilter({ type: t })}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  type === t
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {t === "all" ? "All" : t === "daily" ? "Daily" : "Monthly"}
              </button>
            ))}
          </div>
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
                      <form action={handleDelete.bind(null, expense.id)}>
                        <button
                          type="submit"
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <X className="size-3.5" />
                        </button>
                      </form>
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
