"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useMemo, useState } from "react";
import {
  NUTRIENT_META,
  formatNutrient,
  nutrientStatus,
  nutrientValue,
  statusColor,
  type NutrientGroup,
  type NutrientKey,
  type NutrientMeta,
} from "@/lib/nutrients";
import type { Goals, Nutrients } from "@/lib/types";

const GROUPS: Array<{ id: NutrientGroup; label: string }> = [
  { id: "vitamins", label: "Vitamins" },
  { id: "minerals", label: "Minerals" },
];

interface Props {
  totals: Nutrients;
  goals: Goals;
  onSelect?: (key: NutrientKey) => void;
}

export function MicroPanel({ totals, goals, onSelect }: Props) {
  const [open, setOpen] = useState(false);

  const tracked = useMemo(() => {
    const out: Array<{ meta: NutrientMeta; value: number; target: number }> = [];
    for (const m of NUTRIENT_META) {
      if (m.group !== "vitamins" && m.group !== "minerals") continue;
      const target =
        (goals as unknown as Record<string, number | undefined>)[m.key as string] ?? 0;
      if (target <= 0) continue;
      const value = nutrientValue(totals, m.key) ?? 0;
      out.push({ meta: m, value, target });
    }
    return out;
  }, [totals, goals]);

  // headline summary: how many are "bad" (<50% for "up" goals)
  const lowCount = tracked.filter(
    ({ meta, value, target }) =>
      nutrientStatus(value, target, meta.goalDirection) === "bad",
  ).length;

  return (
    <section className="card overflow-hidden" data-testid="micro-panel">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="micro-panel-body"
        className="w-full px-4 py-4 grid grid-cols-[1fr_auto] items-center gap-3 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
      >
        <div>
          <div className="display-md">Vitamins &amp; minerals</div>
          <div className="label mt-0.5">
            {tracked.length === 0 ? (
              "set targets in Settings"
            ) : lowCount > 0 ? (
              <span className="text-[var(--accent)]">
                {lowCount} below 50% of target
              </span>
            ) : (
              <span className="text-[var(--good)]">on track</span>
            )}
          </div>
        </div>
        {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>
      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            id="micro-panel-body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 grid gap-5 border-t border-[var(--border)] pt-3">
              {GROUPS.map((g) => {
                const rows = tracked.filter((r) => r.meta.group === g.id);
                if (rows.length === 0) return null;
                return (
                  <div key={g.id}>
                    <div className="label-strong mb-2">{g.label}</div>
                    <ul className="grid gap-2">
                      {rows.map(({ meta, value, target }) => {
                        const status = nutrientStatus(value, target, meta.goalDirection);
                        const color = statusColor(status);
                        const pct = target > 0 ? Math.min(1.5, value / target) : 0;
                        return (
                          <li key={meta.key as string}>
                            <button
                              type="button"
                              onClick={() => onSelect?.(meta.key)}
                              aria-label={`${meta.label} detail`}
                              className="w-full text-left active:bg-[var(--panel-2)] px-1 py-1 rounded-[6px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
                            >
                              <div className="flex items-baseline justify-between text-[12.5px]">
                                <span>{meta.label}</span>
                                <span className="numeric text-[var(--fg-dim)]">
                                  {formatNutrient(value, meta.unit)}
                                  <span className="text-[var(--muted)]">
                                    {" / "}
                                    {formatNutrient(target, meta.unit)}
                                  </span>
                                </span>
                              </div>
                              <div className="mt-1 h-[4px] rounded-full bg-[var(--panel-2)] overflow-hidden">
                                <div
                                  className="h-full rounded-full"
                                  style={{
                                    width: `${Math.min(100, pct * 100)}%`,
                                    background: color,
                                  }}
                                />
                              </div>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                );
              })}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}
