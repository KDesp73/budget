import { verifySession } from "@/lib/dal";
import { getSettings } from "@/app/actions/settings";
import {
  getExpenses,
  getTodaysExpenses,
  addExpense,
  deleteExpense,
} from "@/app/actions/expenses";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

export default async function Dashboard() {
  await verifySession();

  const [settings, monthlyExpenses, todaysExpenses] = await Promise.all([
    getSettings(),
    getExpenses("monthly"),
    getTodaysExpenses(),
  ]);

  const totalMonthly = monthlyExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalToday = todaysExpenses.reduce((sum, e) => sum + e.amount, 0);
  const savingsTarget = (settings.monthlySalary * settings.savingsPercentage) / 100;
  const remaining = settings.monthlySalary - totalMonthly - savingsTarget;

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 p-4">
      <h1 className="text-lg font-semibold">Dashboard</h1>

      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardHeader>
            <CardDescription>Monthly Salary</CardDescription>
            <CardTitle className="text-2xl">
              €{settings.monthlySalary.toFixed(2)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Fixed Expenses</CardDescription>
            <CardTitle className="text-2xl">
              €{totalMonthly.toFixed(2)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Savings ({settings.savingsPercentage}%)</CardDescription>
            <CardTitle className="text-2xl">
              €{savingsTarget.toFixed(2)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Remaining</CardDescription>
            <CardTitle
              className={`text-2xl ${remaining < 0 ? "text-destructive" : ""}`}
            >
              €{remaining.toFixed(2)}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Monthly Expenses</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <form action={addExpense} className="flex gap-2">
            <input type="hidden" name="type" value="monthly" />
            <Input
              name="name"
              placeholder="Name (e.g. Rent)"
              required
              className="flex-1"
            />
            <Input
              name="amount"
              type="number"
              step="0.01"
              placeholder="Amount"
              required
              className="w-28"
            />
            <Button type="submit">Add</Button>
          </form>
          {monthlyExpenses.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No monthly expenses added yet
            </p>
          ) : (
            <div className="space-y-1">
              {monthlyExpenses.map((expense) => (
                <div
                  key={expense.id}
                  className="flex items-center justify-between rounded-lg border px-3 py-2"
                >
                  <span className="text-sm">{expense.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      €{expense.amount.toFixed(2)}
                    </span>
                    <form action={deleteExpense}>
                      <input type="hidden" name="id" value={expense.id} />
                      <Button
                        type="submit"
                        variant="ghost"
                        size="xs"
                        className="text-muted-foreground hover:text-destructive"
                      >
                        ✕
                      </Button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Today&apos;s Spending</CardTitle>
          {totalToday > 0 && (
            <CardDescription>€{totalToday.toFixed(2)} total</CardDescription>
          )}
        </CardHeader>
        {todaysExpenses.length === 0 ? (
          <CardContent>
            <p className="text-sm text-muted-foreground">No spending today</p>
          </CardContent>
        ) : (
          <CardContent className="space-y-1">
            {todaysExpenses.map((expense) => (
              <div
                key={expense.id}
                className="flex items-center justify-between rounded-lg border px-3 py-2"
              >
                <span className="text-sm">{expense.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">
                    €{expense.amount.toFixed(2)}
                  </span>
                  <form action={deleteExpense}>
                    <input type="hidden" name="id" value={expense.id} />
                    <Button
                      type="submit"
                      variant="ghost"
                      size="xs"
                      className="text-muted-foreground hover:text-destructive"
                    >
                      ✕
                    </Button>
                  </form>
                </div>
              </div>
            ))}
          </CardContent>
        )}
      </Card>
    </div>
  );
}
