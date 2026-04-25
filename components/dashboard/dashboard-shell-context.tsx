"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type DashboardShellContextValue = {
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (v: boolean) => void;
  mobileNavOpen: boolean;
  setMobileNavOpen: (v: boolean) => void;
  toggleMobileNav: () => void;
};

const DashboardShellContext =
  createContext<DashboardShellContextValue | null>(null);

export function useDashboardShell() {
  const ctx = useContext(DashboardShellContext);
  if (!ctx)
    throw new Error("useDashboardShell must be used within DashboardShell");
  return ctx;
}

export function DashboardShellProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem("dash-sidebar-collapsed") === "1")
        setSidebarCollapsed(true);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(
        "dash-sidebar-collapsed",
        sidebarCollapsed ? "1" : "0"
      );
    } catch {
      /* ignore */
    }
  }, [sidebarCollapsed]);

  useEffect(() => {
    if (mobileNavOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileNavOpen]);

  const toggleMobileNav = useCallback(() => {
    setMobileNavOpen((o) => !o);
  }, []);

  const value = useMemo(
    () => ({
      sidebarCollapsed,
      setSidebarCollapsed,
      mobileNavOpen,
      setMobileNavOpen,
      toggleMobileNav,
    }),
    [sidebarCollapsed, mobileNavOpen, toggleMobileNav]
  );

  return (
    <DashboardShellContext.Provider value={value}>
      {children}
    </DashboardShellContext.Provider>
  );
}
