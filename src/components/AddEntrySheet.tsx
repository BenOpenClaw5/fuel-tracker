"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Minus, Plus, X } from "lucide-react";
import { useMemo, useState } from "react";
import { addLogEntry, upsertFood } from "@/lib/storage";
import type { Food, Meal, Nutrients, ServingOption } from "@/lib/types";
import { newId } from "@/lib/dates";
import { showToast } from "./ToastHost";
import { scaleNutrients } from "@/lib/nutrients";

const MEAL_LABEL: Record<Meal, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
  snacks: "Snacks",
};

const ALWAYS_AVAILABLE_OPTIONS: ServingOption[] = [
  { label: "1 g", grams: 1 },
  { label: "1 oz (28.35 g)", grams: 28.3495 },
];

function buildOptions(food: Food): ServingOption[] {
  const seen = new Set<string>();
  const out: ServingOption[] = [];
  for (const o of [
    ...(food.servingOptions ?? [{ label: food.servingLabel, grams: food.servingSizeG }]),
    ...ALWAYS_AVAILABLE_OPTIONS,
  ]) {
    const k = o.label.toLowerCase();
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(o);
  }
  return out;
}

/**
 * +/− increment depends on the chosen unit. For raw grams, +1g is too fine —
 * step by 10. For ounces, +1. Otherwise default to 1.
 */
function stepFor(option: ServingOption): number {
  const label = option.label.toLowerCase();
  if (/^1 g\b/.test(label)) return 10;
  return 1;
}

function fmtAmount(n: number): string {
  if (!Number.isFinite(n) || n <= 0) return "";
  return parseFloat(n.toFixed(2)).toString();
}

