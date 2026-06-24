"use server";

import { db } from "@/db/index";
import { verifySession } from "@/lib/dal";
import { revalidatePath } from "next/cache";

export type Settings = {
  monthlySalary: number;
  savingsPercentage: number;
  dailyGoal: number;
  quickItems: string[];
};

const DEFAULT_QUICK_ITEMS = ["Coffee", "Lunch", "Dinner", "Transport", "Snack", "Groceries"];

export async function getSettings(): Promise<Settings> {
  await verifySession();

  const rows = await db.execute(
    "SELECT key, value FROM settings WHERE key IN ('monthly_salary', 'savings_percentage', 'daily_goal', 'quick_items')"
  );

  const map = new Map(rows.rows.map((r: Record<string, unknown>) => [r.key as string, r.value as string]));

  return {
    monthlySalary: map.has("monthly_salary") ? Number(map.get("monthly_salary")) : 0,
    savingsPercentage: map.has("savings_percentage") ? Number(map.get("savings_percentage")) : 0,
    dailyGoal: map.has("daily_goal") ? Number(map.get("daily_goal")) : 0,
    quickItems: map.has("quick_items") ? JSON.parse(map.get("quick_items")!) : DEFAULT_QUICK_ITEMS,
  };
}

export async function saveSettings(_prevState: unknown, formData: FormData) {
  await verifySession();

  const salary = Number(formData.get("monthly_salary"));
  const percentage = Number(formData.get("savings_percentage"));
  const dailyGoal = Number(formData.get("daily_goal"));

  const upsert = "INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value";

  await db.execute(upsert, ["monthly_salary", String(salary)]);
  await db.execute(upsert, ["savings_percentage", String(percentage)]);
  await db.execute(upsert, ["daily_goal", String(dailyGoal)]);

  return { success: true };
}

export async function saveQuickItems(items: string[]) {
  await verifySession();

  await db.execute(
    "INSERT INTO settings (key, value) VALUES ('quick_items', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
    [JSON.stringify(items)]
  );

  revalidatePath("/");
  revalidatePath("/settings");

  return { success: true };
}
