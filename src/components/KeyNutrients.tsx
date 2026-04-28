"use client";

import { motion } from "framer-motion";
import {
  WATCH_NUTRIENTS,
  formatNutrient,
  nutrientStatus,
  nutrientValue,
  statusColor,
  type NutrientKey,
} from "@/lib/nutrients";
import type { Goals, Nutrients } from "@/lib/types";

export function KeyNutrients({
  totals,
  goals,
  onSelect,
}: {
  totals: Nutrients;
  goals: Goals;
  onSelect: (key: NutrientKey) => void;
}) {
  return (
    <section
      data-testid="key-nutrients"
      aria-label="Key nutrients"
      className="card p-3"
    >
      <div className="px-1 pb-2 flex items-baseline justify-between">
        <div className="label-strong">Key nutrients</div>
        <div className="label">Tap for details</div>
      </div>
      <div className="grid grid-cols-2 gap-[1px] bg-[var(--border)] rounded-[var(--radius)] overflow-hidden border border-[var(--border)]">
        {WATCH_NUTRIENTS.map((meta) => {
          const value = nutrientValue(totals, meta.key) ?? 0;
          const target =
            (goals as unknown as Record<string, number | undefined>)[
              meta.key as string
            ] ?? 0;
          const status = nutrientStatus(value, target, meta.goalDirection);
          const color = statusColor(status);
          const direction = meta.goalDirection;

          // For "down" we visualize to 100% of target with overshoot beyond.
          const pct = target > 0 ? value / target : 0;
          const trackPct = Math.min(100, pct * 100);
          const overshoot = direction === "down" && pct > 1.0;
          return (
            <button
              type="button"
              key={meta.key}
              onClick={() => onSelect(meta.key)}
              aria-label={`${meta.label} detail`}
              className="bg-[var(--panel)] active:bg-[var(--panel-2)] px-3 py-3 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
            >
              <div className="flex items-baseline justify-between">
                <div className="label-strong">{shortName(meta.label)}</div>
                <DirectionPill direction={direction} status={status} />
              </div>
              <div className="mt-1 flex items-baseline gap-1">
                <span
                  className="numeric text-[18px] font-semibold leading-none"
                  style={{ color: status === "neutral" ? "var(--fg)" : color }}
                >
                  {Math.round(value)}
                </span>
                <span className="numeric text-[10px] text-[var(--muted)]">
                  /{" "}
                  {target > 0
                    ? formatNutrient(target, meta.unit).replace(/\s.+$/, "")
                    : "—"}
                </span>
                <span className="text-[10px] text-[var(--muted)]">
                  {meta.unit === "kcal" ? "kcal" : meta.unit === "mcg" ? "µg" : meta.unit}
                </span>
              </div>
              <div
                className="mt-2 h-[4px] rounded-full bg-[var(--panel-2)] overflow-hidden relative"
                aria-hidden
              >
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: color }}
                  initial={false}
                  animate={{ width: `${trackPct}%` }}
                  transition={{ type: "spring", stiffness: 220, damping: 30 }}
                />
                {overshoot ? (
                  <div
                    className="absolute inset-y-0 right-0 bg-[var(--accent)] opacity-60"
                    style={{ width: `${Math.min(100, (pct - 1) * 100)}%` }}
                  />
                ) : null}
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function shortName(label: string): string {
  if (label === "Saturated fat") return "Sat fat";
  return label;
}

function DirectionPill({
  direction,
  status,
}: {
  direction: "up" | "down" | "band" | undefined;
  status: ReturnType<typeof nutrientStatus>;
}) {
  if (!direction || status === "neutral") return null;
  const symbol = direction === "down" ? "↓" : direction === "up" ? "↑" : "≈";
  const tooltip = direction === "down" ? "Stay under" : direction === "up" ? "Aim above" : "Match";
  return (
    <span
      title={tooltip}
      aria-hidden
      className="text-[10px] font-bold tabular-nums px-1.5 rounded-full"
      style={{
        color: statusColor(status),
        background: "color-mix(in srgb, currentColor 12%, transparent)",
      }}
    >
      {symbol}
    </span>
  );
}
