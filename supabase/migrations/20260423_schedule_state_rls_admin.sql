-- Bước 2: RLS theo role admin/viewer (JWT metadata).
-- Chạy trong Supabase SQL Editor (hoặc `supabase db push`) sau khi đã có bảng schedule_state.
--
-- Quy ước role (giống app):
--   app_metadata.role = 'admin'  -> được INSERT/UPDATE/DELETE
--   app_metadata.role = 'viewer' hoặc thiếu -> chỉ SELECT
--   (RLS ghi chỉ đọc app_metadata — không dùng user_metadata trong policy.)

-- Gỡ policy demo cũ (mở cho mọi client).
drop policy if exists "schedule_state_read" on public.schedule_state;
drop policy if exists "schedule_state_write" on public.schedule_state;
drop policy if exists "schedule_state_update" on public.schedule_state;

-- Tránh trùng tên nếu chạy lại.
drop policy if exists "schedule_state_select_authenticated" on public.schedule_state;
drop policy if exists "schedule_state_insert_admin" on public.schedule_state;
drop policy if exists "schedule_state_update_admin" on public.schedule_state;
drop policy if exists "schedule_state_delete_admin" on public.schedule_state;

alter table public.schedule_state enable row level security;

-- Chỉ user đã đăng nhập (JWT hợp lệ) mới đọc được.
create policy "schedule_state_select_authenticated"
  on public.schedule_state
  for select
  to authenticated
  using (true);

-- Ghi: chỉ admin (theo metadata trên JWT).
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
