# Cutoff SCSC — Bảng Cut-off & STD

Công cụ tính cut-off time theo STD cho cargo terminal SCSC.

## Chạy local

Mở `index.html` bằng trình duyệt là xong. Không cần server, không cần build.

Hoặc nếu muốn phục vụ qua HTTP local:

```bash
python -m http.server 8080
# → mở http://localhost:8080
```

## Dữ liệu

- Toàn bộ dữ liệu (bảng chuyến, nháp STD, danh sách hãng bay) lưu trong **localStorage của trình duyệt**
- Mỗi máy có dữ liệu riêng — không đồng bộ giữa máy này & máy khác
- Dùng **Export Excel** trong app để xuất bản in / chia sẻ

## Deploy

Dự án được host trên Railway qua Dockerfile (nginx:alpine). Push code lên branch `main` là tự deploy.

## Công nghệ

- HTML + CSS + JavaScript vanilla (không framework)
- Không backend, không database
- Serve bằng nginx trong container Docker
