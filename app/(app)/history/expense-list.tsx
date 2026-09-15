"use client";

import { useState } from "react";
import { toast } from "sonner";
import { deleteExpense, updateExpense } from "@/app/actions/expenses";
import { Input } from "@/components/ui/input";
import { Check, Pencil, X } from "lucide-react";
import { useConfirm } from "@/components/confirm-dialog";
import type { Expense } from "@/app/actions/expenses";

export default function ExpenseList({
  expenses,
  onChanged,
}: {
  expenses: Expense[];
  onChanged?: () => void;
}) {
  const { confirm } = useConfirm();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editAmount, setEditAmount] = useState("");

  const startEdit = (e: Expense) => {
    setEditingId(e.id);
    setEditName(e.name);
    setEditAmount(String(e.amount));
  };

  const saveEdit = async () => {
    if (!editingId) return;
    await updateExpense(editingId, {
      name: editName,
      amount: Number(editAmount),
    });
    setEditingId(null);
    toast.success("Expense updated");
    onChanged?.();
  };

  const handleDelete = async (id: number) => {
    if (
      !(await confirm({
        title: "Delete expense",
        message: "Delete this expense?",
        destructive: true,
        confirmLabel: "Delete",
      }))
    )
      return;
    const fd = new FormData();
    fd.set("id", String(id));
    await deleteExpense(fd);
    toast.success("Expense deleted");
    onChanged?.();
  };

  if (expenses.length === 0) return null;

  return (
    <div className="space-y-1">
      {expenses.map((expense) => (
        <div
          key={expense.id}
          className="flex items-center justify-between rounded-lg border px-3 py-2.5"
        >
          {editingId === expense.id ? (
            <div className="flex flex-1 items-center gap-2">
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="h-8 flex-1"
              />
              <Input
                type="number"
                step="0.01"
                value={editAmount}
                onChange={(e) => setEditAmount(e.target.value)}
                className="h-8 w-24"
              />
              <button
                type="button"
                onClick={saveEdit}
                className="text-green-600 hover:text-green-500"
              >
                <Check className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => setEditingId(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>
          ) : (
            <>
              <div className="flex flex-col">
                <span className="text-sm font-medium">{expense.name}</span>
                <span className="text-[11px] text-muted-foreground">
                  {expense.date ?? "—"}
                  {expense.type === "monthly" && (
                    <span className="ml-1.5 rounded bg-muted px-1 py-0.5 text-[10px]">
                      monthly
                    </span>
                  )}
                  {expense.type === "variable_monthly" && (
                    <span className="ml-1.5 rounded bg-muted px-1 py-0.5 text-[10px]">
                      variable
                    </span>
                  )}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold tabular-nums">
                  €{expense.amount.toFixed(2)}
                </span>
                <button
                  type="button"
                  onClick={() => startEdit(expense)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Pencil className="size-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(expense.id)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <X className="size-3.5" />
                </button>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
}