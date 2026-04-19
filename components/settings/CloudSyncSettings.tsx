"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { clearSyncRuntimeOverride } from "@/lib/sync/env";
import {
  clearSyncPrefsFromLocalStorage,
  readSyncPrefsFromLocalStorage,
  saveSyncPrefsToLocalStorage,
} from "@/lib/sync/syncLocalPrefs";
import { useEffect, useState } from "react";

export function CloudSyncSettings() {
  const [url, setUrl] = useState("");
  const [anonKey, setAnonKey] = useState("");
  const [docId, setDocId] = useState("default");

  useEffect(() => {
    const p = readSyncPrefsFromLocalStorage();
    if (p) {
      setUrl(p.url);
      setAnonKey(p.key);
      setDocId(p.docId);
    }
  }, []);

  const save = () => {
    const u = url.trim();
    const k = anonKey.trim();
    if (!u || !k) {
      alert("Cần đủ URL và Anon key.");
      return;
    }
    saveSyncPrefsToLocalStorage({
      url: u,
      key: k,
      docId: docId.trim() || "default",
    });
    window.location.reload();
  };

  const clearLocalCloud = () => {
    if (!confirm("Gỡ cấu hình Supabase trên thiết bị này?")) return;
    clearSyncPrefsFromLocalStorage();
    clearSyncRuntimeOverride();
    window.location.reload();
  };

  return (
    <div className="space-y-4">
      <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
        Nhập cùng một project Supabase trên mọi thiết bị (máy tính + điện thoại) để
        đồng bộ. Lấy URL và anon key trong Supabase → Settings → API.
      </p>
      <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400">
        Supabase URL
        <Input
          className="mt-1.5"
          type="url"
          autoComplete="off"
          placeholder="https://xxxx.supabase.co"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
      </label>
      <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400">
        Anon public key
        <Input
          className="mt-1.5"
          type="password"
          autoComplete="off"
          placeholder="eyJ..."
          value={anonKey}
          onChange={(e) => setAnonKey(e.target.value)}
        />
      </label>
      <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400">
        Sync doc ID (mặc định{" "}
        <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">default</code>
        )
        <Input
          className="mt-1.5"
          autoComplete="off"
          placeholder="default"
          value={docId}
          onChange={(e) => setDocId(e.target.value)}
        />
      </label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button variant="primary" className="flex-1" type="button" onClick={save}>
          Lưu và tải lại
        </Button>
        <Button variant="secondary" className="flex-1" type="button" onClick={clearLocalCloud}>
          Gỡ cấu hình trên máy này
        </Button>
      </div>
    </div>
  );
}
