"use client";

import { useActionState, useEffect, useState } from "react";
import { saveSettings, getSettings, saveQuickItems, saveQuickAmounts, saveCategoryBudgets } from "@/app/actions/settings";
import {
  getExpenses,
  addExpense,
  deleteExpense,
  updateExpense,
} from "@/app/actions/expenses";
import { logout } from "@/app/actions/auth";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Edit, LogOut, Plus, X, Sun, Moon } from "lucide-react";
import type { Expense } from "@/app/actions/expenses";

export default function SettingsPage() {
  const [loaded, setLoaded] = useState(false);
  const [salary, setSalary] = useState("");
  const [percentage, setPercentage] = useState("");
  const [dailyGoal, setDailyGoal] = useState("");
  const [monthlyExpenses, setMonthlyExpenses] = useState<Expense[]>([]);
  const [quickItems, setQuickItems] = useState<string[]>([]);
  const [newItem, setNewItem] = useState("");
  const [quickAmounts, setQuickAmounts] = useState<number[]>([]);
  const [newAmount, setNewAmount] = useState("");
  const [darkMode, setDarkMode] = useState(() =>
    typeof document !== "undefined" && document.documentElement.classList.contains("dark")
  );
  const [categoryBudgets, setCategoryBudgets] = useState<Record<string, number>>({});
  const [budgetCategory, setBudgetCategory] = useState("");
  const [budgetAmount, setBudgetAmount] = useState("");
  const [editingMonthly, setEditingMonthly] = useState<number | null>(null);
  const [editMonthlyName, setEditMonthlyName] = useState("");
  const [editMonthlyAmount, setEditMonthlyAmount] = useState("");
  const [state, action, pending] = useActionState(saveSettings, undefined);

  const refreshMonthly = () =>
    getExpenses("monthly").then(setMonthlyExpenses);

  const startEditMonthly = (expense: Expense) => {
    setEditingMonthly(expense.id);
    setEditMonthlyName(expense.name);
    setEditMonthlyAmount(String(expense.amount));
  };

  const saveEditMonthly = async (id: number) => {
    await updateExpense(id, { name: editMonthlyName, amount: Number(editMonthlyAmount) });
    setEditingMonthly(null);
    refreshMonthly();
    toast.success("Expense updated");
  };

  useEffect(() => {
    getSettings().then((s) => {
      setSalary(String(s.monthlySalary));
      setPercentage(String(s.savingsPercentage));
      setDailyGoal(String(s.dailyGoal));
      setQuickItems(s.quickItems);
      setQuickAmounts(s.quickAmounts);
      setCategoryBudgets(s.categoryBudgets);
    });
    refreshMonthly().then(() => setLoaded(true));
  }, []);

  if (!loaded) {
    return (
      <div className="mx-auto flex w-full max-w-lg animate-pulse flex-col gap-6 p-4">
        <div className="h-6 w-28 rounded bg-muted" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-xl border p-4">
            <div className="mb-4 h-4 w-32 rounded bg-muted" />
            <div className="space-y-3">
              <div className="h-9 rounded bg-muted" />
              <div className="h-9 rounded bg-muted" />
              <div className="h-9 w-20 rounded bg-muted" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-lg space-y-6 p-4">
      <div>
        <h1 className="text-lg font-semibold">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Configure your monthly income and savings goal
        </p>
      </div>

      <Card>
          <CardHeader>
            <CardTitle>Budget</CardTitle>
            <CardDescription>
              Your monthly income, savings goal, and daily spending target
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={action} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="monthly_salary" className="text-sm font-medium">
                  Monthly Salary (€)
                </label>
                <Input
                  id="monthly_salary"
                  name="monthly_salary"
                  type="number"
                  step="0.01"
                  value={salary}
                  onChange={(e) => setSalary(e.target.value)}
                  placeholder="0.00"
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="savings_percentage" className="text-sm font-medium">
                  Savings Target (%)
                </label>
                <Input
                  id="savings_percentage"
                  name="savings_percentage"
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  value={percentage}
                  onChange={(e) => setPercentage(e.target.value)}
                  placeholder="20"
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="daily_goal" className="text-sm font-medium">
                  Daily Spending Goal (€)
                </label>
                <Input
                  id="daily_goal"
                  name="daily_goal"
                  type="number"
                  step="0.01"
                  value={dailyGoal}
                  onChange={(e) => setDailyGoal(e.target.value)}
                  placeholder="0.00"
                />
              </div>
              {state?.success && (
                <p className="text-sm text-green-600 dark:text-green-400">
                  Settings saved
                </p>
              )}
              <Button type="submit" disabled={pending}>
                {pending ? "Saving..." : "Save"}
              </Button>
            </form>
          </CardContent>
        </Card>

      <Card>
        <CardHeader>
          <CardTitle>Monthly Expenses</CardTitle>
          <CardDescription>Recurring fixed expenses each month</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <form
            action={addExpense}
            onSubmit={() => setTimeout(refreshMonthly, 100)}
            className="flex gap-2"
          >
            <input type="hidden" name="type" value="monthly" />
            <Input
              name="name"
              placeholder="Name (e.g. Rent)"
              required
              className="flex-1"
            />
            <Input
              name="amount"
              type="number"
              step="0.01"
              placeholder="Amount"
              required
              className="w-28"
            />
            <Button type="submit">Add</Button>
          </form>
          {monthlyExpenses.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No monthly expenses added yet
            </p>
          ) : (
            <div className="space-y-1">
              {monthlyExpenses.map((expense) => (
                <div
                  key={expense.id}
                  className="flex items-center justify-between rounded-lg border px-3 py-2"
                >
                  {editingMonthly === expense.id ? (
                    <div className="flex w-full items-center gap-2">
                      <Input
                        value={editMonthlyName}
                        onChange={(e) => setEditMonthlyName(e.target.value)}
                        placeholder="Name"
                        className="flex-1"
                      />
                      <Input
                        value={editMonthlyAmount}
                        onChange={(e) => setEditMonthlyAmount(e.target.value)}
                        type="number"
                        step="0.01"
                        placeholder="Amount"
                        className="w-24"
                      />
                      <Button size="xs" onClick={() => saveEditMonthly(expense.id)}>
                        Save
                      </Button>
                      <Button
                        size="xs"
                        variant="ghost"
                        onClick={() => setEditingMonthly(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <>
                      <span className="text-sm">{expense.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          €{expense.amount.toFixed(2)}
                        </span>
                        <button
                          type="button"
                          onClick={() => startEditMonthly(expense)}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <Edit className="size-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            if (window.confirm("Delete this expense?")) {
                              const fd = new FormData();
                              fd.set("id", String(expense.id));
                              await deleteExpense(fd);
                              refreshMonthly();
                              toast.success("Expense deleted");
                            }
                          }}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <X className="size-3.5" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Category Budgets</CardTitle>
          <CardDescription>Monthly spending limits per category</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input
              value={budgetCategory}
              onChange={(e) => setBudgetCategory(e.target.value)}
              placeholder="Category name"
              className="flex-1"
              list="category-suggestions"
            />
            <datalist id="category-suggestions">
              {quickItems.map((item) => (
                <option key={item} value={item} />
              ))}
            </datalist>
            <Input
              type="number"
              step="0.01"
              value={budgetAmount}
              onChange={(e) => setBudgetAmount(e.target.value)}
              placeholder="Budget"
              className="w-24"
            />
            <Button
              type="button"
              disabled={!budgetCategory.trim() || !budgetAmount}
              onClick={() => {
                if (budgetCategory.trim() && Number(budgetAmount) > 0) {
                  const next = { ...categoryBudgets, [budgetCategory.trim()]: Number(budgetAmount) };
                  setCategoryBudgets(next);
                  saveCategoryBudgets(next);
                  setBudgetCategory("");
                  setBudgetAmount("");
                }
              }}
            >
              <Plus className="size-4" />
            </Button>
          </div>
          {Object.keys(categoryBudgets).length === 0 ? (
            <p className="text-sm text-muted-foreground">No category budgets set</p>
          ) : (
            <div className="space-y-2">
              {Object.entries(categoryBudgets).map(([cat, budget]) => (
                <div
                  key={cat}
                  className="flex items-center justify-between rounded-lg border px-3 py-2"
                >
                  <span className="text-sm">{cat}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">€{budget.toFixed(2)}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const next = { ...categoryBudgets };
                        delete next[cat];
                        setCategoryBudgets(next);
                        saveCategoryBudgets(next);
                      }}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <X className="size-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quick Amounts</CardTitle>
          <CardDescription>
            Preset amounts shown on the home page for quick logging
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input
              value={newAmount}
              onChange={(e) => setNewAmount(e.target.value)}
              placeholder="Add amount..."
              type="number"
              step="0.01"
              className="flex-1"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  const val = parseFloat(newAmount);
                  if (!isNaN(val) && val > 0 && !quickAmounts.includes(val)) {
                    const next = [...quickAmounts, val];
                    setQuickAmounts(next);
                    saveQuickAmounts(next);
                    setNewAmount("");
                  }
                }
              }}
            />
            <Button
              type="button"
              disabled={!newAmount.trim()}
              onClick={() => {
                const val = parseFloat(newAmount);
                if (!isNaN(val) && val > 0 && !quickAmounts.includes(val)) {
                  const next = [...quickAmounts, val];
                  setQuickAmounts(next);
                  saveQuickAmounts(next);
                  setNewAmount("");
                }
              }}
            >
              <Plus className="size-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {quickAmounts.map((amount, i) => (
              <div
                key={amount}
                className="group flex items-center gap-1.5 rounded-full border bg-background px-3 py-1.5 text-sm"
              >
                <span>+€{amount}</span>
                <button
                  type="button"
                  onClick={() => {
                    const next = quickAmounts.filter((_, j) => j !== i);
                    setQuickAmounts(next);
                    saveQuickAmounts(next);
                  }}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <X className="size-3.5" />
                </button>
              </div>
            ))}
          </div>
          {quickAmounts.length === 0 && (
            <p className="text-sm text-muted-foreground">No amounts added</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quick Categories</CardTitle>
          <CardDescription>
            Preset labels shown on the home page for quick logging
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              placeholder="Add category..."
              className="flex-1"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  if (newItem.trim() && !quickItems.includes(newItem.trim())) {
                    const next = [...quickItems, newItem.trim()];
                    setQuickItems(next);
                    saveQuickItems(next);
                    setNewItem("");
                  }
                }
              }}
            />
            <Button
              type="button"
              disabled={!newItem.trim()}
              onClick={() => {
                if (newItem.trim() && !quickItems.includes(newItem.trim())) {
                  const next = [...quickItems, newItem.trim()];
                  setQuickItems(next);
                  saveQuickItems(next);
                  setNewItem("");
                }
              }}
            >
              <Plus className="size-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {quickItems.map((item, i) => (
              <div
                key={item}
                className="group flex items-center gap-1.5 rounded-full border bg-background px-3 py-1.5 text-sm"
              >
                <span>{item}</span>
                <button
                  type="button"
                  onClick={() => {
                    const next = quickItems.filter((_, j) => j !== i);
                    setQuickItems(next);
                    saveQuickItems(next);
                  }}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <X className="size-3.5" />
                </button>
              </div>
            ))}
          </div>
          {quickItems.length === 0 && (
            <p className="text-sm text-muted-foreground">No categories added</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>Manage your account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Dark Mode</span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const next = !darkMode;
                setDarkMode(next);
                document.documentElement.classList.toggle("dark");
                localStorage.setItem("theme", next ? "dark" : "light");
              }}
            >
              {darkMode ? <Moon className="size-4" /> : <Sun className="size-4" />}
            </Button>
          </div>
          <form action={logout}>
            <Button type="submit" variant="outline" className="w-full">
              <LogOut className="mr-2 size-4" />
              Sign out
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
