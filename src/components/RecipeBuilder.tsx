"use client";

import { ArrowLeft, Minus, Plus, Save, Search, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { showToast } from "@/components/ToastHost";
import { newId } from "@/lib/dates";
import { useFoods } from "@/lib/hooks";
import { scaleNutrients, sumNutrients } from "@/lib/nutrients";
import { upsertFood, upsertRecipe } from "@/lib/storage";
import type { Food, Recipe, RecipeItem } from "@/lib/types";
import { FoodResultRow } from "@/components/FoodResultRow";

interface RecipeBuilderProps {
  initial?: Recipe;
}

export function RecipeBuilder({ initial }: RecipeBuilderProps) {
  const router = useRouter();
  const [name, setName] = useState(initial?.name ?? "");
  const [servings, setServings] = useState(initial?.servings ?? 1);
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [items, setItems] = useState<RecipeItem[]>(initial?.items ?? []);

  const totals = useMemo(
    () => sumNutrients(items.map((it) => scaleNutrients(it.cachedNutrients, it.servings))),
    [items],
  );
  const perServing = useMemo(
    () => scaleNutrients(totals, 1 / Math.max(1, servings)),
    [totals, servings],
  );

  const submit = () => {
    if (!name.trim()) {
      showToast("Name your recipe", "error");
      return;
    }
    if (items.length === 0) {
      showToast("Add at least one ingredient", "error");
      return;
    }
    const now = Date.now();
    const recipe: Recipe = {
      id: initial?.id ?? newId("rec"),
      name: name.trim(),
      servings,
      notes: notes.trim() || undefined,
      items,
      createdAt: initial?.createdAt ?? now,
      updatedAt: now,
    };
    upsertRecipe(recipe);
    showToast("Recipe saved", "success");
    router.push("/recipes");
  };

  return (
    <div className="flex-1 flex flex-col">
      <header className="sticky top-0 z-10 bar-top safe-top">
        <div className="px-3 pt-3 pb-3 grid grid-cols-[auto_1fr_auto] items-center gap-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="btn btn-ghost btn-sm !min-h-[36px] !px-2"
            aria-label="Back"
          >
            <ArrowLeft size={16} />
          </button>
          <div className="text-center text-[13px] font-semibold">
            {initial ? "Edit recipe" : "New recipe"}
          </div>
          <button type="button" onClick={submit} className="btn btn-primary btn-sm">
            <Save size={14} /> Save
          </button>
        </div>
      </header>

      <div className="flex-1 px-5 py-5 max-w-[640px] w-full mx-auto grid gap-4">
        <section className="card p-4">
          <label className="block">
            <div className="label mb-1.5">Name</div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Sunday morning oats"
              autoCapitalize="sentences"
            />
          </label>
          <div className="grid grid-cols-2 gap-3 mt-3">
            <label className="block">
              <div className="label mb-1.5">Servings produced</div>
              <input
                type="number"
                min={1}
                step={1}
                value={servings}
                onChange={(e) => setServings(Math.max(1, Number(e.target.value) || 1))}
              />
            </label>
            <label className="block">
              <div className="label mb-1.5">Notes (optional)</div>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. with cinnamon"
              />
            </label>
          </div>
        </section>

        <section className="card overflow-hidden">
          <div className="px-4 pt-4 pb-2 flex items-center justify-between">
            <div className="display-md">Ingredients</div>
            <span className="label">{items.length}</span>
          </div>
          <ul className="border-t border-[var(--border)]">
            <AnimatePresence initial={false}>
              {items.map((it, i) => (
                <motion.li
                  key={`${it.foodId}_${i}`}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.18 }}
                  className="border-b border-[var(--border)] last:border-b-0"
                >
                  <IngredientRow
                    item={it}
                    onChange={(patch) =>
                      setItems((arr) =>
                        arr.map((x, idx) => (idx === i ? { ...x, ...patch } : x)),
                      )
                    }
                    onRemove={() => setItems((arr) => arr.filter((_, idx) => idx !== i))}
                  />
                </motion.li>
              ))}
            </AnimatePresence>
            {items.length === 0 ? (
              <li className="px-4 py-5 text-center text-[13px] text-[var(--muted)]">
                Search and add foods below.
              </li>
            ) : null}
          </ul>
        </section>

        <section className="card p-4">
          <div className="display-md">Nutrition</div>
          <div className="grid grid-cols-2 gap-4 mt-3">
            <NutBox label="Total" totals={totals} />
            <NutBox label="Per serving" totals={perServing} accent />
          </div>
        </section>

        <IngredientPicker
          onAdd={(item) => {
            setItems((arr) => [...arr, item]);
            showToast(`Added ${item.cachedName}`, "success");
          }}
        />
      </div>
    </div>
  );
}

