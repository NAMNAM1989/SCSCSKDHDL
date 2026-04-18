# Dockerfile — serve static site với nginx:alpine (image siêu nhẹ, ~40MB)
FROM nginx:alpine

# Copy toàn bộ file static vào nginx html folder
COPY . /usr/share/nginx/html

# Xoá các file không cần serve (nếu tồn tại)
RUN rm -f /usr/share/nginx/html/Dockerfile \
          /usr/share/nginx/html/.gitignore \
          /usr/share/nginx/html/README.md \
          /usr/share/nginx/html/nginx.conf \
 && rm -rf /usr/share/nginx/html/.git

# Copy cấu hình nginx tuỳ chỉnh (lắng nghe cổng Railway inject qua $PORT)
COPY nginx.conf /etc/nginx/templates/default.conf.template

# Railway sẽ set $PORT — nginx:alpine có envsubst sẵn trong entrypoint
EXPOSE 8080

# Không cần CMD — image gốc nginx:alpine đã có sẵn
