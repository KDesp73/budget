"use server";

import { db } from "@/db/index";
import { verifySession } from "@/lib/dal";

export type Settings = {
  monthlySalary: number;
  savingsPercentage: number;
};

export async function getSettings(): Promise<Settings> {
  await verifySession();

  const rows = await db.execute(
    "SELECT key, value FROM settings WHERE key IN ('monthly_salary', 'savings_percentage')"
  );

  const map = new Map(rows.rows.map((r: Record<string, unknown>) => [r.key as string, r.value as string]));

  return {
    monthlySalary: map.has("monthly_salary") ? Number(map.get("monthly_salary")) : 0,
    savingsPercentage: map.has("savings_percentage") ? Number(map.get("savings_percentage")) : 0,
  };
}

export async function saveSettings(_prevState: unknown, formData: FormData) {
  await verifySession();

  const salary = Number(formData.get("monthly_salary"));
  const percentage = Number(formData.get("savings_percentage"));

  await db.execute(
    "INSERT INTO settings (key, value) VALUES ('monthly_salary', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
    [String(salary)]
  );
  await db.execute(
    "INSERT INTO settings (key, value) VALUES ('savings_percentage', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
    [String(percentage)]
  );

  return { success: true };
}
