"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Droplets, Scale, Settings as Cog } from "lucide-react";
import { useMemo, useState } from "react";
import { Logo } from "@/components/Logo";
import { MacroDashboard } from "@/components/MacroDashboard";
import { MealCard } from "@/components/MealCard";
import { MicroPanel } from "@/components/MicroPanel";
import { KeyNutrients } from "@/components/KeyNutrients";
import { NutrientDetailSheet } from "@/components/NutrientDetailSheet";
import { QuickAddStrip } from "@/components/QuickAddStrip";
import { useGoals, useLog, useWater, useWeight, useProfile } from "@/lib/hooks";
import { todayISODate } from "@/lib/dates";
import { scaleNutrients, sumNutrients, type NutrientKey } from "@/lib/nutrients";
import type { Meal } from "@/lib/types";
import { setWater, upsertWeight } from "@/lib/storage";
import { showToast } from "@/components/ToastHost";

const MEALS: Meal[] = ["breakfast", "lunch", "dinner", "snacks"];

export default function TodayPage() {
  const log = useLog();
  const goals = useGoals();
  const profile = useProfile();
  const water = useWater();
  const weights = useWeight();
  const date = todayISODate();

  const todays = useMemo(() => log.filter((e) => e.date === date), [log, date]);
  const totals = useMemo(
    () =>
      sumNutrients(
        todays.map((e) => scaleNutrients(e.snapshot.nutrients, e.servings)),
      ),
    [todays],
  );

  const todayWater = water[date]?.ml ?? 0;
  const waterTarget = goals?.water_ml ?? 2500;
  const lastWeight = weights[weights.length - 1];
  const [detailKey, setDetailKey] = useState<NutrientKey | null>(null);

  const today = new Date();
  const niceDate = today.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="flex-1 flex flex-col">
      <header className="px-5 pt-6 pb-3 safe-top flex items-center justify-between">
        <Logo size={18} />
        <Link
          href="/settings"
          aria-label="Settings"
          className="btn btn-ghost btn-sm !min-h-[36px]"
        >
          <Cog size={16} strokeWidth={2} />
        </Link>
      </header>

      <div className="px-5 pb-2">
        <div className="label">{niceDate}</div>
        <h1 className="display-xl mt-1">Today</h1>
      </div>

      <div className="px-5 pt-3 grid gap-4 max-w-[760px] w-full mx-auto">
        {goals ? (
          <MacroDashboard
            totals={totals}
            goals={goals}
            onSelectNutrient={(k) => setDetailKey(k)}
          />
        ) : null}

        {goals ? (
          <KeyNutrients
            totals={totals}
            goals={goals}
            onSelect={(k) => setDetailKey(k)}
          />
        ) : null}

        {goals ? (
          <MicroPanel totals={totals} goals={goals} onSelect={(k) => setDetailKey(k)} />
        ) : null}

        <QuickAddStrip date={date} />

        <div className="grid grid-cols-2 gap-4">
          <WaterCard
            ml={todayWater}
            target={waterTarget}
            onAdd={(d) => {
              const next = Math.max(0, todayWater + d);
              setWater(date, next);
              if (d > 0) showToast(`+${d} ml water`, "success");
            }}
          />
          <WeightCard
            value={lastWeight?.weightKg}
            units={profile?.units ?? "imperial"}
            onLog={(kg) => {
              upsertWeight({ date, weightKg: kg, createdAt: Date.now() });
              showToast("Weight logged", "success");
            }}
          />
        </div>

        <div className="grid gap-3">
          {MEALS.map((m, i) => (
            <motion.div
              key={m}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.18, delay: i * 0.03 }}
            >
              <MealCard
                meal={m}
                date={date}
                entries={todays.filter((e) => e.meal === m)}
              />
            </motion.div>
          ))}
        </div>
      </div>

      <NutrientDetailSheet
        nutrientKey={detailKey}
        entries={todays}
        goals={goals}
        onClose={() => setDetailKey(null)}
      />
    </div>
  );
}

function WaterCard({
  ml,
  target,
  onAdd,
}: {
  ml: number;
  target: number;
  onAdd: (delta: number) => void;
}) {
  const pct = Math.min(1, target > 0 ? ml / target : 0);
  return (
    <section className="card p-4 flex flex-col">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Droplets size={14} strokeWidth={2} className="text-[var(--info)]" />
          <span className="label">Water</span>
        </div>
        <button
          type="button"
          onClick={() => onAdd(-250)}
          className="btn btn-ghost btn-sm !min-h-[28px] !px-2 text-[12px]"
          aria-label="Remove 250 ml"
        >
          −250
        </button>
      </div>
      <div className="mt-2 numeric text-[24px] font-semibold leading-none">
        {ml.toLocaleString()}
        <span className="text-[var(--muted)] text-[13px] font-normal numeric">
          {" "}
          / {target.toLocaleString()}{" "}
        </span>
        <span className="label">ml</span>
      </div>
      <div className="mt-3 h-[4px] rounded-full bg-[var(--panel-2)] overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-[var(--info)]"
          initial={false}
          animate={{ width: `${pct * 100}%` }}
          transition={{ type: "spring", stiffness: 220, damping: 30 }}
        />
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {[250, 500, 750].map((delta) => (
          <button
            key={delta}
            type="button"
            onClick={() => onAdd(delta)}
            className="btn btn-sm !min-h-[34px] !px-1 text-[12px]"
          >
            +{delta}
          </button>
        ))}
      </div>
    </section>
  );
}

function WeightCard({
  value,
  units,
  onLog,
}: {
  value: number | undefined;
  units: "imperial" | "metric";
  onLog: (kg: number) => void;
}) {
  const isImperial = units === "imperial";
  const display = value
    ? isImperial
      ? `${(value * 2.20462).toFixed(1)} lb`
      : `${value.toFixed(1)} kg`
    : "—";
  return (
    <section className="card p-4 flex flex-col">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Scale size={14} strokeWidth={2} className="text-[var(--accent)]" />
          <span className="label">Weight</span>
        </div>
        <button
          type="button"
          onClick={() => {
            const v = window.prompt(`Enter weight (${isImperial ? "lb" : "kg"})`);
            if (!v) return;
            const num = Number(v);
            if (!Number.isFinite(num) || num <= 0) return;
            const kg = isImperial ? num / 2.20462 : num;
            onLog(kg);
          }}
          className="btn btn-ghost btn-sm !min-h-[28px] !px-2 text-[12px]"
        >
          Log
        </button>
      </div>
      <div className="mt-2 numeric text-[24px] font-semibold leading-none">
        {display}
      </div>
      <div className="mt-3 text-[12px] text-[var(--muted)]">
        Tap log to record today&apos;s weight.
      </div>
    </section>
  );
}
