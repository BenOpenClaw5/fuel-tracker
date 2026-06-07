"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useRef, useState } from "react";
import {
  ArrowLeft,
  Camera,
  PenLine,
  ScanText,
  Sparkles,
  RotateCcw,
} from "lucide-react";
import { ServingSheetAnim } from "@/components/AddEntrySheet";
import { showToast } from "@/components/ToastHost";
import { todayISODate, newId } from "@/lib/dates";
import type { Food, Meal, Nutrients } from "@/lib/types";

const MEAL_LABEL: Record<Meal, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
  snacks: "Snacks",
};

type Mode = "photo" | "label" | "describe";

interface AiResult {
  name: string;
  brand: string | null;
  servingLabel: string;
  servingGrams: number;
  nutrients: Nutrients;
  confidence: "low" | "medium" | "high";
  assumptions: string;
}

/** Downscale to ≤1024px on the long edge and re-encode as JPEG to keep the
 *  upload (and the per-request token cost) small. Returns base64 (no prefix). */
async function compressImage(
  file: File,
): Promise<{ base64: string; mediaType: string }> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(fr.result as string);
    fr.onerror = () => reject(new Error("read failed"));
    fr.readAsDataURL(file);
  });
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const i = new Image();
    i.onload = () => resolve(i);
    i.onerror = () => reject(new Error("decode failed"));
    i.src = dataUrl;
  });
  const MAX = 1024;
  let { width, height } = img;
  if (width > MAX || height > MAX) {
    const scale = MAX / Math.max(width, height);
    width = Math.round(width * scale);
    height = Math.round(height * scale);
  }
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return { base64: dataUrl.split(",")[1] ?? "", mediaType: file.type || "image/jpeg" };
  ctx.drawImage(img, 0, 0, width, height);
  const out = canvas.toDataURL("image/jpeg", 0.8);
  return { base64: out.split(",")[1] ?? "", mediaType: "image/jpeg" };
}

function aiToFood(r: AiResult): Food {
  const grams = r.servingGrams > 0 ? r.servingGrams : 100;
  return {
    id: newId("ai"),
    source: "ai",
    name: r.name,
    brand: r.brand ?? undefined,
    servingSizeG: grams,
    servingLabel: r.servingLabel,
    servingOptions: [{ label: r.servingLabel, grams }],
    nutrients: r.nutrients,
    createdAt: Date.now(),
  };
}

export default function AiPage() {
  return (
    <Suspense fallback={null}>
      <AiPageInner />
    </Suspense>
  );
}

function AiPageInner() {
  const router = useRouter();
  const params = useSearchParams();
  const date = params?.get("date") ?? todayISODate();
  const meal = (params?.get("meal") as Meal | null) ?? "snacks";

  const [mode, setMode] = useState<Mode>("photo");
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<AiResult | null>(null);
  const [selected, setSelected] = useState<Food | null>(null);

  const photoInputRef = useRef<HTMLInputElement>(null);
  const labelInputRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setResult(null);
    setError(null);
    setPreview(null);
    setText("");
  };

  const estimate = async (payload: {
    mode: Mode;
    text?: string;
    image?: string;
    mediaType?: string;
  }) => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/ai-food", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as { food?: AiResult; error?: string };
      if (!res.ok || !data.food) {
        setError(data.error ?? "Something went wrong.");
        return;
      }
      setResult(data.food);
    } catch {
      setError("Network error — try again.");
    } finally {
      setLoading(false);
    }
  };

  const onPickImage = async (file: File | undefined, kind: Mode) => {
    if (!file) return;
    try {
      const { base64, mediaType } = await compressImage(file);
      setPreview(`data:${mediaType};base64,${base64}`);
      await estimate({ mode: kind, image: base64, mediaType });
    } catch {
      setError("Couldn't read that image.");
    }
  };

  const onDescribe = () => {
    const t = text.trim();
    if (t.length < 2) {
      showToast("Describe what you ate", "error");
      return;
    }
    estimate({ mode: "describe", text: t });
  };

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
          <div className="text-center text-[13px] font-semibold inline-flex items-center justify-center gap-1.5">
            <Sparkles size={14} className="text-[var(--accent)]" />
            AI · <span className="text-[var(--accent)]">{MEAL_LABEL[meal]}</span>
          </div>
          <span />
        </div>
        <ModeTabs mode={mode} setMode={(m) => { setMode(m); reset(); }} />
      </header>

      <div className="flex-1 px-4 py-4">
        {/* hidden file inputs */}
        <input
          ref={photoInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => onPickImage(e.target.files?.[0], "photo")}
        />
        <input
          ref={labelInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => onPickImage(e.target.files?.[0], "label")}
        />

        {!result && !loading ? (
          <>
            {mode === "photo" ? (
              <Capture
                icon={<Camera size={22} />}
                title="Photo of your food"
                subtitle="Snap your plate — AI estimates the portion and macros."
                cta="Take / choose photo"
                onClick={() => photoInputRef.current?.click()}
              />
            ) : null}

            {mode === "label" ? (
              <Capture
                icon={<ScanText size={22} />}
                title="Nutrition label"
                subtitle="Photograph the Nutrition Facts panel — AI reads it exactly."
                cta="Take / choose photo"
                onClick={() => labelInputRef.current?.click()}
              />
            ) : null}

            {mode === "describe" ? (
              <div>
                <div className="label mb-2">Describe it</div>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  rows={3}
                  autoFocus
                  placeholder={'e.g. "a 6 inch #3 from Jimmy John\'s" or "one serving of tortilla chips"'}
                  className="w-full resize-none"
                />
                <button
                  type="button"
                  onClick={onDescribe}
                  className="btn btn-primary btn-lg w-full mt-3"
                >
                  <Sparkles size={15} /> Estimate
                </button>
                <p className="mt-3 text-[12px] text-[var(--muted)] leading-relaxed">
                  Name a chain item, a dish, or a portion. The clearer the
                  description, the better the estimate.
                </p>
              </div>
            ) : null}
          </>
        ) : null}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={preview}
                alt=""
                className="w-28 h-28 object-cover rounded-[var(--radius)] border border-[var(--border)] opacity-80"
              />
            ) : (
              <Sparkles size={28} className="text-[var(--accent)] animate-pulse" />
            )}
            <div className="text-[14px] text-[var(--muted)] animate-pulse">
              Reading your food…
            </div>
          </div>
        ) : null}

        {error && !loading ? (
          <div className="mt-6 text-center">
            <div className="text-[14px] text-[var(--fg-dim)]">{error}</div>
            <button type="button" onClick={reset} className="btn mt-4 inline-flex">
              <RotateCcw size={14} /> Try again
            </button>
          </div>
        ) : null}

        {result && !loading ? (
          <ResultCard
            result={result}
            preview={preview}
            onLog={() => setSelected(aiToFood(result))}
            onReset={reset}
          />
        ) : null}
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

