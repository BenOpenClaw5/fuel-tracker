"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Logo } from "@/components/Logo";
import { useGoals, useLog } from "@/lib/hooks";
import { formatLogDate, fromIsoDate, shiftDays, todayISODate, toIsoDate } from "@/lib/dates";
import { scaleNutrients, sumNutrients } from "@/lib/nutrients";
import type { LogEntry, Meal } from "@/lib/types";

const MEAL_LABEL: Record<Meal, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
  snacks: "Snacks",
};

export default function LogPage() {
  const log = useLog();
  const goals = useGoals();
  const [date, setDate] = useState<string>(todayISODate());
  const [pageEpoch] = useState(() => Date.now());

  const entries = useMemo(() => log.filter((e) => e.date === date), [log, date]);
  const totals = useMemo(
    () =>
      sumNutrients(
        entries.map((e) => scaleNutrients(e.snapshot.nutrients, e.servings)),
      ),
    [entries],
  );

  // 14-day strip with hits
  const strip = useMemo<
    Array<{ iso: string; label: string; hasEntry: boolean; cal: number }>
  >(() => {
    const days: Array<{ iso: string; label: string; hasEntry: boolean; cal: number }> = [];
    const now = pageEpoch;
    for (let i = 13; i >= 0; i--) {
      const iso = toIsoDate(new Date(now - i * 86400000));
      const dayEntries = log.filter((e) => e.date === iso);
      const cal = dayEntries.reduce(
        (sum, e) => sum + (e.snapshot.nutrients.calories ?? 0) * e.servings,
        0,
      );
      days.push({
        iso,
        label: fromIsoDate(iso).toLocaleDateString("en-US", { weekday: "short" }).slice(0, 1),
        hasEntry: dayEntries.length > 0,
        cal,
      });
    }
    return days;
  }, [log, pageEpoch]);

  const grouped: Record<Meal, LogEntry[]> = {
    breakfast: [],
    lunch: [],
    dinner: [],
    snacks: [],
  };
  for (const e of entries) grouped[e.meal].push(e);

  return (
    <div className="flex-1 flex flex-col">
      <header className="px-5 pt-6 pb-3 safe-top flex items-center justify-between">
        <Logo size={18} />
        <div className="label">Log</div>
      </header>

      <section className="px-5 pb-3">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setDate((d) => shiftDays(d, -1))}
            className="btn btn-ghost btn-sm !min-h-[36px] !px-2"
            aria-label="Previous day"
          >
            <ChevronLeft size={16} />
          </button>
          <div className="text-center">
            <div className="display-lg leading-none">{formatLogDate(date)}</div>
            <div className="label mt-1 numeric">{date.replaceAll("-", ".")}</div>
          </div>
          <button
            type="button"
            onClick={() => setDate((d) => shiftDays(d, 1))}
            className="btn btn-ghost btn-sm !min-h-[36px] !px-2"
            aria-label="Next day"
            disabled={date >= todayISODate()}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </section>

      <section className="px-3 pb-3">
        <div className="grid grid-cols-14 gap-1" style={{ gridTemplateColumns: "repeat(14, minmax(0, 1fr))" }}>
          {strip.map((d) => {
            const active = d.iso === date;
            const ratio = goals?.calories ? Math.min(1.2, d.cal / goals.calories) : 0;
            return (
              <button
                key={d.iso}
                type="button"
                onClick={() => setDate(d.iso)}
                className={
                  "rounded-md p-1.5 flex flex-col items-center gap-1 border " +
                  (active
                    ? "bg-[var(--fg)] text-[var(--bg)] border-[var(--fg)]"
                    : d.hasEntry
                      ? "border-[var(--border)] bg-[var(--panel)]"
                      : "border-transparent")
                }
              >
                <div className="text-[9px] font-semibold opacity-80">{d.label}</div>
                <div className="numeric text-[10px] font-semibold leading-none">
                  {d.cal > 0 ? Math.round(d.cal) : "·"}
                </div>
                <div
                  className="w-full h-[3px] rounded-sm"
                  style={{
                    background: active ? "rgba(255,255,255,0.4)" : "var(--panel-2)",
                  }}
                >
                  <div
                    className="h-full rounded-sm"
                    style={{
                      width: `${Math.min(100, ratio * 100)}%`,
                      background: active ? "var(--bg)" : "var(--accent)",
                    }}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <section className="px-5 pb-2">
        <div className="card p-4">
          <div className="grid grid-cols-4 gap-3">
            <Stat label="Calories" value={Math.round(totals.calories ?? 0)} />
            <Stat label="Protein" value={Math.round(totals.protein_g ?? 0)} suffix="g" />
            <Stat label="Carbs" value={Math.round(totals.carbs_g ?? 0)} suffix="g" />
            <Stat label="Fat" value={Math.round(totals.fat_g ?? 0)} suffix="g" />
          </div>
        </div>
      </section>

      <section className="px-5 pt-3 grid gap-3 max-w-[760px] w-full mx-auto pb-8">
        {(Object.keys(grouped) as Meal[]).map((meal) => (
          <article key={meal} className="card overflow-hidden">
            <header className="px-4 pt-3 pb-2 flex items-center justify-between">
              <div className="display-md">{MEAL_LABEL[meal]}</div>
              <Link
                href={`/add?meal=${meal}&date=${date}`}
                className="text-[12.5px] font-semibold text-[var(--accent)]"
              >
                + Add
              </Link>
            </header>
            {grouped[meal].length === 0 ? (
              <div className="border-t border-[var(--border)] px-4 py-3 text-[12.5px] text-[var(--muted)]">
                No entries.
              </div>
            ) : (
              <ul className="border-t border-[var(--border)]">
                {grouped[meal].map((entry) => {
                  const cal = (entry.snapshot.nutrients.calories ?? 0) * entry.servings;
                  return (
                    <li
                      key={entry.id}
                      className="px-4 py-2.5 border-b last:border-b-0 border-[var(--border)] grid grid-cols-[1fr_auto] items-center gap-3"
                    >
                      <div className="min-w-0">
                        <div className="text-[14px] font-medium truncate">
                          {entry.snapshot.name}
                        </div>
                        <div className="text-[11.5px] text-[var(--muted)] truncate">
                          <span className="numeric">{entry.servings}× {entry.snapshot.servingLabel}</span>
                        </div>
                      </div>
                      <div className="numeric text-[14px] font-semibold">
                        {Math.round(cal)} <span className="text-[10px] text-[var(--muted)] font-normal">kcal</span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </article>
        ))}
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  suffix,
}: {
  label: string;
  value: number;
  suffix?: string;
}) {
  return (
    <div>
      <div className="label">{label}</div>
      <div className="mt-1 numeric text-[18px] font-semibold leading-none">
        {value.toLocaleString()}
        {suffix ? <span className="text-[10px] text-[var(--muted)] font-normal numeric"> {suffix}</span> : null}
      </div>
    </div>
  );
}