function NutBox({
  label,
  totals,
  accent,
}: {
  label: string;
  totals: ReturnType<typeof sumNutrients>;
  accent?: boolean;
}) {
  return (
    <div className="card-flat p-3" style={accent ? { borderColor: "var(--accent)" } : undefined}>
      <div className="label">{label}</div>
      <div className="numeric text-[22px] font-semibold leading-none mt-1">
        {Math.round(totals.calories ?? 0).toLocaleString()}
        <span className="text-[var(--muted)] text-[11px] font-normal numeric"> kcal</span>
      </div>
      <div className="mt-2 flex flex-wrap gap-3 text-[12px] text-[var(--fg-dim)] numeric">
        <span>{Math.round(totals.protein_g ?? 0)} P</span>
        <span>{Math.round(totals.carbs_g ?? 0)} C</span>
        <span>{Math.round(totals.fat_g ?? 0)} F</span>
      </div>
    </div>
  );
}

function IngredientRow({
  item,
  onChange,
  onRemove,
}: {
  item: RecipeItem;
  onChange: (patch: Partial<RecipeItem>) => void;
  onRemove: () => void;
}) {
  return (
    <div className="px-4 py-3 grid grid-cols-[1fr_auto_auto] items-center gap-3">
      <div className="min-w-0">
        <div className="text-[14px] font-medium truncate">{item.cachedName}</div>
        <div className="text-[12px] text-[var(--muted)] truncate">
          {item.cachedBrand ? `${item.cachedBrand} · ` : ""}
          <span className="numeric">{item.cachedServingLabel}</span>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() =>
            onChange({ servings: Math.max(0.25, Math.round((item.servings - 0.5) * 4) / 4) })
          }
          className="btn !w-9 !h-9 !min-h-[36px] !px-0"
          aria-label="Decrease"
        >
          <Minus size={14} />
        </button>
        <input
          type="number"
          min={0.25}
          step={0.25}
          value={item.servings}
          onChange={(e) =>
            onChange({ servings: Math.max(0.25, Number(e.target.value) || 0.25) })
          }
          className="numeric text-center !w-16 !min-h-[36px] !text-[13px]"
        />
        <button
          type="button"
          onClick={() => onChange({ servings: Math.round((item.servings + 0.5) * 4) / 4 })}
          className="btn !w-9 !h-9 !min-h-[36px] !px-0"
          aria-label="Increase"
        >
          <Plus size={14} />
        </button>
      </div>
      <button
        type="button"
        aria-label="Remove ingredient"
        onClick={onRemove}
        className="p-2 text-[var(--muted)] hover:text-[var(--danger)]"
      >
        <Trash2 size={15} />
      </button>
    </div>
  );
}

function IngredientPicker({
  onAdd,
}: {
  onAdd: (item: RecipeItem) => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Food[]>([]);
  const [loading, setLoading] = useState(false);
  const foodsMap = useFoods();
  const inputRef = useRef<HTMLInputElement>(null);

  const recent = useMemo(
    () =>
      Object.values(foodsMap)
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, 8),
    [foodsMap],
  );

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
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

  const list = query.trim() ? results : recent;

  const addItem = (food: Food) => {
    upsertFood(food);
    onAdd({
      foodId: food.id,
      servings: 1,
      cachedName: food.name,
      cachedBrand: food.brand,
      cachedServingLabel: food.servingLabel,
      cachedNutrients: food.nutrients,
    });
  };

  return (
    <section className="card overflow-hidden">
      <div className="px-4 pt-4 pb-3 flex items-center justify-between">
        <div className="display-md">Add ingredient</div>
        <Link
          href="/foods/new"
          className="text-[12.5px] font-semibold text-[var(--accent)]"
        >
          + Custom food
        </Link>
      </div>
      <div className="px-4 pb-3 relative">
        <Search
          size={16}
          className="absolute left-7 top-1/2 -translate-y-1/2 text-[var(--muted)] pointer-events-none"
        />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search foods to add"
          className="!pl-10 w-full"
          autoComplete="off"
          spellCheck={false}
        />
      </div>
      <div className="border-t border-[var(--border)]">
        {loading ? (
          <div className="px-5 py-6 text-center text-[13px] text-[var(--muted)]">
            Searching…
          </div>
        ) : list.length === 0 && query.trim() ? (
          <div className="px-5 py-6 text-center text-[13px] text-[var(--muted)]">
            No results.
          </div>
        ) : list.length === 0 ? (
          <div className="px-5 py-6 text-center text-[13px] text-[var(--muted)]">
            Start typing to search USDA + Open Food Facts.
          </div>
        ) : (
          <ul className="divide-y divide-[var(--border)]">
            {list.map((food) => (
              <li key={food.id}>
                <FoodResultRow food={food} onSelect={() => addItem(food)} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