function ModeTabs({ mode, setMode }: { mode: Mode; setMode: (m: Mode) => void }) {
  const items: Array<{ id: Mode; label: string; icon: React.ReactNode }> = [
    { id: "photo", label: "Food", icon: <Camera size={14} /> },
    { id: "label", label: "Label", icon: <ScanText size={14} /> },
    { id: "describe", label: "Describe", icon: <PenLine size={14} /> },
  ];
  return (
    <div className="px-3 pb-2 flex gap-1">
      {items.map((it) => (
        <button
          key={it.id}
          type="button"
          onClick={() => setMode(it.id)}
          className={
            "flex-1 h-9 rounded-full text-[12.5px] font-semibold inline-flex items-center justify-center gap-1.5 border " +
            (mode === it.id
              ? "bg-[var(--fg)] text-[var(--bg)] border-[var(--fg)]"
              : "border-[var(--border)] text-[var(--fg-dim)]")
          }
        >
          {it.icon}
          {it.label}
        </button>
      ))}
    </div>
  );
}

function Capture({
  icon,
  title,
  subtitle,
  cta,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  cta: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-[var(--radius-lg)] border-2 border-dashed border-[var(--border)] bg-[var(--panel)] px-6 py-10 flex flex-col items-center gap-3 text-center active:bg-[var(--panel-2)]"
    >
      <span className="w-14 h-14 rounded-full bg-[var(--panel-2)] flex items-center justify-center text-[var(--accent)]">
        {icon}
      </span>
      <span className="display-md">{title}</span>
      <span className="text-[13px] text-[var(--muted)] max-w-[260px] leading-relaxed">
        {subtitle}
      </span>
      <span className="btn btn-primary mt-2 pointer-events-none">{cta}</span>
    </button>
  );
}

function ResultCard({
  result,
  preview,
  onLog,
  onReset,
}: {
  result: AiResult;
  preview: string | null;
  onLog: () => void;
  onReset: () => void;
}) {
  const n = result.nutrients;
  const confColor =
    result.confidence === "high"
      ? "var(--ok, #2e9e5b)"
      : result.confidence === "medium"
        ? "var(--accent)"
        : "var(--muted)";
  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--panel)] overflow-hidden">
      {preview ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={preview} alt="" className="w-full h-40 object-cover" />
      ) : null}
      <div className="px-5 pt-4">
        <div className="display-md">{result.name}</div>
        <div className="label mt-1">
          {result.brand ? `${result.brand} · ` : ""}
          <span className="numeric">{result.servingLabel}</span>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <span
            className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
            style={{ color: confColor, border: `1px solid ${confColor}` }}
          >
            {result.confidence} confidence
          </span>
        </div>
      </div>

      <div className="px-5 mt-4 grid grid-cols-4 gap-3">
        <Macro label="Cal" value={n.calories} />
        <Macro label="Protein" value={n.protein_g} unit="g" color="var(--accent)" />
        <Macro label="Carbs" value={n.carbs_g} unit="g" color="var(--info)" />
        <Macro label="Fat" value={n.fat_g} unit="g" color="var(--accent-soft)" />
      </div>

      {result.assumptions ? (
        <p className="px-5 mt-4 text-[12px] text-[var(--muted)] leading-relaxed">
          {result.assumptions}
        </p>
      ) : null}

      <div
        className="px-5 pt-4 pb-5 mt-4 border-t border-[var(--border)] grid grid-cols-[auto_1fr] gap-3"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 14px)" }}
      >
        <button type="button" onClick={onReset} className="btn !px-4" aria-label="Try again">
          <RotateCcw size={15} />
        </button>
        <button type="button" onClick={onLog} className="btn btn-primary btn-lg">
          Review &amp; log
        </button>
      </div>
    </div>
  );
}

function Macro({
  label,
  value,
  unit,
  color,
}: {
  label: string;
  value: number | null;
  unit?: string;
  color?: string;
}) {
  return (
    <div className="min-w-0">
      <div className="flex items-center gap-1 min-w-0">
        {color ? (
          <span className="inline-block w-1.5 h-1.5 rounded-full shrink-0" style={{ background: color }} />
        ) : null}
        <div className="label truncate">{label}</div>
      </div>
      <div className="mt-0.5 numeric text-[16px] font-semibold leading-none truncate">
        {value == null ? "—" : Math.round(value)}
        {unit && value != null ? (
          <span className="text-[var(--muted)] text-[11px] font-normal">{unit}</span>
        ) : null}
      </div>
    </div>
  );
}
