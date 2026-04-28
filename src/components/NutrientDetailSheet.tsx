"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import {
  formatNutrient,
  getMeta,
  nutrientStatus,
  nutrientValue,
  statusColor,
  type NutrientKey,
} from "@/lib/nutrients";
import type { Goals, LogEntry } from "@/lib/types";

interface DetailSheetProps {
  nutrientKey: NutrientKey | null;
  entries: LogEntry[];
  goals: Goals | null;
  onClose: () => void;
}

export function NutrientDetailSheet({
  nutrientKey,
  entries,
  goals,
  onClose,
}: DetailSheetProps) {
  return (
    <AnimatePresence>
      {nutrientKey ? (
        <DetailSheet
          key={nutrientKey}
          nutrientKey={nutrientKey}
          entries={entries}
          goals={goals}
          onClose={onClose}
        />
      ) : null}
    </AnimatePresence>
  );
}

function DetailSheet({
  nutrientKey,
  entries,
  goals,
  onClose,
}: DetailSheetProps & { nutrientKey: NutrientKey }) {
  const meta = getMeta(nutrientKey);
  if (!meta) return null;

  const target = (goals as unknown as Record<string, number | undefined> | null)?.[
    nutrientKey as string
  ];

  // Foods sorted by contribution to this nutrient (descending)
  const contributions = entries
    .map((e) => {
      const per = nutrientValue(e.snapshot.nutrients, nutrientKey);
      const total = per == null ? 0 : per * e.servings;
      return { entry: e, total };
    })
    .filter((c) => c.total > 0)
    .sort((a, b) => b.total - a.total);

  const totalAmount = contributions.reduce((sum, c) => sum + c.total, 0);
  const status = nutrientStatus(totalAmount, target, meta.goalDirection);
  const color = statusColor(status);
  const direction = meta.goalDirection;

  const pct =
    target && target > 0 ? Math.max(0, Math.min(2, totalAmount / target)) : 0;

  const headerCopy = (() => {
    if (!target || target <= 0) return "No target set.";
    if (direction === "down") {
      return totalAmount <= target
        ? `${formatNutrient(target - totalAmount, meta.unit)} remaining`
        : `${formatNutrient(totalAmount - target, meta.unit)} over target`;
    }
    if (direction === "up") {
      return totalAmount >= target
        ? "Target hit"
        : `${formatNutrient(target - totalAmount, meta.unit)} to go`;
    }
    return "";
  })();

  return (
    <>
      <motion.div
        className="sheet-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        aria-hidden
      />
      <motion.div
        role="dialog"
        aria-label={`${meta.label} detail`}
        className="sheet"
        initial={{ y: 360 }}
        animate={{ y: 0 }}
        exit={{ y: 380 }}
        transition={{ type: "spring", stiffness: 340, damping: 34 }}
      >
        <span className="sheet-handle" aria-hidden />
        <div className="px-5 pt-3 pb-3 grid grid-cols-[1fr_auto] items-start gap-3">
          <div className="min-w-0">
            <div className="label">{groupLabel(meta.group)}</div>
            <div className="display-md mt-0.5 truncate">{meta.label}</div>
            <div className="mt-2 flex items-baseline gap-2">
              <div
                className="numeric font-semibold leading-none"
                style={{ fontSize: "clamp(2rem, 8vw, 2.6rem)", color }}
              >
                {formatNutrient(totalAmount, meta.unit).replace(/\s.+$/, "")}
              </div>
              {target ? (
                <div className="numeric text-[var(--muted)] text-[14px]">
                  / {formatNutrient(target, meta.unit)}
                </div>
              ) : null}
            </div>
            <div className="mt-1 text-[13px] text-[var(--fg-dim)]">{headerCopy}</div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="btn btn-ghost btn-sm !min-h-[36px] !px-2"
          >
            <X size={16} />
          </button>
        </div>

        {target ? (
          <div className="px-5 pb-3">
            <ProgressTrack
              pct={pct}
              color={color}
              direction={direction}
            />
          </div>
        ) : null}

        <div className="border-t border-[var(--border)] flex-1 overflow-auto">
          <div className="px-5 pt-4 pb-2 label-strong">
            {direction === "down" ? "Top sources" : "Contributions"}{" "}
            <span className="text-[var(--muted)] font-normal">
              ({contributions.length})
            </span>
          </div>
          {contributions.length === 0 ? (
            <div className="px-5 py-8 text-center text-[13px] text-[var(--muted)]">
              {direction === "down"
                ? "Nothing logged contains this nutrient yet — that's good."
                : "Nothing logged contains this nutrient yet."}
            </div>
          ) : (
            <ul className="divide-y divide-[var(--border)]">
              {contributions.map(({ entry, total }) => {
                const share = totalAmount > 0 ? total / totalAmount : 0;
                return (
                  <li
                    key={entry.id}
                    className="px-5 py-3 grid grid-cols-[1fr_auto] items-center gap-3"
                  >
                    <div className="min-w-0">
                      <div className="text-[14px] font-medium truncate">
                        {entry.snapshot.name}
                      </div>
                      <div className="text-[12px] text-[var(--muted)] truncate">
                        <span className="capitalize">{entry.meal}</span> ·{" "}
                        <span className="numeric">
                          {entry.servings}× {entry.snapshot.servingLabel}
                        </span>
                      </div>
                      <div className="mt-1 h-[3px] rounded-full bg-[var(--panel-2)] overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${Math.min(100, share * 100)}%`,
                            background: color,
                          }}
                        />
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="numeric text-[14px] font-semibold leading-none">
                        {formatNutrient(total, meta.unit)}
                      </div>
                      <div className="numeric text-[10px] text-[var(--muted)] mt-0.5">
                        {Math.round(share * 100)}%
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div
          className="border-t border-[var(--border)] px-5 py-3 safe-bottom text-[12px] text-[var(--muted)]"
        >
          {hint(meta)}
        </div>
      </motion.div>
    </>
  );
}

function ProgressTrack({
  pct,
  color,
  direction,
}: {
  pct: number;
  color: string;
  direction?: "up" | "down" | "band";
}) {
  // For "down" goals we render up to 2× the target (overshoot zone).
  const widthPct = Math.min(100, (pct / (direction === "down" ? 2 : 1.2)) * 100);
  return (
    <div className="h-[6px] rounded-full bg-[var(--panel-2)] overflow-hidden relative">
      {direction === "down" ? (
        <div
          className="absolute inset-y-0 left-1/2 w-[1px] bg-[var(--border-strong)]"
          aria-hidden
          style={{ left: "50%" }}
        />
      ) : null}
      <motion.div
        className="h-full rounded-full"
        style={{ background: color }}
        initial={false}
        animate={{ width: `${widthPct}%` }}
        transition={{ type: "spring", stiffness: 220, damping: 30 }}
      />
    </div>
  );
}

function groupLabel(g: ReturnType<typeof getMeta> extends infer T ? T extends { group: infer G } ? G : never : never): string {
  switch (g) {
    case "macro":
      return "Macro";
    case "macroDetail":
      return "Macro detail";
    case "minerals":
      return "Mineral";
    case "vitamins":
      return "Vitamin";
    default:
      return "";
  }
}

function hint(meta: NonNullable<ReturnType<typeof getMeta>>): string {
  switch (meta.key) {
    case "fiber_g":
      return "Aim to hit your target. Whole grains, legumes, fruit and vegetables are the best sources.";
    case "sodium_mg":
      return "Stay under your target. Most sodium comes from packaged foods and restaurant meals.";
    case "sat_fat_g":
      return "Stay under your target. Limit fatty cuts of red meat, butter, full-fat dairy, fried foods.";
    case "added_sugar_g":
      return "Stay under your target. Sweetened drinks and packaged snacks are the usual offenders.";
    case "potassium_mg":
      return "Push for your target. Bananas, leafy greens, beans and potatoes are dense sources.";
    case "iron_mg":
      return "Push for your target. Pair plant iron with vitamin C for better absorption.";
    case "vit_d_mcg":
      return "Tough to hit through food alone. Fatty fish, eggs, fortified dairy. Supplement if needed.";
    case "vit_b12_mcg":
      return "Animal foods only. Plant-based diets generally need to supplement.";
    default:
      return meta.goalDirection === "down"
        ? "Stay under your target."
        : meta.goalDirection === "up"
          ? "Aim for your target or above."
          : "";
  }
}
