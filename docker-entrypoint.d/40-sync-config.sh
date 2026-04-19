#!/bin/sh
# Ghi sync-config.json từ biến môi trường runtime (Railway) để SPA không cần rebuild khi đổi Supabase.
set -e
OUT="/usr/share/nginx/html/sync-config.json"
URL="${SYNC_SUPABASE_URL:-${NEXT_PUBLIC_SUPABASE_URL:-}}"
KEY="${SYNC_SUPABASE_ANON_KEY:-${NEXT_PUBLIC_SUPABASE_ANON_KEY:-}}"
DOC="${SYNC_DOC_ID:-${NEXT_PUBLIC_SYNC_DOC_ID:-default}}"

if [ -n "$URL" ] && [ -n "$KEY" ]; then
  jq -n \
    --arg url "$URL" \
    --arg key "$KEY" \
    --arg doc "$DOC" \
    '{supabaseUrl: $url, supabaseAnonKey: $key, syncDocId: $doc}' \
    >"$OUT.tmp"
  mv "$OUT.tmp" "$OUT"
fi
