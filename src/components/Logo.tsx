"use client";

/**
 * FUEL — horizontal fuel-gauge bars (sibling to OVERLOAD's vertical bars).
 *   Three stacked horizontal bars, lengths increasing top→bottom:
 *     short  blue  (background level)
 *     medium white (mid)
 *     long   orange (full tank)
 */
export function LogoMark({ size = 24 }: { size?: number }) {
  const s = size;
  const pad = Math.round(s * 0.1);
  const inner = s - pad * 2;
  const barH = Math.max(2, Math.round(inner * 0.18));
  const gap = Math.max(1, Math.round(inner * 0.08));
  const groupH = barH * 3 + gap * 2;
  const startY = pad + Math.round((inner - groupH) / 2);
  const x = pad;

  // ascending lengths top → bottom
  const w1 = Math.round(inner * 0.5);
  const w2 = Math.round(inner * 0.74);
  const w3 = inner;

  return (
    <svg
      width={s}
      height={s}
      viewBox={`0 0 ${s} ${s}`}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      style={{ display: "inline-block", verticalAlign: "middle" }}
    >
      <rect x={x} y={startY} width={w1} height={barH} fill="var(--info)" rx={1} />
      <rect
        x={x}
        y={startY + barH + gap}
        width={w2}
        height={barH}
        fill="var(--fg)"
        rx={1}
      />
      <rect
        x={x}
        y={startY + (barH + gap) * 2}
        width={w3}
        height={barH}
        fill="var(--accent)"
        rx={1}
      />
    </svg>
  );
}

export function LogoWordmark({ size = 22 }: { size?: number }) {
  return (
    <span
      style={{
        fontFamily: "var(--font-display)",
        fontSize: size,
        fontWeight: 600,
        letterSpacing: "-0.02em",
        lineHeight: 1,
      }}
    >
      FUEL
    </span>
  );
}

export function Logo({ size = 22 }: { size?: number }) {
  return (
    <span className="inline-flex items-center gap-2">
      <LogoMark size={size + 4} />
      <LogoWordmark size={size} />
    </span>
  );
}
