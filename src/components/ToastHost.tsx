"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

interface ToastEvent {
  id: string;
  message: string;
  kind: "info" | "success" | "error";
  /** Optional inline action — fires when tapped, dismisses the toast. */
  action?: { label: string; id: string };
  ttlMs?: number;
}

const channel = "fuel:toast";
const actionChannel = "fuel:toast-action";

export function showToast(
  message: string,
  kind: ToastEvent["kind"] = "info",
  options: { action?: { label: string; id: string }; ttlMs?: number } = {},
) {
  if (typeof window === "undefined") return;
  const id = `${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  window.dispatchEvent(
    new CustomEvent<ToastEvent>(channel, {
      detail: { id, message, kind, action: options.action, ttlMs: options.ttlMs },
    }),
  );
}

/**
 * Subscribe to action presses on toasts. Returns an unsubscribe.
 *   onToastAction("undo-delete-xyz", () => ...)
 */
export function onToastAction(
  actionId: string,
  cb: () => void,
): () => void {
  if (typeof window === "undefined") return () => {};
  const handler = (e: Event) => {
    const detail = (e as CustomEvent<{ id: string }>).detail;
    if (detail?.id === actionId) cb();
  };
  window.addEventListener(actionChannel, handler);
  return () => window.removeEventListener(actionChannel, handler);
}

export function ToastHost() {
  const [toasts, setToasts] = useState<ToastEvent[]>([]);

  useEffect(() => {
    const onEvent = (e: Event) => {
      const detail = (e as CustomEvent<ToastEvent>).detail;
      setToasts((t) => [...t, detail]);
      const ttl = detail.ttlMs ?? (detail.action ? 5000 : 2400);
      window.setTimeout(() => {
        setToasts((t) => t.filter((x) => x.id !== detail.id));
      }, ttl);
    };
    window.addEventListener(channel, onEvent);
    return () => window.removeEventListener(channel, onEvent);
  }, []);

  const dismiss = (id: string) =>
    setToasts((t) => t.filter((x) => x.id !== id));

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
            role={t.kind === "error" ? "alert" : "status"}
            className={
              "pointer-events-auto card-elev px-3 py-2 text-[13px] font-medium flex items-center gap-3 " +
              (t.kind === "success"
                ? "!border-[var(--good)]"
                : t.kind === "error"
                  ? "!border-[var(--danger)]"
                  : "")
            }
            style={{
              color:
                t.kind === "success"
                  ? "var(--good)"
                  : t.kind === "error"
                    ? "var(--danger)"
                    : undefined,
            }}
          >
            <span>{t.message}</span>
            {t.action ? (
              <button
                type="button"
                onClick={() => {
                  window.dispatchEvent(
                    new CustomEvent(actionChannel, { detail: { id: t.action!.id } }),
                  );
                  dismiss(t.id);
                }}
                className="text-[12px] font-bold uppercase tracking-wider px-2 py-1 rounded-md border border-current opacity-90"
              >
                {t.action.label}
              </button>
            ) : null}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
