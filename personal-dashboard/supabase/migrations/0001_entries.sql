create extension if not exists pgcrypto;

create table if not exists public.entries (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null default auth.uid() references auth.users (id) on delete cascade,
  type         text not null check (type in ('task', 'expense', 'email', 'message', 'note')),
  title        text not null check (char_length(title) between 1 and 500),
  status       text not null default 'open' check (status in ('open', 'done', 'archived')),
  amount       numeric(12, 2) check (amount is null or amount >= 0),
  currency     char(3) not null default 'SGD',
  category     text,
  due_date     date,
  occurred_on  date not null default (now() at time zone 'Asia/Singapore')::date,
  source       text not null default 'manual',
  external_id  text,
  details      jsonb not null default '{}'::jsonb,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  constraint expense_has_amount check (type <> 'expense' or amount is not null)
);

create index if not exists entries_user_type_date_idx on public.entries (user_id, type, occurred_on desc);
create index if not exists entries_user_due_idx on public.entries (user_id, due_date) where type = 'task' and status = 'open';
create unique index if not exists entries_user_source_external_idx on public.entries (user_id, source, external_id) where external_id is not null;

create or replace function public.touch_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists entries_touch_updated_at on public.entries;
create trigger entries_touch_updated_at before update on public.entries
  for each row execute function public.touch_updated_at();

alter table public.entries enable row level security;
alter table public.entries force row level security;

drop policy if exists "entries_select_own" on public.entries;
drop policy if exists "entries_insert_own" on public.entries;
drop policy if exists "entries_update_own" on public.entries;
drop policy if exists "entries_delete_own" on public.entries;

create policy "entries_select_own" on public.entries for select to authenticated
  using ((select auth.uid()) = user_id);
create policy "entries_insert_own" on public.entries for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy "entries_update_own" on public.entries for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "entries_delete_own" on public.entries for delete to authenticated
  using ((select auth.uid()) = user_id);

revoke all on public.entries from anon;
grant select, insert, update, delete on public.entries to authenticated;
