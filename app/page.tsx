import { verifySession } from "@/lib/dal";
import { logout } from "@/app/actions/auth";

export default async function Dashboard() {
  await verifySession();

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
        <h1 className="text-lg font-semibold">Budget</h1>
        <form action={logout}>
          <button
            type="submit"
            className="rounded-lg bg-zinc-100 px-4 py-2 text-sm font-medium transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700"
          >
            Sign out
          </button>
        </form>
      </header>
      <main className="flex flex-1 items-center justify-center">
        <p className="text-zinc-500 dark:text-zinc-400">Welcome to your budget app. Start by adding transactions.</p>
      </main>
    </div>
  );
}
