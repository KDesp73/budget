"use server";

import { db } from "@/db/index";
import { verifySession } from "@/lib/dal";
import { revalidatePath } from "next/cache";
import { getBudgetDateRange, getPeriodLabel } from "@/lib/budget";

const REVALIDATE_PATHS = ["/", "/dashboard", "/settings", "/history"];

function toPlain(row: Record<string, unknown>): Expense {
  return {
    id: Number(row.id),
    name: String(row.name),
    amount: Number(row.amount),
    type: row.type as "monthly" | "daily" | "variable_monthly",
    date: row.date ? String(row.date) : null,
    created_at: String(row.created_at),
  };
}

export type Expense = {
  id: number;
  name: string;
  amount: number;
  type: "monthly" | "daily" | "variable_monthly";
  date: string | null;
  created_at: string;
};

export async function getExpenses(type?: "monthly" | "daily" | "variable_monthly"): Promise<Expense[]> {
  await verifySession();

  let sql = "SELECT id, name, amount, type, date, created_at FROM expenses";
  const params: (string | number)[] = [];

  if (type) {
    sql += " WHERE type = ?";
    params.push(type);
  }

  sql += " ORDER BY created_at DESC";

  const result = await db.execute(sql, params);
  return result.rows.map((r) => toPlain(r as Record<string, unknown>));
}

export async function getTodaysExpenses(): Promise<Expense[]> {
  await verifySession();

  const today = new Date().toISOString().slice(0, 10);

  const result = await db.execute(
    "SELECT id, name, amount, type, date, created_at FROM expenses WHERE type = 'daily' AND date = ? ORDER BY created_at DESC",
    [today]
  );

  return result.rows.map((r) => toPlain(r as Record<string, unknown>));
}

export type DailyTotal = {
  date: string;
  total: number;
  day: number;
  expenses: Expense[];
};

export async function getExpensesByDateRange(
  startDate: string,
  endDate: string
): Promise<DailyTotal[]> {
  await verifySession();

  const result = await db.execute(
    `SELECT id, name, amount, type, date, created_at
     FROM expenses
     WHERE type = 'daily'
       AND date >= ?
       AND date <= ?
     ORDER BY date ASC, created_at ASC`,
    [startDate, endDate]
  );

  const expenses = result.rows.map((r) =>
    toPlain(r as Record<string, unknown>)
  );

  const map = new Map<string, Expense[]>();
  for (const e of expenses) {
    const d = e.date ?? "";
    if (!map.has(d)) map.set(d, []);
    map.get(d)!.push(e);
  }

  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffDays = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  const dailyTotals: DailyTotal[] = [];

  for (let offset = 0; offset < diffDays; offset++) {
    const d = new Date(start);
    d.setDate(d.getDate() + offset);
    const dateStr = d.toISOString().slice(0, 10);
    const dayExpenses = map.get(dateStr) ?? [];
    dailyTotals.push({
      date: dateStr,
      day: d.getDate(),
      total: dayExpenses.reduce((s, e) => s + e.amount, 0),
      expenses: dayExpenses,
    });
  }

  return dailyTotals;
}

