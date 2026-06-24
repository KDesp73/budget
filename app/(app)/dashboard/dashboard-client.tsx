"use client";

import { useState, useCallback } from "react";
import { getExpensesByMonth } from "@/app/actions/expenses";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import SpendingChart from "./spending-chart";
import CategoryPie from "./category-pie";
import CalendarGrid from "./calendar-grid";
import type { DailyTotal, Expense } from "@/app/actions/expenses";
import type { Settings } from "@/app/actions/settings";

export default function DashboardClient({
  initialYear,
  initialMonth,
  initialData,
  initialSettings,
  initialMonthly,
}: {
  initialYear: number;
  initialMonth: number;
  initialData: DailyTotal[];
  initialSettings: Settings;
  initialMonthly: Expense[];
}) {
  const [year, setYear] = useState(initialYear);
  const [month, setMonth] = useState(initialMonth);
  const [data, setData] = useState(initialData);
  const [settings] = useState(initialSettings);
  const [monthlyExpenses] = useState(initialMonthly);

  const fetchMonth = useCallback(async (y: number, m: number) => {
    const result = await getExpensesByMonth(y, m);
    setData(result);
  }, []);

  const goPrev = () => {
    const newMonth = month === 1 ? 12 : month - 1;
    const newYear = month === 1 ? year - 1 : year;
    setMonth(newMonth);
    setYear(newYear);
    fetchMonth(newYear, newMonth);
  };

  const goNext = () => {
    const newMonth = month === 12 ? 1 : month + 1;
    const newYear = month === 12 ? year + 1 : year;
    setMonth(newMonth);
    setYear(newYear);
    fetchMonth(newYear, newMonth);
  };

  const totalMonthly = monthlyExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalThisMonth = data.reduce((sum, d) => sum + d.total, 0);
  const savingsTarget =
    (settings.monthlySalary * settings.savingsPercentage) / 100;
  const remaining = settings.monthlySalary - totalMonthly - savingsTarget;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-4">
      <h1 className="text-lg font-semibold">Dashboard</h1>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardDescription>Monthly Salary</CardDescription>
            <CardTitle className="text-2xl">
              €{settings.monthlySalary.toFixed(2)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Fixed Expenses</CardDescription>
            <CardTitle className="text-2xl">
              €{totalMonthly.toFixed(2)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Savings ({settings.savingsPercentage}%)</CardDescription>
            <CardTitle className="text-2xl">
              €{savingsTarget.toFixed(2)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Remaining</CardDescription>
            <CardTitle
              className={`text-2xl ${remaining < 0 ? "text-destructive" : ""}`}
            >
              €{remaining.toFixed(2)}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SpendingChart data={data} />
        </div>
        <CategoryPie data={data} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Month Summary</CardTitle>
              <CardDescription>
                {data.filter((d) => d.total > 0).length} days with expenses
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total spent</span>
                <span className="font-semibold">€{totalThisMonth.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Daily average</span>
                <span className="font-semibold">
                  €
                  {(
                    totalThisMonth /
                    Math.max(data.filter((d) => d.total > 0).length, 1)
                  ).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Biggest day</span>
                <span className="font-semibold">
                  €
                  {Math.max(...data.map((d) => d.total), 0).toFixed(2)}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-3">
          <CalendarGrid
            data={data}
            year={year}
            month={month}
            onPrev={goPrev}
            onNext={goNext}
          />
        </div>
      </div>
    </div>
  );
}
