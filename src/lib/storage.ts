"use client";

import type {
  AppSettings,
  Food,
  Goals,
  LogEntry,
  Profile,
  Recipe,
  WaterLog,
  WeightLog,
} from "./types";

const KEYS = {
  profile: "fuel.profile.v1",
  goals: "fuel.goals.v1",
  foods: "fuel.foods.v1", // user-created + cached external foods, keyed map
  log: "fuel.log.v1", // array of LogEntry
  weight: "fuel.weight.v1", // array of WeightLog
  water: "fuel.water.v1", // map iso → WaterLog
  settings: "fuel.settings.v1",
  recents: "fuel.recents.v1", // array of foodId, most-recent first
  favorites: "fuel.favorites.v1", // array of foodId
  upcCache: "fuel.upcCache.v1", // map upc → foodId
  recipes: "fuel.recipes.v1", // map id → Recipe
  onboarded: "fuel.onboarded.v1",
};

const EVENT = "fuel:storage";

export const DEFAULT_SETTINGS: AppSettings = {
  theme: "system",
  units: "imperial",
};

interface Cache {
  profile?: Profile | null;
  goals?: Goals | null;
  foods?: Record<string, Food>;
  log?: LogEntry[];
  weight?: WeightLog[];
  water?: Record<string, WaterLog>;
  settings?: AppSettings;
  recents?: string[];
  favorites?: string[];
  upcCache?: Record<string, string>;
  recipes?: Record<string, Recipe>;
}
let cache: Cache = {};

function emit() {
  cache = {};
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(EVENT));
}

export function onStorageChange(cb: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const handler = () => {
    cache = {};
    cb();
  };
  window.addEventListener(EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
  emit();
}

// ── Profile ────────────────────────────────────────────────────────
export function loadProfile(): Profile | null {
  if (cache.profile !== undefined) return cache.profile;
  cache.profile = read<Profile | null>(KEYS.profile, null);
  return cache.profile;
}
export function saveProfile(p: Profile) {
  write(KEYS.profile, p);
}

// ── Goals ──────────────────────────────────────────────────────────
export function loadGoals(): Goals | null {
  if (cache.goals !== undefined) return cache.goals;
  cache.goals = read<Goals | null>(KEYS.goals, null);
  return cache.goals;
}
export function saveGoals(g: Goals) {
  write(KEYS.goals, g);
}

// ── Onboarded flag ─────────────────────────────────────────────────
export function isOnboarded(): boolean {
  if (typeof window === "undefined") return true;
  return localStorage.getItem(KEYS.onboarded) === "1";
}
export function markOnboarded() {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEYS.onboarded, "1");
  emit();
}

// ── Foods ──────────────────────────────────────────────────────────
export function loadFoods(): Record<string, Food> {
  if (cache.foods) return cache.foods;
  cache.foods = read<Record<string, Food>>(KEYS.foods, {});
  return cache.foods;
}
export function saveFoods(map: Record<string, Food>) {
  write(KEYS.foods, map);
}
export function upsertFood(food: Food) {
  const map = { ...loadFoods() };
  map[food.id] = food;
  saveFoods(map);
  // index by UPC if present
  if (food.upc) {
    const idx = { ...loadUpcCache() };
    idx[food.upc] = food.id;
    write(KEYS.upcCache, idx);
  }
}
export function loadUpcCache(): Record<string, string> {
  if (cache.upcCache) return cache.upcCache;
  cache.upcCache = read<Record<string, string>>(KEYS.upcCache, {});
  return cache.upcCache;
}
export function findFoodByUpc(upc: string): Food | null {
  const id = loadUpcCache()[upc];
  if (!id) return null;
  return loadFoods()[id] ?? null;
}

// ── Log entries ────────────────────────────────────────────────────
export function loadLog(): LogEntry[] {
  if (cache.log) return cache.log;
  cache.log = read<LogEntry[]>(KEYS.log, []);
  return cache.log;
}
export function saveLog(list: LogEntry[]) {
  write(KEYS.log, list);
}
export function addLogEntry(entry: LogEntry) {
  saveLog([...loadLog(), entry]);
  bumpRecent(entry.foodId);
}
export function updateLogEntry(id: string, patch: Partial<LogEntry>) {
  saveLog(loadLog().map((e) => (e.id === id ? { ...e, ...patch } : e)));
}
export function deleteLogEntry(id: string) {
  saveLog(loadLog().filter((e) => e.id !== id));
}
export function entriesForDate(date: string): LogEntry[] {
  return loadLog().filter((e) => e.date === date);
}

