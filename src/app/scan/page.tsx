"use client";

import { BrowserMultiFormatReader } from "@zxing/browser";
import { BarcodeFormat, DecodeHintType } from "@zxing/library";
import { ArrowLeft, ScanBarcode, Search } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { ServingSheetAnim } from "@/components/AddEntrySheet";
import { findFoodByUpc, upsertFood } from "@/lib/storage";
import type { Food, Meal } from "@/lib/types";
import { todayISODate } from "@/lib/dates";
import { showToast } from "@/components/ToastHost";

export default function ScanPage() {
  return (
    <Suspense fallback={null}>
      <ScanPageInner />
    </Suspense>
  );
}

function ScanPageInner() {
  const router = useRouter();
  const params = useSearchParams();
  const date = params?.get("date") ?? todayISODate();
  const meal = (params?.get("meal") as Meal | null) ?? "snacks";

  const videoRef = useRef<HTMLVideoElement>(null);
  const stopRef = useRef<(() => void) | null>(null);
  const lastDetectedRef = useRef<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [food, setFood] = useState<Food | null>(null);
  const [manualUpc, setManualUpc] = useState("");

  const busyRef = useRef(false);

  const handleUpc = useCallback(async (upc: string) => {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    setError(null);
    try {
      const cached = findFoodByUpc(upc);
      if (cached) {
        setFood(cached);
        navigator.vibrate?.(40);
        return;
      }
      const res = await fetch(`/api/barcode/${encodeURIComponent(upc)}`);
      if (!res.ok) {
        setError(`No match for ${upc}.`);
        showToast(`Barcode ${upc} not found`, "error");
        return;
      }
      const data = (await res.json()) as { food: Food };
      if (!data.food) {
        setError(`No match for ${upc}.`);
        return;
      }
      upsertFood(data.food);
      setFood(data.food);
      navigator.vibrate?.(40);
    } catch {
      setError("Lookup failed.");
    } finally {
      busyRef.current = false;
      setBusy(false);
      window.setTimeout(() => {
        lastDetectedRef.current = null;
      }, 1500);
    }
  }, []);

  useEffect(() => {
    const hints = new Map<DecodeHintType, unknown>();
    hints.set(DecodeHintType.POSSIBLE_FORMATS, [
      BarcodeFormat.UPC_A,
      BarcodeFormat.UPC_E,
      BarcodeFormat.EAN_13,
      BarcodeFormat.EAN_8,
      BarcodeFormat.CODE_128,
    ]);
    hints.set(DecodeHintType.TRY_HARDER, true);
    const reader = new BrowserMultiFormatReader(hints as never);

    let stopped = false;

    const start = async () => {
      if (!videoRef.current) return;
      try {
        const controls = await reader.decodeFromVideoDevice(
          undefined,
          videoRef.current,
          (result) => {
            if (stopped) return;
            if (!result) return;
            const upc = result.getText().replace(/\D/g, "");
            if (!upc || upc === lastDetectedRef.current) return;
            lastDetectedRef.current = upc;
            handleUpc(upc);
          },
        );
        stopRef.current = () => controls.stop();
      } catch (e) {
        setError(
          (e as Error).message ||
            "Camera unavailable. Use manual entry below.",
        );
      }
    };

    start();
    return () => {
      stopped = true;
      if (stopRef.current) stopRef.current();
      stopRef.current = null;
    };
  }, [handleUpc]);

  return (
    <div className="flex-1 flex flex-col bg-black text-white">
      <header className="px-3 pt-3 pb-2 safe-top grid grid-cols-[auto_1fr_auto] items-center gap-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="p-2 rounded-md hover:bg-white/10"
          aria-label="Back"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="text-center text-[13px] font-semibold">Scan barcode</div>
        <Link href={`/add?meal=${meal}&date=${date}`} className="p-2 rounded-md hover:bg-white/10" aria-label="Manual search">
          <Search size={18} />
        </Link>
      </header>

      <div className="relative flex-1 overflow-hidden">
        <video
          ref={videoRef}
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div
            className="w-[78vw] max-w-[420px] aspect-[1.6/1] rounded-2xl"
            style={{ boxShadow: "0 0 0 9999px rgba(0,0,0,0.55)", borderColor: "rgba(255,255,255,0.85)", borderWidth: 2, borderStyle: "solid" }}
          />
        </div>
        <div className="absolute inset-x-0 bottom-0 p-4 pb-6 safe-bottom flex flex-col items-center gap-3">
          <div className="flex items-center gap-2 text-[13px] text-white/80">
            <ScanBarcode size={14} />
            Align a UPC inside the frame
          </div>
          {error ? (
            <div className="rounded-md bg-red-600/90 text-white text-[12px] px-3 py-1.5">
              {error}
            </div>
          ) : null}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const v = manualUpc.replace(/\D/g, "");
              if (v.length >= 6) handleUpc(v);
            }}
            className="w-full max-w-md flex gap-2"
          >
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="Or enter UPC"
              value={manualUpc}
              onChange={(e) => setManualUpc(e.target.value)}
              className="flex-1 !bg-white/10 !text-white !border-white/30 placeholder:text-white/50"
            />
            <button
              type="submit"
              className="btn !bg-white !text-black !border-white"
              disabled={busy}
            >
              Look up
            </button>
          </form>
        </div>
      </div>

      <ServingSheetAnim
        food={food}
        meal={meal}
        date={date}
        onClose={() => setFood(null)}
        onLogged={() => {
          setFood(null);
          router.push("/");
        }}
      />
    </div>
  );
}