export function AddEntrySheet({
  food,
  meal,
  date,
  onClose,
  onLogged,
}: {
  food: Food;
  meal: Meal;
  date: string;
  onClose: () => void;
  onLogged: () => void;
}) {
  const options = useMemo(() => buildOptions(food), [food]);
  const [optionIndex, setOptionIndex] = useState(0);
  /**
   * Input is kept as a string while the user types — we never snap a
   * partially-typed value (the prior `0.25` clamp bug). The numeric
   * `amount` is derived on read and only validated on submit/blur.
   */
  const [amountStr, setAmountStr] = useState("1");
  const [activeMeal, setActiveMeal] = useState<Meal>(meal);

  const selected = options[optionIndex];
  const amount = Math.max(0, parseFloat(amountStr) || 0);
  const step = stepFor(selected);
  const totalGrams = selected.grams * amount;
  const factor = totalGrams / food.servingSizeG;
  const scaled = scaleNutrients(food.nutrients, factor);
  const canSubmit = amount > 0;

  const switchOption = (newIndex: number) => {
    setOptionIndex(newIndex);
    setAmountStr("1");
  };

  const bumpAmount = (delta: number) => {
    const next = Math.max(0, amount + delta);
    setAmountStr(fmtAmount(next));
  };

  const onAmountChange = (raw: string) => {
    if (raw === "" || /^[0-9]*\.?[0-9]*$/.test(raw)) {
      setAmountStr(raw);
    }
  };

  const onAmountBlur = () => {
    if (amountStr === "" || amount === 0) setAmountStr("1");
  };

  const submit = () => {
    if (!canSubmit) {
      showToast("Enter an amount", "error");
      return;
    }
    upsertFood(food);
    const perChoice: Nutrients = scaleNutrients(
      food.nutrients,
      selected.grams / food.servingSizeG,
    );
    addLogEntry({
      id: newId("log"),
      date,
      meal: activeMeal,
      foodId: food.id,
      servings: amount,
      snapshot: {
        name: food.name,
        brand: food.brand,
        servingLabel: selected.label,
        nutrients: perChoice,
      },
      createdAt: Date.now(),
    });
    showToast("Logged", "success");
    onLogged();
  };

  const totalDisplay =
    totalGrams >= 100
      ? `${Math.round(totalGrams)} g`
      : `${totalGrams.toFixed(1)} g`;

  return (
    <>
      <motion.div
        className="sheet-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.div
        className="sheet"
        initial={{ y: 360 }}
        animate={{ y: 0 }}
        exit={{ y: 380 }}
        transition={{ type: "spring", stiffness: 340, damping: 34 }}
      >
        <span className="sheet-handle" aria-hidden />
        <div className="px-5 pt-3 pb-2 grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
          <div className="min-w-0">
            <div className="display-md truncate">{food.name}</div>
            <div className="label mt-1 truncate">
              {food.brand ? `${food.brand} · ` : ""}
              <span className="numeric">{selected.label}</span>
            </div>
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

        <div className="px-5 mt-3">
          <div className="label mb-2">Meal</div>
          <div
            className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)] p-1 bg-[var(--panel-2)] rounded-[var(--radius)] border border-[var(--border)] gap-1"
            role="radiogroup"
            aria-label="Meal"
          >
            {(Object.keys(MEAL_LABEL) as Meal[]).map((m) => (
              <button
                key={m}
                type="button"
                role="radio"
                aria-checked={activeMeal === m}
                onClick={() => setActiveMeal(m)}
                className={
                  "h-9 rounded-[6px] text-[12px] font-semibold transition-colors truncate min-w-0 " +
                  (activeMeal === m
                    ? "bg-[var(--panel)] shadow-[var(--shadow-sm)] text-[var(--fg)]"
                    : "text-[var(--fg-dim)]")
                }
              >
                {MEAL_LABEL[m]}
              </button>
            ))}
          </div>
        </div>

        <div className="px-5 mt-4">
          <div className="label mb-2">Serving size</div>
          <select
            value={optionIndex}
            onChange={(e) => switchOption(Number(e.target.value))}
            aria-label="Serving size"
            className="w-full"
          >
            {options.map((o, i) => (
              <option key={`${o.label}_${i}`} value={i}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <div className="px-5 mt-4">
          <div className="label mb-2">Amount</div>
          <div className="flex items-stretch gap-2">
            <button
              type="button"
              onClick={() => bumpAmount(-step)}
              className="btn !w-12 !h-12 !min-h-[48px] !px-0 shrink-0"
              aria-label={`Decrease by ${step}`}
              disabled={amount <= 0}
            >
              <Minus size={16} />
            </button>
            <input
              type="text"
              inputMode="decimal"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              value={amountStr}
              onChange={(e) => onAmountChange(e.target.value)}
              onBlur={onAmountBlur}
              onFocus={(e) => e.target.select()}
              className="numeric text-center !text-[20px] !font-semibold flex-1 min-w-0"
              aria-label="Amount"
              placeholder="0"
            />
            <button
              type="button"
              onClick={() => bumpAmount(step)}
              className="btn !w-12 !h-12 !min-h-[48px] !px-0 shrink-0"
              aria-label={`Increase by ${step}`}
            >
              <Plus size={16} />
            </button>
          </div>
          <div className="mt-2 text-[12px] text-[var(--muted)] numeric truncate">
            {canSubmit ? (
              <>
                Total{" "}
                <span className="text-[var(--fg)] font-semibold">
                  {totalDisplay}
                </span>
              </>
            ) : (
              <>Enter an amount</>
            )}
          </div>
        </div>

        <div className="px-5 mt-4 mb-2">
          <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)] gap-3">
            <Quad label="Calories" value={scaled.calories} unit="" />
            <Quad label="Protein" value={scaled.protein_g} unit="g" color="var(--accent)" />
            <Quad label="Carbs" value={scaled.carbs_g} unit="g" color="var(--info)" />
            <Quad label="Fat" value={scaled.fat_g} unit="g" color="var(--accent-soft)" />
          </div>
        </div>

        <div
          className="px-5 pt-3 pb-5 border-t border-[var(--border)] mt-2 grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-3"
          style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 14px)" }}
        >
          <button type="button" onClick={onClose} className="btn">
            Cancel
          </button>
          <button
            type="button"
            onClick={submit}
            className="btn btn-primary btn-lg"
            disabled={!canSubmit}
          >
            Add to {MEAL_LABEL[activeMeal]}
          </button>
        </div>
      </motion.div>
    </>
  );
}

function Quad({
  label,
  value,
  unit,
  color,
}: {
  label: string;
  value: number | null;
  unit: string;
  color?: string;
}) {
  return (
    <div className="min-w-0">
      <div className="flex items-center gap-1 min-w-0">
        {color ? (
          <span className="inline-block w-1.5 h-1.5 rounded-full shrink-0" style={{ background: color }} />
        ) : null}
        <div className="label truncate">{label}</div>
      </div>
      <div className="mt-0.5 numeric text-[16px] font-semibold leading-none truncate">
        {value == null ? "—" : Math.round(value)}
        {unit && value != null ? (
          <span className="text-[var(--muted)] text-[11px] font-normal">{unit}</span>
        ) : null}
      </div>
    </div>
  );
}

export function ServingSheetAnim({
  food,
  meal,
  date,
  onClose,
  onLogged,
}: {
  food: Food | null;
  meal: Meal;
  date: string;
  onClose: () => void;
  onLogged: () => void;
}) {
  return (
    <AnimatePresence>
      {food ? (
        <AddEntrySheet
          food={food}
          meal={meal}
          date={date}
          onClose={onClose}
          onLogged={onLogged}
        />
      ) : null}
    </AnimatePresence>
  );
}
