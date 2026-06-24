"use client";

import { useActionState, useEffect, useState } from "react";
import { saveSettings, getSettings } from "@/app/actions/settings";
import {
  getExpenses,
  addExpense,
  deleteExpense,
} from "@/app/actions/expenses";
import { logout } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { LogOut } from "lucide-react";
import type { Expense } from "@/app/actions/expenses";

export default function SettingsPage() {
  const [loaded, setLoaded] = useState(false);
  const [salary, setSalary] = useState("");
  const [percentage, setPercentage] = useState("");
  const [dailyGoal, setDailyGoal] = useState("");
  const [monthlyExpenses, setMonthlyExpenses] = useState<Expense[]>([]);
  const [state, action, pending] = useActionState(saveSettings, undefined);

  const refreshMonthly = () =>
    getExpenses("monthly").then(setMonthlyExpenses);

  useEffect(() => {
    getSettings().then((s) => {
      setSalary(String(s.monthlySalary));
      setPercentage(String(s.savingsPercentage));
      setDailyGoal(String(s.dailyGoal));
    });
    refreshMonthly().then(() => setLoaded(true));
  }, []);

  if (!loaded) return null;

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
                  <span className="text-sm">{expense.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      €{expense.amount.toFixed(2)}
                    </span>
                    <form action={deleteExpense}>
                      <input type="hidden" name="id" value={expense.id} />
                      <Button
                        type="submit"
                        variant="ghost"
                        size="xs"
                        className="text-muted-foreground hover:text-destructive"
                      >
                        ✕
                      </Button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>Sign out of your account</CardDescription>
        </CardHeader>
        <CardContent>
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
