export function todayISODate(): string {
  const d = new Date();
  return toIsoDate(d);
}

export function toIsoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

export function fromIsoDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function shiftDays(iso: string, delta: number): string {
  const d = fromIsoDate(iso);
  d.setDate(d.getDate() + delta);
  return toIsoDate(d);
}

export function formatLogDate(iso: string): string {
  const d = fromIsoDate(iso);
  const today = new Date();
  const yIso = toIsoDate(d);
  const tIso = toIsoDate(today);
  if (yIso === tIso) return "Today";
  const yest = new Date(today);
  yest.setDate(today.getDate() - 1);
  if (yIso === toIsoDate(yest)) return "Yesterday";
  const tomr = new Date(today);
  tomr.setDate(today.getDate() + 1);
  if (yIso === toIsoDate(tomr)) return "Tomorrow";
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export function newId(prefix = "id"): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}