export async function getExpensesByMonth(
  year: number,
  month: number
): Promise<DailyTotal[]> {
  await verifySession();

  const monthStr = `${year}-${String(month).padStart(2, "0")}`;

  const result = await db.execute(
    `SELECT id, name, amount, type, date, created_at
     FROM expenses
     WHERE type = 'daily'
       AND date LIKE ?
     ORDER BY date ASC, created_at ASC`,
    [`${monthStr}%`]
  );

  const expenses = result.rows.map((r) =>
    toPlain(r as Record<string, unknown>)
  );

  const map = new Map<string, Expense[]>();
  for (const e of expenses) {
    const d = e.date ?? "";
    if (!map.has(d)) map.set(d, []);
    map.get(d)!.push(e);
  }

  const daysInMonth = new Date(year, month, 0).getDate();
  const dailyTotals: DailyTotal[] = [];

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${monthStr}-${String(day).padStart(2, "0")}`;
    const dayExpenses = map.get(dateStr) ?? [];
    dailyTotals.push({
      date: dateStr,
      day,
      total: dayExpenses.reduce((s, e) => s + e.amount, 0),
      expenses: dayExpenses,
    });
  }

  return dailyTotals;
}

export async function addExpense(formData: FormData) {
  await verifySession();

  const name = formData.get("name") as string;
  const amount = Number(formData.get("amount"));
  const type = (formData.get("type") as "monthly" | "daily" | "variable_monthly") || "daily";
  const date = (formData.get("date") as string) || null;

  if (!name || !amount) return;

  await db.execute(
    "INSERT INTO expenses (name, amount, type, date) VALUES (?, ?, ?, ?)",
    [name, amount, type, date]
  );

  REVALIDATE_PATHS.forEach((p) => revalidatePath(p));
}

export async function deleteExpense(formData: FormData) {
  await verifySession();

  const id = Number(formData.get("id"));

  await db.execute("DELETE FROM expenses WHERE id = ?", [id]);

  REVALIDATE_PATHS.forEach((p) => revalidatePath(p));
}

export async function searchExpenses(query: {
  search?: string;
  startDate?: string;
  endDate?: string;
  type?: "daily" | "monthly" | "variable_monthly" | "all";
}): Promise<Expense[]> {
  await verifySession();

  const conditions: string[] = [];
  const params: (string | number)[] = [];

  if (query.search) {
    conditions.push("name LIKE ?");
    params.push(`%${query.search}%`);
  }

  if (query.startDate) {
    conditions.push("date >= ?");
    params.push(query.startDate);
  }

  if (query.endDate) {
    conditions.push("date <= ?");
    params.push(query.endDate);
  }

  if (query.type && query.type !== "all") {
    conditions.push("type = ?");
    params.push(query.type);
  } else if (!query.type || query.type === "all") {
    conditions.push("type != ?");
    params.push("variable_monthly");
  }

  const where = conditions.length > 0 ? ` WHERE ${conditions.join(" AND ")}` : "";
  const sql = `SELECT id, name, amount, type, date, created_at FROM expenses${where} ORDER BY created_at DESC`;

  const result = await db.execute(sql, params);
  return result.rows.map((r) => toPlain(r as Record<string, unknown>));
}

export async function exportDateRangeCSV(startDate: string, endDate: string): Promise<string> {
  await verifySession();

  const result = await db.execute(
    `SELECT name, amount, type, date, created_at
     FROM expenses
      WHERE (type = 'daily' AND date >= ? AND date <= ?) OR type = 'monthly' OR type = 'variable_monthly'
     ORDER BY date ASC, created_at ASC`,
    [startDate, endDate]
  );

  const rows = result.rows.map((r) => toPlain(r as Record<string, unknown>));
  const header = "Name,Amount,Type,Date\n";
  const body = rows
    .map((r) => `${r.name},${r.amount.toFixed(2)},${r.type},${r.date ?? ""}`)
    .join("\n");
  return header + body;
}

export async function exportMonthCSV(year: number, month: number): Promise<string> {
  await verifySession();

  const monthStr = `${year}-${String(month).padStart(2, "0")}`;
  const result = await db.execute(
    `SELECT name, amount, type, date, created_at
     FROM expenses
      WHERE (type = 'daily' AND date LIKE ?) OR type = 'monthly' OR type = 'variable_monthly'
     ORDER BY date ASC, created_at ASC`,
    [`${monthStr}%`]
  );

  const rows = result.rows.map((r) => toPlain(r as Record<string, unknown>));
  const header = "Name,Amount,Type,Date\n";
  const body = rows
    .map((r) => `${r.name},${r.amount.toFixed(2)},${r.type},${r.date ?? ""}`)
    .join("\n");
  return header + body;
}

export type PeriodSummary = {
  year: number;
  month: number;
  label: string;
  total: number;
};

export async function getPreviousPeriodData(paydayDay: number, year: number, month: number): Promise<DailyTotal[]> {
  await verifySession();

  let prevYear: number, prevMonth: number;
  if (month === 1) {
    prevYear = year - 1;
    prevMonth = 12;
  } else {
    prevYear = year;
    prevMonth = month - 1;
  }

  const { startDate, endDate } = getBudgetDateRange(paydayDay, prevYear, prevMonth);
  return getExpensesByDateRange(startDate, endDate);
}

export async function getMultiPeriodTotals(paydayDay: number, year: number, month: number, count: number = 6): Promise<PeriodSummary[]> {
  await verifySession();

  const periods: { year: number; month: number }[] = [];
  let curYear = year;
  let curMonth = month;

  for (let i = 0; i < count; i++) {
    periods.push({ year: curYear, month: curMonth });
    if (curMonth === 1) { curYear--; curMonth = 12; } else { curMonth--; }
  }

  const ranges = periods.map(p => getBudgetDateRange(paydayDay, p.year, p.month));
  const overallStart = ranges[ranges.length - 1].startDate;
  const overallEnd = ranges[0].endDate;

  const result = await db.execute(
    `SELECT id, name, amount, type, date, created_at
     FROM expenses
     WHERE type = 'daily'
       AND date >= ?
       AND date <= ?
     ORDER BY date ASC`,
    [overallStart, overallEnd]
  );

  const expenses = result.rows.map(r => toPlain(r as Record<string, unknown>));

  const trendData = periods.map(p => {
    const range = getBudgetDateRange(paydayDay, p.year, p.month);
    const total = expenses
      .filter(e => e.date && e.date >= range.startDate && e.date <= range.endDate)
      .reduce((s, e) => s + e.amount, 0);
    return {
      year: p.year,
      month: p.month,
      label: getPeriodLabel(paydayDay, p.year, p.month),
      total,
    };
  });

  return trendData.reverse();
}

export async function getRecentExpenses(limit: number = 10): Promise<Expense[]> {
  await verifySession();

  const result = await db.execute(
    `SELECT id, name, amount, type, date, created_at
     FROM expenses
     WHERE type = 'daily'
     ORDER BY date DESC, created_at DESC
     LIMIT ?`,
    [limit]
  );

  return result.rows.map(r => toPlain(r as Record<string, unknown>));
}

export async function updateExpense(id: number, data: { name?: string; amount?: number }) {
  await verifySession();

  const sets: string[] = [];
  const params: (string | number)[] = [];

  if (data.name !== undefined) {
    sets.push("name = ?");
    params.push(data.name);
  }
  if (data.amount !== undefined) {
    sets.push("amount = ?");
    params.push(data.amount);
  }

  if (sets.length === 0) return;

  params.push(id);
  await db.execute(
    `UPDATE expenses SET ${sets.join(", ")} WHERE id = ?`,
    params
  );

  REVALIDATE_PATHS.forEach((p) => revalidatePath(p));
}
