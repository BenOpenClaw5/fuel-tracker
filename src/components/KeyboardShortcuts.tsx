"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Global keyboard shortcuts.
 *   /  → open search (/add)
 *   s  → open barcode scanner
 *   n  → new recipe
 *   c  → new custom food
 *   t  → today
 *   l  → log
 *   r  → recipes
 *   ?  → no-op (could open help later)
 *
 * Disabled while focus is in an input/textarea/contenteditable.
 */
export function KeyboardShortcuts() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handler = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (!t) return;
      if (
        t.tagName === "INPUT" ||
        t.tagName === "TEXTAREA" ||
        t.tagName === "SELECT" ||
        t.isContentEditable
      ) {
        return;
      }
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (pathname?.startsWith("/onboarding")) return;
      const key = e.key.toLowerCase();
      switch (key) {
        case "/":
          e.preventDefault();
          router.push("/add");
          break;
        case "s":
          router.push("/scan");
          break;
        case "n":
          router.push("/recipes/new");
          break;
        case "c":
          router.push("/foods/new");
          break;
        case "t":
          router.push("/");
          break;
        case "l":
          router.push("/log");
          break;
        case "r":
          router.push("/recipes");
          break;
        case "g":
          router.push("/trends");
          break;
        default:
          break;
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [pathname, router]);

  return null;
}
