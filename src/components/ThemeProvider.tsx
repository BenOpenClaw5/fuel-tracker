"use client";

import { useEffect } from "react";
import { useSettings } from "@/lib/hooks";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const settings = useSettings();
  const choice = settings.theme;

  useEffect(() => {
    if (typeof window === "undefined") return;
    const apply = () => {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const effective =
        choice === "system" ? (prefersDark ? "dark" : "light") : choice;
      document.documentElement.dataset.theme = effective;
      const meta = document.querySelector('meta[name="theme-color"]');
      if (meta) {
        meta.setAttribute("content", effective === "dark" ? "#16140F" : "#FAF7F2");
      }
    };
    apply();
    if (choice === "system") {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      mq.addEventListener("change", apply);
      return () => mq.removeEventListener("change", apply);
    }
  }, [choice]);

  return <>{children}</>;
}

/**
 * No-flash inline script. Reads localStorage settings key directly and sets
 * data-theme before React hydrates.
 */
export const ThemeBootstrapScript = () => {
  const code = `(function(){try{var s=localStorage.getItem('fuel.settings.v1');var c=s?(JSON.parse(s).theme||'system'):'system';var prefersDark=window.matchMedia('(prefers-color-scheme: dark)').matches;var t=c==='system'?(prefersDark?'dark':'light'):c;document.documentElement.dataset.theme=t;}catch(e){document.documentElement.dataset.theme='light';}})();`;
  return <script dangerouslySetInnerHTML={{ __html: code }} />;
};
