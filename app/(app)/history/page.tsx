"use client";

import { useState, useEffect } from "react";
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
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [type, setType] = useState<"all" | "daily" | "monthly">("all");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editAmount, setEditAmount] = useState("");

  useEffect(() => {
    (async () => {
      const result = await searchExpenses({
        search: search || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        type,
      });
      setExpenses(result);
    })();
  }, [search, startDate, endDate, type]);

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
    refresh();
  };

  const handleDelete = async (id: number) => {
    const fd = new FormData();
    fd.set("id", String(id));
    await deleteExpense(fd);
    refresh();
  };

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
              onChange={(e) => setSearch(e.target.value)}
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
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <label className="mb-1 block text-xs text-muted-foreground">To</label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-1">
            {(["all", "daily", "monthly"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
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
        </CardHeader>
        {expenses.length === 0 ? (
          <CardContent>
            <p className="text-sm text-muted-foreground">No expenses match your filters</p>
          </CardContent>
        ) : (
          <CardContent className="space-y-1">
            {expenses.map((expense) => (
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
          </CardContent>
        )}
      </Card>
    </div>
  );
}
