import { createClient } from "@libsql/client";

async function main() {
  const db = createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
  });

  await db.execute(`CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  )`);

  await db.execute(`CREATE TABLE IF NOT EXISTS expenses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    amount REAL NOT NULL,
    type TEXT NOT NULL DEFAULT 'daily',
    date TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`);

  try {
    await db.execute("ALTER TABLE expenses ADD COLUMN type TEXT NOT NULL DEFAULT 'daily'");
  } catch {}

  try {
    await db.execute("ALTER TABLE expenses ADD COLUMN date TEXT");
  } catch {}

  console.log("Database setup complete");
}

main();
