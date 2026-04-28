import type { Nutrients } from "./types";

export type NutrientKey = keyof Nutrients;
export type NutrientGroup = "macro" | "macroDetail" | "minerals" | "vitamins";

export type NutrientUnit = "g" | "mg" | "mcg" | "kcal";

export interface NutrientMeta {
  key: NutrientKey;
  label: string;
  unit: NutrientUnit;
  group: NutrientGroup;
  /**
   * Direction the user wants to push the value:
   *   "up"   = hit at least the target (e.g. fiber, vitamins)
   *   "down" = stay at or below the target (e.g. sodium, sat fat, added sugar)
   *   "band" = stay within ±15% of target (e.g. protein/carbs/fat split)
   */
  goalDirection?: "up" | "down" | "band";
  /** Surface on the Today "Key nutrients" strip. */
  watch?: boolean;
}

export const NUTRIENT_META: NutrientMeta[] = [
  // Macros
  { key: "calories", label: "Calories", unit: "kcal", group: "macro", goalDirection: "band" },
  { key: "protein_g", label: "Protein", unit: "g", group: "macro", goalDirection: "up" },
  { key: "carbs_g", label: "Carbs", unit: "g", group: "macro", goalDirection: "band" },
  { key: "fat_g", label: "Fat", unit: "g", group: "macro", goalDirection: "band" },

  // Macro detail (the watch-list)
  { key: "fiber_g", label: "Fiber", unit: "g", group: "macroDetail", goalDirection: "up", watch: true },
  { key: "sat_fat_g", label: "Saturated fat", unit: "g", group: "macroDetail", goalDirection: "down", watch: true },
  { key: "sodium_mg", label: "Sodium", unit: "mg", group: "macroDetail", goalDirection: "down", watch: true },
  { key: "added_sugar_g", label: "Added sugar", unit: "g", group: "macroDetail", goalDirection: "down", watch: true },
  { key: "sugar_g", label: "Sugar (total)", unit: "g", group: "macroDetail" },
  { key: "trans_fat_g", label: "Trans fat", unit: "g", group: "macroDetail", goalDirection: "down" },
  { key: "cholesterol_mg", label: "Cholesterol", unit: "mg", group: "macroDetail", goalDirection: "down" },
  { key: "omega3_g", label: "Omega-3", unit: "g", group: "macroDetail", goalDirection: "up" },
  { key: "omega6_g", label: "Omega-6", unit: "g", group: "macroDetail" },

  // Minerals (sodium intentionally promoted to macroDetail above)
  { key: "potassium_mg", label: "Potassium", unit: "mg", group: "minerals", goalDirection: "up" },
  { key: "calcium_mg", label: "Calcium", unit: "mg", group: "minerals", goalDirection: "up" },
  { key: "iron_mg", label: "Iron", unit: "mg", group: "minerals", goalDirection: "up" },
  { key: "magnesium_mg", label: "Magnesium", unit: "mg", group: "minerals", goalDirection: "up" },
  { key: "zinc_mg", label: "Zinc", unit: "mg", group: "minerals", goalDirection: "up" },
  { key: "selenium_mcg", label: "Selenium", unit: "mcg", group: "minerals", goalDirection: "up" },
  { key: "copper_mg", label: "Copper", unit: "mg", group: "minerals", goalDirection: "up" },
  { key: "manganese_mg", label: "Manganese", unit: "mg", group: "minerals", goalDirection: "up" },
  { key: "phosphorus_mg", label: "Phosphorus", unit: "mg", group: "minerals", goalDirection: "up" },

  // Vitamins
  { key: "vit_a_mcg", label: "Vitamin A", unit: "mcg", group: "vitamins", goalDirection: "up" },
  { key: "vit_c_mg", label: "Vitamin C", unit: "mg", group: "vitamins", goalDirection: "up" },
  { key: "vit_d_mcg", label: "Vitamin D", unit: "mcg", group: "vitamins", goalDirection: "up" },
  { key: "vit_e_mg", label: "Vitamin E", unit: "mg", group: "vitamins", goalDirection: "up" },
  { key: "vit_k_mcg", label: "Vitamin K", unit: "mcg", group: "vitamins", goalDirection: "up" },
  { key: "vit_b1_mg", label: "Vitamin B1 (Thiamin)", unit: "mg", group: "vitamins", goalDirection: "up" },
  { key: "vit_b2_mg", label: "Vitamin B2 (Riboflavin)", unit: "mg", group: "vitamins", goalDirection: "up" },
  { key: "vit_b3_mg", label: "Vitamin B3 (Niacin)", unit: "mg", group: "vitamins", goalDirection: "up" },
  { key: "vit_b5_mg", label: "Vitamin B5", unit: "mg", group: "vitamins", goalDirection: "up" },
  { key: "vit_b6_mg", label: "Vitamin B6", unit: "mg", group: "vitamins", goalDirection: "up" },
  { key: "vit_b7_mcg", label: "Vitamin B7 (Biotin)", unit: "mcg", group: "vitamins", goalDirection: "up" },
  { key: "vit_b9_mcg", label: "Vitamin B9 (Folate)", unit: "mcg", group: "vitamins", goalDirection: "up" },
  { key: "vit_b12_mcg", label: "Vitamin B12", unit: "mcg", group: "vitamins", goalDirection: "up" },
];

