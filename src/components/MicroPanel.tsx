"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { NUTRIENT_META, formatNutrient } from "@/lib/nutrients";
import type { Goals, Nutrients } from "@/lib/types";

const GROUPS: Array<{ id: "fats" | "minerals" | "vitamins"; label: string }> = [
  { id: "fats", label: "Fats & cholesterol" },
  { id: "minerals", label: "Minerals" },
  { id: "vitamins", label: "Vitamins" },
];

export function MicroPanel({
  totals,
  goals,
}: {
  totals: Nutrients;
  goals: Goals;
}) {
  const [open, setOpen] = useState(false);

  const groupRows = (groupId: "fats" | "minerals" | "vitamins") =>
    NUTRIENT_META.filter((m) => m.group === groupId).map((m) => {
      const value = (totals as unknown as Record<string, number | null>)[m.key as string];
      const target = (goals as unknown as Record<string, number | undefined>)[m.key as string];
      return { meta: m, value, target };
    });

  // Quick summary: how many tracked nutrients are below 50%?
  let lowCount = 0;
  let trackedCount = 0;
  for (const groupId of ["minerals", "vitamins"] as const) {
    for (const { value, target } of groupRows(groupId)) {
      if (typeof target !== "number" || target <= 0) continue;
      trackedCount += 1;
      const pct = (value ?? 0) / target;
      if (pct < 0.5) lowCount += 1;
    }
  }

  return (
    <section className="card overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full px-4 py-4 grid grid-cols-[1fr_auto] items-center gap-3 text-left"
      >
        <div>
          <div className="display-md">Micronutrients</div>
          <div className="label mt-0.5">
            {trackedCount > 0 ? (
              lowCount > 0 ? (
                <span className="text-[var(--accent)]">
                  {lowCount} below 50% of target
                </span>
              ) : (
                <span className="text-[var(--good)]">on track</span>
              )
            ) : (
              "tap for vitamins, minerals, fats"
            )}
          </div>
        </div>
        {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>
      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 grid gap-5 border-t border-[var(--border)] pt-3">
              {GROUPS.map((g) => {
                const rows = groupRows(g.id);
                const tracked = rows.filter(
                  (r) => typeof r.target === "number" && r.target > 0,
                );
                if (tracked.length === 0) return null;
                return (
                  <div key={g.id}>
                    <div className="label-strong mb-2">{g.label}</div>
                    <ul className="grid gap-2">
                      {tracked.map(({ meta, value, target }) => {
                        const t = target ?? 0;
                        const v = value ?? 0;
                        const pct = t > 0 ? Math.min(1.5, v / t) : 0;
                        const color =
                          pct >= 0.9
                            ? "var(--good)"
                            : pct >= 0.5
                              ? "var(--warn)"
                              : "var(--accent)";
                        return (
                          <li key={meta.key as string}>
                            <div className="flex items-baseline justify-between text-[12.5px]">
                              <span>{meta.label}</span>
                              <span className="numeric text-[var(--fg-dim)]">
                                {formatNutrient(value ?? null, meta.unit)}
                                <span className="text-[var(--muted)]">
                                  {" / "}
                                  {formatNutrient(t, meta.unit)}
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
