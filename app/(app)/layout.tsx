import Link from "next/link";
import { verifySession } from "@/lib/dal";
import BottomNav from "./bottom-nav";

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
        <nav className="flex items-center gap-1">
          <Link
            href="/"
            className="inline-flex h-7 items-center justify-center rounded-lg px-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            Log
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex h-7 items-center justify-center rounded-lg px-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            Dashboard
          </Link>
          <Link
            href="/history"
            className="inline-flex h-7 items-center justify-center rounded-lg px-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            History
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

      <BottomNav />
    </>
  );
}
