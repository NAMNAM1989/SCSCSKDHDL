import { Activity, Home, Search, User } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  Icon: LucideIcon;
};

export const MAIN_NAV: NavItem[] = [
  { href: "/", label: "Home", Icon: Home },
  { href: "/search/", label: "Search", Icon: Search },
  { href: "/activity/", label: "Activity", Icon: Activity },
  { href: "/profile/", label: "Profile", Icon: User },
];

export function isNavActive(pathname: string, href: string): boolean {
  const p = pathname.replace(/\/$/, "") || "/";
  const h = href.replace(/\/$/, "") || "/";
  if (h === "/") return p === "/";
  return p === h || p.startsWith(`${h}/`);
}
