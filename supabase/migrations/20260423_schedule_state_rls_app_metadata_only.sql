-- Bổ sung: policy ghi chỉ dùng app_metadata (tránh user_metadata trong RLS — Supabase advisor).

drop policy if exists "schedule_state_insert_admin" on public.schedule_state;
drop policy if exists "schedule_state_update_admin" on public.schedule_state;
drop policy if exists "schedule_state_delete_admin" on public.schedule_state;

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
