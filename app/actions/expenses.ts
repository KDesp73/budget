"use server";

import { db } from "@/db/index";
import { verifySession } from "@/lib/dal";
import { revalidatePath } from "next/cache";

const REVALIDATE_PATHS = ["/", "/dashboard", "/settings"];

function toPlain(row: Record<string, unknown>): Expense {
  return {
    id: Number(row.id),
    name: String(row.name),
    amount: Number(row.amount),
    type: row.type as "monthly" | "daily",
    date: row.date ? String(row.date) : null,
    created_at: String(row.created_at),
  };
}

export type Expense = {
  id: number;
  name: string;
  amount: number;
  type: "monthly" | "daily";
  date: string | null;
  created_at: string;
};

export async function getExpenses(type?: "monthly" | "daily"): Promise<Expense[]> {
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
  const type = (formData.get("type") as "monthly" | "daily") || "daily";
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
