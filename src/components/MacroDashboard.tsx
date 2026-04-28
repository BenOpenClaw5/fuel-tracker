"use client";

import { motion } from "framer-motion";
import type { Goals, Nutrients } from "@/lib/types";

export function MacroDashboard({
  totals,
  goals,
}: {
  totals: Nutrients;
  goals: Goals;
}) {
  const eaten = Math.round(totals.calories ?? 0);
  const target = goals.calories;
  const remaining = Math.max(0, target - eaten);
  const over = eaten > target;
  const pct = Math.min(1, target > 0 ? eaten / target : 0);

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
        />
        <MacroBar
          label="Carbs"
          color="var(--info)"
          value={totals.carbs_g ?? 0}
          target={goals.carbs_g}
          unit="g"
        />
        <MacroBar
          label="Fat"
          color="var(--accent-soft)"
          value={totals.fat_g ?? 0}
          target={goals.fat_g}
          unit="g"
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
}: {
  label: string;
  color: string;
  value: number;
  target: number;
  unit: string;
}) {
  const pct = Math.min(1, target > 0 ? value / target : 0);
  return (
    <div>
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
    </div>
  );
}

function CalorieRing({ pct, over }: { pct: number; over: boolean }) {
  const size = 76;
  const stroke = 6;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const dash = c - c * pct;
  const color = over ? "var(--accent)" : "var(--accent)";

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
        stroke={color}
        strokeWidth={stroke}
        fill="none"
        strokeLinecap="round"
        strokeDasharray={c}
        initial={false}
        animate={{ strokeDashoffset: dash }}
        transition={{ type: "spring", stiffness: 80, damping: 20 }}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text
        x="50%"
        y="50%"
        dominantBaseline="central"
        textAnchor="middle"
        className="numeric"
        style={{ fontSize: 12, fill: "var(--fg)", fontWeight: 600 }}
      >
        {Math.round(pct * 100)}%
      </text>
    </svg>
  );
}
