"use client";

import { useSyncExternalStore } from "react";
import {
  loadFavorites,
  loadFoods,
  loadGoals,
  loadLog,
  loadProfile,
  loadRecents,
  loadRecipes,
  loadSettings,
  loadWater,
  loadWeight,
  onStorageChange,
  isOnboarded,
  DEFAULT_SETTINGS,
} from "./storage";
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

const EMPTY_FOODS: Record<string, Food> = {};
const EMPTY_LOG: LogEntry[] = [];
const EMPTY_WEIGHT: WeightLog[] = [];
const EMPTY_WATER: Record<string, WaterLog> = {};
const EMPTY_LIST: string[] = [];
const EMPTY_RECIPES: Record<string, Recipe> = {};

function subscribe(cb: () => void) {
  return onStorageChange(cb);
}

export function useProfile(): Profile | null {
  return useSyncExternalStore(
    subscribe,
    () => loadProfile(),
    () => null,
  );
}
export function useGoals(): Goals | null {
  return useSyncExternalStore(
    subscribe,
    () => loadGoals(),
    () => null,
  );
}
export function useFoods(): Record<string, Food> {
  return useSyncExternalStore(
    subscribe,
    () => loadFoods(),
    () => EMPTY_FOODS,
  );
}
export function useLog(): LogEntry[] {
  return useSyncExternalStore(
    subscribe,
    () => loadLog(),
    () => EMPTY_LOG,
  );
}
export function useWeight(): WeightLog[] {
  return useSyncExternalStore(
    subscribe,
    () => loadWeight(),
    () => EMPTY_WEIGHT,
  );
}
export function useWater(): Record<string, WaterLog> {
  return useSyncExternalStore(
    subscribe,
    () => loadWater(),
    () => EMPTY_WATER,
  );
}
export function useSettings(): AppSettings {
  return useSyncExternalStore(
    subscribe,
    () => loadSettings(),
    () => DEFAULT_SETTINGS,
  );
}
export function useRecents(): string[] {
  return useSyncExternalStore(
    subscribe,
    () => loadRecents(),
    () => EMPTY_LIST,
  );
}
export function useFavorites(): string[] {
  return useSyncExternalStore(
    subscribe,
    () => loadFavorites(),
    () => EMPTY_LIST,
  );
}
export function useRecipes(): Record<string, Recipe> {
  return useSyncExternalStore(
    subscribe,
    () => loadRecipes(),
    () => EMPTY_RECIPES,
  );
}
export function useOnboarded(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => isOnboarded(),
    () => true,
  );
}
