-- Chạy trong Supabase SQL Editor (một lần).
-- Bật Realtime: Database → Replication → bật cho bảng schedule_state (hoặc dùng lệnh publication bên dưới).

create table if not exists public.schedule_state (
  id text primary key,
  payload jsonb not null,
  updated_at timestamptz not null default now()
);

-- Realtime: đưa bảng vào publication (Supabase mặc định dùng supabase_realtime)
alter publication supabase_realtime add table public.schedule_state;

-- RLS — CHỈ dùng cho demo / nội bộ: mọi client anon đều đọc/ghi được.
-- Production: thay bằng auth.uid() và policy chặt.
alter table public.schedule_state enable row level security;

create policy "schedule_state_read"
  on public.schedule_state for select
  using (true);

create policy "schedule_state_write"
  on public.schedule_state for insert
  with check (true);

create policy "schedule_state_update"
  on public.schedule_state for update
  using (true)
  with check (true);
