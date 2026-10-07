# Personal Dashboard

Phase 1 of a personal "everything tracker": daily tasks and SGD expenses, with per-user private storage in Supabase so it can later be opened up to other users.

- Next.js 16 (App Router, Server Actions) + React 19
- Supabase Postgres + Auth (email magic link), Row Level Security on every row
- PC-first layout that collapses to a phone layout; installable as a PWA
- CSV export for Excel, Power BI and Google Sheets

## Setup

1. Create a project at https://supabase.com (free tier is fine). Pick the Singapore region.
2. In the Supabase dashboard open **SQL Editor**, paste the contents of `supabase/migrations/0001_entries.sql`, and run it.
3. In **Authentication → URL Configuration**:
   - Site URL: `http://localhost:3000` (change to your deployed URL later)
   - Redirect URLs: add `http://localhost:3000/auth/confirm` and, later, `https://<your-domain>/auth/confirm`
4. Copy keys from **Project Settings → API** into `.env.local`:

```bash
cp .env.example .env.local
```

5. Install and run:

```bash
npm install
npm run dev
```

Open http://localhost:3000, enter your email, and click the link in the email in the same browser.

## Deploy (Vercel)

1. Import the repo in Vercel and set **Root Directory** to `personal-dashboard`.
2. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` as environment variables.
3. Add `https://<your-vercel-domain>/auth/confirm` to Supabase Redirect URLs and set the Site URL.

To keep it single-user for now, turn off **Authentication → Providers → Email → Allow new users to sign up** after your first sign-in.

## Data model

One table, `public.entries`, holds every kind of item so later sources (Gmail, Telegram) are new `type`/`source` values rather than new tables.

| Column | Purpose |
|---|---|
| `user_id` | Owner; defaults to `auth.uid()`. RLS restricts all access to the owner |
| `type` | `task`, `expense`, `email`, `message`, `note` |
| `status` | `open`, `done`, `archived` |
| `amount`, `currency` | Required for expenses; currency defaults to `SGD` |
| `category` | Expense category |
| `due_date` | Task due date |
| `occurred_on` | Date the item happened (Singapore date by default) |
| `source`, `external_id` | Origin (`manual`, later `gmail`, `telegram`) and its ID, unique per user for de-duplicated imports |
| `details` | JSON for source-specific fields |

## Reporting

- **Excel / Google Sheets:** Expenses page → **Export CSV** (month) or **Export all**. `GET /api/export?month=YYYY-MM&type=expense` also works while signed in.
- **Power BI:** Get Data → PostgreSQL. Use the connection details from Supabase **Project Settings → Database** (session pooler host). Create a read-only Postgres role for this rather than using the `postgres` password.

## Roadmap

- Phase 2: Telegram capture bot and bank CSV import
- Phase 3: Gmail read-only sync (`gmail.readonly` scope)
- Phase 4: Daily digest
