"use client";

import { useMemo, useState } from "react";
import { Logo } from "@/components/Logo";
import { Sparkline } from "@/components/Sparkline";
import { useGoals, useLog, useWeight, useProfile } from "@/lib/hooks";
import { scaleNutrients, sumNutrients } from "@/lib/nutrients";
import { toIsoDate } from "@/lib/dates";
import { kgToLbs } from "@/lib/nutrition";

const DAYS = 14;

export default function TrendsPage() {
  const log = useLog();
  const goals = useGoals();
  const weight = useWeight();
  const profile = useProfile();
  const [pageEpoch] = useState(() => Date.now());

  const series = useMemo(() => {
    const out: Array<{ iso: string; cal: number | null; p: number | null; c: number | null; f: number | null }> = [];
    const now = pageEpoch;
    for (let i = DAYS - 1; i >= 0; i--) {
      const iso = toIsoDate(new Date(now - i * 86400000));
      const dayEntries = log.filter((e) => e.date === iso);
      if (!dayEntries.length) {
        out.push({ iso, cal: null, p: null, c: null, f: null });
        continue;
      }
      const totals = sumNutrients(
        dayEntries.map((e) => scaleNutrients(e.snapshot.nutrients, e.servings)),
      );
      out.push({
        iso,
        cal: totals.calories ?? null,
        p: totals.protein_g ?? null,
        c: totals.carbs_g ?? null,
        f: totals.fat_g ?? null,
      });
    }
    return out;
  }, [log, pageEpoch]);

  const weightSeries = useMemo(() => {
    const map = new Map<string, number>();
    for (const w of weight) map.set(w.date, w.weightKg);
    const out: Array<number | null> = [];
    const now = pageEpoch;
    for (let i = DAYS - 1; i >= 0; i--) {
      const iso = toIsoDate(new Date(now - i * 86400000));
      out.push(map.has(iso) ? map.get(iso) ?? null : null);
    }
    return out;
  }, [weight, pageEpoch]);

  const calValues = series.map((s) => s.cal);
  const proteinValues = series.map((s) => s.p);
  const today = series[series.length - 1];
  const isImperial = profile?.units === "imperial";

  const nutrientGaps = useMemo(() => {
    if (!goals) return [] as Array<{ key: string; label: string; unit: string; dailyTarget: number; avg: number; pct: number }>;
    const cutoff = pageEpoch - 7 * 86400000;
    const last7 = log.filter((e) => e.createdAt > cutoff);
    const totals = sumNutrients(
      last7.map((e) => scaleNutrients(e.snapshot.nutrients, e.servings)),
    );
    const targets: Array<{ key: keyof typeof goals; label: string; unit: string }> = [
      { key: "fiber_g", label: "Fiber", unit: "g" },
      { key: "potassium_mg", label: "Potassium", unit: "mg" },
      { key: "calcium_mg", label: "Calcium", unit: "mg" },
      { key: "iron_mg", label: "Iron", unit: "mg" },
      { key: "magnesium_mg", label: "Magnesium", unit: "mg" },
      { key: "vit_c_mg", label: "Vitamin C", unit: "mg" },
      { key: "vit_d_mcg", label: "Vitamin D", unit: "µg" },
      { key: "vit_b12_mcg", label: "Vitamin B12", unit: "µg" },
    ];
    return targets
      .map((t) => {
        const target = goals[t.key];
        const dailyTarget = typeof target === "number" ? target : 0;
        const total =
          (totals as unknown as Record<string, number | null>)[t.key as string] ?? 0;
        const avgPerDay = total / 7;
        const pct = dailyTarget > 0 ? avgPerDay / dailyTarget : 0;
        return { ...t, dailyTarget, avg: avgPerDay, pct };
      })
      .filter((g) => g.dailyTarget > 0)
      .sort((a, b) => a.pct - b.pct);
  }, [log, goals, pageEpoch]);

  return (
    <div className="flex-1 flex flex-col">
      <header className="px-5 pt-6 pb-3 safe-top flex items-center justify-between">
        <Logo size={18} />
        <div className="label">Trends</div>
      </header>

      <div className="px-5 pb-2">
        <h1 className="display-xl">Last 14 days</h1>
      </div>

      <div className="px-5 grid gap-4 max-w-[760px] w-full mx-auto pb-8">
        <article className="card p-5">
          <div className="flex items-baseline justify-between">
            <div>
              <div className="label">Calories / day</div>
              <div className="numeric text-[28px] font-semibold leading-none mt-1">
                {today?.cal != null ? Math.round(today.cal).toLocaleString() : "—"}
              </div>
              <div className="label mt-1 numeric">
                {goals ? `target ${goals.calories.toLocaleString()}` : ""}
              </div>
            </div>
            <Sparkline values={calValues} stroke="var(--accent)" fill="color-mix(in srgb, var(--accent) 18%, transparent)" />
          </div>
        </article>

        <article className="card p-5">
          <div className="flex items-baseline justify-between">
            <div>
              <div className="label">Protein / day</div>
              <div className="numeric text-[28px] font-semibold leading-none mt-1">
                {today?.p != null ? Math.round(today.p) : "—"}
                <span className="text-[var(--muted)] text-[13px] font-normal numeric"> g</span>
              </div>
              <div className="label mt-1 numeric">
                {goals ? `target ${goals.protein_g} g` : ""}
              </div>
            </div>
            <Sparkline values={proteinValues} stroke="var(--info)" fill="color-mix(in srgb, var(--info) 18%, transparent)" />
          </div>
        </article>

        <article className="card p-5">
          <div className="flex items-baseline justify-between">
            <div>
              <div className="label">Weight</div>
              <div className="numeric text-[28px] font-semibold leading-none mt-1">
                {(() => {
                  const last = weightSeries.filter((v): v is number => v != null).at(-1);
                  if (last == null) return "—";
                  return isImperial
                    ? `${kgToLbs(last).toFixed(1)} `
                    : `${last.toFixed(1)} `;
                })()}
                <span className="text-[var(--muted)] text-[13px] font-normal numeric">
                  {isImperial ? "lb" : "kg"}
                </span>
              </div>
            </div>
            <Sparkline values={weightSeries} stroke="var(--fg)" fill="color-mix(in srgb, var(--fg) 8%, transparent)" />
          </div>
        </article>

        <article className="card p-5">
          <div className="label-strong mb-1">Micronutrient gaps</div>
          <div className="text-[13px] text-[var(--fg-dim)]">
            7-day average vs. your daily target. Sorted by biggest gaps first — these
            are where MyFitnessPal lets you down.
          </div>
          <ul className="mt-4 grid gap-3">
            {nutrientGaps.map((g) => (
              <li key={g.key as string}>
                <div className="flex items-baseline justify-between">
                  <div className="text-[13px] font-semibold">{g.label}</div>
                  <div className="numeric text-[12px] text-[var(--fg-dim)]">
                    {Math.round(g.avg)} / {Math.round(g.dailyTarget)} {g.unit}
                  </div>
                </div>
                <div className="mt-1.5 h-[5px] rounded-full bg-[var(--panel-2)] overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.min(100, g.pct * 100)}%`,
                      background:
                        g.pct >= 0.9
                          ? "var(--good)"
                          : g.pct >= 0.5
                            ? "var(--warn)"
                            : "var(--accent)",
                    }}
                  />
                </div>
              </li>
            ))}
            {nutrientGaps.length === 0 ? (
              <li className="text-[12.5px] text-[var(--muted)]">
                Log a few meals to see your micronutrient picture.
              </li>
            ) : null}
          </ul>
        </article>

        <p className="text-[12px] text-[var(--muted)] px-1">
          Phase 2 will add monthly views, full micronutrient time-series, and
          per-nutrient drill-downs.
        </p>
      </div>
    </div>
  );
}
