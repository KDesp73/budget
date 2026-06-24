"use server";

import { db } from "@/db/index";
import { verifySession } from "@/lib/dal";
import { revalidatePath } from "next/cache";

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

  revalidatePath("/");
}

export async function deleteExpense(formData: FormData) {
  await verifySession();

  const id = Number(formData.get("id"));

  await db.execute("DELETE FROM expenses WHERE id = ?", [id]);

  revalidatePath("/");
}
