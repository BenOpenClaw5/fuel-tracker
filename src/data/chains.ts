import type { Food, Nutrients } from "@/lib/types";

/**
 * Curated chain restaurant nutrition data.
 *
 * Values are factual nutrient data published by each chain. We do not
 * reproduce marketing copy, descriptions, or images — only numbers and
 * item names. Numeric facts are not copyrightable (Feist v. Rural, 1991).
 *
 * Update when chain menus change. To regenerate, see scripts/scrape-*.
 */
export interface ChainSeed {
  id: string;
  brand: string;
  name: string;
  aliases?: string[];
  /** Nutrients per "1 item" (not per 100 g). */
  perItem: Nutrients;
  /** Display label for the portion (e.g. "30 ct", "12 oz"). */
  portionLabel: string;
  /** Approximate gram weight of one item — for reporting "grams" totals. */
  approxGrams?: number;
}

export const CHAIN_SEEDS: ChainSeed[] = [
  // ─── Chick-fil-A ────────────────────────────────────────────────
  {
    id: "cfa_grilled_nuggets_8",
    brand: "Chick-fil-A",
    name: "Grilled Nuggets",
    aliases: ["cfa grilled nuggets", "cfa nuggets grilled"],
    portionLabel: "8 ct",
    approxGrams: 113,
    perItem: { calories: 130, protein_g: 25, carbs_g: 1, fat_g: 3, sat_fat_g: 1, sodium_mg: 440, cholesterol_mg: 75, sugar_g: 0 },
  },
  {
    id: "cfa_grilled_nuggets_12",
    brand: "Chick-fil-A",
    name: "Grilled Nuggets",
    aliases: ["cfa grilled nuggets 12"],
    portionLabel: "12 ct",
    approxGrams: 170,
    perItem: { calories: 200, protein_g: 38, carbs_g: 2, fat_g: 4.5, sat_fat_g: 1.5, sodium_mg: 660, cholesterol_mg: 110, sugar_g: 0 },
  },
  {
    id: "cfa_grilled_nuggets_30",
    brand: "Chick-fil-A",
    name: "Grilled Nuggets",
    aliases: ["cfa grilled nuggets 30", "cfa 30 count grilled nuggets", "30 grilled nuggets"],
    portionLabel: "30 ct",
    approxGrams: 425,
    perItem: { calories: 500, protein_g: 95, carbs_g: 5, fat_g: 11, sat_fat_g: 3.5, sodium_mg: 1650, cholesterol_mg: 280, sugar_g: 0 },
  },
  {
    id: "cfa_nuggets_8",
    brand: "Chick-fil-A",
    name: "Nuggets",
    aliases: ["cfa nuggets", "chick-fil-a nuggets"],
    portionLabel: "8 ct",
    approxGrams: 113,
    perItem: { calories: 250, protein_g: 27, carbs_g: 11, fat_g: 11, sat_fat_g: 2.5, sodium_mg: 1210, cholesterol_mg: 85, sugar_g: 1 },
  },
  {
    id: "cfa_nuggets_12",
    brand: "Chick-fil-A",
    name: "Nuggets",
    portionLabel: "12 ct",
    approxGrams: 170,
    perItem: { calories: 370, protein_g: 40, carbs_g: 17, fat_g: 16, sat_fat_g: 3.5, sodium_mg: 1810, cholesterol_mg: 125, sugar_g: 1 },
  },
  {
    id: "cfa_nuggets_30",
    brand: "Chick-fil-A",
    name: "Nuggets",
    aliases: ["cfa 30 nuggets"],
    portionLabel: "30 ct",
    approxGrams: 425,
    perItem: { calories: 940, protein_g: 100, carbs_g: 41, fat_g: 41, sat_fat_g: 9, sodium_mg: 4540, cholesterol_mg: 315, sugar_g: 2 },
  },
  {
    id: "cfa_chicken_sandwich",
    brand: "Chick-fil-A",
    name: "Original Chicken Sandwich",
    aliases: ["cfa sandwich"],
    portionLabel: "1 sandwich",
    approxGrams: 183,
    perItem: { calories: 420, protein_g: 28, carbs_g: 41, fat_g: 16, sat_fat_g: 3.5, sodium_mg: 1400, cholesterol_mg: 60, fiber_g: 2, sugar_g: 6 },
  },
  {
    id: "cfa_spicy_sandwich",
    brand: "Chick-fil-A",
    name: "Spicy Chicken Sandwich",
    portionLabel: "1 sandwich",
    approxGrams: 183,
    perItem: { calories: 450, protein_g: 28, carbs_g: 42, fat_g: 17, sat_fat_g: 4, sodium_mg: 1530, cholesterol_mg: 60, fiber_g: 2, sugar_g: 6 },
  },
  {
    id: "cfa_grilled_chicken_sandwich",
    brand: "Chick-fil-A",
    name: "Grilled Chicken Sandwich",
    portionLabel: "1 sandwich",
    approxGrams: 232,
    perItem: { calories: 380, protein_g: 28, carbs_g: 41, fat_g: 11, sat_fat_g: 2, sodium_mg: 750, cholesterol_mg: 80, fiber_g: 5, sugar_g: 9 },
  },
  {
    id: "cfa_waffle_fries_med",
    brand: "Chick-fil-A",
    name: "Waffle Potato Fries",
    aliases: ["cfa fries", "waffle fries"],
    portionLabel: "Medium",
    approxGrams: 125,
    perItem: { calories: 360, protein_g: 4, carbs_g: 47, fat_g: 16, sat_fat_g: 2.5, sodium_mg: 270, fiber_g: 6, sugar_g: 0 },
  },
  {
    id: "cfa_mac_n_cheese_med",
    brand: "Chick-fil-A",
    name: "Mac & Cheese",
    portionLabel: "Medium",
    approxGrams: 218,
    perItem: { calories: 450, protein_g: 19, carbs_g: 31, fat_g: 26, sat_fat_g: 13, sodium_mg: 1320, cholesterol_mg: 60 },
  },
  // Sauces
  {
    id: "cfa_sauce_cfa",
    brand: "Chick-fil-A",
    name: "Chick-fil-A Sauce",
    aliases: ["cfa sauce"],
    portionLabel: "1 packet",
    approxGrams: 28,
    perItem: { calories: 140, protein_g: 0, carbs_g: 6, fat_g: 13, sat_fat_g: 2, sodium_mg: 170, sugar_g: 6, added_sugar_g: 5 },
  },
  {
    id: "cfa_sauce_polynesian",
    brand: "Chick-fil-A",
    name: "Polynesian Sauce",
    aliases: ["cfa polynesian"],
    portionLabel: "1 packet",
    approxGrams: 28,
    perItem: { calories: 110, protein_g: 0, carbs_g: 14, fat_g: 6, sodium_mg: 220, sugar_g: 13, added_sugar_g: 13 },
  },
  {
    id: "cfa_sauce_honey_mustard",
    brand: "Chick-fil-A",
    name: "Honey Mustard Sauce",
    portionLabel: "1 packet",
    approxGrams: 28,
    perItem: { calories: 50, protein_g: 0, carbs_g: 12, fat_g: 0.5, sodium_mg: 180, sugar_g: 10, added_sugar_g: 10 },
  },
  {
    id: "cfa_sauce_bbq",
    brand: "Chick-fil-A",
    name: "Barbeque Sauce",
    aliases: ["cfa bbq"],
    portionLabel: "1 packet",
    approxGrams: 28,
    perItem: { calories: 50, protein_g: 0, carbs_g: 11, fat_g: 0, sodium_mg: 260, sugar_g: 10, added_sugar_g: 10 },
  },
  {
    id: "cfa_sauce_buffalo",
    brand: "Chick-fil-A",
    name: "Buffalo Sauce",
    portionLabel: "1 packet",
    approxGrams: 28,
    perItem: { calories: 15, protein_g: 0, carbs_g: 0, fat_g: 1.5, sodium_mg: 460 },
  },
  {
    id: "cfa_sauce_ranch",
    brand: "Chick-fil-A",
    name: "Garden Herb Ranch Sauce",
    aliases: ["cfa ranch"],
    portionLabel: "1 packet",
    approxGrams: 28,
    perItem: { calories: 140, protein_g: 0, carbs_g: 3, fat_g: 14, sat_fat_g: 2, sodium_mg: 280 },
  },
  {
    id: "cfa_sauce_zesty_buffalo",
    brand: "Chick-fil-A",
    name: "Zesty Buffalo Sauce",
    portionLabel: "1 packet",
    approxGrams: 28,
    perItem: { calories: 70, protein_g: 0, carbs_g: 1, fat_g: 7, sat_fat_g: 1, sodium_mg: 380 },
  },
  {
    id: "cfa_sauce_sriracha",
    brand: "Chick-fil-A",
    name: "Sriracha Sauce",
    portionLabel: "1 packet",
    approxGrams: 28,
    perItem: { calories: 25, protein_g: 0, carbs_g: 5, fat_g: 0.5, sodium_mg: 250, sugar_g: 4, added_sugar_g: 4 },
  },

  // ─── McDonald's ───────────────────────────────────────────────────
  {
    id: "mcd_big_mac",
    brand: "McDonald's",
    name: "Big Mac",
    aliases: ["bigmac"],
    portionLabel: "1 sandwich",
    approxGrams: 219,
    perItem: { calories: 590, protein_g: 25, carbs_g: 46, fat_g: 33, sat_fat_g: 11, sodium_mg: 1010, cholesterol_mg: 85, fiber_g: 3, sugar_g: 9 },
  },
  {
    id: "mcd_mcdouble",
    brand: "McDonald's",
    name: "McDouble",
    portionLabel: "1 sandwich",
    approxGrams: 135,
    perItem: { calories: 400, protein_g: 22, carbs_g: 33, fat_g: 20, sat_fat_g: 9, sodium_mg: 920, cholesterol_mg: 65, fiber_g: 2, sugar_g: 7 },
  },
  {
    id: "mcd_quarter_pounder",
    brand: "McDonald's",
    name: "Quarter Pounder with Cheese",
    portionLabel: "1 sandwich",
    approxGrams: 199,
    perItem: { calories: 520, protein_g: 30, carbs_g: 42, fat_g: 26, sat_fat_g: 12, sodium_mg: 1140, cholesterol_mg: 95, fiber_g: 3, sugar_g: 10 },
  },
  {
    id: "mcd_mcchicken",
    brand: "McDonald's",
    name: "McChicken",
    portionLabel: "1 sandwich",
    approxGrams: 144,
    perItem: { calories: 400, protein_g: 14, carbs_g: 39, fat_g: 21, sat_fat_g: 3.5, sodium_mg: 560, cholesterol_mg: 40, fiber_g: 2, sugar_g: 5 },
  },
  {
    id: "mcd_mcnuggets_10",
    brand: "McDonald's",
    name: "Chicken McNuggets",
    aliases: ["mcnuggets"],
    portionLabel: "10 ct",
    approxGrams: 162,
    perItem: { calories: 410, protein_g: 23, carbs_g: 25, fat_g: 25, sat_fat_g: 4, sodium_mg: 800, cholesterol_mg: 60, sugar_g: 0 },
  },
  {
    id: "mcd_mcnuggets_20",
    brand: "McDonald's",
    name: "Chicken McNuggets",
    portionLabel: "20 ct",
    approxGrams: 324,
    perItem: { calories: 830, protein_g: 47, carbs_g: 50, fat_g: 50, sat_fat_g: 8, sodium_mg: 1610, cholesterol_mg: 120 },
  },
  {
    id: "mcd_fries_med",
    brand: "McDonald's",
    name: "World Famous Fries",
    aliases: ["mcdonalds fries"],
    portionLabel: "Medium",
    approxGrams: 117,
    perItem: { calories: 320, protein_g: 4, carbs_g: 43, fat_g: 15, sat_fat_g: 2, sodium_mg: 260, fiber_g: 4, sugar_g: 0 },
  },

  // ─── Chipotle ─────────────────────────────────────────────────────
  {
    id: "chipotle_chicken_4oz",
    brand: "Chipotle",
    name: "Chicken",
    aliases: ["chipotle chicken"],
    portionLabel: "4 oz scoop",
    approxGrams: 113,
    perItem: { calories: 180, protein_g: 32, carbs_g: 0, fat_g: 7, sat_fat_g: 2.5, sodium_mg: 310, cholesterol_mg: 130 },
  },
  {
    id: "chipotle_steak_4oz",
    brand: "Chipotle",
    name: "Steak",
    portionLabel: "4 oz scoop",
    approxGrams: 113,
    perItem: { calories: 150, protein_g: 21, carbs_g: 1, fat_g: 6, sat_fat_g: 2, sodium_mg: 330, cholesterol_mg: 65 },
  },
  {
    id: "chipotle_carnitas_4oz",
    brand: "Chipotle",
    name: "Carnitas",
    portionLabel: "4 oz scoop",
    approxGrams: 113,
    perItem: { calories: 210, protein_g: 23, carbs_g: 0, fat_g: 12, sat_fat_g: 4, sodium_mg: 450, cholesterol_mg: 80 },
  },
  {
    id: "chipotle_barbacoa_4oz",
    brand: "Chipotle",
    name: "Barbacoa",
    portionLabel: "4 oz scoop",
    approxGrams: 113,
    perItem: { calories: 170, protein_g: 24, carbs_g: 1, fat_g: 7, sat_fat_g: 2.5, sodium_mg: 530, cholesterol_mg: 65 },
  },
  {
    id: "chipotle_sofritas_4oz",
    brand: "Chipotle",
    name: "Sofritas",
    portionLabel: "4 oz scoop",
    approxGrams: 113,
    perItem: { calories: 150, protein_g: 8, carbs_g: 9, fat_g: 10, sat_fat_g: 1.5, sodium_mg: 555, fiber_g: 3 },
  },
  {
    id: "chipotle_white_rice",
    brand: "Chipotle",
    name: "White Rice",
    portionLabel: "4 oz scoop",
    approxGrams: 113,
    perItem: { calories: 210, protein_g: 4, carbs_g: 40, fat_g: 4, sodium_mg: 350, fiber_g: 0 },
  },
  {
    id: "chipotle_brown_rice",
    brand: "Chipotle",
    name: "Brown Rice",
    portionLabel: "4 oz scoop",
    approxGrams: 113,
    perItem: { calories: 210, protein_g: 4, carbs_g: 36, fat_g: 5, sodium_mg: 295, fiber_g: 4 },
  },
  {
    id: "chipotle_black_beans",
    brand: "Chipotle",
    name: "Black Beans",
    portionLabel: "4 oz scoop",
    approxGrams: 113,
    perItem: { calories: 130, protein_g: 8, carbs_g: 22, fat_g: 1.5, sodium_mg: 210, fiber_g: 7 },
  },
  {
    id: "chipotle_pinto_beans",
    brand: "Chipotle",
    name: "Pinto Beans",
    portionLabel: "4 oz scoop",
    approxGrams: 113,
    perItem: { calories: 130, protein_g: 8, carbs_g: 22, fat_g: 1.5, sodium_mg: 250, fiber_g: 7 },
  },
  {
    id: "chipotle_fajita_veg",
    brand: "Chipotle",
    name: "Fajita Vegetables",
    portionLabel: "2.5 oz scoop",
    approxGrams: 71,
    perItem: { calories: 20, protein_g: 1, carbs_g: 4, fat_g: 0, sodium_mg: 150, fiber_g: 1 },
  },
  {
    id: "chipotle_guac",
    brand: "Chipotle",
    name: "Guacamole",
    portionLabel: "4 oz",
    approxGrams: 113,
    perItem: { calories: 230, protein_g: 3, carbs_g: 8, fat_g: 22, sat_fat_g: 3, sodium_mg: 370, fiber_g: 6 },
  },
  {
    id: "chipotle_queso",
    brand: "Chipotle",
    name: "Queso Blanco",
    portionLabel: "4 oz",
    approxGrams: 113,
    perItem: { calories: 240, protein_g: 8, carbs_g: 12, fat_g: 18, sat_fat_g: 9, sodium_mg: 600 },
  },
  {
    id: "chipotle_cheese",
    brand: "Chipotle",
    name: "Cheese",
    portionLabel: "1 oz",
    approxGrams: 28,
    perItem: { calories: 110, protein_g: 7, carbs_g: 0, fat_g: 8, sat_fat_g: 5, sodium_mg: 180, cholesterol_mg: 25 },
  },
  {
    id: "chipotle_sour_cream",
    brand: "Chipotle",
    name: "Sour Cream",
    portionLabel: "2 oz",
    approxGrams: 57,
    perItem: { calories: 110, protein_g: 2, carbs_g: 2, fat_g: 9, sat_fat_g: 7, sodium_mg: 30, cholesterol_mg: 35 },
  },

  // ─── Starbucks ────────────────────────────────────────────────────
  {
    id: "sbux_grande_latte_2",
    brand: "Starbucks",
    name: "Caffè Latte (2% milk)",
    aliases: ["sbux latte"],
    portionLabel: "Grande (16 oz)",
    approxGrams: 473,
    perItem: { calories: 190, protein_g: 13, carbs_g: 19, sugar_g: 18, fat_g: 7, sat_fat_g: 4, sodium_mg: 150, calcium_mg: 350 },
  },
  {
    id: "sbux_grande_cappuccino",
    brand: "Starbucks",
    name: "Cappuccino (2% milk)",
    portionLabel: "Grande (16 oz)",
    approxGrams: 473,
    perItem: { calories: 140, protein_g: 9, carbs_g: 14, sugar_g: 13, fat_g: 5, sat_fat_g: 3, sodium_mg: 110 },
  },
  {
    id: "sbux_grande_caramel_macchiato",
    brand: "Starbucks",
    name: "Caramel Macchiato",
    portionLabel: "Grande (16 oz)",
    approxGrams: 473,
    perItem: { calories: 250, protein_g: 10, carbs_g: 35, sugar_g: 33, added_sugar_g: 24, fat_g: 7, sat_fat_g: 4.5, sodium_mg: 150 },
  },
  {
    id: "sbux_grande_psl",
    brand: "Starbucks",
    name: "Pumpkin Spice Latte (2% milk)",
    aliases: ["psl"],
    portionLabel: "Grande (16 oz)",
    approxGrams: 473,
    perItem: { calories: 390, protein_g: 14, carbs_g: 52, sugar_g: 50, added_sugar_g: 38, fat_g: 14, sat_fat_g: 8, sodium_mg: 230 },
  },
  {
    id: "sbux_grande_cold_brew",
    brand: "Starbucks",
    name: "Cold Brew (black)",
    portionLabel: "Grande (16 oz)",
    approxGrams: 473,
    perItem: { calories: 5, protein_g: 1, carbs_g: 0, fat_g: 0, sodium_mg: 10 },
  },
  {
    id: "sbux_grande_iced_coffee",
    brand: "Starbucks",
    name: "Iced Coffee (unsweet)",
    portionLabel: "Grande (16 oz)",
    approxGrams: 473,
    perItem: { calories: 5, protein_g: 1, carbs_g: 0, fat_g: 0 },
  },
];

