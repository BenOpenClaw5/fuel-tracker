import type { Food, Nutrients, ServingOption } from "@/lib/types";

/**
 * Compact authoring format for curated whole foods. Nutrients are per 100 g.
 *   `servings` lists alternate ways to express the food's portion size; the
 *   first entry is the default that the AddEntrySheet shows on open.
 *
 * Values are well-known reference points (USDA SR Legacy + standard kitchen
 * conversions). They are approximations — packaging variants exist, but for a
 * personal tracker the canonical numbers are good enough.
 */
export interface WholeFoodSeed {
  id: string;
  name: string;
  aliases?: string[];
  category: "protein" | "grain" | "veg" | "fruit" | "legume" | "nut" | "dairy" | "fat" | "sweetener" | "beverage" | "condiment";
  per100g: Nutrients;
  servings: ServingOption[];
}

// helpers — gram weights for common household measures
const OZ = 28.3495;
const TBSP = 14.787; // ml — used as gram approximation for water-density items
const CUP = 240;

export const WHOLE_FOOD_SEEDS: WholeFoodSeed[] = [
  // ── Proteins ──────────────────────────────────────────────────────
  {
    id: "wf_chicken_breast_raw",
    name: "Chicken breast, raw",
    aliases: ["chicken breast", "raw chicken", "chicken raw"],
    category: "protein",
    per100g: { calories: 120, protein_g: 22.5, carbs_g: 0, fat_g: 2.6, sat_fat_g: 0.6, sodium_mg: 60, potassium_mg: 334, cholesterol_mg: 70 },
    servings: [
      { label: "4 oz (113 g)", grams: 113 },
      { label: "3 oz (85 g)", grams: 85 },
      { label: "1 breast, avg (174 g)", grams: 174 },
      { label: "100 g", grams: 100 },
      { label: "1 oz", grams: OZ },
    ],
  },
  {
    id: "wf_chicken_breast_grilled",
    name: "Chicken breast, grilled",
    aliases: ["chicken breast cooked", "grilled chicken", "chicken breast roasted"],
    category: "protein",
    per100g: { calories: 165, protein_g: 31, carbs_g: 0, fat_g: 3.6, sat_fat_g: 1.0, sodium_mg: 74, potassium_mg: 256, cholesterol_mg: 85 },
    servings: [
      { label: "4 oz cooked (113 g)", grams: 113 },
      { label: "3 oz cooked (85 g)", grams: 85 },
      { label: "1 breast, cooked (140 g)", grams: 140 },
      { label: "100 g", grams: 100 },
      { label: "1 oz", grams: OZ },
    ],
  },
  {
    id: "wf_chicken_thigh_cooked",
    name: "Chicken thigh, cooked, skinless",
    aliases: ["chicken thigh"],
    category: "protein",
    per100g: { calories: 209, protein_g: 26, carbs_g: 0, fat_g: 10.9, sat_fat_g: 3.0, sodium_mg: 87, cholesterol_mg: 95 },
    servings: [
      { label: "1 thigh (52 g)", grams: 52 },
      { label: "4 oz (113 g)", grams: 113 },
      { label: "100 g", grams: 100 },
    ],
  },
  {
    id: "wf_chicken_wing_cooked",
    name: "Chicken wing, cooked",
    category: "protein",
    per100g: { calories: 290, protein_g: 27, carbs_g: 0, fat_g: 19.5, sat_fat_g: 5.4, sodium_mg: 92 },
    servings: [
      { label: "1 wing (21 g)", grams: 21 },
      { label: "3 wings (63 g)", grams: 63 },
      { label: "6 wings (126 g)", grams: 126 },
      { label: "100 g", grams: 100 },
    ],
  },
  {
    id: "wf_ground_beef_85",
    name: "Ground beef 85/15, cooked",
    aliases: ["ground beef", "hamburger meat"],
    category: "protein",
    per100g: { calories: 250, protein_g: 26, carbs_g: 0, fat_g: 15, sat_fat_g: 6.0, sodium_mg: 75, cholesterol_mg: 87 },
    servings: [
      { label: "4 oz cooked (113 g)", grams: 113 },
      { label: "3 oz cooked (85 g)", grams: 85 },
      { label: "1 patty (113 g)", grams: 113 },
      { label: "100 g", grams: 100 },
    ],
  },
  {
    id: "wf_ground_beef_93",
    name: "Ground beef 93/7, cooked",
    aliases: ["lean ground beef"],
    category: "protein",
    per100g: { calories: 170, protein_g: 27, carbs_g: 0, fat_g: 7, sat_fat_g: 2.7, sodium_mg: 75, cholesterol_mg: 77 },
    servings: [
      { label: "4 oz cooked (113 g)", grams: 113 },
      { label: "3 oz cooked (85 g)", grams: 85 },
      { label: "100 g", grams: 100 },
    ],
  },
  {
    id: "wf_steak_sirloin",
    name: "Sirloin steak, grilled",
    aliases: ["steak", "sirloin"],
    category: "protein",
    per100g: { calories: 211, protein_g: 31, carbs_g: 0, fat_g: 9, sat_fat_g: 3.5, sodium_mg: 65, cholesterol_mg: 89 },
    servings: [
      { label: "6 oz (170 g)", grams: 170 },
      { label: "8 oz (227 g)", grams: 227 },
      { label: "100 g", grams: 100 },
    ],
  },
  {
    id: "wf_bacon",
    name: "Bacon, pan-fried",
    category: "protein",
    per100g: { calories: 541, protein_g: 37, carbs_g: 1.4, fat_g: 42, sat_fat_g: 14, sodium_mg: 1717, cholesterol_mg: 110 },
    servings: [
      { label: "1 strip (8 g)", grams: 8 },
      { label: "2 strips (16 g)", grams: 16 },
      { label: "3 strips (24 g)", grams: 24 },
      { label: "100 g", grams: 100 },
    ],
  },
  {
    id: "wf_salmon_baked",
    name: "Salmon, baked",
    aliases: ["salmon cooked", "atlantic salmon"],
    category: "protein",
    per100g: { calories: 206, protein_g: 22, carbs_g: 0, fat_g: 12, sat_fat_g: 2.6, sodium_mg: 61, potassium_mg: 384, vit_d_mcg: 11, omega3_g: 2.3 },
    servings: [
      { label: "4 oz (113 g)", grams: 113 },
      { label: "6 oz fillet (170 g)", grams: 170 },
      { label: "100 g", grams: 100 },
    ],
  },
  {
    id: "wf_tuna_canned_water",
    name: "Tuna, canned in water, drained",
    aliases: ["tuna", "canned tuna"],
    category: "protein",
    per100g: { calories: 116, protein_g: 26, carbs_g: 0, fat_g: 0.8, sodium_mg: 247, cholesterol_mg: 30 },
    servings: [
      { label: "1 can (142 g)", grams: 142 },
      { label: "1 pouch (74 g)", grams: 74 },
      { label: "3 oz (85 g)", grams: 85 },
      { label: "100 g", grams: 100 },
    ],
  },
  {
    id: "wf_shrimp_cooked",
    name: "Shrimp, cooked",
    category: "protein",
    per100g: { calories: 99, protein_g: 24, carbs_g: 0.2, fat_g: 0.3, sat_fat_g: 0.1, sodium_mg: 111, cholesterol_mg: 189 },
    servings: [
      { label: "4 oz (113 g)", grams: 113 },
      { label: "3 oz (85 g)", grams: 85 },
      { label: "100 g", grams: 100 },
    ],
  },
  {
    id: "wf_egg_large",
    name: "Egg, whole, large",
    aliases: ["eggs", "whole egg"],
    category: "protein",
    per100g: { calories: 143, protein_g: 12.6, carbs_g: 0.7, fat_g: 9.5, sat_fat_g: 3.1, sodium_mg: 142, cholesterol_mg: 372, vit_d_mcg: 2.0, vit_b12_mcg: 0.9 },
    servings: [
      { label: "1 large egg (50 g)", grams: 50 },
      { label: "2 large eggs (100 g)", grams: 100 },
      { label: "3 large eggs (150 g)", grams: 150 },
    ],
  },
  {
    id: "wf_egg_white_large",
    name: "Egg white, large",
    aliases: ["egg whites"],
    category: "protein",
    per100g: { calories: 52, protein_g: 11, carbs_g: 0.7, fat_g: 0.2, sodium_mg: 166 },
    servings: [
      { label: "1 egg white (33 g)", grams: 33 },
      { label: "3 egg whites (99 g)", grams: 99 },
      { label: "1 cup (243 g)", grams: 243 },
    ],
  },
  {
    id: "wf_greek_yogurt_plain_0",
    name: "Greek yogurt, plain, 0%",
    aliases: ["greek yogurt", "fage", "nonfat yogurt"],
    category: "dairy",
    per100g: { calories: 59, protein_g: 10.3, carbs_g: 3.6, sugar_g: 3.2, fat_g: 0.4, calcium_mg: 110, sodium_mg: 36 },
    servings: [
      { label: "1 cup (245 g)", grams: 245 },
      { label: "1 container (170 g)", grams: 170 },
      { label: "100 g", grams: 100 },
    ],
  },
  {
    id: "wf_greek_yogurt_2",
    name: "Greek yogurt, plain, 2%",
    category: "dairy",
    per100g: { calories: 73, protein_g: 9.9, carbs_g: 3.9, sugar_g: 3.5, fat_g: 1.9, sat_fat_g: 1.2, calcium_mg: 111 },
    servings: [
      { label: "1 cup (245 g)", grams: 245 },
      { label: "100 g", grams: 100 },
    ],
  },
  {
    id: "wf_cottage_cheese_2",
    name: "Cottage cheese, 2%",
    category: "dairy",
    per100g: { calories: 84, protein_g: 11, carbs_g: 4.3, fat_g: 2.3, sat_fat_g: 1.0, sodium_mg: 308, calcium_mg: 91 },
    servings: [
      { label: "1 cup (226 g)", grams: 226 },
      { label: "1/2 cup (113 g)", grams: 113 },
      { label: "100 g", grams: 100 },
    ],
  },
  {
    id: "wf_tofu_firm",
    name: "Tofu, firm",
    category: "protein",
    per100g: { calories: 144, protein_g: 17, carbs_g: 2.8, fat_g: 8.7, sodium_mg: 14, calcium_mg: 683, iron_mg: 2.7 },
    servings: [
      { label: "3 oz (85 g)", grams: 85 },
      { label: "4 oz (113 g)", grams: 113 },
      { label: "1/4 block (85 g)", grams: 85 },
      { label: "100 g", grams: 100 },
    ],
  },

  // ── Grains ────────────────────────────────────────────────────────
  {
    id: "wf_white_rice_cooked",
    name: "White rice, cooked",
    aliases: ["rice", "jasmine rice cooked", "long grain rice"],
    category: "grain",
    per100g: { calories: 130, protein_g: 2.7, carbs_g: 28, fat_g: 0.3, fiber_g: 0.4, sodium_mg: 1 },
    servings: [
      { label: "1 cup cooked (158 g)", grams: 158 },
      { label: "1/2 cup cooked (79 g)", grams: 79 },
      { label: "100 g", grams: 100 },
    ],
  },
  {
    id: "wf_white_rice_dry",
    name: "White rice, dry",
    category: "grain",
    per100g: { calories: 365, protein_g: 7.1, carbs_g: 80, fat_g: 0.7, fiber_g: 1.3, sodium_mg: 5 },
    servings: [
      { label: "1/4 cup dry (45 g)", grams: 45 },
      { label: "100 g", grams: 100 },
    ],
  },
  {
    id: "wf_brown_rice_cooked",
    name: "Brown rice, cooked",
    category: "grain",
    per100g: { calories: 123, protein_g: 2.7, carbs_g: 26, fat_g: 1.0, fiber_g: 1.6, sodium_mg: 4, magnesium_mg: 44 },
    servings: [
      { label: "1 cup cooked (195 g)", grams: 195 },
      { label: "1/2 cup cooked (98 g)", grams: 98 },
      { label: "100 g", grams: 100 },
    ],
  },
  {
    id: "wf_quinoa_cooked",
    name: "Quinoa, cooked",
    category: "grain",
    per100g: { calories: 120, protein_g: 4.4, carbs_g: 21, fat_g: 1.9, fiber_g: 2.8, sodium_mg: 7, iron_mg: 1.5 },
    servings: [
      { label: "1 cup cooked (185 g)", grams: 185 },
      { label: "1/2 cup cooked (93 g)", grams: 93 },
      { label: "100 g", grams: 100 },
    ],
  },
  {
    id: "wf_oats_rolled_dry",
    name: "Oats, rolled, dry",
    aliases: ["oats", "rolled oats", "old fashioned oats", "oatmeal dry"],
    category: "grain",
    per100g: { calories: 379, protein_g: 13, carbs_g: 67, fat_g: 7, fiber_g: 10, sugar_g: 1, sodium_mg: 6, iron_mg: 4.0, magnesium_mg: 138 },
    servings: [
      { label: "1/2 cup dry (40 g)", grams: 40 },
      { label: "1/3 cup dry (27 g)", grams: 27 },
      { label: "1 cup dry (81 g)", grams: 81 },
      { label: "100 g", grams: 100 },
    ],
  },
  {
    id: "wf_oats_cooked",
    name: "Oatmeal, cooked",
    aliases: ["oatmeal", "cooked oats"],
    category: "grain",
    per100g: { calories: 71, protein_g: 2.5, carbs_g: 12, fat_g: 1.5, fiber_g: 1.7, sugar_g: 0.3, sodium_mg: 4 },
    servings: [
      { label: "1 cup cooked (234 g)", grams: 234 },
      { label: "1/2 cup cooked (117 g)", grams: 117 },
      { label: "100 g", grams: 100 },
    ],
  },
  {
    id: "wf_pasta_cooked",
    name: "Pasta, cooked",
    aliases: ["spaghetti", "penne cooked", "noodles"],
    category: "grain",
    per100g: { calories: 158, protein_g: 5.8, carbs_g: 31, fat_g: 0.9, fiber_g: 1.8, sodium_mg: 6 },
    servings: [
      { label: "1 cup cooked (140 g)", grams: 140 },
      { label: "2 oz dry equivalent (140 g cooked)", grams: 140 },
      { label: "100 g", grams: 100 },
    ],
  },
  {
    id: "wf_bread_white",
    name: "Bread, white",
    category: "grain",
    per100g: { calories: 265, protein_g: 9, carbs_g: 49, fat_g: 3.2, fiber_g: 2.7, sugar_g: 5, sodium_mg: 477 },
    servings: [
      { label: "1 slice (28 g)", grams: 28 },
      { label: "2 slices (56 g)", grams: 56 },
      { label: "100 g", grams: 100 },
    ],
  },
  {
    id: "wf_bread_wheat",
    name: "Bread, whole wheat",
    aliases: ["wheat bread", "whole grain bread"],
    category: "grain",
    per100g: { calories: 247, protein_g: 13, carbs_g: 41, fat_g: 3.5, fiber_g: 7, sugar_g: 6, sodium_mg: 472 },
    servings: [
      { label: "1 slice (32 g)", grams: 32 },
      { label: "2 slices (64 g)", grams: 64 },
      { label: "100 g", grams: 100 },
    ],
  },
  {
    id: "wf_tortilla_flour",
    name: "Tortilla, flour",
    category: "grain",
    per100g: { calories: 304, protein_g: 8, carbs_g: 52, fat_g: 7, fiber_g: 3, sodium_mg: 644 },
    servings: [
      { label: "1 small (6 in, 33 g)", grams: 33 },
      { label: "1 medium (8 in, 49 g)", grams: 49 },
      { label: "1 large (10 in, 71 g)", grams: 71 },
      { label: "1 burrito-size (12 in, 100 g)", grams: 100 },
    ],
  },
  {
    id: "wf_tortilla_corn",
    name: "Tortilla, corn",
    category: "grain",
    per100g: { calories: 218, protein_g: 5.7, carbs_g: 45, fat_g: 2.9, fiber_g: 6.3, sodium_mg: 45 },
    servings: [
      { label: "1 small (6 in, 24 g)", grams: 24 },
      { label: "2 small (48 g)", grams: 48 },
      { label: "3 small (72 g)", grams: 72 },
    ],
  },
  {
    id: "wf_bagel_plain",
    name: "Bagel, plain",
    category: "grain",
    per100g: { calories: 257, protein_g: 10, carbs_g: 50, fat_g: 1.5, fiber_g: 2.1, sodium_mg: 439 },
    servings: [
      { label: "1 small (71 g)", grams: 71 },
      { label: "1 medium (98 g)", grams: 98 },
      { label: "1 large (131 g)", grams: 131 },
    ],
  },

  // ── Vegetables ────────────────────────────────────────────────────
  {
    id: "wf_broccoli_raw",
    name: "Broccoli, raw",
    aliases: ["broccoli"],
    category: "veg",
    per100g: { calories: 34, protein_g: 2.8, carbs_g: 6.6, fat_g: 0.4, fiber_g: 2.6, sugar_g: 1.7, sodium_mg: 33, vit_c_mg: 89.2, vit_k_mcg: 102, potassium_mg: 316 },
    servings: [
      { label: "1 cup chopped (91 g)", grams: 91 },
      { label: "1 head (608 g)", grams: 608 },
      { label: "100 g", grams: 100 },
    ],
  },
  {
    id: "wf_spinach_raw",
    name: "Spinach, raw",
    category: "veg",
    per100g: { calories: 23, protein_g: 2.9, carbs_g: 3.6, fat_g: 0.4, fiber_g: 2.2, sodium_mg: 79, iron_mg: 2.7, vit_a_mcg: 469, vit_k_mcg: 482, vit_b9_mcg: 194 },
    servings: [
      { label: "1 cup (30 g)", grams: 30 },
      { label: "1 bag (140 g)", grams: 140 },
      { label: "100 g", grams: 100 },
    ],
  },
  {
    id: "wf_kale_raw",
    name: "Kale, raw",
    category: "veg",
    per100g: { calories: 49, protein_g: 4.3, carbs_g: 8.8, fat_g: 0.9, fiber_g: 3.6, sodium_mg: 38, vit_c_mg: 120, vit_k_mcg: 705, calcium_mg: 150 },
    servings: [
      { label: "1 cup (67 g)", grams: 67 },
      { label: "100 g", grams: 100 },
    ],
  },
  {
    id: "wf_carrots_raw",
    name: "Carrots, raw",
    category: "veg",
    per100g: { calories: 41, protein_g: 0.9, carbs_g: 9.6, fat_g: 0.2, fiber_g: 2.8, sugar_g: 4.7, sodium_mg: 69, vit_a_mcg: 835 },
    servings: [
      { label: "1 medium (61 g)", grams: 61 },
      { label: "1 cup chopped (128 g)", grams: 128 },
      { label: "10 baby carrots (100 g)", grams: 100 },
    ],
  },
  {
    id: "wf_bell_pepper_red",
    name: "Bell pepper, red, raw",
    category: "veg",
    per100g: { calories: 31, protein_g: 1, carbs_g: 6, fat_g: 0.3, fiber_g: 2.1, sugar_g: 4.2, vit_c_mg: 128, vit_a_mcg: 157 },
    servings: [
      { label: "1 medium (119 g)", grams: 119 },
      { label: "1 cup sliced (92 g)", grams: 92 },
      { label: "100 g", grams: 100 },
    ],
  },
  {
    id: "wf_onion",
    name: "Onion, raw",
    category: "veg",
    per100g: { calories: 40, protein_g: 1.1, carbs_g: 9.3, fat_g: 0.1, fiber_g: 1.7, sugar_g: 4.2, sodium_mg: 4 },
    servings: [
      { label: "1 medium (110 g)", grams: 110 },
      { label: "1 cup chopped (160 g)", grams: 160 },
      { label: "100 g", grams: 100 },
    ],
  },
  {
    id: "wf_tomato",
    name: "Tomato, raw",
    category: "veg",
    per100g: { calories: 18, protein_g: 0.9, carbs_g: 3.9, fat_g: 0.2, fiber_g: 1.2, sugar_g: 2.6, sodium_mg: 5, vit_c_mg: 13.7 },
    servings: [
      { label: "1 medium (123 g)", grams: 123 },
      { label: "1 cup chopped (180 g)", grams: 180 },
      { label: "1 cherry tomato (17 g)", grams: 17 },
    ],
  },
  {
    id: "wf_cucumber",
    name: "Cucumber",
    category: "veg",
    per100g: { calories: 15, protein_g: 0.7, carbs_g: 3.6, fat_g: 0.1, fiber_g: 0.5, sugar_g: 1.7, sodium_mg: 2 },
    servings: [
      { label: "1 medium (201 g)", grams: 201 },
      { label: "1 cup sliced (104 g)", grams: 104 },
      { label: "100 g", grams: 100 },
    ],
  },
  {
    id: "wf_lettuce_romaine",
    name: "Romaine lettuce",
    category: "veg",
    per100g: { calories: 17, protein_g: 1.2, carbs_g: 3.3, fat_g: 0.3, fiber_g: 2.1, sodium_mg: 8, vit_a_mcg: 436, vit_k_mcg: 102 },
    servings: [
      { label: "1 cup shredded (47 g)", grams: 47 },
      { label: "1 head (626 g)", grams: 626 },
    ],
  },
  {
    id: "wf_sweet_potato_baked",
    name: "Sweet potato, baked",
    category: "veg",
    per100g: { calories: 90, protein_g: 2, carbs_g: 20.7, fat_g: 0.2, fiber_g: 3.3, sugar_g: 6.5, sodium_mg: 36, vit_a_mcg: 961, potassium_mg: 475 },
    servings: [
      { label: "1 medium (114 g)", grams: 114 },
      { label: "1 cup cubed (200 g)", grams: 200 },
      { label: "100 g", grams: 100 },
    ],
  },
  {
    id: "wf_potato_baked",
    name: "Potato, baked",
    aliases: ["baked potato", "russet potato"],
    category: "veg",
    per100g: { calories: 93, protein_g: 2.5, carbs_g: 21, fat_g: 0.1, fiber_g: 2.2, sodium_mg: 10, potassium_mg: 535 },
    servings: [
      { label: "1 medium (173 g)", grams: 173 },
      { label: "1 large (299 g)", grams: 299 },
      { label: "100 g", grams: 100 },
    ],
  },
  {
    id: "wf_avocado",
    name: "Avocado",
    category: "fruit",
    per100g: { calories: 160, protein_g: 2, carbs_g: 9, fat_g: 15, sat_fat_g: 2.1, fiber_g: 7, sodium_mg: 7, potassium_mg: 485 },
    servings: [
      { label: "1 medium (150 g)", grams: 150 },
      { label: "1/2 medium (75 g)", grams: 75 },
      { label: "1/4 medium (37 g)", grams: 37 },
      { label: "100 g", grams: 100 },
    ],
  },

  // ── Fruits ────────────────────────────────────────────────────────
  {
    id: "wf_apple",
    name: "Apple",
    category: "fruit",
    per100g: { calories: 52, protein_g: 0.3, carbs_g: 14, fat_g: 0.2, fiber_g: 2.4, sugar_g: 10, sodium_mg: 1, vit_c_mg: 4.6 },
    servings: [
      { label: "1 medium (182 g)", grams: 182 },
      { label: "1 small (149 g)", grams: 149 },
      { label: "1 large (223 g)", grams: 223 },
      { label: "100 g", grams: 100 },
    ],
  },
  {
    id: "wf_banana",
    name: "Banana",
    category: "fruit",
    per100g: { calories: 89, protein_g: 1.1, carbs_g: 23, fat_g: 0.3, fiber_g: 2.6, sugar_g: 12, sodium_mg: 1, potassium_mg: 358 },
    servings: [
      { label: "1 medium (118 g)", grams: 118 },
      { label: "1 small (101 g)", grams: 101 },
      { label: "1 large (136 g)", grams: 136 },
    ],
  },
  {
    id: "wf_orange",
    name: "Orange",
    category: "fruit",
    per100g: { calories: 47, protein_g: 0.9, carbs_g: 12, fat_g: 0.1, fiber_g: 2.4, sugar_g: 9, sodium_mg: 0, vit_c_mg: 53 },
    servings: [
      { label: "1 medium (131 g)", grams: 131 },
      { label: "1 large (184 g)", grams: 184 },
    ],
  },
  {
    id: "wf_strawberries",
    name: "Strawberries",
    category: "fruit",
    per100g: { calories: 32, protein_g: 0.7, carbs_g: 7.7, fat_g: 0.3, fiber_g: 2, sugar_g: 4.9, sodium_mg: 1, vit_c_mg: 58.8 },
    servings: [
      { label: "1 cup whole (144 g)", grams: 144 },
      { label: "1 cup sliced (166 g)", grams: 166 },
      { label: "1 strawberry (12 g)", grams: 12 },
    ],
  },
  {
    id: "wf_blueberries",
    name: "Blueberries",
    category: "fruit",
    per100g: { calories: 57, protein_g: 0.7, carbs_g: 14, fat_g: 0.3, fiber_g: 2.4, sugar_g: 10, sodium_mg: 1, vit_c_mg: 9.7 },
    servings: [
      { label: "1 cup (148 g)", grams: 148 },
      { label: "1/2 cup (74 g)", grams: 74 },
      { label: "100 g", grams: 100 },
    ],
  },
  {
    id: "wf_grapes",
    name: "Grapes",
    category: "fruit",
    per100g: { calories: 69, protein_g: 0.7, carbs_g: 18, fat_g: 0.2, fiber_g: 0.9, sugar_g: 16, sodium_mg: 2 },
    servings: [
      { label: "1 cup (151 g)", grams: 151 },
      { label: "100 g", grams: 100 },
    ],
  },
  {
    id: "wf_watermelon",
    name: "Watermelon",
    category: "fruit",
    per100g: { calories: 30, protein_g: 0.6, carbs_g: 7.6, fat_g: 0.2, fiber_g: 0.4, sugar_g: 6.2, sodium_mg: 1, vit_c_mg: 8.1 },
    servings: [
      { label: "1 cup diced (152 g)", grams: 152 },
      { label: "1 wedge (286 g)", grams: 286 },
    ],
  },
  {
    id: "wf_mango",
    name: "Mango",
    category: "fruit",
    per100g: { calories: 60, protein_g: 0.8, carbs_g: 15, fat_g: 0.4, fiber_g: 1.6, sugar_g: 14, vit_c_mg: 36, vit_a_mcg: 54 },
    servings: [
      { label: "1 medium (200 g)", grams: 200 },
      { label: "1 cup diced (165 g)", grams: 165 },
    ],
  },
  {
    id: "wf_pineapple",
    name: "Pineapple",
    category: "fruit",
    per100g: { calories: 50, protein_g: 0.5, carbs_g: 13, fat_g: 0.1, fiber_g: 1.4, sugar_g: 10, vit_c_mg: 47.8 },
    servings: [
      { label: "1 cup chunks (165 g)", grams: 165 },
      { label: "100 g", grams: 100 },
    ],
  },

  // ── Legumes / Nuts ───────────────────────────────────────────────
  {
    id: "wf_black_beans_canned",
    name: "Black beans, canned",
    category: "legume",
    per100g: { calories: 91, protein_g: 6, carbs_g: 16, fat_g: 0.3, fiber_g: 6.4, sodium_mg: 251, iron_mg: 1.9, potassium_mg: 308 },
    servings: [
      { label: "1 can (425 g)", grams: 425 },
      { label: "1/2 cup (130 g)", grams: 130 },
      { label: "1 cup (260 g)", grams: 260 },
    ],
  },
  {
    id: "wf_chickpeas_canned",
    name: "Chickpeas, canned",
    aliases: ["garbanzo beans"],
    category: "legume",
    per100g: { calories: 139, protein_g: 7.1, carbs_g: 23, fat_g: 2.6, fiber_g: 6.4, sodium_mg: 322, iron_mg: 1.5 },
    servings: [
      { label: "1 can (425 g)", grams: 425 },
      { label: "1/2 cup (120 g)", grams: 120 },
    ],
  },
  {
    id: "wf_lentils_cooked",
    name: "Lentils, cooked",
    category: "legume",
    per100g: { calories: 116, protein_g: 9, carbs_g: 20, fat_g: 0.4, fiber_g: 7.9, sodium_mg: 2, iron_mg: 3.3, vit_b9_mcg: 181 },
    servings: [
      { label: "1 cup cooked (198 g)", grams: 198 },
      { label: "1/2 cup cooked (99 g)", grams: 99 },
    ],
  },
  {
    id: "wf_edamame",
    name: "Edamame, shelled",
    category: "legume",
    per100g: { calories: 121, protein_g: 12, carbs_g: 9, fat_g: 5, fiber_g: 5, sodium_mg: 6 },
    servings: [
      { label: "1 cup (155 g)", grams: 155 },
      { label: "1/2 cup (77 g)", grams: 77 },
    ],
  },
  {
    id: "wf_almonds",
    name: "Almonds, raw",
    aliases: ["almond"],
    category: "nut",
    per100g: { calories: 579, protein_g: 21, carbs_g: 22, fat_g: 50, sat_fat_g: 3.8, fiber_g: 12.5, sodium_mg: 1, magnesium_mg: 270, vit_e_mg: 25.6 },
    servings: [
      { label: "1 oz (28 g, ~23 almonds)", grams: 28 },
      { label: "1/4 cup (35 g)", grams: 35 },
      { label: "1 almond (1.2 g)", grams: 1.2 },
    ],
  },
  {
    id: "wf_walnuts",
    name: "Walnuts",
    category: "nut",
    per100g: { calories: 654, protein_g: 15, carbs_g: 14, fat_g: 65, sat_fat_g: 6.1, fiber_g: 6.7, omega3_g: 9 },
    servings: [
      { label: "1 oz (28 g, ~14 halves)", grams: 28 },
      { label: "1/4 cup (30 g)", grams: 30 },
    ],
  },
  {
    id: "wf_cashews",
    name: "Cashews, raw",
    category: "nut",
    per100g: { calories: 553, protein_g: 18, carbs_g: 30, fat_g: 44, sat_fat_g: 7.8, fiber_g: 3.3, magnesium_mg: 292 },
    servings: [
      { label: "1 oz (28 g, ~18 nuts)", grams: 28 },
      { label: "1/4 cup (32 g)", grams: 32 },
    ],
  },
  {
    id: "wf_peanut_butter",
    name: "Peanut butter, smooth",
    aliases: ["peanut butter"],
    category: "nut",
    per100g: { calories: 588, protein_g: 25, carbs_g: 20, fat_g: 50, sat_fat_g: 10, fiber_g: 6, sodium_mg: 459 },
    servings: [
      { label: "1 tbsp (16 g)", grams: 16 },
      { label: "2 tbsp (32 g)", grams: 32 },
      { label: "100 g", grams: 100 },
    ],
  },
  {
    id: "wf_almond_butter",
    name: "Almond butter",
    category: "nut",
    per100g: { calories: 614, protein_g: 21, carbs_g: 19, fat_g: 56, sat_fat_g: 5.2, fiber_g: 10, sodium_mg: 7 },
    servings: [
      { label: "1 tbsp (16 g)", grams: 16 },
      { label: "2 tbsp (32 g)", grams: 32 },
    ],
  },

  // ── Dairy / Alts ─────────────────────────────────────────────────
  {
    id: "wf_milk_whole",
    name: "Milk, whole",
    aliases: ["whole milk"],
    category: "dairy",
    per100g: { calories: 61, protein_g: 3.2, carbs_g: 4.8, sugar_g: 5.1, fat_g: 3.3, sat_fat_g: 1.9, sodium_mg: 43, calcium_mg: 113 },
    servings: [
      { label: "1 cup (244 g)", grams: 244 },
      { label: "1/2 cup (122 g)", grams: 122 },
      { label: "1 tbsp (15 g)", grams: 15 },
    ],
  },
  {
    id: "wf_milk_2",
    name: "Milk, 2%",
    aliases: ["2% milk"],
    category: "dairy",
    per100g: { calories: 50, protein_g: 3.3, carbs_g: 4.8, sugar_g: 5.1, fat_g: 2.0, sat_fat_g: 1.2, sodium_mg: 44, calcium_mg: 120 },
    servings: [
      { label: "1 cup (244 g)", grams: 244 },
      { label: "1/2 cup (122 g)", grams: 122 },
    ],
  },
  {
    id: "wf_milk_skim",
    name: "Milk, skim",
    aliases: ["skim milk", "nonfat milk"],
    category: "dairy",
    per100g: { calories: 34, protein_g: 3.4, carbs_g: 5.0, sugar_g: 5.1, fat_g: 0.1, sodium_mg: 42, calcium_mg: 122 },
    servings: [{ label: "1 cup (245 g)", grams: 245 }],
  },
  {
    id: "wf_almond_milk_unsweet",
    name: "Almond milk, unsweetened",
    category: "dairy",
    per100g: { calories: 17, protein_g: 0.6, carbs_g: 0.6, fat_g: 1.5, sodium_mg: 75, calcium_mg: 188 },
    servings: [{ label: "1 cup (240 g)", grams: 240 }],
  },
  {
    id: "wf_oat_milk",
    name: "Oat milk, original",
    category: "dairy",
    per100g: { calories: 50, protein_g: 1.3, carbs_g: 7.1, sugar_g: 3, fat_g: 2.1, sodium_mg: 42, calcium_mg: 146 },
    servings: [{ label: "1 cup (240 g)", grams: 240 }],
  },
  {
    id: "wf_cheddar",
    name: "Cheddar cheese",
    category: "dairy",
    per100g: { calories: 402, protein_g: 25, carbs_g: 1.3, fat_g: 33, sat_fat_g: 19, sodium_mg: 621, calcium_mg: 721 },
    servings: [
      { label: "1 slice (28 g)", grams: 28 },
      { label: "1 oz (28 g)", grams: 28 },
      { label: "1 cup shredded (113 g)", grams: 113 },
    ],
  },
  {
    id: "wf_mozzarella",
    name: "Mozzarella cheese, part-skim",
    category: "dairy",
    per100g: { calories: 254, protein_g: 24, carbs_g: 2.8, fat_g: 16, sat_fat_g: 10, sodium_mg: 619, calcium_mg: 782 },
    servings: [
      { label: "1 oz (28 g)", grams: 28 },
      { label: "1 cup shredded (113 g)", grams: 113 },
    ],
  },
  {
    id: "wf_parmesan",
    name: "Parmesan cheese",
    category: "dairy",
    per100g: { calories: 392, protein_g: 35, carbs_g: 3.2, fat_g: 26, sat_fat_g: 16, sodium_mg: 1529, calcium_mg: 1184 },
    servings: [
      { label: "1 tbsp grated (5 g)", grams: 5 },
      { label: "1 oz (28 g)", grams: 28 },
    ],
  },
  {
    id: "wf_butter",
    name: "Butter, unsalted",
    category: "fat",
    per100g: { calories: 717, protein_g: 0.9, carbs_g: 0.1, fat_g: 81, sat_fat_g: 51, cholesterol_mg: 215, sodium_mg: 11 },
    servings: [
      { label: "1 tbsp (14 g)", grams: 14 },
      { label: "1 tsp (5 g)", grams: 5 },
      { label: "1 stick (113 g)", grams: 113 },
    ],
  },

  // ── Fats / Oils ──────────────────────────────────────────────────
  {
    id: "wf_olive_oil",
    name: "Olive oil",
    aliases: ["evoo", "extra virgin olive oil"],
    category: "fat",
    per100g: { calories: 884, protein_g: 0, carbs_g: 0, fat_g: 100, sat_fat_g: 13.8, sodium_mg: 2 },
    servings: [
      { label: "1 tbsp (14 g)", grams: 13.5 },
      { label: "1 tsp (4.5 g)", grams: 4.5 },
      { label: "2 tbsp (27 g)", grams: 27 },
    ],
  },
  {
    id: "wf_coconut_oil",
    name: "Coconut oil",
    category: "fat",
    per100g: { calories: 892, protein_g: 0, carbs_g: 0, fat_g: 100, sat_fat_g: 87 },
    servings: [
      { label: "1 tbsp (14 g)", grams: 14 },
      { label: "1 tsp (4.5 g)", grams: 4.5 },
    ],
  },

  // ── Sweeteners ───────────────────────────────────────────────────
  {
    id: "wf_honey",
    name: "Honey",
    aliases: ["raw honey"],
    category: "sweetener",
    per100g: { calories: 304, protein_g: 0.3, carbs_g: 82, sugar_g: 82, added_sugar_g: 0, fat_g: 0, sodium_mg: 4 },
    servings: [
      { label: "1 tbsp (21 g)", grams: 21 },
      { label: "1 tsp (7 g)", grams: 7 },
      { label: "1 cup (340 g)", grams: 340 },
      { label: "100 g", grams: 100 },
    ],
  },
  {
    id: "wf_maple_syrup",
    name: "Maple syrup",
    category: "sweetener",
    per100g: { calories: 260, protein_g: 0, carbs_g: 67, sugar_g: 60, added_sugar_g: 0, fat_g: 0.2, sodium_mg: 12 },
    servings: [
      { label: "1 tbsp (20 g)", grams: 20 },
      { label: "1/4 cup (80 g)", grams: 80 },
    ],
  },
  {
    id: "wf_sugar_white",
    name: "Sugar, white granulated",
    aliases: ["sugar", "granulated sugar"],
    category: "sweetener",
    per100g: { calories: 387, protein_g: 0, carbs_g: 100, sugar_g: 100, added_sugar_g: 100, fat_g: 0 },
    servings: [
      { label: "1 tsp (4 g)", grams: 4 },
      { label: "1 tbsp (12 g)", grams: 12 },
      { label: "1 cup (200 g)", grams: 200 },
    ],
  },

  // ── Condiments ───────────────────────────────────────────────────
  {
    id: "wf_mayonnaise",
    name: "Mayonnaise",
    aliases: ["mayo"],
    category: "condiment",
    per100g: { calories: 680, protein_g: 1.0, carbs_g: 0.6, fat_g: 75, sat_fat_g: 12, sodium_mg: 635 },
    servings: [
      { label: "1 tbsp (14 g)", grams: 14 },
      { label: "1 tsp (5 g)", grams: 5 },
    ],
  },
  {
    id: "wf_ketchup",
    name: "Ketchup",
    category: "condiment",
    per100g: { calories: 101, protein_g: 1.7, carbs_g: 27, sugar_g: 22, added_sugar_g: 22, fat_g: 0.4, sodium_mg: 907 },
    servings: [
      { label: "1 tbsp (17 g)", grams: 17 },
      { label: "1 packet (8 g)", grams: 8 },
    ],
  },
  {
    id: "wf_mustard",
    name: "Mustard, yellow",
    category: "condiment",
    per100g: { calories: 60, protein_g: 4, carbs_g: 5.8, fat_g: 3.4, sodium_mg: 1135 },
    servings: [
      { label: "1 tsp (5 g)", grams: 5 },
      { label: "1 tbsp (15 g)", grams: 15 },
    ],
  },
  {
    id: "wf_soy_sauce",
    name: "Soy sauce",
    category: "condiment",
    per100g: { calories: 53, protein_g: 8, carbs_g: 4.9, fat_g: 0.6, sodium_mg: 5493 },
    servings: [
      { label: "1 tbsp (16 g)", grams: 16 },
      { label: "1 tsp (5 g)", grams: 5 },
    ],
  },
  {
    id: "wf_hummus",
    name: "Hummus",
    category: "condiment",
    per100g: { calories: 166, protein_g: 7.9, carbs_g: 14, fat_g: 9.6, sat_fat_g: 1.4, fiber_g: 6, sodium_mg: 379 },
    servings: [
      { label: "2 tbsp (28 g)", grams: 28 },
      { label: "1/4 cup (60 g)", grams: 60 },
    ],
  },
  {
    id: "wf_guacamole",
    name: "Guacamole",
    category: "condiment",
    per100g: { calories: 159, protein_g: 2, carbs_g: 9, fat_g: 14.7, sat_fat_g: 2.1, fiber_g: 6.8, sodium_mg: 280 },
    servings: [
      { label: "2 tbsp (28 g)", grams: 28 },
      { label: "1/4 cup (60 g)", grams: 60 },
      { label: "1/2 cup (120 g)", grams: 120 },
    ],
  },

  // ── Beverages ────────────────────────────────────────────────────
  {
    id: "wf_coffee_black",
    name: "Coffee, black, brewed",
    aliases: ["black coffee"],
    category: "beverage",
    per100g: { calories: 1, protein_g: 0.1, carbs_g: 0, fat_g: 0, sodium_mg: 2, potassium_mg: 49 },
    servings: [
      { label: "12 oz (355 g)", grams: 355 },
      { label: "16 oz (473 g)", grams: 473 },
      { label: "8 oz (237 g)", grams: 237 },
    ],
  },
  {
    id: "wf_orange_juice",
    name: "Orange juice",
    aliases: ["oj"],
    category: "beverage",
    per100g: { calories: 45, protein_g: 0.7, carbs_g: 10, sugar_g: 8.4, fat_g: 0.2, sodium_mg: 1, vit_c_mg: 50 },
    servings: [
      { label: "1 cup (248 g)", grams: 248 },
      { label: "8 oz (240 g)", grams: 240 },
    ],
  },
  {
    id: "wf_beer_regular",
    name: "Beer, regular (5% ABV)",
    category: "beverage",
    per100g: { calories: 43, protein_g: 0.5, carbs_g: 3.6, sugar_g: 0, fat_g: 0, sodium_mg: 4 },
    servings: [
      { label: "12 oz can/bottle (355 g)", grams: 355 },
      { label: "16 oz pint (473 g)", grams: 473 },
    ],
  },
  {
    id: "wf_red_wine",
    name: "Red wine",
    category: "beverage",
    per100g: { calories: 85, protein_g: 0.1, carbs_g: 2.6, sugar_g: 0.6, fat_g: 0 },
    servings: [
      { label: "5 oz glass (147 g)", grams: 147 },
      { label: "750 ml bottle", grams: 750 },
    ],
  },
];

// silence unused warning
void OZ;
void TBSP;
void CUP;

/** Convert a curated seed into a Food shape with the first serving as default. */
export function seedToFood(seed: WholeFoodSeed): Food {
  const def = seed.servings[0];
  const factor = def.grams / 100;
  const nutrients: Nutrients = {
    calories: null,
    protein_g: null,
    carbs_g: null,
    fat_g: null,
  };
  for (const [key, value] of Object.entries(seed.per100g)) {
    if (value == null) continue;
    (nutrients as unknown as Record<string, number>)[key] =
      Math.round(value * factor * 100) / 100;
  }
  return {
    id: seed.id,
    source: "curated",
    name: seed.name,
    aliases: seed.aliases,
    servingSizeG: def.grams,
    servingLabel: def.label,
    servingOptions: seed.servings,
    nutrients,
    createdAt: 0,
  };
}
