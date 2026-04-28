"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ChefHat, ScanBarcode, Plus, Search } from "lucide-react";
import { todayISODate } from "@/lib/dates";
import type { Food, Meal, Recipe } from "@/lib/types";
import { useFavorites, useFoods, useRecents, useRecipes } from "@/lib/hooks";
import { FoodResultRow } from "@/components/FoodResultRow";
import { ServingSheetAnim } from "@/components/AddEntrySheet";
import { toggleFavorite } from "@/lib/storage";
import { sumNutrients, scaleNutrients } from "@/lib/nutrients";

const MEAL_LABEL: Record<Meal, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
  snacks: "Snacks",
};

type Tab = "search" | "recents" | "favorites" | "recipes" | "mine";

export default function AddPage() {
  return (
    <Suspense fallback={null}>
      <AddPageInner />
    </Suspense>
  );
}

function AddPageInner() {
  const router = useRouter();
  const params = useSearchParams();
  const date = params?.get("date") ?? todayISODate();
  const meal = (params?.get("meal") as Meal | null) ?? "snacks";

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Food[]>([]);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<Tab>("recents");
  const [selected, setSelected] = useState<Food | null>(null);

  const foods = useFoods();
  const recentsList = useRecents();
  const favoritesList = useFavorites();
  const recipesMap = useRecipes();

  const recents = useMemo(
    () => recentsList.map((id) => foods[id]).filter(Boolean) as Food[],
    [recentsList, foods],
  );
  const favorites = useMemo(
    () => favoritesList.map((id) => foods[id]).filter(Boolean) as Food[],
    [favoritesList, foods],
  );
  const mine = useMemo(
    () => Object.values(foods).filter((f) => f.source === "user"),
    [foods],
  );
  const recipes = useMemo(
    () =>
      Object.values(recipesMap).sort((a, b) => b.updatedAt - a.updatedAt),
    [recipesMap],
  );

  const recipeAsFood = (r: Recipe): Food => {
    const totals = sumNutrients(
      r.items.map((it) => scaleNutrients(it.cachedNutrients, it.servings)),
    );
    const perServing = scaleNutrients(totals, 1 / Math.max(1, r.servings));
    return {
      id: r.id,
      source: "user",
      name: r.name,
      brand: "Recipe",
      servingLabel: `1 of ${r.servings} servings`,
      servingSizeG: 0,
      nutrients: perServing,
      createdAt: r.createdAt,
    };
  };

  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Debounced live search.
  // Note: this effect synchronizes external (network) state into local
  // state, so setState calls below are intentional.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setTab("search");
    const ctrl = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`, {
          signal: ctrl.signal,
        });
        const data = (await res.json()) as { results: Food[] };
        setResults(data.results ?? []);
      } catch (e) {
        if ((e as Error).name !== "AbortError") setResults([]);
      } finally {
        setLoading(false);
      }
    }, 280);
    return () => {
      ctrl.abort();
      window.clearTimeout(timer);
    };
  }, [query]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const list =
    tab === "search"
      ? results
      : tab === "recents"
        ? recents
        : tab === "favorites"
          ? favorites
          : tab === "recipes"
            ? recipes.map(recipeAsFood)
            : mine;
  const showEmpty = !loading && list.length === 0;

  return (
    <div className="flex-1 flex flex-col">
      <header className="sticky top-0 z-20 bar-top safe-top">
        <div className="px-3 pt-3 pb-2 grid grid-cols-[auto_1fr_auto] items-center gap-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="btn btn-ghost btn-sm !min-h-[36px] !px-2"
            aria-label="Back"
          >
            <ArrowLeft size={16} />
          </button>
          <div className="text-center text-[13px] font-semibold">
            Add to <span className="text-[var(--accent)]">{MEAL_LABEL[meal]}</span>
          </div>
          <Link
            href={`/scan?meal=${meal}&date=${date}`}
            aria-label="Scan barcode"
            className="btn btn-ghost btn-sm !min-h-[36px] !px-2"
          >
            <ScanBarcode size={18} />
          </Link>
        </div>
        <div className="px-3 pb-3">
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)] pointer-events-none"
            />
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search foods, brands, or scan a barcode"
              className="!pl-10 w-full"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              enterKeyHint="search"
            />
          </div>
        </div>
        <Tabs tab={tab} setTab={setTab} hasQuery={Boolean(query.trim())} />
      </header>

      <div className="flex-1">
        {loading ? (
          <div className="px-5 py-10 text-center text-[14px] text-[var(--muted)]">
            Searching…
          </div>
        ) : null}

        {!loading && tab === "search" && !query.trim() ? (
          <div className="px-5 py-10 text-center text-[14px] text-[var(--muted)]">
            Type to search USDA + Open Food Facts.
          </div>
        ) : null}

        {showEmpty && tab === "search" && query.trim() ? (
          <div className="px-5 py-10 text-center">
            <div className="text-[14px] text-[var(--fg-dim)]">No matches.</div>
            <Link href="/foods/new" className="btn mt-4 inline-flex">
              <Plus size={14} /> Create a custom food
            </Link>
          </div>
        ) : null}

        {showEmpty && tab !== "search" ? (
          <div className="px-5 py-10 text-center text-[14px] text-[var(--muted)]">
            {tab === "recents"
              ? "Your recent foods will show here."
              : tab === "favorites"
                ? "Tap the star on any food to favorite it."
                : tab === "recipes"
                  ? "No saved recipes yet."
                  : "No custom foods yet."}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              {tab === "recipes" ? (
                <Link href="/recipes/new" className="btn inline-flex">
                  <ChefHat size={14} /> New recipe
                </Link>
              ) : (
                <Link href="/foods/new" className="btn inline-flex">
                  <Plus size={14} /> Create a custom food
                </Link>
              )}
            </div>
          </div>
        ) : null}

        <ul className="divide-y divide-[var(--border)]">
          {list.map((food) => (
            <li key={food.id}>
              <FoodResultRow
                food={food}
                isFavorite={favoritesList.includes(food.id)}
                onSelect={() => setSelected(food)}
                onToggleFavorite={() => toggleFavorite(food.id)}
              />
            </li>
          ))}
        </ul>
      </div>

      <ServingSheetAnim
        food={selected}
        meal={meal}
        date={date}
        onClose={() => setSelected(null)}
        onLogged={() => {
          setSelected(null);
          router.push("/");
        }}
      />
    </div>
  );
}

function Tabs({
  tab,
  setTab,
  hasQuery,
}: {
  tab: Tab;
  setTab: (t: Tab) => void;
  hasQuery: boolean;
}) {
  const items: Array<{ id: Tab; label: string }> = hasQuery
    ? [
        { id: "search", label: "Search" },
        { id: "recents", label: "Recents" },
        { id: "favorites", label: "Favorites" },
        { id: "recipes", label: "Recipes" },
        { id: "mine", label: "Mine" },
      ]
    : [
        { id: "recents", label: "Recents" },
        { id: "favorites", label: "Favorites" },
        { id: "recipes", label: "Recipes" },
        { id: "mine", label: "Mine" },
      ];
  return (
    <div className="px-3 pb-2 flex gap-1 overflow-x-auto">
      {items.map((it) => (
        <button
          key={it.id}
          type="button"
          onClick={() => setTab(it.id)}
          className={
            "h-8 px-3 rounded-full text-[12.5px] font-semibold whitespace-nowrap border " +
            (tab === it.id
              ? "bg-[var(--fg)] text-[var(--bg)] border-[var(--fg)]"
              : "border-[var(--border)] text-[var(--fg-dim)]")
          }
        >
          {it.label}
        </button>
      ))}
    </div>
  );
}
