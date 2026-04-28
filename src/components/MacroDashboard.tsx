"use client";

import { motion } from "framer-motion";
import type { NutrientKey } from "@/lib/nutrients";
import type { Goals, Nutrients } from "@/lib/types";

export function MacroDashboard({
  totals,
  goals,
  onSelectNutrient,
}: {
  totals: Nutrients;
  goals: Goals;
  onSelectNutrient?: (key: NutrientKey) => void;
}) {
  const eaten = Math.round(totals.calories ?? 0);
  const target = goals.calories;
  const remaining = Math.max(0, target - eaten);
  const over = eaten > target;
  const pct = target > 0 ? eaten / target : 0;

  return (
    <section className="card p-5">
      <div className="grid grid-cols-[1fr_auto] items-end gap-3">
        <div>
          <div className="label">Calories</div>
          <div className="mt-1 flex items-baseline gap-2">
            <div className="numeric font-semibold leading-none" style={{ fontSize: "clamp(2.5rem, 11vw, 3.5rem)" }}>
              {eaten.toLocaleString()}
            </div>
            <div className="numeric text-[var(--muted)] text-[15px]">
              / {target.toLocaleString()}
            </div>
          </div>
        </div>
        <CalorieRing pct={pct} over={over} />
      </div>

      <div className="mt-3 text-[13px] text-[var(--fg-dim)]">
        {over ? (
          <span className="text-[var(--accent)] font-semibold">
            {Math.round(eaten - target).toLocaleString()} over target
          </span>
        ) : (
          <>
            <span className="text-[var(--fg)] font-semibold numeric">
              {remaining.toLocaleString()}
            </span>{" "}
            kcal remaining
          </>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3 mt-5">
        <MacroBar
          label="Protein"
          color="var(--accent)"
          value={totals.protein_g ?? 0}
          target={goals.protein_g}
          unit="g"
          onClick={onSelectNutrient ? () => onSelectNutrient("protein_g") : undefined}
        />
        <MacroBar
          label="Carbs"
          color="var(--info)"
          value={totals.carbs_g ?? 0}
          target={goals.carbs_g}
          unit="g"
          onClick={onSelectNutrient ? () => onSelectNutrient("carbs_g") : undefined}
        />
        <MacroBar
          label="Fat"
          color="var(--accent-soft)"
          value={totals.fat_g ?? 0}
          target={goals.fat_g}
          unit="g"
          onClick={onSelectNutrient ? () => onSelectNutrient("fat_g") : undefined}
        />
      </div>
    </section>
  );
}

function MacroBar({
  label,
  color,
  value,
  target,
  unit,
  onClick,
}: {
  label: string;
  color: string;
  value: number;
  target: number;
  unit: string;
  onClick?: () => void;
}) {
  const pct = Math.min(1, target > 0 ? value / target : 0);
  const Inner = (
    <>
      <div className="flex items-baseline justify-between gap-1">
        <div className="flex items-center gap-1.5">
          <span className="inline-block w-2 h-2 rounded-full" style={{ background: color }} />
          <span className="label">{label}</span>
        </div>
      </div>
      <div className="mt-1 numeric text-[16px] font-semibold leading-none">
        {Math.round(value)}
        <span className="text-[var(--muted)] text-[12px] font-normal numeric">
          {" "}
          / {target}
          {unit}
        </span>
      </div>
      <div className="mt-2 h-[4px] rounded-full bg-[var(--panel-2)] overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          initial={false}
          animate={{ width: `${pct * 100}%` }}
          transition={{ type: "spring", stiffness: 220, damping: 30 }}
        />
      </div>
    </>
  );
  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-label={`${label} detail`}
        className="text-left rounded-[6px] -m-1 p-1 active:bg-[var(--panel-2)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
      >
        {Inner}
      </button>
    );
  }
  return <div>{Inner}</div>;
}

function CalorieRing({ pct, over }: { pct: number; over: boolean }) {
  const size = 76;
  const stroke = 6;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;

  // Primary ring: progress to 100% of target (clamped).
  const primaryPct = Math.min(1, pct);
  const primaryDash = c - c * primaryPct;

  // Overshoot ring: anything past 100%, drawn on top in accent.
  const overPct = over ? Math.min(1, pct - 1) : 0;
  const overDash = c - c * overPct;

  const labelPct = pct;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        stroke="var(--panel-2)"
        strokeWidth={stroke}
        fill="none"
      />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        stroke={over ? "var(--info)" : "var(--accent)"}
        strokeWidth={stroke}
        fill="none"
        strokeLinecap="round"
        strokeDasharray={c}
        initial={false}
        animate={{ strokeDashoffset: primaryDash }}
        transition={{ type: "spring", stiffness: 80, damping: 20 }}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      {over ? (
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="var(--accent)"
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          initial={false}
          animate={{ strokeDashoffset: overDash }}
          transition={{ type: "spring", stiffness: 80, damping: 20 }}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      ) : null}
      <text
        x="50%"
        y="50%"
        dominantBaseline="central"
        textAnchor="middle"
        className="numeric"
        style={{
          fontSize: 12,
          fill: over ? "var(--accent)" : "var(--fg)",
          fontWeight: 600,
        }}
      >
        {Math.round(labelPct * 100)}%
      </text>
    </svg>
  );
}
