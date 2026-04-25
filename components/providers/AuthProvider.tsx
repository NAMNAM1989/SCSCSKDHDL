"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  applySyncRuntimeOverride,
  getSupabaseAnonKey,
  getSupabaseUrl,
  hasEmbeddedSupabaseEnv,
  isSupabaseConfigured,
} from "@/lib/sync/env";
import { getPresetLoginConfig } from "@/lib/auth/presetLogin";
import { readSyncPrefsFromLocalStorage } from "@/lib/sync/syncLocalPrefs";
import { loadSupabaseJs } from "@/lib/sync/loadSupabaseJs";
import { cn } from "@/lib/cn";
import type { Session, SupabaseClient, User } from "@supabase/supabase-js";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type Role = "admin" | "viewer";

type AuthCtx = {
  session: Session | null;
  user: User | null;
  role: Role;
  canEdit: boolean;
  loading: boolean;
  isConfigured: boolean;
  signInWithPassword: (email: string, password: string) => Promise<void>;
  /** Khi bật preset env: đăng nhập Admin hoặc User (viewer) không nhập email. */
  signInWithPreset: (kind: "admin" | "viewer") => Promise<void>;
  presetLogin: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthCtx | null>(null);

function resolveRole(user: User | null): Role {
  if (!user) return "viewer";
  const app = user.app_metadata as Record<string, unknown> | null;
  const profile = user.user_metadata as Record<string, unknown> | null;
  const raw =
    String(app?.role ?? profile?.role ?? "")
      .trim()
      .toLowerCase() || "viewer";
  return raw === "admin" ? "admin" : "viewer";
}

let authClient: SupabaseClient | null = null;
let authClientKey = "";

async function getAuthClient(): Promise<SupabaseClient | null> {
  const finalUrl = getSupabaseUrl();
  const finalKey = getSupabaseAnonKey();
  if (!finalUrl || !finalKey) return null;

  const k = `${finalUrl}|${finalKey}`;
  if (!authClient || authClientKey !== k) {
    const { createClient } = await loadSupabaseJs();
    authClient = createClient(finalUrl, finalKey);
    authClientKey = k;
  }
  return authClient;
}

export function useAuth(): AuthCtx {
  const v = useContext(AuthContext);
  if (!v) throw new Error("useAuth outside AuthProvider");
  return v;
}

function LoginPanel({ configured }: { configured: boolean }) {
  const { loading, signInWithPassword, signInWithPreset, presetLogin } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setError(null);
    try {
      await signInWithPassword(email, password);
    } catch (e) {
      setError(String(e));
    }
  };

  const submitPreset = async (kind: "admin" | "viewer") => {
    setError(null);
    try {
      await signInWithPreset(kind);
    } catch (e) {
      setError(String(e));
    }
  };

  return (
    <div className="flex min-h-dvh items-center justify-center bg-zinc-50 px-4 dark:bg-zinc-950">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          Đăng nhập nội bộ
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          {presetLogin
            ? "Chọn loại tài khoản. Mật khẩu đã cấu hình sẵn trên máy chủ build."
            : "Chỉ tài khoản được cấp quyền mới truy cập và chỉnh sửa dữ liệu."}
        </p>
        {!configured ? (
          <p className="mt-3 rounded-lg border border-amber-300/40 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:border-amber-700/40 dark:bg-amber-950/30 dark:text-amber-300">
            Chưa có cấu hình Supabase. Vào Settings để nhập URL và Anon Key.
          </p>
        ) : null}
        <div className="mt-4 space-y-3">
          {presetLogin ? (
            <>
              <Button
                variant="primary"
                className="w-full"
                disabled={!configured || loading}
                onClick={() => void submitPreset("admin")}
              >
                {loading ? "Đang xử lý..." : "Đăng nhập Admin"}
              </Button>
            </>
          ) : (
            <>
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  Email
                </label>
                <Input
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@company.com"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  Mật khẩu
                </label>
                <Input
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") void submit();
                  }}
                  placeholder="••••••••"
                />
              </div>
            </>
          )}
          {error ? (
            <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
          ) : null}
          {!presetLogin ? (
            <Button
              variant="primary"
              className="w-full"
              disabled={!configured || loading || !email || !password}
              onClick={() => void submit()}
            >
              {loading ? "Đang xử lý..." : "Đăng nhập"}
            </Button>
          ) : null}
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {presetLogin ? (
              <>
                User Admin tương ứng phải tồn tại trong Supabase (email nội bộ
                cố định, xem{" "}
                <code className="rounded bg-zinc-100 px-1 py-0.5 dark:bg-zinc-800">
                  docs/auth-rbac-setup.md
                </code>
                ).
              </>
            ) : (
              <>
                Tài khoản do admin tạo trong Supabase. Gán quyền bằng metadata{" "}
                <code className="rounded bg-zinc-100 px-1 py-0.5 dark:bg-zinc-800">
                  role=admin
                </code>{" "}
                hoặc{" "}
                <code className="rounded bg-zinc-100 px-1 py-0.5 dark:bg-zinc-800">
                  role=viewer
                </code>
                .
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [runtimeReady, setRuntimeReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        if (hasEmbeddedSupabaseEnv()) return;
        const local = readSyncPrefsFromLocalStorage();
        if (local) {
          applySyncRuntimeOverride(local);
          return;
        }
        const r = await fetch("/sync-config.json", { cache: "no-store" });
        if (!r.ok) return;
        const j = (await r.json()) as Record<string, unknown>;
        const url = typeof j.supabaseUrl === "string" ? j.supabaseUrl.trim() : "";
        const key =
          typeof j.supabaseAnonKey === "string" ? j.supabaseAnonKey.trim() : "";
        const docRaw = typeof j.syncDocId === "string" ? j.syncDocId.trim() : "";
        if (url && key) {
          applySyncRuntimeOverride({
            url,
            key,
            docId: docRaw || "default",
          });
        }
      } catch {
        /* giữ local only */
      } finally {
        if (!cancelled) setRuntimeReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!runtimeReady) return;
    let active = true;
    let unsub: { unsubscribe: () => void } | null = null;
    void (async () => {
      const sb = await getAuthClient();
      if (!active) return;
      if (!sb) {
        setLoading(false);
        return;
      }
      const { data } = await sb.auth.getSession();
      if (!active) return;
      setSession(data.session ?? null);
      setLoading(false);
      const { data: sub } = sb.auth.onAuthStateChange((_event, next) => {
        if (!active) return;
        setSession(next);
        setLoading(false);
      });
      unsub = sub.subscription;
    })();
    return () => {
      active = false;
      unsub?.unsubscribe();
    };
  }, [runtimeReady]);

  const signInWithPassword = useCallback(async (email: string, password: string) => {
    const sb = await getAuthClient();
    if (!sb) throw new Error("Supabase chưa cấu hình.");
    setLoading(true);
    const { error } = await sb.auth.signInWithPassword({ email, password });
    if (error) {
      setLoading(false);
      throw error;
    }
  }, []);

  const presetLogin = Boolean(getPresetLoginConfig());

  const signInWithPreset = useCallback(
    async (kind: "admin" | "viewer") => {
      const preset = getPresetLoginConfig();
      if (!preset) throw new Error("Chưa cấu hình preset đăng nhập.");
      const pair = kind === "admin" ? preset.admin : preset.viewer;
      if (!pair) throw new Error(`Chưa cấu hình preset ${kind}.`);
      await signInWithPassword(pair.email, pair.password);
    },
    [signInWithPassword]
  );

  const signOut = useCallback(async () => {
    const sb = await getAuthClient();
    if (!sb) return;
    await sb.auth.signOut();
  }, []);

  const user = session?.user ?? null;
  const role = resolveRole(user);
  const value = useMemo<AuthCtx>(
    () => ({
      session,
      user,
      role,
      canEdit: role === "admin",
      loading,
      isConfigured: isSupabaseConfigured(),
      signInWithPassword,
      signInWithPreset,
      presetLogin,
      signOut,
    }),
    [session, user, role, loading, signInWithPassword, signInWithPreset, presetLogin, signOut]
  );

  return (
    <AuthContext.Provider value={value}>
      {loading ? (
        <div className="flex min-h-dvh items-center justify-center bg-zinc-50 dark:bg-zinc-950">
          <p className="text-sm text-zinc-500">Đang kiểm tra đăng nhập...</p>
        </div>
      ) : (
        <div
          className={cn(
            "min-h-dvh",
            role === "viewer" && "ring-1 ring-amber-500/20"
          )}
        >
          {children}
        </div>
      )}
    </AuthContext.Provider>
  );
}
