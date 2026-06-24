"use server";

import { db } from "@/db/index";
import { verifySession } from "@/lib/dal";
import { revalidatePath } from "next/cache";

export type Expense = {
  id: number;
  name: string;
  amount: number;
  created_at: string;
};

export async function getExpenses(): Promise<Expense[]> {
  await verifySession();

  const result = await db.execute(
    "SELECT id, name, amount, created_at FROM expenses ORDER BY created_at DESC"
  );

  return result.rows as unknown as Expense[];
}

export async function addExpense(formData: FormData) {
  await verifySession();

  const name = formData.get("name") as string;
  const amount = Number(formData.get("amount"));

  if (!name || !amount) return;

  await db.execute(
    "INSERT INTO expenses (name, amount) VALUES (?, ?)",
    [name, amount]
  );

  revalidatePath("/");
}

export async function deleteExpense(formData: FormData) {
  await verifySession();

  const id = Number(formData.get("id"));

  await db.execute("DELETE FROM expenses WHERE id = ?", [id]);

  revalidatePath("/");
}
