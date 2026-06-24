"use client";

import { useState, createContext, useContext, useCallback } from "react";

type ConfirmOptions = {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
};

type ConfirmContextValue = {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
};

const ConfirmContext = createContext<ConfirmContextValue>({
  confirm: async () => false,
});

export function useConfirm() {
  return useContext(ConfirmContext);
}

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions>({
    title: "",
    message: "",
  });
  const [resolve, setResolve] = useState<((value: boolean) => void) | null>(
    null
  );

  const confirm = useCallback((opts: ConfirmOptions) => {
    setOptions(opts);
    setOpen(true);
    return new Promise<boolean>((res) => {
      setResolve(() => res);
    });
  }, []);

  const handleConfirm = () => {
    resolve?.(true);
    setOpen(false);
  };

  const handleCancel = () => {
    resolve?.(false);
    setOpen(false);
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-xl bg-background p-6 shadow-lg">
            <h3 className="text-base font-semibold">{options.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {options.message}
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={handleCancel}
                className="inline-flex h-8 items-center rounded-lg border bg-background px-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {options.cancelLabel ?? "Cancel"}
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className={`inline-flex h-8 items-center rounded-lg px-3 text-sm font-medium text-white transition-colors ${
                  options.destructive
                    ? "bg-destructive hover:bg-destructive/80"
                    : "bg-primary hover:bg-primary/80"
                }`}
              >
                {options.confirmLabel ?? "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}
