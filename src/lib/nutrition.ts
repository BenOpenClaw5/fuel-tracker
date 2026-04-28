import type { ActivityLevel, Goal, Goals, Profile, Sex } from "./types";

/** Mifflin-St Jeor BMR (kcal/day). */
export function mifflinStJeor(p: {
  sex: Sex;
  weightKg: number;
  heightCm: number;
  age: number;
}): number {
  const { sex, weightKg, heightCm, age } = p;
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  if (sex === "m") return base + 5;
  if (sex === "f") return base - 161;
  // Non-binary: average of m/f estimates
  return base - 78;
}

const ACTIVITY_FACTORS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  very: 1.725,
  extreme: 1.9,
};

const GOAL_DELTAS: Record<Goal, number> = {
  cut: -500,
  maintain: 0,
  bulk: 300,
};

export function tdee(profile: {
  sex: Sex;
  weightKg: number;
  heightCm: number;
  age: number;
  activityLevel: ActivityLevel;
}): number {
  return mifflinStJeor(profile) * ACTIVITY_FACTORS[profile.activityLevel];
}

export function ageFromBirthDate(iso?: string): number {
  if (!iso) return 30;
  const b = new Date(iso);
  if (Number.isNaN(b.getTime())) return 30;
  const now = new Date();
  let age = now.getFullYear() - b.getFullYear();
  const m = now.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < b.getDate())) age -= 1;
  return Math.max(13, age);
}

/** Macro split: 1 g protein/lb body weight, 0.35 g fat/lb, remainder carbs. */
export function defaultMacros(weightKg: number, calories: number) {
  const lb = weightKg * 2.20462;
  const protein_g = Math.round(lb * 1);
  const fat_g = Math.round(lb * 0.35);
  const proteinKcal = protein_g * 4;
  const fatKcal = fat_g * 9;
  const carbsKcal = Math.max(0, calories - proteinKcal - fatKcal);
  const carbs_g = Math.round(carbsKcal / 4);
  return { protein_g, carbs_g, fat_g };
}

export function buildGoals(profile: Profile): Goals {
  const age = ageFromBirthDate(profile.birthDate);
  const dee = tdee({
    sex: profile.sex,
    weightKg: profile.weightKg,
    heightCm: profile.heightCm,
    age,
    activityLevel: profile.activityLevel,
  });
  const calories = Math.max(1200, Math.round(dee + GOAL_DELTAS[profile.goal]));
  const macros = defaultMacros(profile.weightKg, calories);
  const isMale = profile.sex === "m";
  return {
    calories,
    protein_g: macros.protein_g,
    carbs_g: macros.carbs_g,
    fat_g: macros.fat_g,
    fiber_g: isMale ? 38 : 25,
    sugar_g: Math.round((calories * 0.1) / 4),
    added_sugar_g: 25, // WHO recommends ≤25 g free sugars
    sat_fat_g: Math.round((calories * 0.1) / 9),
    sodium_mg: 2300,
    potassium_mg: 3500,
    calcium_mg: 1000,
    iron_mg: isMale ? 8 : 18,
    magnesium_mg: isMale ? 400 : 310,
    zinc_mg: isMale ? 11 : 8,
    phosphorus_mg: 700,
    vit_a_mcg: isMale ? 900 : 700,
    vit_c_mg: isMale ? 90 : 75,
    vit_d_mcg: 20,
    vit_e_mg: 15,
    vit_k_mcg: isMale ? 120 : 90,
    vit_b1_mg: isMale ? 1.2 : 1.1,
    vit_b2_mg: isMale ? 1.3 : 1.1,
    vit_b3_mg: isMale ? 16 : 14,
    vit_b6_mg: 1.3,
    vit_b9_mcg: 400,
    vit_b12_mcg: 2.4,
    cholesterol_mg: 300,
    water_ml: Math.round(profile.weightKg * 35),
  };
}

export function lbsToKg(lb: number): number {
  return lb / 2.20462;
}
export function kgToLbs(kg: number): number {
  return kg * 2.20462;
}
export function inchesToCm(inches: number): number {
  return inches * 2.54;
}
export function cmToInches(cm: number): number {
  return cm / 2.54;
}
export function feetInchesToCm(ft: number, inches: number): number {
  return inchesToCm(ft * 12 + inches);
}
export function cmToFeetInches(cm: number): { ft: number; inches: number } {
  const totalIn = cmToInches(cm);
  const ft = Math.floor(totalIn / 12);
  const inches = Math.round(totalIn - ft * 12);
  return { ft, inches };
}
