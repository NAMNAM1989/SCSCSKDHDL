-- Chạy trong Supabase SQL Editor (một lần) — hoặc dùng CLI Supabase.
-- Bật Realtime: Database → Replication → bật cho bảng schedule_state (hoặc dùng lệnh publication bên dưới).

create table if not exists public.schedule_state (
  id text primary key,
  payload jsonb not null,
  updated_at timestamptz not null default now()
);

-- Realtime: đưa bảng vào publication (Supabase mặc định dùng supabase_realtime)
alter publication supabase_realtime add table public.schedule_state;

-- RLS: authenticated đọc; chỉ admin (JWT metadata) ghi.
alter table public.schedule_state enable row level security;

drop policy if exists "schedule_state_read" on public.schedule_state;
drop policy if exists "schedule_state_write" on public.schedule_state;
drop policy if exists "schedule_state_update" on public.schedule_state;
drop policy if exists "schedule_state_select_authenticated" on public.schedule_state;
drop policy if exists "schedule_state_insert_admin" on public.schedule_state;
drop policy if exists "schedule_state_update_admin" on public.schedule_state;
drop policy if exists "schedule_state_delete_admin" on public.schedule_state;

create policy "schedule_state_select_authenticated"
  on public.schedule_state
  for select
  to authenticated
  using (true);

create policy "schedule_state_insert_admin"
  on public.schedule_state
  for insert
  to authenticated
  with check (coalesce(nullif(trim(auth.jwt() -> 'app_metadata' ->> 'role'), ''), '') = 'admin');

create policy "schedule_state_update_admin"
  on public.schedule_state
  for update
  to authenticated
  using (coalesce(nullif(trim(auth.jwt() -> 'app_metadata' ->> 'role'), ''), '') = 'admin')
  with check (coalesce(nullif(trim(auth.jwt() -> 'app_metadata' ->> 'role'), ''), '') = 'admin');

create policy "schedule_state_delete_admin"
  on public.schedule_state
  for delete
  to authenticated
  using (coalesce(nullif(trim(auth.jwt() -> 'app_metadata' ->> 'role'), ''), '') = 'admin');
