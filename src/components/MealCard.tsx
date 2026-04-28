"use client";

import { ChevronRight, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { deleteLogEntry } from "@/lib/storage";
import type { LogEntry, Meal } from "@/lib/types";
import { showToast } from "./ToastHost";

const MEAL_LABEL: Record<Meal, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
  snacks: "Snacks",
};

const MEAL_TIME: Record<Meal, string> = {
  breakfast: "Morning",
  lunch: "Midday",
  dinner: "Evening",
  snacks: "Anytime",
};

export function MealCard({
  meal,
  date,
  entries,
}: {
  meal: Meal;
  date: string;
  entries: LogEntry[];
}) {
  const totalCal = entries.reduce(
    (sum, e) => sum + (e.snapshot.nutrients.calories ?? 0) * e.servings,
    0,
  );

  return (
    <section className="card overflow-hidden">
      <header className="px-4 pt-4 pb-3 flex items-center justify-between">
        <div>
          <h2 className="display-md">{MEAL_LABEL[meal]}</h2>
          <div className="label mt-0.5">{MEAL_TIME[meal]}</div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="numeric text-[18px] font-semibold leading-none">
              {Math.round(totalCal).toLocaleString()}
            </div>
            <div className="label mt-0.5">kcal</div>
          </div>
          <Link
            href={`/add?meal=${meal}&date=${date}`}
            aria-label={`Add to ${MEAL_LABEL[meal]}`}
            className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-[var(--accent)] text-white active:translate-y-[1px] transition-transform"
          >
            <Plus size={16} strokeWidth={2.6} />
          </Link>
        </div>
      </header>

      {entries.length > 0 ? (
        <ul className="border-t border-[var(--border)]">
          <AnimatePresence initial={false}>
            {entries.map((entry) => (
              <motion.li
                key={entry.id}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.18 }}
                className="border-b border-[var(--border)] last:border-b-0"
              >
                <EntryRow entry={entry} />
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      ) : (
        <div className="border-t border-[var(--border)] px-4 py-4 flex items-center justify-between">
          <span className="text-[13px] text-[var(--muted)]">Nothing logged yet.</span>
          <Link
            href={`/add?meal=${meal}&date=${date}`}
            className="text-[13px] font-semibold text-[var(--accent)] inline-flex items-center gap-1"
          >
            Add food <ChevronRight size={14} />
          </Link>
        </div>
      )}
    </section>
  );
}

function EntryRow({ entry }: { entry: LogEntry }) {
  const cal = (entry.snapshot.nutrients.calories ?? 0) * entry.servings;
  const p = (entry.snapshot.nutrients.protein_g ?? 0) * entry.servings;
  const c = (entry.snapshot.nutrients.carbs_g ?? 0) * entry.servings;
  const f = (entry.snapshot.nutrients.fat_g ?? 0) * entry.servings;
  return (
    <div className="px-4 py-3 grid grid-cols-[1fr_auto_auto] items-center gap-3">
      <div className="min-w-0">
        <div className="text-[14px] font-medium truncate">
          {entry.snapshot.name}
        </div>
        <div className="text-[12px] text-[var(--muted)] truncate">
          <span className="numeric">{entry.servings}× {entry.snapshot.servingLabel}</span>
          {entry.snapshot.brand ? <span> · {entry.snapshot.brand}</span> : null}
        </div>
        <div className="mt-1 flex items-center gap-3 text-[11px] text-[var(--fg-dim)]">
          <span><span className="numeric">{Math.round(p)}</span> P</span>
          <span><span className="numeric">{Math.round(c)}</span> C</span>
          <span><span className="numeric">{Math.round(f)}</span> F</span>
        </div>
      </div>
      <div className="text-right">
        <div className="numeric text-[15px] font-semibold leading-none">
          {Math.round(cal)}
        </div>
        <div className="label mt-0.5">kcal</div>
      </div>
      <button
        type="button"
        aria-label="Delete"
        onClick={() => {
          deleteLogEntry(entry.id);
          showToast("Removed");
        }}
        className="p-2 text-[var(--muted)] hover:text-[var(--danger)]"
      >
        <Trash2 size={15} strokeWidth={2} />
      </button>
    </div>
  );
}
