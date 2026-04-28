"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { RecipeBuilder } from "@/components/RecipeBuilder";
import { useRecipes } from "@/lib/hooks";

export default function RecipeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const recipes = useRecipes();
  const recipe = recipes[id];

  if (!recipe) {
    return (
      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="text-center">
          <div className="display-md">Recipe not found</div>
          <Link href="/recipes" className="btn mt-4 inline-flex">
            Back to recipes
          </Link>
        </div>
      </div>
    );
  }

  return <RecipeBuilder initial={recipe} />;
}
