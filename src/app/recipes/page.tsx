"use client";

import Link from "next/link";
import { ChefHat, Plus, Trash2 } from "lucide-react";
import { Logo } from "@/components/Logo";
import { useRecipes } from "@/lib/hooks";
import { deleteRecipe } from "@/lib/storage";
import { showToast } from "@/components/ToastHost";
import { sumNutrients, scaleNutrients } from "@/lib/nutrients";

export default function RecipesPage() {
  const recipesMap = useRecipes();
  const recipes = Object.values(recipesMap).sort(
    (a, b) => b.updatedAt - a.updatedAt,
  );

  return (
    <div className="flex-1 flex flex-col">
      <header className="px-5 pt-6 pb-3 safe-top flex items-center justify-between">
        <Logo size={18} />
        <Link href="/recipes/new" className="btn btn-primary btn-sm">
          <Plus size={14} /> New
        </Link>
      </header>

      <div className="px-5 pb-2">
        <h1 className="display-xl">Recipes</h1>
        <p className="mt-2 text-[14px] text-[var(--fg-dim)] max-w-[40ch]">
          Save meals you eat often. Combine foods into a single saved recipe and log
          it in one tap.
        </p>
      </div>

      <div className="px-5 grid gap-3 max-w-[760px] w-full mx-auto pb-8">
        {recipes.length === 0 ? (
          <div className="card p-8 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[var(--panel-2)] mb-3">
              <ChefHat size={20} strokeWidth={1.6} className="text-[var(--fg-dim)]" />
            </div>
            <div className="text-[14px] font-semibold">No recipes yet</div>
            <div className="text-[13px] text-[var(--muted)] mt-1 max-w-[34ch] mx-auto">
              Build a recipe to log a multi-ingredient meal in one tap.
            </div>
            <Link href="/recipes/new" className="btn btn-primary btn-sm mt-4 inline-flex">
              <Plus size={14} /> Create your first recipe
            </Link>
          </div>
        ) : (
          recipes.map((r) => {
            const totals = sumNutrients(
              r.items.map((it) => scaleNutrients(it.cachedNutrients, it.servings)),
            );
            const perServing = scaleNutrients(totals, 1 / Math.max(1, r.servings));
            return (
              <article key={r.id} className="card overflow-hidden">
                <Link href={`/recipes/${r.id}`} className="block">
                  <div className="px-4 py-4 flex items-start gap-3">
                    <div
                      className="mt-1 w-10 h-10 flex items-center justify-center rounded-md"
                      style={{ background: "color-mix(in srgb, var(--info) 15%, var(--panel-2))" }}
                    >
                      <ChefHat size={18} strokeWidth={2} className="text-[var(--info)]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="display-md truncate">{r.name}</div>
                      <div className="label mt-0.5 numeric">
                        {r.items.length} ingredients · serves {r.servings}
                      </div>
                      <div className="mt-2 flex items-baseline gap-3 text-[12.5px] text-[var(--fg-dim)] numeric">
                        <span>
                          <span className="text-[var(--fg)] font-semibold">
                            {Math.round(perServing.calories ?? 0)}
                          </span>{" "}
                          kcal/serving
                        </span>
                        <span>{Math.round(perServing.protein_g ?? 0)} P</span>
                        <span>{Math.round(perServing.carbs_g ?? 0)} C</span>
                        <span>{Math.round(perServing.fat_g ?? 0)} F</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      aria-label="Delete recipe"
                      onClick={(e) => {
                        e.preventDefault();
                        if (window.confirm(`Delete "${r.name}"?`)) {
                          deleteRecipe(r.id);
                          showToast("Recipe deleted");
                        }
                      }}
                      className="p-2 text-[var(--muted)] hover:text-[var(--danger)]"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </Link>
              </article>
            );
          })
        )}
      </div>
    </div>
  );
}
