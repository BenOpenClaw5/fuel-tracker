import type { Nutrients } from "./types";

export type NutrientKey = keyof Nutrients;

export interface NutrientMeta {
  key: NutrientKey;
  label: string;
  unit: "g" | "mg" | "mcg" | "kcal";
  group: "macro" | "minerals" | "vitamins" | "fats";
}

export const NUTRIENT_META: NutrientMeta[] = [
  { key: "calories", label: "Calories", unit: "kcal", group: "macro" },
  { key: "protein_g", label: "Protein", unit: "g", group: "macro" },
  { key: "carbs_g", label: "Carbs", unit: "g", group: "macro" },
  { key: "fat_g", label: "Fat", unit: "g", group: "macro" },
  { key: "fiber_g", label: "Fiber", unit: "g", group: "macro" },
  { key: "sugar_g", label: "Sugar", unit: "g", group: "macro" },
  { key: "added_sugar_g", label: "Added sugar", unit: "g", group: "macro" },

  { key: "sat_fat_g", label: "Saturated fat", unit: "g", group: "fats" },
  { key: "trans_fat_g", label: "Trans fat", unit: "g", group: "fats" },
  { key: "cholesterol_mg", label: "Cholesterol", unit: "mg", group: "fats" },
  { key: "omega3_g", label: "Omega-3", unit: "g", group: "fats" },
  { key: "omega6_g", label: "Omega-6", unit: "g", group: "fats" },

  { key: "sodium_mg", label: "Sodium", unit: "mg", group: "minerals" },
  { key: "potassium_mg", label: "Potassium", unit: "mg", group: "minerals" },
  { key: "calcium_mg", label: "Calcium", unit: "mg", group: "minerals" },
  { key: "iron_mg", label: "Iron", unit: "mg", group: "minerals" },
  { key: "magnesium_mg", label: "Magnesium", unit: "mg", group: "minerals" },
  { key: "zinc_mg", label: "Zinc", unit: "mg", group: "minerals" },
  { key: "selenium_mcg", label: "Selenium", unit: "mcg", group: "minerals" },
  { key: "copper_mg", label: "Copper", unit: "mg", group: "minerals" },
  { key: "manganese_mg", label: "Manganese", unit: "mg", group: "minerals" },
  { key: "phosphorus_mg", label: "Phosphorus", unit: "mg", group: "minerals" },

  { key: "vit_a_mcg", label: "Vitamin A", unit: "mcg", group: "vitamins" },
  { key: "vit_c_mg", label: "Vitamin C", unit: "mg", group: "vitamins" },
  { key: "vit_d_mcg", label: "Vitamin D", unit: "mcg", group: "vitamins" },
  { key: "vit_e_mg", label: "Vitamin E", unit: "mg", group: "vitamins" },
  { key: "vit_k_mcg", label: "Vitamin K", unit: "mcg", group: "vitamins" },
  { key: "vit_b1_mg", label: "Vitamin B1 (Thiamin)", unit: "mg", group: "vitamins" },
  { key: "vit_b2_mg", label: "Vitamin B2 (Riboflavin)", unit: "mg", group: "vitamins" },
  { key: "vit_b3_mg", label: "Vitamin B3 (Niacin)", unit: "mg", group: "vitamins" },
  { key: "vit_b5_mg", label: "Vitamin B5", unit: "mg", group: "vitamins" },
  { key: "vit_b6_mg", label: "Vitamin B6", unit: "mg", group: "vitamins" },
  { key: "vit_b7_mcg", label: "Vitamin B7 (Biotin)", unit: "mcg", group: "vitamins" },
  { key: "vit_b9_mcg", label: "Vitamin B9 (Folate)", unit: "mcg", group: "vitamins" },
  { key: "vit_b12_mcg", label: "Vitamin B12", unit: "mcg", group: "vitamins" },
];

export const NUTRIENT_META_MAP: Record<string, NutrientMeta> = Object.fromEntries(
  NUTRIENT_META.map((m) => [m.key, m]),
);

export function emptyNutrients(): Nutrients {
  return { calories: null, protein_g: null, carbs_g: null, fat_g: null };
}

/** Multiply nutrients by `factor` (servings). null * x = null. */
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
      // round sensibly per unit
      const scaled = v * factor;
      out[meta.key as NutrientKey] =
        meta.unit === "g" ? Math.round(scaled * 10) / 10 : Math.round(scaled * 100) / 100;
    }
  }
  return out;
}

/** Sum nutrient panels. null is treated as 0. */
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

export function formatNutrient(value: number | null | undefined, unit: string): string {
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
