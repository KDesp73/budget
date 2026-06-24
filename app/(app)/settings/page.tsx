"use client";

import { useActionState, useEffect, useState } from "react";
import { saveSettings, getSettings } from "@/app/actions/settings";
import { logout } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { LogOut } from "lucide-react";

type Settings = {
  monthlySalary: number;
  savingsPercentage: number;
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    monthlySalary: 0,
    savingsPercentage: 0,
  });
  const [state, action, pending] = useActionState(saveSettings, undefined);

  useEffect(() => {
    getSettings().then(setSettings);
  }, []);

  return (
    <div className="mx-auto w-full max-w-lg space-y-6 p-4">
      <div>
        <h1 className="text-lg font-semibold">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Configure your monthly income and savings goal
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Income & Savings</CardTitle>
          <CardDescription>
            Your monthly salary and target savings percentage
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={action} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="monthly_salary" className="text-sm font-medium">
                Monthly Salary (€)
              </label>
              <Input
                id="monthly_salary"
                name="monthly_salary"
                type="number"
                step="0.01"
                defaultValue={settings.monthlySalary || ""}
                placeholder="0.00"
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="savings_percentage" className="text-sm font-medium">
                Savings Target (%)
              </label>
              <Input
                id="savings_percentage"
                name="savings_percentage"
                type="number"
                min="0"
                max="100"
                step="1"
                defaultValue={settings.savingsPercentage || ""}
                placeholder="20"
                required
              />
            </div>
            {state?.success && (
              <p className="text-sm text-green-600 dark:text-green-400">
                Settings saved
              </p>
            )}
            <Button type="submit" disabled={pending}>
              {pending ? "Saving..." : "Save"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>Sign out of your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={logout}>
            <Button type="submit" variant="outline" className="w-full">
              <LogOut className="mr-2 size-4" />
              Sign out
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
