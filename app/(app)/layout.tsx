import Link from "next/link";
import { verifySession } from "@/lib/dal";
import { Home, Settings } from "lucide-react";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await verifySession();

  return (
    <>
      <header className="sticky top-0 z-50 hidden items-center justify-between border-b bg-background px-4 py-3 md:flex">
        <Link href="/" className="text-lg font-semibold">
          Budget
        </Link>
        <nav className="flex items-center gap-2">
          <Link
            href="/"
            className="inline-flex h-7 items-center justify-center rounded-lg px-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            Dashboard
          </Link>
          <Link
            href="/settings"
            className="inline-flex h-7 items-center justify-center rounded-lg px-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            Settings
          </Link>
        </nav>
      </header>

      <main className="mb-16 flex flex-1 flex-col md:mb-0">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-50 flex items-center justify-around border-t bg-background py-2 md:hidden">
        <Link
          href="/"
          className="flex flex-col items-center gap-0.5 px-4 py-1 text-muted-foreground"
        >
          <Home className="size-5" />
          <span className="text-[10px]">Home</span>
        </Link>
        <Link
          href="/settings"
          className="flex flex-col items-center gap-0.5 px-4 py-1 text-muted-foreground"
        >
          <Settings className="size-5" />
          <span className="text-[10px]">Settings</span>
        </Link>
      </nav>
    </>
  );
}
