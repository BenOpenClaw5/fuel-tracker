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

/**
 * Merge food.servingOptions with the always-on grams/oz options at the bottom,
 * de-duped by label.
 */
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
  const [servings, setServings] = useState(1);
  const [activeMeal, setActiveMeal] = useState<Meal>(meal);

  const selected = options[optionIndex];

  /**
   * Factor against the food's canonical serving size. If selected serving is
   * 113 g and canonical is 100 g, factor is 1.13 per "1 serving" the user
   * declares.
   */
  const factor = (selected.grams / food.servingSizeG) * servings;
  const scaled = scaleNutrients(food.nutrients, factor);

  const submit = () => {
    upsertFood(food);
    // Snapshot uses the chosen serving as the "1 unit", so the log row reads
    // naturally (e.g. "2× 4 oz (113 g)") rather than carrying the food's
    // canonical serving.
    const perChoice: Nutrients = scaleNutrients(food.nutrients, selected.grams / food.servingSizeG);
    addLogEntry({
      id: newId("log"),
      date,
      meal: activeMeal,
      foodId: food.id,
      servings,
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
        <div className="px-5 pt-3 pb-2 grid grid-cols-[1fr_auto] items-start gap-2">
          <div className="min-w-0">
            <div className="display-md truncate">{food.name}</div>
            <div className="label mt-1">
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
            className="grid grid-cols-4 p-1 bg-[var(--panel-2)] rounded-[var(--radius)] border border-[var(--border)] gap-1"
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
                  "h-9 rounded-[6px] text-[12px] font-semibold transition-colors " +
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
            onChange={(e) => setOptionIndex(Number(e.target.value))}
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
          <div className="label mb-2">Servings</div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() =>
                setServings((v) => Math.max(0.25, Math.round((v - 0.5) * 4) / 4))
              }
              className="btn !w-12 !h-12 !min-h-[48px] !px-0"
              aria-label="Decrease servings"
            >
              <Minus size={16} />
            </button>
            <input
              type="number"
              min={0.25}
              step={0.25}
              value={servings}
              onChange={(e) =>
                setServings(Math.max(0.25, Number(e.target.value) || 0.25))
              }
              className="numeric text-center !text-[18px] !font-semibold flex-1"
              aria-label="Servings"
            />
            <button
              type="button"
              onClick={() => setServings((v) => Math.round((v + 0.5) * 4) / 4)}
              className="btn !w-12 !h-12 !min-h-[48px] !px-0"
              aria-label="Increase servings"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>

        <div className="px-5 mt-3">
          <div className="text-[12px] text-[var(--muted)]">
            Total:{" "}
            <span className="numeric text-[var(--fg)] font-semibold">
              {(selected.grams * servings).toFixed(servings * selected.grams < 10 ? 1 : 0)} g
            </span>
          </div>
        </div>

        <div className="px-5 mt-4 mb-2">
          <div className="grid grid-cols-4 gap-3">
            <Quad label="Calories" value={scaled.calories} unit="" />
            <Quad label="Protein" value={scaled.protein_g} unit="g" color="var(--accent)" />
            <Quad label="Carbs" value={scaled.carbs_g} unit="g" color="var(--info)" />
            <Quad label="Fat" value={scaled.fat_g} unit="g" color="var(--accent-soft)" />
          </div>
        </div>

        <div
          className="px-5 pt-3 pb-5 border-t border-[var(--border)] mt-2 grid grid-cols-2 gap-3"
          style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 14px)" }}
        >
          <button type="button" onClick={onClose} className="btn">
            Cancel
          </button>
          <button type="button" onClick={submit} className="btn btn-primary btn-lg">
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
    <div>
      <div className="flex items-center gap-1">
        {color ? (
          <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ background: color }} />
        ) : null}
        <div className="label">{label}</div>
      </div>
      <div className="mt-0.5 numeric text-[16px] font-semibold leading-none">
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
