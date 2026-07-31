import { verifySession } from "@/lib/dal";
import { getExpensesByDateRange, getExpenses, getPreviousPeriodData, getMultiPeriodTotals, getRecentExpenses } from "@/app/actions/expenses";
import { getSettings } from "@/app/actions/settings";
import { getCurrentBudgetPeriod, getBudgetDateRange } from "@/lib/budget";
import DashboardClient from "./dashboard-client";

export default async function Dashboard() {
  await verifySession();

  const settings = await getSettings();
  const period = getCurrentBudgetPeriod(settings.paydayDay);
  const { startDate, endDate } = getBudgetDateRange(settings.paydayDay, period.year, period.month);

  const [data, monthlyExpenses, variableExpenses, previousData, trendData, recentExpenses] = await Promise.all([
    getExpensesByDateRange(startDate, endDate),
    getExpenses("monthly"),
    getExpenses("variable_monthly"),
    getPreviousPeriodData(settings.paydayDay, period.year, period.month),
    getMultiPeriodTotals(settings.paydayDay, period.year, period.month, 6),
    getRecentExpenses(10),
  ]);

  return (
    <DashboardClient
      initialYear={period.year}
      initialMonth={period.month}
      initialData={data}
      initialSettings={settings}
      initialMonthly={monthlyExpenses}
      initialVariable={variableExpenses}
      initialPreviousData={previousData}
      initialTrendData={trendData}
      initialRecentExpenses={recentExpenses}
    />
  );
}
