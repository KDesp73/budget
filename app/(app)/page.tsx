import { getTodaysExpenses, getExpenses } from "@/app/actions/expenses";
import { getSettings } from "@/app/actions/settings";
import QuickLog from "./quick-log-client";

export default async function HomePage() {
  const [expenses, settings, variableExpenses, monthlyExpenses] = await Promise.all([
    getTodaysExpenses(),
    getSettings(),
    getExpenses("variable_monthly"),
    getExpenses("monthly"),
  ]);

  const total = expenses.reduce((s, e) => s + e.amount, 0);
  const excludedNames = [
    ...variableExpenses.map((e) => e.name),
    ...monthlyExpenses.map((e) => e.name),
  ];

  return (
    <QuickLog
      initialExpenses={expenses}
      initialTotal={total}
      initialSettings={{
        dailyGoal: settings.dailyGoal,
        quickItems: settings.quickItems,
        quickAmounts: settings.quickAmounts,
      }}
      initialExcludedNames={excludedNames}
    />
  );
}