// ── Weight ─────────────────────────────────────────────────────────
export function loadWeight(): WeightLog[] {
  if (cache.weight) return cache.weight;
  cache.weight = read<WeightLog[]>(KEYS.weight, []);
  return cache.weight;
}
export function saveWeight(list: WeightLog[]) {
  write(KEYS.weight, list);
}
export function upsertWeight(entry: WeightLog) {
  const list = loadWeight().filter((w) => w.date !== entry.date);
  list.push(entry);
  list.sort((a, b) => a.date.localeCompare(b.date));
  saveWeight(list);
}
export function deleteWeight(date: string) {
  saveWeight(loadWeight().filter((w) => w.date !== date));
}

// ── Water ──────────────────────────────────────────────────────────
export function loadWater(): Record<string, WaterLog> {
  if (cache.water) return cache.water;
  cache.water = read<Record<string, WaterLog>>(KEYS.water, {});
  return cache.water;
}
export function setWater(date: string, ml: number) {
  const map = { ...loadWater() };
  if (ml <= 0) delete map[date];
  else map[date] = { date, ml, updatedAt: Date.now() };
  write(KEYS.water, map);
}

// ── Settings ───────────────────────────────────────────────────────
export function loadSettings(): AppSettings {
  if (cache.settings) return cache.settings;
  cache.settings = { ...DEFAULT_SETTINGS, ...read(KEYS.settings, {}) };
  return cache.settings;
}
export function saveSettings(s: AppSettings) {
  write(KEYS.settings, s);
}

// ── Recents / Favorites ────────────────────────────────────────────
export function loadRecents(): string[] {
  if (cache.recents) return cache.recents;
  cache.recents = read<string[]>(KEYS.recents, []);
  return cache.recents;
}
export function bumpRecent(foodId: string) {
  const next = [foodId, ...loadRecents().filter((id) => id !== foodId)].slice(0, 50);
  write(KEYS.recents, next);
}
export function loadFavorites(): string[] {
  if (cache.favorites) return cache.favorites;
  cache.favorites = read<string[]>(KEYS.favorites, []);
  return cache.favorites;
}
export function toggleFavorite(foodId: string) {
  const list = loadFavorites();
  const next = list.includes(foodId) ? list.filter((id) => id !== foodId) : [...list, foodId];
  write(KEYS.favorites, next);
}

// ── Recipes ────────────────────────────────────────────────────────
export function loadRecipes(): Record<string, Recipe> {
  if (cache.recipes) return cache.recipes;
  cache.recipes = read<Record<string, Recipe>>(KEYS.recipes, {});
  return cache.recipes;
}
export function saveRecipes(map: Record<string, Recipe>) {
  write(KEYS.recipes, map);
}
export function upsertRecipe(recipe: Recipe) {
  const map = { ...loadRecipes() };
  map[recipe.id] = recipe;
  saveRecipes(map);
}
export function deleteRecipe(id: string) {
  const map = { ...loadRecipes() };
  delete map[id];
  saveRecipes(map);
}

// ── Export / Import ────────────────────────────────────────────────
export function exportAll(): string {
  return JSON.stringify(
    {
      app: "fuel-tracker",
      version: 1,
      exportedAt: new Date().toISOString(),
      profile: loadProfile(),
      goals: loadGoals(),
      foods: loadFoods(),
      log: loadLog(),
      weight: loadWeight(),
      water: loadWater(),
      settings: loadSettings(),
      recents: loadRecents(),
      favorites: loadFavorites(),
      upcCache: loadUpcCache(),
      recipes: loadRecipes(),
    },
    null,
    2,
  );
}

export function importAll(json: string) {
  const p = JSON.parse(json);
  if (!p || typeof p !== "object") throw new Error("Invalid payload.");
  if (p.profile) write(KEYS.profile, p.profile);
  if (p.goals) write(KEYS.goals, p.goals);
  if (p.foods) write(KEYS.foods, p.foods);
  if (Array.isArray(p.log)) write(KEYS.log, p.log);
  if (Array.isArray(p.weight)) write(KEYS.weight, p.weight);
  if (p.water) write(KEYS.water, p.water);
  if (p.settings) write(KEYS.settings, p.settings);
  if (Array.isArray(p.recents)) write(KEYS.recents, p.recents);
  if (Array.isArray(p.favorites)) write(KEYS.favorites, p.favorites);
  if (p.upcCache) write(KEYS.upcCache, p.upcCache);
  if (p.recipes) write(KEYS.recipes, p.recipes);
  emit();
}

export function nukeAll() {
  if (typeof window === "undefined") return;
  for (const k of Object.values(KEYS)) localStorage.removeItem(k);
  cache = {};
  emit();
}