export function chainSeedToFood(seed: ChainSeed): Food {
  return {
    id: seed.id,
    source: "chain",
    name: seed.name,
    brand: seed.brand,
    aliases: seed.aliases,
    servingSizeG: seed.approxGrams ?? 100,
    servingLabel: seed.portionLabel,
    servingOptions: [
      { label: seed.portionLabel, grams: seed.approxGrams ?? 100 },
    ],
    nutrients: seed.perItem,
    createdAt: 0,
  };
}

/**
 * Full published menus for major chains, authored in a per-serving shape.
 * Sourced from each chain's official nutrition data (numeric facts are not
 * copyrightable, Feist v. Rural). `nutrients` are for one `servingLabel`.
 */
export interface MenuSeed {
  id: string;
  brand: string;
  name: string;
  aliases?: string[];
  servingLabel: string;
  servingGrams: number;
  nutrients: Nutrients;
}

export const MENU_SEEDS: MenuSeed[] = [
  // ─── Chipotle (official US Nutrition Facts) ─────────────────────────
  { id: "chipotle_chicken", brand: "Chipotle", name: "Chicken", aliases: ["chipotle chicken", "grilled chicken"], servingLabel: "4 oz serving", servingGrams: 113, nutrients: { calories: 180, protein_g: 32, carbs_g: 0, fat_g: 7, sat_fat_g: 3, trans_fat_g: 0, cholesterol_mg: 125, sodium_mg: 310, fiber_g: 0, sugar_g: 0 } },
  { id: "chipotle_steak", brand: "Chipotle", name: "Steak", aliases: ["chipotle steak"], servingLabel: "4 oz serving", servingGrams: 113, nutrients: { calories: 150, protein_g: 21, carbs_g: 1, fat_g: 6, sat_fat_g: 2.5, trans_fat_g: 0, cholesterol_mg: 80, sodium_mg: 330, sugar_g: 1 } },
  { id: "chipotle_barbacoa", brand: "Chipotle", name: "Barbacoa", aliases: ["chipotle barbacoa", "shredded beef"], servingLabel: "4 oz serving", servingGrams: 113, nutrients: { calories: 170, protein_g: 24, carbs_g: 2, fat_g: 7, sat_fat_g: 2.5, trans_fat_g: 0, cholesterol_mg: 65, sodium_mg: 530, fiber_g: 1, sugar_g: 0 } },
  { id: "chipotle_carnitas", brand: "Chipotle", name: "Carnitas", aliases: ["chipotle carnitas", "shredded pork"], servingLabel: "4 oz serving", servingGrams: 113, nutrients: { calories: 210, protein_g: 23, carbs_g: 0, fat_g: 12, sat_fat_g: 7, trans_fat_g: 0, cholesterol_mg: 65, sodium_mg: 450, fiber_g: 0, sugar_g: 0 } },
  { id: "chipotle_sofritas", brand: "Chipotle", name: "Sofritas", aliases: ["chipotle sofritas", "tofu", "plant protein"], servingLabel: "4 oz serving", servingGrams: 113, nutrients: { calories: 150, protein_g: 8, carbs_g: 9, fat_g: 10, sat_fat_g: 1.5, trans_fat_g: 0, cholesterol_mg: 0, sodium_mg: 560, fiber_g: 3, sugar_g: 5 } },
  { id: "chipotle_white_rice", brand: "Chipotle", name: "White Cilantro-Lime Rice", aliases: ["white rice", "cilantro lime white rice"], servingLabel: "4 oz serving", servingGrams: 113, nutrients: { calories: 210, protein_g: 4, carbs_g: 40, fat_g: 4, sat_fat_g: 1, trans_fat_g: 0, cholesterol_mg: 0, sodium_mg: 350, fiber_g: 1, sugar_g: 0 } },
  { id: "chipotle_brown_rice", brand: "Chipotle", name: "Brown Cilantro-Lime Rice", aliases: ["brown rice", "cilantro lime brown rice"], servingLabel: "4 oz serving", servingGrams: 113, nutrients: { calories: 210, protein_g: 4, carbs_g: 36, fat_g: 6, sat_fat_g: 0, trans_fat_g: 0, cholesterol_mg: 0, sodium_mg: 190, fiber_g: 2, sugar_g: 0 } },
  { id: "chipotle_black_beans", brand: "Chipotle", name: "Black Beans", aliases: ["black beans"], servingLabel: "4 oz serving", servingGrams: 113, nutrients: { calories: 130, protein_g: 8, carbs_g: 22, fat_g: 1.5, sat_fat_g: 0, trans_fat_g: 0, cholesterol_mg: 0, sodium_mg: 210, fiber_g: 7, sugar_g: 2 } },
  { id: "chipotle_pinto_beans", brand: "Chipotle", name: "Pinto Beans", aliases: ["pinto beans"], servingLabel: "4 oz serving", servingGrams: 113, nutrients: { calories: 130, protein_g: 8, carbs_g: 21, fat_g: 1.5, sat_fat_g: 0, trans_fat_g: 0, cholesterol_mg: 0, sodium_mg: 210, fiber_g: 8, sugar_g: 1 } },
  { id: "chipotle_fresh_tomato_salsa", brand: "Chipotle", name: "Fresh Tomato Salsa", aliases: ["fresh tomato salsa", "mild salsa", "pico de gallo"], servingLabel: "4 oz serving", servingGrams: 113, nutrients: { calories: 25, protein_g: 0, carbs_g: 4, fat_g: 0, sat_fat_g: 0, trans_fat_g: 0, cholesterol_mg: 0, sodium_mg: 550, fiber_g: 1, sugar_g: 1 } },
  { id: "chipotle_roasted_chili_corn_salsa", brand: "Chipotle", name: "Roasted Chili-Corn Salsa", aliases: ["roasted chili corn salsa", "corn salsa"], servingLabel: "4 oz serving", servingGrams: 113, nutrients: { calories: 80, protein_g: 3, carbs_g: 16, fat_g: 1.5, sat_fat_g: 0, trans_fat_g: 0, cholesterol_mg: 0, sodium_mg: 330, fiber_g: 3, sugar_g: 4 } },
  { id: "chipotle_tomatillo_green_chili_salsa", brand: "Chipotle", name: "Tomatillo Green-Chili Salsa", aliases: ["tomatillo green chili salsa", "green salsa", "mild green"], servingLabel: "2 fl oz serving", servingGrams: 60, nutrients: { calories: 15, protein_g: 0, carbs_g: 4, fat_g: 0, sat_fat_g: 0, trans_fat_g: 0, cholesterol_mg: 0, sodium_mg: 260, fiber_g: 0, sugar_g: 2 } },
  { id: "chipotle_tomatillo_red_chili_salsa", brand: "Chipotle", name: "Tomatillo Red-Chili Salsa", aliases: ["tomatillo red chili salsa", "red salsa", "hot salsa"], servingLabel: "2 fl oz serving", servingGrams: 60, nutrients: { calories: 30, protein_g: 0, carbs_g: 4, fat_g: 0, sat_fat_g: 0, trans_fat_g: 0, cholesterol_mg: 0, sodium_mg: 500, fiber_g: 1, sugar_g: 0 } },
  { id: "chipotle_fajita_veggies", brand: "Chipotle", name: "Fajita Veggies", aliases: ["fajita vegetables", "fajita veggies", "peppers and onions"], servingLabel: "2 oz serving", servingGrams: 57, nutrients: { calories: 20, protein_g: 1, carbs_g: 5, fat_g: 0, sat_fat_g: 0, trans_fat_g: 0, cholesterol_mg: 0, sodium_mg: 150, fiber_g: 1, sugar_g: 2 } },
  { id: "chipotle_romaine_lettuce", brand: "Chipotle", name: "Romaine Lettuce", aliases: ["romaine lettuce", "lettuce"], servingLabel: "1 oz serving", servingGrams: 28, nutrients: { calories: 5, protein_g: 0, carbs_g: 1, fat_g: 0, sat_fat_g: 0, trans_fat_g: 0, cholesterol_mg: 0, sodium_mg: 0, fiber_g: 1, sugar_g: 0 } },
  { id: "chipotle_cheese", brand: "Chipotle", name: "Cheese", aliases: ["cheese", "shredded cheese", "monterey jack"], servingLabel: "1 oz serving", servingGrams: 28, nutrients: { calories: 110, protein_g: 6, carbs_g: 1, fat_g: 8, sat_fat_g: 5, trans_fat_g: 0, cholesterol_mg: 30, sodium_mg: 190, fiber_g: 0, sugar_g: 0 } },
  { id: "chipotle_sour_cream", brand: "Chipotle", name: "Sour Cream", aliases: ["sour cream"], servingLabel: "2 oz serving", servingGrams: 57, nutrients: { calories: 110, protein_g: 2, carbs_g: 2, fat_g: 9, sat_fat_g: 7, trans_fat_g: 0, cholesterol_mg: 40, sodium_mg: 30, fiber_g: 0, sugar_g: 2 } },
  { id: "chipotle_guacamole", brand: "Chipotle", name: "Guacamole", aliases: ["guacamole", "guac"], servingLabel: "4 oz serving", servingGrams: 113, nutrients: { calories: 230, protein_g: 2, carbs_g: 8, fat_g: 22, sat_fat_g: 3.5, trans_fat_g: 0, cholesterol_mg: 0, sodium_mg: 370, fiber_g: 6, sugar_g: 1 } },
  { id: "chipotle_queso_blanco", brand: "Chipotle", name: "Queso Blanco", aliases: ["queso blanco", "queso"], servingLabel: "2 oz serving", servingGrams: 57, nutrients: { calories: 120, protein_g: 5, carbs_g: 4, fat_g: 9, sat_fat_g: 6, trans_fat_g: 0, cholesterol_mg: 30, sodium_mg: 250, fiber_g: 0, sugar_g: 1 } },
  { id: "chipotle_flour_tortilla_burrito", brand: "Chipotle", name: "Flour Tortilla (Burrito)", aliases: ["flour tortilla", "burrito tortilla"], servingLabel: "1 tortilla", servingGrams: 91, nutrients: { calories: 320, protein_g: 8, carbs_g: 50, fat_g: 9, sat_fat_g: 0.5, trans_fat_g: 0, cholesterol_mg: 0, sodium_mg: 600, fiber_g: 3, sugar_g: 0 } },
  { id: "chipotle_crispy_corn_taco_shells_3", brand: "Chipotle", name: "Crispy Corn Taco Shells (3)", aliases: ["crispy corn tacos", "hard taco shells", "crispy corn tortilla"], servingLabel: "3 shells", servingGrams: 63, nutrients: { calories: 210, protein_g: 3, carbs_g: 30, fat_g: 9, sat_fat_g: 0, trans_fat_g: 0, cholesterol_mg: 0, sodium_mg: 0, fiber_g: 3, sugar_g: 0 } },
  { id: "chipotle_soft_flour_taco_tortillas_3", brand: "Chipotle", name: "Soft Flour Taco Tortillas (3)", aliases: ["soft flour tacos", "flour taco tortilla", "soft tacos"], servingLabel: "3 tortillas", servingGrams: 90, nutrients: { calories: 240, protein_g: 6, carbs_g: 39, fat_g: 7.5, sat_fat_g: 0, trans_fat_g: 0, cholesterol_mg: 0, sodium_mg: 480, sugar_g: 0 } },
  { id: "chipotle_chips", brand: "Chipotle", name: "Chips", aliases: ["chips", "tortilla chips"], servingLabel: "4 oz (serves 2)", servingGrams: 113, nutrients: { calories: 540, protein_g: 7, carbs_g: 73, fat_g: 25, sat_fat_g: 3.5, trans_fat_g: 0, cholesterol_mg: 0, sodium_mg: 390, fiber_g: 7, sugar_g: 1 } },
  { id: "chipotle_chips_large", brand: "Chipotle", name: "Large Chips", aliases: ["large chips", "big chips"], servingLabel: "6 oz (serves 3)", servingGrams: 170, nutrients: { calories: 810, protein_g: 11, carbs_g: 110, fat_g: 38, sat_fat_g: 5, trans_fat_g: 0, cholesterol_mg: 0, sodium_mg: 590, fiber_g: 11, sugar_g: 2 } },
  { id: "chipotle_chips_and_guac", brand: "Chipotle", name: "Chips & Guacamole", aliases: ["chips and guac", "chips and guacamole"], servingLabel: "regular (chips 4 oz + guac 4 oz)", servingGrams: 226, nutrients: { calories: 770, protein_g: 9, carbs_g: 81, fat_g: 47, sat_fat_g: 7, trans_fat_g: 0, cholesterol_mg: 0, sodium_mg: 760, fiber_g: 13, sugar_g: 2 } },
  { id: "chipotle_chips_and_queso", brand: "Chipotle", name: "Chips & Queso Blanco", aliases: ["chips and queso", "chips and queso blanco"], servingLabel: "regular (chips 4 oz + queso 4 oz)", servingGrams: 226, nutrients: { calories: 780, protein_g: 17, carbs_g: 80, fat_g: 43, sat_fat_g: 15.5, trans_fat_g: 1, cholesterol_mg: 60, sodium_mg: 880, fiber_g: 7, sugar_g: 3 } },

  // ─── Chick-fil-A (official US menu) ──────────────────────────────────
  { id: "cfa_deluxe_sandwich", brand: "Chick-fil-A", name: "Deluxe Sandwich", aliases: ["cfa deluxe", "chick-fil-a deluxe"], servingLabel: "1 sandwich", servingGrams: 208, nutrients: { calories: 490, protein_g: 32, carbs_g: 43, fat_g: 22, sat_fat_g: 6, trans_fat_g: 0, cholesterol_mg: 85, sodium_mg: 1700, fiber_g: 1, sugar_g: 7 } },
  { id: "cfa_spicy_deluxe_sandwich", brand: "Chick-fil-A", name: "Spicy Deluxe Sandwich", aliases: ["cfa spicy deluxe", "spicy deluxe"], servingLabel: "1 sandwich", servingGrams: 208, nutrients: { calories: 540, protein_g: 34, carbs_g: 47, fat_g: 26, sat_fat_g: 8, trans_fat_g: 0, cholesterol_mg: 85, sodium_mg: 1880, fiber_g: 2, sugar_g: 7 } },
  { id: "cfa_grilled_chicken_sandwich", brand: "Chick-fil-A", name: "Grilled Chicken Sandwich", aliases: ["cfa grilled sandwich", "grilled chicken sandwich"], servingLabel: "1 sandwich", servingGrams: 200, nutrients: { calories: 390, protein_g: 28, carbs_g: 45, fat_g: 11, sat_fat_g: 2.5, trans_fat_g: 0, cholesterol_mg: 75, sodium_mg: 765, fiber_g: 3, sugar_g: 11 } },
  { id: "cfa_grilled_chicken_club", brand: "Chick-fil-A", name: "Grilled Chicken Club Sandwich", aliases: ["cfa grilled club", "grilled chicken club"], servingLabel: "1 sandwich", servingGrams: 250, nutrients: { calories: 520, protein_g: 37, carbs_g: 45, fat_g: 22, sat_fat_g: 8, trans_fat_g: 0, cholesterol_mg: 105, sodium_mg: 1055, fiber_g: 3, sugar_g: 12 } },
  { id: "cfa_chick_n_strips_3ct", brand: "Chick-fil-A", name: "Chick-n-Strips (3 ct)", aliases: ["cfa strips 3", "chick-n-strips 3 count"], servingLabel: "3 strips", servingGrams: 136, nutrients: { calories: 310, protein_g: 29, carbs_g: 16, fat_g: 14, sat_fat_g: 2.5, trans_fat_g: 0, cholesterol_mg: 75, sodium_mg: 870, fiber_g: 0, sugar_g: 2 } },
  { id: "cfa_chick_n_strips_4ct", brand: "Chick-fil-A", name: "Chick-n-Strips (4 ct)", aliases: ["cfa strips 4", "chick-n-strips 4 count"], servingLabel: "4 strips", servingGrams: 181, nutrients: { calories: 410, protein_g: 39, carbs_g: 22, fat_g: 19 } },
  { id: "cfa_cool_wrap", brand: "Chick-fil-A", name: "Cool Wrap", aliases: ["cfa cool wrap"], servingLabel: "1 wrap", servingGrams: 320, nutrients: { calories: 660, protein_g: 43, carbs_g: 32, fat_g: 45, sat_fat_g: 9, trans_fat_g: 0, cholesterol_mg: 110, sodium_mg: 1420, fiber_g: 14, sugar_g: 5 } },
  { id: "cfa_grilled_cool_wrap", brand: "Chick-fil-A", name: "Grilled Cool Wrap", aliases: ["cfa grilled cool wrap", "grilled chicken cool wrap"], servingLabel: "1 wrap", servingGrams: 290, nutrients: { calories: 350, protein_g: 42, carbs_g: 29, fat_g: 13, sat_fat_g: 4, trans_fat_g: 0, cholesterol_mg: 85, sodium_mg: 900, fiber_g: 13, sugar_g: 4 } },
  { id: "cfa_chicken_biscuit", brand: "Chick-fil-A", name: "Chicken Biscuit", aliases: ["cfa chicken biscuit"], servingLabel: "1 biscuit", servingGrams: 153, nutrients: { calories: 460, protein_g: 19, carbs_g: 45, fat_g: 23, sat_fat_g: 8, trans_fat_g: 0, cholesterol_mg: 45, sodium_mg: 1510, fiber_g: 2, sugar_g: 6 } },
  { id: "cfa_spicy_chicken_biscuit", brand: "Chick-fil-A", name: "Spicy Chicken Biscuit", aliases: ["cfa spicy biscuit"], servingLabel: "1 biscuit", servingGrams: 153, nutrients: { calories: 450, protein_g: 19, carbs_g: 44, fat_g: 22, sat_fat_g: 8, trans_fat_g: 0, cholesterol_mg: 40, sodium_mg: 1570, fiber_g: 3, sugar_g: 5 } },
  { id: "cfa_chicken_egg_cheese_biscuit", brand: "Chick-fil-A", name: "Chicken, Egg & Cheese Biscuit", aliases: ["cfa chicken egg cheese biscuit"], servingLabel: "1 biscuit", servingGrams: 200, nutrients: { calories: 550, protein_g: 27, carbs_g: 48, fat_g: 28, sat_fat_g: 12, trans_fat_g: 0, cholesterol_mg: 215, sodium_mg: 1870, fiber_g: 3, sugar_g: 7 } },
  { id: "cfa_bacon_egg_cheese_biscuit", brand: "Chick-fil-A", name: "Bacon, Egg & Cheese Biscuit", aliases: ["cfa bacon egg cheese biscuit"], servingLabel: "1 biscuit", servingGrams: 145, nutrients: { calories: 420, protein_g: 15, carbs_g: 38, fat_g: 23, sat_fat_g: 11, trans_fat_g: 0, cholesterol_mg: 180, sodium_mg: 1220, fiber_g: 2, sugar_g: 4 } },
  { id: "cfa_hash_brown_scramble_bowl", brand: "Chick-fil-A", name: "Hash Brown Scramble Bowl (w/ Nuggets)", aliases: ["cfa scramble bowl", "hash brown scramble bowl"], servingLabel: "1 bowl", servingGrams: 233, nutrients: { calories: 470, protein_g: 29, carbs_g: 19, fat_g: 30 } },
  { id: "cfa_hash_brown_scramble_burrito", brand: "Chick-fil-A", name: "Hash Brown Scramble Burrito (w/ Nuggets)", aliases: ["cfa scramble burrito", "hash brown scramble burrito"], servingLabel: "1 burrito", servingGrams: 245, nutrients: { calories: 700, protein_g: 34, carbs_g: 51, fat_g: 40, sat_fat_g: 12, trans_fat_g: 0.5, cholesterol_mg: 415, sodium_mg: 1770, fiber_g: 3, sugar_g: 2 } },
  { id: "cfa_hash_browns", brand: "Chick-fil-A", name: "Hash Browns", aliases: ["cfa hash browns"], servingLabel: "1 serving", servingGrams: 80, nutrients: { calories: 270, protein_g: 3, carbs_g: 23, fat_g: 18, sat_fat_g: 2.5, trans_fat_g: 0, cholesterol_mg: 0, sodium_mg: 440, fiber_g: 3, sugar_g: 0 } },
  { id: "cfa_egg_white_grill", brand: "Chick-fil-A", name: "Egg White Grill", aliases: ["cfa egg white grill"], servingLabel: "1 sandwich", servingGrams: 156, nutrients: { calories: 300, protein_g: 27, carbs_g: 29, fat_g: 8, sat_fat_g: 4, trans_fat_g: 0, cholesterol_mg: 65, sodium_mg: 990, fiber_g: 1, sugar_g: 2 } },
  { id: "cfa_berry_parfait", brand: "Chick-fil-A", name: "Berry Parfait (w/ Granola)", aliases: ["cfa parfait", "greek yogurt parfait", "berry parfait"], servingLabel: "1 parfait", servingGrams: 215, nutrients: { calories: 270, protein_g: 13, carbs_g: 35, fat_g: 9 } },
  { id: "cfa_bacon_egg_cheese_muffin", brand: "Chick-fil-A", name: "Bacon, Egg & Cheese Muffin", aliases: ["cfa bacon egg cheese muffin", "english muffin bacon"], servingLabel: "1 sandwich", servingGrams: 135, nutrients: { calories: 300, protein_g: 16, carbs_g: 28, fat_g: 13, sat_fat_g: 6, trans_fat_g: 0, cholesterol_mg: 180, sodium_mg: 780, fiber_g: 1, sugar_g: 2 } },
  { id: "cfa_chicken_egg_cheese_muffin", brand: "Chick-fil-A", name: "Chicken, Egg & Cheese Muffin", aliases: ["cfa chicken egg cheese muffin", "english muffin chicken"], servingLabel: "1 sandwich", servingGrams: 180, nutrients: { calories: 410, protein_g: 27, carbs_g: 36, fat_g: 18, sat_fat_g: 6, trans_fat_g: 0, cholesterol_mg: 215, sodium_mg: 1320, fiber_g: 1, sugar_g: 4 } },
  { id: "cfa_waffle_fries_small", brand: "Chick-fil-A", name: "Waffle Potato Fries (Small)", aliases: ["cfa small fries"], servingLabel: "small", servingGrams: 85, nutrients: { calories: 320, protein_g: 4, carbs_g: 35, fat_g: 19 } },
  { id: "cfa_waffle_fries_medium", brand: "Chick-fil-A", name: "Waffle Potato Fries (Medium)", aliases: ["cfa medium fries", "waffle fries"], servingLabel: "medium", servingGrams: 125, nutrients: { calories: 420, protein_g: 5, carbs_g: 45, fat_g: 24, sat_fat_g: 4, trans_fat_g: 0, cholesterol_mg: 0, sodium_mg: 240, fiber_g: 5, sugar_g: 1 } },
  { id: "cfa_waffle_fries_large", brand: "Chick-fil-A", name: "Waffle Potato Fries (Large)", aliases: ["cfa large fries"], servingLabel: "large", servingGrams: 180, nutrients: { calories: 600, protein_g: 7, carbs_g: 65, fat_g: 35 } },
  { id: "cfa_mac_and_cheese_small", brand: "Chick-fil-A", name: "Mac & Cheese (Small)", aliases: ["cfa small mac"], servingLabel: "small", servingGrams: 136, nutrients: { calories: 270, protein_g: 12, carbs_g: 17, fat_g: 17 } },
  { id: "cfa_mac_and_cheese_medium", brand: "Chick-fil-A", name: "Mac & Cheese (Medium)", aliases: ["cfa mac and cheese", "mac and cheese"], servingLabel: "medium", servingGrams: 227, nutrients: { calories: 450, protein_g: 20, carbs_g: 28, fat_g: 29, sat_fat_g: 16, trans_fat_g: 0, cholesterol_mg: 70, sodium_mg: 1190, fiber_g: 3, sugar_g: 3 } },
  { id: "cfa_mac_and_cheese_large", brand: "Chick-fil-A", name: "Mac & Cheese (Large)", aliases: ["cfa large mac"], servingLabel: "large", servingGrams: 425, nutrients: { calories: 840, protein_g: 38, carbs_g: 53, fat_g: 53 } },
  { id: "cfa_side_salad", brand: "Chick-fil-A", name: "Side Salad (no dressing)", aliases: ["cfa side salad"], servingLabel: "1 salad", servingGrams: 124, nutrients: { calories: 160, protein_g: 6, carbs_g: 11, fat_g: 10, sodium_mg: 170, fiber_g: 3 } },
  { id: "cfa_fruit_cup", brand: "Chick-fil-A", name: "Fruit Cup (Medium)", aliases: ["cfa fruit cup", "fruit cup"], servingLabel: "medium", servingGrams: 124, nutrients: { calories: 70, protein_g: 1, carbs_g: 16, fat_g: 0, sat_fat_g: 0, trans_fat_g: 0, cholesterol_mg: 0, sodium_mg: 0, fiber_g: 2, sugar_g: 12 } },
  { id: "cfa_chicken_noodle_soup", brand: "Chick-fil-A", name: "Chicken Noodle Soup", aliases: ["cfa soup", "chicken noodle soup"], servingLabel: "1 cup", servingGrams: 244, nutrients: { calories: 190, protein_g: 11, carbs_g: 27, fat_g: 4.5, sat_fat_g: 1, trans_fat_g: 0, cholesterol_mg: 30, sodium_mg: 1290, fiber_g: 2, sugar_g: 2 } },
  { id: "cfa_kale_crunch_side", brand: "Chick-fil-A", name: "Kale Crunch Side", aliases: ["cfa kale crunch", "kale crunch"], servingLabel: "1 side", servingGrams: 88, nutrients: { calories: 170, protein_g: 4, carbs_g: 13, fat_g: 12, sat_fat_g: 1.5, trans_fat_g: 0, cholesterol_mg: 0, sodium_mg: 250, fiber_g: 4, sugar_g: 8 } },
  { id: "cfa_cobb_salad_grilled", brand: "Chick-fil-A", name: "Cobb Salad w/ Grilled Chicken (no dressing)", aliases: ["cfa cobb salad", "cobb salad"], servingLabel: "1 salad", servingGrams: 350, nutrients: { calories: 390, protein_g: 37, carbs_g: 20, fat_g: 19, sat_fat_g: 6, trans_fat_g: 0, cholesterol_mg: 150, sodium_mg: 850, fiber_g: 4, sugar_g: 5 } },
  { id: "cfa_spicy_southwest_salad_grilled", brand: "Chick-fil-A", name: "Spicy Southwest Salad w/ Grilled Chicken (no dressing)", aliases: ["cfa southwest salad", "spicy southwest salad"], servingLabel: "1 salad", servingGrams: 350, nutrients: { calories: 460, protein_g: 35, carbs_g: 37, fat_g: 20, sat_fat_g: 4, trans_fat_g: 0, cholesterol_mg: 70, sodium_mg: 750, fiber_g: 9, sugar_g: 8 } },
  { id: "cfa_market_salad_grilled", brand: "Chick-fil-A", name: "Market Salad w/ Grilled Chicken (no dressing)", aliases: ["cfa market salad", "market salad"], servingLabel: "1 salad", servingGrams: 330, nutrients: { calories: 330, protein_g: 28, carbs_g: 27, fat_g: 14, sat_fat_g: 3.5, trans_fat_g: 0, cholesterol_mg: 60, sodium_mg: 700, fiber_g: 5, sugar_g: 13 } },
  { id: "cfa_avocado_lime_ranch_dressing", brand: "Chick-fil-A", name: "Avocado Lime Ranch Dressing", aliases: ["cfa avocado lime ranch"], servingLabel: "1 packet", servingGrams: 57, nutrients: { calories: 310, protein_g: 1, carbs_g: 3, fat_g: 32 } },
  { id: "cfa_garden_herb_ranch_dressing", brand: "Chick-fil-A", name: "Garden Herb Ranch Dressing", aliases: ["cfa garden herb ranch", "garlic herb ranch"], servingLabel: "1 packet", servingGrams: 57, nutrients: { calories: 280, protein_g: 1, carbs_g: 2, fat_g: 29 } },
  { id: "cfa_zesty_apple_cider_vinaigrette", brand: "Chick-fil-A", name: "Zesty Apple Cider Vinaigrette Dressing", aliases: ["cfa apple cider vinaigrette"], servingLabel: "1 packet", servingGrams: 57, nutrients: { calories: 230, protein_g: 0, carbs_g: 16, fat_g: 19 } },
  { id: "cfa_light_italian_dressing", brand: "Chick-fil-A", name: "Light Italian Dressing", aliases: ["cfa light italian"], servingLabel: "1 packet", servingGrams: 43, nutrients: { calories: 25, protein_g: 0, carbs_g: 3, fat_g: 1 } },
  { id: "cfa_light_balsamic_vinaigrette", brand: "Chick-fil-A", name: "Light Balsamic Vinaigrette Dressing", aliases: ["cfa light balsamic"], servingLabel: "1 packet", servingGrams: 43, nutrients: { calories: 80, protein_g: 0, carbs_g: 10, fat_g: 4 } },
  { id: "cfa_fat_free_honey_mustard_dressing", brand: "Chick-fil-A", name: "Fat-Free Honey Mustard Dressing", aliases: ["cfa honey mustard dressing"], servingLabel: "1 packet", servingGrams: 43, nutrients: { calories: 90, protein_g: 0, carbs_g: 22, fat_g: 0 } },
  { id: "cfa_chocolate_chunk_cookie", brand: "Chick-fil-A", name: "Chocolate Chunk Cookie", aliases: ["cfa cookie", "chocolate chunk cookie"], servingLabel: "1 cookie", servingGrams: 80, nutrients: { calories: 370, protein_g: 5, carbs_g: 49, fat_g: 17, sat_fat_g: 9, trans_fat_g: 0, cholesterol_mg: 15, sodium_mg: 230, fiber_g: 3, sugar_g: 26 } },
  { id: "cfa_chocolate_fudge_brownie", brand: "Chick-fil-A", name: "Chocolate Fudge Brownie", aliases: ["cfa brownie", "chocolate fudge brownie"], servingLabel: "1 brownie", servingGrams: 76, nutrients: { calories: 370, protein_g: 4, carbs_g: 47, fat_g: 21, sat_fat_g: 8, trans_fat_g: 0, cholesterol_mg: 65, sodium_mg: 140, fiber_g: 2, sugar_g: 35 } },
  { id: "cfa_icedream_cone", brand: "Chick-fil-A", name: "Icedream Cone", aliases: ["cfa icedream cone", "ice dream cone"], servingLabel: "1 cone", servingGrams: 130, nutrients: { calories: 180, protein_g: 4, carbs_g: 32, fat_g: 4, sat_fat_g: 2.5, trans_fat_g: 0, cholesterol_mg: 15, sodium_mg: 90, fiber_g: 0, sugar_g: 25 } },
  { id: "cfa_icedream_cup", brand: "Chick-fil-A", name: "Icedream Cup", aliases: ["cfa icedream cup", "ice dream cup"], servingLabel: "1 cup", servingGrams: 110, nutrients: { calories: 140, protein_g: 4, carbs_g: 24, fat_g: 3.5, sat_fat_g: 2.5, trans_fat_g: 0, cholesterol_mg: 15, sodium_mg: 75, fiber_g: 0, sugar_g: 24 } },
  { id: "cfa_cookies_and_cream_milkshake", brand: "Chick-fil-A", name: "Cookies & Cream Milkshake (Small)", aliases: ["cfa cookies and cream shake"], servingLabel: "small", servingGrams: 425, nutrients: { calories: 630, protein_g: 13, carbs_g: 91, fat_g: 25, sat_fat_g: 15, trans_fat_g: 1, cholesterol_mg: 85, sodium_mg: 430, fiber_g: 1, sugar_g: 84 } },
  { id: "cfa_chocolate_milkshake", brand: "Chick-fil-A", name: "Chocolate Milkshake (Small)", aliases: ["cfa chocolate shake"], servingLabel: "small", servingGrams: 425, nutrients: { calories: 600, protein_g: 12, carbs_g: 93, fat_g: 22, sat_fat_g: 14, trans_fat_g: 1, cholesterol_mg: 85, sodium_mg: 350, fiber_g: 1, sugar_g: 90 } },
  { id: "cfa_vanilla_milkshake", brand: "Chick-fil-A", name: "Vanilla Milkshake (Small)", aliases: ["cfa vanilla shake"], servingLabel: "small", servingGrams: 425, nutrients: { calories: 580, protein_g: 13, carbs_g: 82, fat_g: 23, sat_fat_g: 15, trans_fat_g: 1, cholesterol_mg: 90, sodium_mg: 390, fiber_g: 1, sugar_g: 80 } },
  { id: "cfa_strawberry_milkshake", brand: "Chick-fil-A", name: "Strawberry Milkshake (Small)", aliases: ["cfa strawberry shake"], servingLabel: "small", servingGrams: 425, nutrients: { calories: 560, protein_g: 10, carbs_g: 92, fat_g: 18, sat_fat_g: 11, trans_fat_g: 0.5, cholesterol_mg: 70, sodium_mg: 370, fiber_g: 1, sugar_g: 87 } },
  { id: "cfa_lemonade_medium", brand: "Chick-fil-A", name: "Lemonade (Medium)", aliases: ["cfa lemonade", "lemonade"], servingLabel: "medium", servingGrams: 410, nutrients: { calories: 260, protein_g: 0, carbs_g: 66, fat_g: 0, sat_fat_g: 0, trans_fat_g: 0, cholesterol_mg: 0, fiber_g: 0 } },
  { id: "cfa_diet_lemonade_medium", brand: "Chick-fil-A", name: "Diet Lemonade (Medium)", aliases: ["cfa diet lemonade", "diet lemonade"], servingLabel: "medium", servingGrams: 410, nutrients: { calories: 60, protein_g: 0, carbs_g: 15, fat_g: 0, sat_fat_g: 0, trans_fat_g: 0, cholesterol_mg: 0, fiber_g: 0 } },
  { id: "cfa_frosted_lemonade", brand: "Chick-fil-A", name: "Frosted Lemonade (Small)", aliases: ["cfa frosted lemonade", "frosted lemonade"], servingLabel: "small", servingGrams: 425, nutrients: { calories: 350, protein_g: 7, carbs_g: 67, fat_g: 7, sat_fat_g: 4.5, trans_fat_g: 0, cholesterol_mg: 25, sodium_mg: 135, fiber_g: 0, sugar_g: 65 } },
  { id: "cfa_frosted_coffee", brand: "Chick-fil-A", name: "Frosted Coffee (Small)", aliases: ["cfa frosted coffee", "frosted coffee"], servingLabel: "small", servingGrams: 425, nutrients: { calories: 260, protein_g: 7, carbs_g: 45, fat_g: 7, sat_fat_g: 4.5, trans_fat_g: 0, cholesterol_mg: 25, sodium_mg: 140, fiber_g: 0, sugar_g: 44 } },
  { id: "cfa_kids_nuggets_5ct", brand: "Chick-fil-A", name: "Kids Nuggets (5 ct)", aliases: ["cfa kids nuggets", "5 count nuggets"], servingLabel: "5 nuggets", servingGrams: 71, nutrients: { calories: 160, protein_g: 17, carbs_g: 7, fat_g: 7, sodium_mg: 760 } },
  { id: "cfa_kids_grilled_nuggets_5ct", brand: "Chick-fil-A", name: "Kids Grilled Nuggets (5 ct)", aliases: ["cfa kids grilled nuggets", "5 count grilled nuggets"], servingLabel: "5 nuggets", servingGrams: 60, nutrients: { calories: 80, protein_g: 16, carbs_g: 1, fat_g: 2, sodium_mg: 270 } },
];

export function menuSeedToFood(seed: MenuSeed): Food {
  return {
    id: seed.id,
    source: "chain",
    name: seed.name,
    brand: seed.brand,
    aliases: seed.aliases,
    servingSizeG: seed.servingGrams,
    servingLabel: seed.servingLabel,
    servingOptions: [{ label: seed.servingLabel, grams: seed.servingGrams }],
    nutrients: seed.nutrients,
    createdAt: 0,
  };
}
