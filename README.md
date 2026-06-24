# Budget

A personal budgeting app built with Next.js, Turso, and shadcn/ui. Mobile-first with PWA support.

## Prerequisites

- **Turso database** — create one at [turso.tech](https://turso.tech) and get the URL and auth token
- **Session secret** — generate with `openssl rand -base64 32`
- **Password hash** — run `npx tsx scripts/hash-password.ts` to create a bcrypt hash

## Setup

```bash
cp .env.example .env.local
npm install
npx tsx db/run.ts          # create tables
npm run dev
```

### Docker

```bash
# Build the image
docker build -t budget .

# Run with env vars from .env.local
docker run -p 3000:3000 --env-file .env.local budget
```

The app listens on port 3000. Pass any environment variables with `--env-file` or `-e`.

### Environment Variables

| Variable | Description |
|---|---|
| `TURSO_DATABASE_URL` | Turso database URL |
| `TURSO_AUTH_TOKEN` | Turso auth token |
| `SESSION_SECRET` | JWT signing key (min 32 chars) |
| `APP_PASSWORD_HASH` | bcrypt hash of your login password |

## Features

- Daily expense logging with quick-amount buttons and category chips
- Dashboard with spending bar chart, category pie chart, monthly calendar, and budget progress bars
- Expense history with search, date range filter, and pagination
- Configurable monthly fixed expenses, category budgets, and quick items
- CSV export for any month
- Dark mode

## Tech

- **Next.js 16** (server actions, proxy middleware)
- **Turso** + `@libsql/client`
- **shadcn/ui** (Base UI primitives)
- **Recharts** (bar chart, pie chart)
- **sonner** (toasts)
- **JWT** sessions via `jose`
- **bcryptjs** password auth
