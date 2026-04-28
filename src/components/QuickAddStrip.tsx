"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Star } from "lucide-react";
import { useFavorites, useFoods, useRecents } from "@/lib/hooks";
import type { Meal } from "@/lib/types";
import { ServingSheetAnim } from "./AddEntrySheet";
import type { Food } from "@/lib/types";

export function QuickAddStrip({ date }: { date: string }) {
  const recents = useRecents();
  const favoritesList = useFavorites();
  const foods = useFoods();
  const [selected, setSelected] = useState<Food | null>(null);
  const [meal, setMeal] = useState<Meal>("snacks");

  const list = useMemo(() => {
    const favs = favoritesList.map((id) => foods[id]).filter(Boolean) as Food[];
    const recentFoods = recents.map((id) => foods[id]).filter(Boolean) as Food[];
    const merged: Food[] = [];
    const seen = new Set<string>();
    for (const f of [...favs, ...recentFoods]) {
      if (seen.has(f.id)) continue;
      seen.add(f.id);
      merged.push(f);
      if (merged.length >= 8) break;
    }
    return { merged, favSet: new Set(favoritesList) };
  }, [recents, favoritesList, foods]);

  if (list.merged.length === 0) return null;

  return (
    <section>
      <div className="px-1 mb-2 flex items-baseline justify-between">
        <div className="label-strong">Quick add</div>
        <Link href="/add" className="label !normal-case !tracking-wide text-[var(--info)]">
          Browse all
        </Link>
      </div>
      <div className="overflow-x-auto -mx-1 px-1">
        <div className="flex gap-2 pb-1">
          {list.merged.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => {
                setMeal(suggestMeal());
                setSelected(f);
              }}
              className="card-flat px-3 py-2.5 text-left whitespace-nowrap min-w-[160px] max-w-[220px] active:bg-[var(--panel-2)]"
            >
              <div className="flex items-center gap-1.5">
                {list.favSet.has(f.id) ? (
                  <Star
                    size={11}
                    className="text-[var(--accent)]"
                    fill="var(--accent)"
                    strokeWidth={1.5}
                  />
                ) : null}
                <div className="text-[13px] font-semibold truncate flex-1">{f.name}</div>
              </div>
              <div className="text-[11px] text-[var(--muted)] mt-0.5 numeric truncate">
                {f.brand ? `${f.brand} · ` : ""}
                {Math.round(f.nutrients.calories ?? 0)} kcal
              </div>
            </button>
          ))}
        </div>
      </div>

      <ServingSheetAnim
        food={selected}
        meal={meal}
        date={date}
        onClose={() => setSelected(null)}
        onLogged={() => setSelected(null)}
      />
    </section>
  );
}

function suggestMeal(): Meal {
  const h = new Date().getHours();
  if (h < 11) return "breakfast";
  if (h < 15) return "lunch";
  if (h < 21) return "dinner";
  return "snacks";
}
