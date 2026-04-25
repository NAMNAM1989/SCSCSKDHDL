"use client";

import { useDashboardShell } from "@/components/dashboard/dashboard-shell-context";
import { useAuth } from "@/components/providers/AuthProvider";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, LogOut, Menu, Moon, Search, ShieldCheck, Sun, X } from "lucide-react";
import { useTheme } from "next-themes";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const titles: Record<string, { title: string; desc?: string }> = {
  "/": { title: "Schedule", desc: "Cut-off SCSC · OPS · EXP" },
  "/search": { title: "Search", desc: "Tìm nhanh chuyến" },
  "/activity": { title: "Activity", desc: "Hướng dẫn & mẹo" },
  "/profile": { title: "Settings", desc: "Giao diện & đồng bộ" },
};

export function AppTopbar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const {
    role,
    user,
    loading,
    isConfigured,
    presetLogin,
    signInWithPassword,
    signInWithPreset,
    signOut,
  } = useAuth();
  const { mobileNavOpen, toggleMobileNav } = useDashboardShell();
  const [adminLoginOpen, setAdminLoginOpen] = useState(false);
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminLoginError, setAdminLoginError] = useState<string | null>(null);
  /** Tránh lệch Sun/Moon giữa SSR và client (next-themes chỉ biết theme sau khi mount). */
  const [themeReady, setThemeReady] = useState(false);
  useEffect(() => {
    setThemeReady(true);
  }, []);

  const meta = useMemo(() => {
    const p = pathname.replace(/\/$/, "") || "/";
    return titles[p] ?? { title: "Dashboard", desc: "" };
  }, [pathname]);

  const submitAdminLogin = async () => {
    setAdminLoginError(null);
    try {
      if (presetLogin) {
        await signInWithPreset("admin");
      } else {
        await signInWithPassword(adminEmail.trim(), adminPassword);
      }
      setAdminPassword("");
      setAdminLoginOpen(false);
    } catch (err) {
      setAdminLoginError(String(err));
    }
  };

  return (
    <>
      <header className="sticky top-0 z-30 flex h-12 shrink-0 items-center gap-2 border-b border-zinc-200/80 bg-white/90 px-2.5 backdrop-blur-md dark:border-zinc-800/80 dark:bg-zinc-950/90 sm:h-14 sm:gap-3 sm:px-4 lg:px-6">
      <button
        type="button"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-zinc-200/80 bg-white text-zinc-700 shadow-sm transition hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800 sm:h-10 sm:w-10 sm:rounded-xl lg:hidden"
        aria-label="Mở menu"
        aria-expanded={mobileNavOpen}
        onClick={toggleMobileNav}
      >
        <AnimatePresence mode="wait" initial={false}>
          {mobileNavOpen ? (
            <motion.span
              key="x"
              initial={{ opacity: 0, rotate: -90 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: 90 }}
            >
              <X className="h-5 w-5" />
            </motion.span>
          ) : (
            <motion.span
              key="menu"
              initial={{ opacity: 0, rotate: 90 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: -90 }}
            >
              <Menu className="h-5 w-5" />
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      <div className="min-w-0 flex-1 lg:flex lg:items-center lg:gap-6">
        <div className="min-w-0 lg:max-w-xs">
          <h1 className="truncate text-[15px] font-semibold leading-tight tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-base sm:leading-normal md:text-lg">
            {meta.title}
          </h1>
          {meta.desc ? (
            <p className="hidden truncate text-[11px] text-zinc-500 dark:text-zinc-400 sm:block sm:text-xs">
              {meta.desc}
            </p>
          ) : null}
        </div>

        <div className="relative mt-0 hidden min-w-0 flex-1 max-w-md lg:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            type="search"
            readOnly
            placeholder="Tìm trong workspace… (sắp có)"
            className="h-10 w-full rounded-xl border border-zinc-200/90 bg-zinc-50/80 pl-10 pr-4 text-sm text-zinc-800 placeholder:text-zinc-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-100 dark:placeholder:text-zinc-500"
            aria-label="Tìm kiếm"
          />
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-0.5 sm:gap-2">
        <span
          className={cn(
            "hidden rounded px-2 py-1 text-[10px] font-semibold uppercase tracking-wide sm:inline-flex",
            role === "admin"
              ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
              : "bg-amber-500/12 text-amber-700 dark:text-amber-300"
          )}
        >
          {role === "admin" ? "ADMIN" : "VIEWER"}
        </span>
        {role === "viewer" ? (
          <Button
            variant="primary"
            className="!h-9 !min-h-9 !min-w-0 !rounded-lg !px-2.5 !text-xs sm:!h-10 sm:!min-h-10 sm:!rounded-xl sm:!px-3 sm:!text-sm"
            onClick={() => setAdminLoginOpen(true)}
          >
            <ShieldCheck className="mr-1.5 h-4 w-4" />
            Admin
          </Button>
        ) : null}
        <button
          type="button"
          className={cn(
            "relative hidden h-9 w-9 items-center justify-center rounded-lg border border-transparent text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-800 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 sm:flex sm:h-10 sm:w-10 sm:rounded-xl"
          )}
          aria-label="Thông báo"
        >
          <Bell className="h-[18px] w-[18px]" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-violet-500 ring-2 ring-white dark:ring-zinc-950" />
        </button>
        <Button
          variant="ghost"
          className="!h-9 !min-h-9 !min-w-9 !rounded-lg !px-0 sm:!h-10 sm:!min-h-10 sm:!min-w-10 sm:!rounded-xl"
          aria-label="Chế độ sáng / tối"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          {!themeReady ? (
            <Moon className="h-[18px] w-[18px] text-zinc-400" aria-hidden />
          ) : theme === "dark" ? (
            <Sun className="h-[18px] w-[18px]" />
          ) : (
            <Moon className="h-[18px] w-[18px]" />
          )}
        </Button>
        {user ? (
          <Button
            variant="ghost"
            className="!h-9 !min-h-9 !min-w-9 !rounded-lg !px-0 sm:!h-10 sm:!min-h-10 sm:!min-w-10 sm:!rounded-xl"
            aria-label="Đăng xuất"
            onClick={() => {
              void signOut();
            }}
          >
            <LogOut className="h-[18px] w-[18px]" />
          </Button>
        ) : null}
        <div
          className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-full border border-zinc-200 bg-gradient-to-br from-zinc-100 to-zinc-200 text-xs font-semibold text-zinc-600 dark:border-zinc-700 dark:from-zinc-800 dark:to-zinc-900 dark:text-zinc-300 sm:flex"
          aria-hidden
        >
          SC
        </div>
      </div>
      </header>
      {adminLoginOpen ? (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/45 px-4 py-8 backdrop-blur-sm sm:items-center sm:py-6">
          <div className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-4 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
                  Đăng nhập Admin
                </h2>
                <p className="mt-1 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
                  Viewer được xem công khai. Admin cần đăng nhập để sửa, import
                  hoặc xoá dữ liệu.
                </p>
              </div>
              <Button
                variant="ghost"
                className="!h-8 !min-h-8 !min-w-8 !rounded-lg !p-0"
                aria-label="Đóng đăng nhập Admin"
                onClick={() => {
                  setAdminLoginError(null);
                  setAdminLoginOpen(false);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {!isConfigured ? (
              <p className="mt-3 rounded-lg border border-amber-300/40 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:border-amber-700/40 dark:bg-amber-950/30 dark:text-amber-300">
                Chưa cấu hình Supabase nên chưa thể đăng nhập Admin.
              </p>
            ) : null}

            <div className="mt-4 space-y-3">
              {!presetLogin ? (
                <>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-zinc-500 dark:text-zinc-400">
                      Email Admin
                    </label>
                    <input
                      type="email"
                      autoComplete="email"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      placeholder="admin@company.com"
                      className="min-h-11 w-full rounded-xl border border-zinc-200 bg-white px-3.5 text-[16px] text-zinc-900 placeholder:text-zinc-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-500"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-zinc-500 dark:text-zinc-400">
                      Mật khẩu
                    </label>
                    <input
                      type="password"
                      autoComplete="current-password"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") void submitAdminLogin();
                      }}
                      placeholder="••••••••"
                      className="min-h-11 w-full rounded-xl border border-zinc-200 bg-white px-3.5 text-[16px] text-zinc-900 placeholder:text-zinc-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-500"
                    />
                  </div>
                </>
              ) : (
                <p className="rounded-lg bg-zinc-50 px-3 py-2 text-xs text-zinc-600 dark:bg-zinc-950 dark:text-zinc-400">
                  Tài khoản Admin dùng preset đã cấu hình trên môi trường deploy.
                </p>
              )}

              {adminLoginError ? (
                <p className="text-xs text-red-600 dark:text-red-400">
                  {adminLoginError}
                </p>
              ) : null}

              <Button
                variant="primary"
                className="w-full"
                disabled={
                  !isConfigured ||
                  loading ||
                  (!presetLogin && (!adminEmail.trim() || !adminPassword))
                }
                onClick={() => void submitAdminLogin()}
              >
                {loading ? "Đang xử lý..." : "Vào chế độ Admin"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
