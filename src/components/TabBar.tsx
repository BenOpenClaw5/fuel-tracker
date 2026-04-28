"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, ChefHat, Home, LineChart, Plus } from "lucide-react";
import { Logo } from "./Logo";

const ITEMS = [
  { href: "/", label: "Today", icon: Home },
  { href: "/log", label: "Log", icon: CalendarDays },
  { href: "/recipes", label: "Recipes", icon: ChefHat },
  { href: "/trends", label: "Trends", icon: LineChart },
] as const;

export function TabBar() {
  const pathname = usePathname() ?? "/";
  if (pathname.startsWith("/onboarding")) return null;
  if (pathname.startsWith("/scan")) return null;

  return (
    <nav
      className="tab-bar fixed bottom-0 inset-x-0 z-30 safe-bottom"
      aria-label="Primary"
    >
      <div className="grid grid-cols-5 max-w-[640px] mx-auto px-2 py-1.5 items-end">
        {ITEMS.slice(0, 2).map((item) => (
          <TabLink key={item.href} {...item} active={isActive(pathname, item.href)} />
        ))}
        <Link
          href="/add"
          className="flex flex-col items-center justify-end gap-1 py-1"
          aria-label="Add food"
        >
          <span
            className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[var(--accent)] text-white shadow-md active:translate-y-[1px] transition-transform"
            style={{ boxShadow: "0 6px 20px color-mix(in srgb, var(--accent) 35%, transparent)" }}
          >
            <Plus size={22} strokeWidth={2.5} />
          </span>
          <span className="text-[10px] font-semibold tracking-wide text-[var(--fg-dim)]">ADD</span>
        </Link>
        {ITEMS.slice(2).map((item) => (
          <TabLink key={item.href} {...item} active={isActive(pathname, item.href)} />
        ))}
      </div>
      <div className="hidden md:flex items-center justify-center pb-2">
        <Logo size={14} />
      </div>
    </nav>
  );
}

function TabLink({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string;
  label: string;
  icon: typeof Home;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={
        "flex flex-col items-center justify-end gap-1 py-2 transition-colors " +
        (active ? "text-[var(--fg)]" : "text-[var(--muted)]")
      }
    >
      <Icon size={20} strokeWidth={active ? 2.4 : 1.8} />
      <span className="text-[10px] font-semibold tracking-wide uppercase">{label}</span>
    </Link>
  );
}

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/" || pathname.startsWith("/?");
  return pathname.startsWith(href);
}
