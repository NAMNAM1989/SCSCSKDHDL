# Supabase Auth + RBAC (admin/viewer)

## 0) Chỉ 2 tài khoản Admin / User — không nhập email trên app

Supabase vẫn dùng cơ chế **email + mật khẩu** phía server; app chỉ **ẩn email** và dùng hai nút nếu bạn cấu hình preset.

1. Trong Supabase: **Authentication → Providers → Email** vẫn phải **bật** (không bắt buộc bật “Confirm email” nếu chỉ nội bộ).
2. Tắt đăng ký công khai nếu chỉ admin tạo user: **Authentication → Providers → Email → Disable sign ups**.
3. Tạo **đúng hai user** (Add user), mật khẩu trùng với biến môi trường bên dưới:

| Vai trò | Email mặc định (có thể đổi bằng env) | `app_metadata.role` |
|--------|----------------------------------------|----------------------|
| Admin  | `admin@cutoffscsc.internal`            | `admin`              |
| User (xem) | `viewer@cutoffscsc.internal`       | `viewer`             |

4. Trong file `.env.local` (hoặc biến build), đặt **cả hai** mật khẩu preset (nếu thiếu một trong hai, app quay lại form email+mật khẩu):

```env
NEXT_PUBLIC_CUTOFF_PRESET_ADMIN_PASSWORD=mật-khẩu-admin
NEXT_PUBLIC_CUTOFF_PRESET_VIEWER_PASSWORD=mật-khẩu-user
```

Tuỳ chọn ghi đè email:

```env
NEXT_PUBLIC_CUTOFF_PRESET_ADMIN_EMAIL=admin@domain-cua-ban.com
NEXT_PUBLIC_CUTOFF_PRESET_VIEWER_EMAIL=user@domain-cua-ban.com
```

**Lưu ý bảo mật:** tiền tố `NEXT_PUBLIC_` đưa giá trị vào bundle trình duyệt — chỉ dùng cho triển khai nội bộ / kiosk. Nếu cần giấu mật khẩu thật sự, cần backend hoặc bỏ static export.

## 1) Bật đăng nhập email/password

Trong Supabase Dashboard:

- `Authentication` -> `Providers` -> bật `Email`.
- Nếu muốn chỉ admin tạo account: tắt public sign-up (`Allow new users to sign up` = off).

## 2) Tạo tài khoản người dùng nội bộ

- Vào `Authentication` -> `Users` -> `Add user`.
- Nhập email + password cho từng nhân sự.

## 3) Gán quyền role cho từng tài khoản

Trong trang user, thêm metadata:

- `app_metadata.role = "admin"`: được sửa/nhập/xoá (UI + API Supabase).
- `app_metadata.role = "viewer"`: chỉ xem.

Nếu không có `role`, ứng dụng mặc định là `viewer`.

**Quan trọng cho RLS:** policy ghi trên database chỉ tin `app_metadata.role` (không dùng `user_metadata` trong RLS — user có thể sửa `user_metadata`). Ứng dụng vẫn có thể đọc `user_metadata` chỉ để hiển thị UI nếu cần; quyền ghi qua Supabase **bắt buộc** gán `app_metadata.role` trong Dashboard (hoặc Admin API).

## 4) RLS bảng `schedule_state` (bước 2 — chặn ghi ở database)

Mục tiêu: viewer không thể `INSERT`/`UPDATE`/`DELETE` dù gọi trực tiếp REST/Realtime với anon key + session; chỉ `admin` ghi được.

### Cách A — Project mới

Chạy toàn bộ `supabase/schema.sql` trong **SQL Editor** (một lần), hoặc dùng Supabase CLI theo quy trình repo.

### Cách B — Đã chạy schema cũ (policy `using (true)`)

Chạy file migration:

- `supabase/migrations/20260423_schedule_state_rls_admin.sql`

Trong Dashboard: **SQL** -> New query -> dán nội dung file -> Run.

### Nội dung policy (tham chiếu)

- `SELECT`: role `authenticated` (đã đăng nhập).
- `INSERT` / `UPDATE` / `DELETE`: chỉ khi `app_metadata.role = 'admin'` (sau `trim`).
- Role `anon` không có policy → không đọc/ghi được bảng này (trừ khi dùng service role server-side, role đó bypass RLS).

### Realtime

Giữ bảng trong publication `supabase_realtime` như trong `schema.sql`. User viewer vẫn nhận broadcast nếu có quyền `SELECT`.

### Kiểm tra nhanh

1. Đăng nhập viewer → thao tác sync/ghi trong app (hoặc gọi API) → kỳ vọng lỗi permission từ Supabase.
2. Đăng nhập admin → ghi thành công.
