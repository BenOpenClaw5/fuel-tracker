"use client";

import { useMemo, useState } from "react";
import { Logo } from "@/components/Logo";
import { Sparkline } from "@/components/Sparkline";
import { useGoals, useLog, useWeight, useProfile } from "@/lib/hooks";
import {
  NUTRIENT_META,
  formatNutrient,
  nutrientStatus,
  nutrientValue,
  scaleNutrients,
  statusColor,
  sumNutrients,
  type NutrientKey,
  type NutrientMeta,
} from "@/lib/nutrients";
import { toIsoDate } from "@/lib/dates";
import { kgToLbs } from "@/lib/nutrition";
import type { Nutrients } from "@/lib/types";

type Window = 14 | 30 | 90;

const WINDOWS: Array<{ days: Window; label: string }> = [
  { days: 14, label: "14d" },
  { days: 30, label: "30d" },
  { days: 90, label: "90d" },
];

export default function TrendsPage() {
  const log = useLog();
  const goals = useGoals();
  const weight = useWeight();
  const profile = useProfile();
  const [pageEpoch] = useState(() => Date.now());
  const [days, setDays] = useState<Window>(14);

  // Per-day totals across the chosen window. `null` for days with no entries.
  const series = useMemo(() => {
    const out: Array<{ iso: string; totals: Nutrients | null }> = [];
    const now = pageEpoch;
    for (let i = days - 1; i >= 0; i--) {
      const iso = toIsoDate(new Date(now - i * 86400000));
      const dayEntries = log.filter((e) => e.date === iso);
      if (!dayEntries.length) {
        out.push({ iso, totals: null });
        continue;
      }
      out.push({
        iso,
        totals: sumNutrients(
          dayEntries.map((e) => scaleNutrients(e.snapshot.nutrients, e.servings)),
        ),
      });
    }
    return out;
  }, [log, days, pageEpoch]);

  const weightSeries = useMemo<Array<number | null>>(() => {
    const map = new Map<string, number>();
    for (const w of weight) map.set(w.date, w.weightKg);
    const out: Array<number | null> = [];
    const now = pageEpoch;
    for (let i = days - 1; i >= 0; i--) {
      const iso = toIsoDate(new Date(now - i * 86400000));
      out.push(map.has(iso) ? map.get(iso) ?? null : null);
    }
    return out;
  }, [weight, days, pageEpoch]);

  const seriesValues = (key: NutrientKey): Array<number | null> =>
    series.map((d) => nutrientValue(d.totals, key));

  const lastValid = (vals: Array<number | null>): number | null => {
    for (let i = vals.length - 1; i >= 0; i--) {
      if (vals[i] != null) return vals[i] as number;
    }
    return null;
  };

  const nDays = (vals: Array<number | null>): number =>
    vals.filter((v) => v != null && v > 0).length;

  const avg = (vals: Array<number | null>): number => {
    const valid = vals.filter((v): v is number => v != null && v > 0);
    if (!valid.length) return 0;
    return valid.reduce((a, b) => a + b, 0) / valid.length;
  };

  const isImperial = profile?.units === "imperial";

  // Nutrient picker — defaults to fiber since it's our most-asked-after watch list item
  const [nutrientKey, setNutrientKey] = useState<NutrientKey>("fiber_g");
  const focusMeta: NutrientMeta = NUTRIENT_META.find((m) => m.key === nutrientKey)!;
  const focusValues = seriesValues(nutrientKey);
  const focusAvg = avg(focusValues);
  const focusTarget =
    (goals as unknown as Record<string, number | undefined> | null)?.[
      nutrientKey as string
    ] ?? 0;
  const focusStatus = nutrientStatus(focusAvg, focusTarget, focusMeta.goalDirection);
  const focusColor = statusColor(focusStatus);

  return (
    <div className="flex-1 flex flex-col">
      <header className="px-5 pt-6 pb-3 safe-top flex items-center justify-between">
        <Logo size={18} />
        <div className="label">Trends</div>
      </header>

      <div className="px-5 pb-2 flex items-end justify-between gap-3">
        <h1 className="display-xl">Trends</h1>
        <WindowSwitcher value={days} onChange={setDays} />
      </div>

      <div className="px-5 grid gap-4 max-w-[760px] w-full mx-auto pb-8">
        {/* Calories headline */}
        <article className="card p-5">
          <div className="flex items-baseline justify-between gap-3">
            <div>
              <div className="label">Calories / day average</div>
              <div className="numeric text-[28px] font-semibold leading-none mt-1">
                {Math.round(avg(seriesValues("calories"))).toLocaleString()}
                <span className="text-[var(--muted)] text-[13px] font-normal numeric">
                  {" "}
                  kcal
                </span>
              </div>
              <div className="label mt-1 numeric">
                {goals ? `target ${goals.calories.toLocaleString()}` : ""}
                {" · "}
                {nDays(seriesValues("calories"))} of {days} days logged
              </div>
            </div>
            <Sparkline
              values={seriesValues("calories")}
              stroke="var(--accent)"
              fill="color-mix(in srgb, var(--accent) 18%, transparent)"
            />
          </div>
        </article>

        {/* Weight */}
        <article className="card p-5">
          <div className="flex items-baseline justify-between gap-3">
            <div>
              <div className="label">Weight</div>
              <div className="numeric text-[28px] font-semibold leading-none mt-1">
                {(() => {
                  const last = lastValid(weightSeries);
                  if (last == null) return "—";
                  return isImperial
                    ? `${kgToLbs(last).toFixed(1)} `
                    : `${last.toFixed(1)} `;
                })()}
                <span className="text-[var(--muted)] text-[13px] font-normal numeric">
                  {isImperial ? "lb" : "kg"}
                </span>
              </div>
              <div className="label mt-1">
                {nDays(weightSeries)} entries in window
              </div>
            </div>
            <Sparkline
              values={weightSeries}
              stroke="var(--fg)"
              fill="color-mix(in srgb, var(--fg) 8%, transparent)"
            />
          </div>
        </article>

        {/* Per-nutrient deep dive */}
        <article className="card p-5">
          <div className="flex items-baseline justify-between">
            <div className="label-strong">Nutrient deep dive</div>
            <select
              value={nutrientKey}
              onChange={(e) => setNutrientKey(e.target.value as NutrientKey)}
              aria-label="Select nutrient"
              className="!min-h-[34px] !text-[13px] !py-1 !px-2"
            >
              {DEEP_DIVE_NUTRIENTS.map((m) => (
                <option key={m.key} value={m.key as string}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <div
              className="numeric text-[28px] font-semibold leading-none"
              style={{ color: focusColor }}
            >
              {Math.round(focusAvg)}
            </div>
            <div className="numeric text-[var(--muted)] text-[13px]">
              {focusMeta.unit === "kcal"
                ? "kcal"
                : focusMeta.unit === "mcg"
                  ? "µg"
                  : focusMeta.unit}
              {focusTarget ? (
                <>
                  {" "}
                  · target {formatNutrient(focusTarget, focusMeta.unit)}
                </>
              ) : null}
            </div>
          </div>
          <div className="mt-3">
            <Sparkline
              values={focusValues}
              width={300}
              height={70}
              stroke={focusColor}
              fill={`color-mix(in srgb, ${focusColor} 18%, transparent)`}
            />
          </div>
          <div className="mt-3 text-[12px] text-[var(--fg-dim)]">
            {focusMeta.goalDirection === "down" ? "Stay under target." : "Aim for target."}{" "}
            {nDays(focusValues)} of {days} days have data.
          </div>
        </article>

        {/* Mini grid: each watch nutrient at a glance */}
        <article className="card p-4">
          <div className="label-strong mb-3">Watch list — daily averages</div>
          <ul className="grid gap-3">
            {WATCH_TABLE.map((m) => {
              const values = seriesValues(m.key);
              const a = avg(values);
              const target =
                (goals as unknown as Record<string, number | undefined> | null)?.[
                  m.key as string
                ] ?? 0;
              const status = nutrientStatus(a, target, m.goalDirection);
              const color = statusColor(status);
              return (
                <li key={m.key as string}>
                  <button
                    type="button"
                    onClick={() => setNutrientKey(m.key)}
                    aria-label={`${m.label} drill-down`}
                    className="w-full grid grid-cols-[120px_1fr_auto] items-center gap-3 py-1 text-left rounded-[6px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent)] active:bg-[var(--panel-2)]"
                  >
                    <div className="text-[13px] font-medium truncate">{m.label}</div>
                    <Sparkline
                      values={values}
                      width={140}
                      height={26}
                      stroke={color}
                      fill={`color-mix(in srgb, ${color} 16%, transparent)`}
                      showPoints={false}
                    />
                    <div className="text-right">
                      <div className="numeric text-[13px] font-semibold leading-none" style={{ color }}>
                        {Math.round(a)}
                      </div>
                      {target ? (
                        <div className="numeric text-[10px] text-[var(--muted)]">
                          / {Math.round(target)}
                        </div>
                      ) : null}
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </article>
      </div>
    </div>
  );
}

function WindowSwitcher({
  value,
  onChange,
}: {
  value: Window;
  onChange: (v: Window) => void;
}) {
  return (
    <div
      className="grid grid-cols-3 p-1 bg-[var(--panel-2)] rounded-[var(--radius)] border border-[var(--border)] gap-1"
      role="radiogroup"
      aria-label="Time range"
    >
      {WINDOWS.map((w) => (
        <button
          key={w.days}
          type="button"
          role="radio"
          aria-checked={value === w.days}
          onClick={() => onChange(w.days)}
          className={
            "h-8 px-3 rounded-[6px] text-[12px] font-semibold transition-colors " +
            (value === w.days
              ? "bg-[var(--panel)] shadow-[var(--shadow-sm)] text-[var(--fg)]"
              : "text-[var(--fg-dim)]")
          }
        >
          {w.label}
        </button>
      ))}
    </div>
  );
}

const DEEP_DIVE_NUTRIENTS: NutrientMeta[] = NUTRIENT_META.filter(
  (m) =>
    m.key !== "calories" &&
    (m.group === "macro" || m.watch || m.group === "vitamins" || m.group === "minerals"),
);

const WATCH_TABLE: NutrientMeta[] = [
  ...NUTRIENT_META.filter((m) => m.watch),
  NUTRIENT_META.find((m) => m.key === "potassium_mg")!,
  NUTRIENT_META.find((m) => m.key === "iron_mg")!,
  NUTRIENT_META.find((m) => m.key === "calcium_mg")!,
  NUTRIENT_META.find((m) => m.key === "vit_c_mg")!,
  NUTRIENT_META.find((m) => m.key === "vit_d_mcg")!,
  NUTRIENT_META.find((m) => m.key === "vit_b12_mcg")!,
];
