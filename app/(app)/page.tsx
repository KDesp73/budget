"use client";

import { useState, useEffect, useRef, useTransition } from "react";
import { addExpense, getTodaysExpenses, deleteExpense } from "@/app/actions/expenses";
import { getSettings } from "@/app/actions/settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X } from "lucide-react";
import type { Expense } from "@/app/actions/expenses";



const QUICK_AMOUNTS = [5, 10, 20, 50];

export default function QuickLog() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [total, setTotal] = useState(0);
  const [dailyGoal, setDailyGoal] = useState(0);
  const [quickItems, setQuickItems] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const nameRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();

  const refreshExpenses = () => {
    getTodaysExpenses().then((list) => {
      setExpenses(list);
      setTotal(list.reduce((s, e) => s + e.amount, 0));
    });
  };

  useEffect(() => {
    refreshExpenses();
    getSettings().then((s) => {
      setDailyGoal(s.dailyGoal);
      setQuickItems(s.quickItems);
    });
  }, []);

  const handleSubmit = async (formData: FormData) => {
    startTransition(async () => {
      await addExpense(formData);
      setName("");
      setAmount("");
      nameRef.current?.focus();
      refreshExpenses();
    });
  };

  const handleDelete = async (id: number) => {
    const formData = new FormData();
    formData.set("id", String(id));
    await deleteExpense(formData);
    const list = await getTodaysExpenses();
    setExpenses(list);
    setTotal(list.reduce((s, e) => s + e.amount, 0));
  };

  const handleQuickItem = (item: string) => {
    setName(item);
    setTimeout(() => {
      const el = document.getElementById("amount-input") as HTMLInputElement;
      el?.focus();
    }, 50);
  };

  const handleQuickAmount = (val: number) => {
    setAmount(String(val));
  };

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-6 p-4">
      <div className="rounded-xl bg-primary px-6 py-8 text-center text-primary-foreground">
        <p className="text-sm font-medium opacity-80">Today&apos;s Spending</p>
        <p className="mt-1 text-5xl font-bold tracking-tight">
          €{total.toFixed(2)}
        </p>
        {dailyGoal > 0 && (
          <div className="mx-auto mt-4 w-full max-w-xs">
            <div className="flex items-center justify-between text-xs opacity-80">
              <span>Goal: €{dailyGoal.toFixed(2)}</span>
              <span>{Math.min(Math.round((total / dailyGoal) * 100), 100)}%</span>
            </div>
            <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-primary-foreground/20">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  total > dailyGoal ? "bg-destructive" : "bg-primary-foreground"
                }`}
                style={{ width: `${Math.min((total / dailyGoal) * 100, 100)}%` }}
              />
            </div>
            {total > dailyGoal && (
              <p className="mt-1 text-xs font-medium opacity-80">
                €{(total - dailyGoal).toFixed(2)} over goal
              </p>
            )}
            {total <= dailyGoal && dailyGoal - total > 0 && (
              <p className="mt-1 text-xs opacity-60">
                €{(dailyGoal - total).toFixed(2)} remaining
              </p>
            )}
          </div>
        )}
        {expenses.length > 0 && (
          <p className="mt-1 text-sm opacity-60">
            {expenses.length} {expenses.length === 1 ? "entry" : "entries"}
          </p>
        )}
      </div>

      <form action={handleSubmit} className="space-y-4">
        <input type="hidden" name="type" value="daily" />
        <input
          type="hidden"
          name="date"
          value={new Date().toISOString().slice(0, 10)}
        />

        <Input
          ref={nameRef}
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="What did you spend on?"
          required
          className="h-12 text-base"
          autoFocus
        />

        <div className="flex gap-2">
          <div className="relative flex-1">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-base text-muted-foreground">
              €
            </span>
            <Input
              id="amount-input"
              name="amount"
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              required
              className="h-12 pl-7 text-lg"
            />
          </div>
          <Button
            type="submit"
            disabled={pending || !name || !amount}
            className="h-12 px-6 text-base"
          >
            {pending ? (
              "..."
            ) : (
              <>
                <Plus className="mr-1 size-5" />
                Log
              </>
            )}
          </Button>
        </div>
      </form>

      <div className="flex flex-wrap gap-1.5">
        {QUICK_AMOUNTS.map((val) => (
          <button
            key={val}
            type="button"
            onClick={() => handleQuickAmount(val)}
            className="rounded-lg border bg-background px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            +€{val}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {quickItems.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => handleQuickItem(item)}
            className="rounded-full border bg-background px-4 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            {item}
          </button>
        ))}
      </div>

      {expenses.length > 0 && (
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">Today</p>
          {expenses.map((expense) => (
            <div
              key={expense.id}
              className="flex items-center justify-between rounded-lg border px-4 py-3"
            >
              <span className="text-sm font-medium">{expense.name}</span>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold tabular-nums">
                  €{expense.amount.toFixed(2)}
                </span>
                <button
                  type="button"
                  onClick={() => handleDelete(expense.id)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <X className="size-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
