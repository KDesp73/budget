import { verifySession } from "@/lib/dal";
import { getSettings } from "@/app/actions/settings";
import { getExpenses, addExpense, deleteExpense } from "@/app/actions/expenses";
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

  const [settings, expenses] = await Promise.all([
    getSettings(),
    getExpenses(),
  ]);

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const savingsTarget = (settings.monthlySalary * settings.savingsPercentage) / 100;
  const remaining = settings.monthlySalary - totalExpenses - savingsTarget;

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 p-4">

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
            <CardDescription>Expenses</CardDescription>
            <CardTitle className="text-2xl">
              €{totalExpenses.toFixed(2)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Savings Target ({settings.savingsPercentage}%)</CardDescription>
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
          <CardTitle>Add Expense</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={addExpense} className="flex gap-2">
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Monthly Expenses</CardTitle>
        </CardHeader>
        {expenses.length === 0 ? (
          <CardContent>
            <p className="text-sm text-muted-foreground">
              No expenses added yet
            </p>
          </CardContent>
        ) : (
          <CardContent className="space-y-1">
            {expenses.map((expense) => (
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