export const NUTRIENT_META_MAP: Record<string, NutrientMeta> = Object.fromEntries(
  NUTRIENT_META.map((m) => [m.key, m]),
);

export const WATCH_NUTRIENTS: NutrientMeta[] = NUTRIENT_META.filter((m) => m.watch);

export function getMeta(key: NutrientKey | string): NutrientMeta | undefined {
  return NUTRIENT_META_MAP[key as string];
}

export function nutrientValue(n: Nutrients | null | undefined, key: NutrientKey): number | null {
  if (!n) return null;
  const v = (n as unknown as Record<string, number | null | undefined>)[key as string];
  return v == null ? null : v;
}

export function emptyNutrients(): Nutrients {
  return { calories: null, protein_g: null, carbs_g: null, fat_g: null };
}

/** Multiply nutrients by `factor` (servings). null stays null. */
export function scaleNutrients(n: Nutrients, factor: number): Nutrients {
  const out: Nutrients = {
    calories: null,
    protein_g: null,
    carbs_g: null,
    fat_g: null,
  };
  for (const meta of NUTRIENT_META) {
    const v = n[meta.key as NutrientKey] as number | null | undefined;
    if (v == null) {
      out[meta.key as NutrientKey] = v ?? null;
    } else {
      const scaled = v * factor;
      out[meta.key as NutrientKey] =
        meta.unit === "g" ? Math.round(scaled * 10) / 10 : Math.round(scaled * 100) / 100;
    }
  }
  return out;
}

/** Sum nutrient panels. null treated as 0. Result fields default to 0 (never null). */
export function sumNutrients(list: Array<Nutrients | null | undefined>): Nutrients {
  const out: Nutrients = {
    calories: 0,
    protein_g: 0,
    carbs_g: 0,
    fat_g: 0,
  };
  for (const meta of NUTRIENT_META) {
    let total = 0;
    let any = false;
    for (const n of list) {
      if (!n) continue;
      const v = n[meta.key as NutrientKey] as number | null | undefined;
      if (v == null) continue;
      total += v;
      any = true;
    }
    out[meta.key as NutrientKey] = any
      ? meta.unit === "g"
        ? Math.round(total * 10) / 10
        : Math.round(total * 100) / 100
      : null;
  }
  return out;
}

export function formatNutrient(value: number | null | undefined, unit: NutrientUnit): string {
  if (value == null) return "—";
  if (unit === "kcal") return Math.round(value).toLocaleString();
  if (unit === "g") {
    if (value < 10) return value.toFixed(1) + " g";
    return Math.round(value) + " g";
  }
  if (unit === "mg") return Math.round(value) + " mg";
  if (unit === "mcg") return Math.round(value) + " µg";
  return String(value);
}

/**
 * Return progress 0..n against a target, accounting for whether you want it
 * up (hit) or down (stay under). For "down" goals, returning 1.0 means the
 * user has consumed the entire allowance — overshoot above 1.0 is bad.
 */
export function nutrientProgress(value: number | null, target: number | undefined): number {
  if (!target || target <= 0) return 0;
  return Math.max(0, (value ?? 0) / target);
}

/** "good" | "warn" | "bad" given current value and meta-driven direction. */
export function nutrientStatus(
  value: number | null,
  target: number | undefined,
  direction: NutrientMeta["goalDirection"],
): "good" | "warn" | "bad" | "neutral" {
  if (!target || target <= 0) return "neutral";
  const pct = (value ?? 0) / target;
  if (direction === "down") {
    if (pct <= 0.85) return "good";
    if (pct <= 1.0) return "warn";
    return "bad";
  }
  if (direction === "up") {
    if (pct >= 0.9) return "good";
    if (pct >= 0.5) return "warn";
    return "bad";
  }
  // band: ±15% of target
  if (pct >= 0.85 && pct <= 1.15) return "good";
  if (pct >= 0.7 && pct <= 1.3) return "warn";
  return "bad";
}

export function statusColor(status: ReturnType<typeof nutrientStatus>): string {
  switch (status) {
    case "good":
      return "var(--good)";
    case "warn":
      return "var(--warn)";
    case "bad":
      return "var(--accent)";
    default:
      return "var(--muted)";
  }
}
