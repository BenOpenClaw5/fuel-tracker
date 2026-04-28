"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

interface ToastEvent {
  id: string;
  message: string;
  kind: "info" | "success" | "error";
}

const channel = "fuel:toast";

export function showToast(message: string, kind: ToastEvent["kind"] = "info") {
  if (typeof window === "undefined") return;
  const id = `${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  window.dispatchEvent(
    new CustomEvent<ToastEvent>(channel, { detail: { id, message, kind } }),
  );
}

export function ToastHost() {
  const [toasts, setToasts] = useState<ToastEvent[]>([]);

  useEffect(() => {
    const onEvent = (e: Event) => {
      const detail = (e as CustomEvent<ToastEvent>).detail;
      setToasts((t) => [...t, detail]);
      window.setTimeout(() => {
        setToasts((t) => t.filter((x) => x.id !== detail.id));
      }, 2400);
    };
    window.addEventListener(channel, onEvent);
    return () => window.removeEventListener(channel, onEvent);
  }, []);

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-0 z-[60] flex flex-col items-center gap-2 px-3 pt-3"
      style={{ paddingTop: "calc(env(safe-area-inset-top) + 8px)" }}
    >
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ y: -16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -16, opacity: 0 }}
            transition={{ type: "spring", stiffness: 360, damping: 28 }}
            className={
              "pointer-events-auto card-elev px-3 py-2 text-[13px] font-medium " +
              (t.kind === "success"
                ? "!border-[var(--good)] text-[var(--good)]"
                : t.kind === "error"
                  ? "!border-[var(--danger)] text-[var(--danger)]"
                  : "")
            }
          >
            {t.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
