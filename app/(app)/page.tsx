import { getTodaysExpenses } from "@/app/actions/expenses";
import { getSettings } from "@/app/actions/settings";
import QuickLog from "./quick-log-client";

export default async function HomePage() {
  const [expenses, settings] = await Promise.all([
    getTodaysExpenses(),
    getSettings(),
  ]);

  const total = expenses.reduce((s, e) => s + e.amount, 0);

  return (
    <QuickLog
      initialExpenses={expenses}
      initialTotal={total}
      initialSettings={{
        dailyGoal: settings.dailyGoal,
        quickItems: settings.quickItems,
        quickAmounts: settings.quickAmounts,
      }}
    />
  );
}
