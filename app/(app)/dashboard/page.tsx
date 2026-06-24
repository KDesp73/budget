import { verifySession } from "@/lib/dal";
import { getExpensesByMonth, getExpenses } from "@/app/actions/expenses";
import { getSettings } from "@/app/actions/settings";
import DashboardClient from "./dashboard-client";

export default async function Dashboard() {
  await verifySession();

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  const [data, settings, monthlyExpenses] = await Promise.all([
    getExpensesByMonth(year, month),
    getSettings(),
    getExpenses("monthly"),
  ]);

  return (
    <DashboardClient
      initialYear={year}
      initialMonth={month}
      initialData={data}
      initialSettings={settings}
      initialMonthly={monthlyExpenses}
    />
  );
}
