"use client";

export function Sparkline({
  values,
  width = 200,
  height = 48,
  stroke = "var(--accent)",
  fill = "color-mix(in srgb, var(--accent) 18%, transparent)",
  showPoints = true,
}: {
  values: Array<number | null>;
  width?: number;
  height?: number;
  stroke?: string;
  fill?: string;
  showPoints?: boolean;
}) {
  const valid = values.filter((v): v is number => v != null);
  if (!valid.length) {
    return (
      <svg width={width} height={height} aria-hidden>
        <line
          x1={0}
          y1={height / 2}
          x2={width}
          y2={height / 2}
          stroke="var(--border)"
          strokeDasharray="3 4"
        />
      </svg>
    );
  }

  const pad = 4;
  const min = Math.min(...valid);
  const max = Math.max(...valid);
  const range = max - min || 1;
  const points = values.map((v, i) => {
    const x = pad + ((width - pad * 2) * i) / Math.max(1, values.length - 1);
    if (v == null) return null;
    const y = height - pad - ((v - min) / range) * (height - pad * 2);
    return { x, y, v };
  });

  const segments: Array<Array<{ x: number; y: number }>> = [];
  let current: Array<{ x: number; y: number }> = [];
  for (const p of points) {
    if (!p) {
      if (current.length) segments.push(current);
      current = [];
    } else {
      current.push({ x: p.x, y: p.y });
    }
  }
  if (current.length) segments.push(current);

  const lastValid = points.filter(Boolean).at(-1);

  return (
    <svg width={width} height={height} aria-hidden>
      {segments.map((seg, i) => {
        const d = seg
          .map((p, j) => `${j === 0 ? "M" : "L"}${p.x.toFixed(2)},${p.y.toFixed(2)}`)
          .join(" ");
        const area =
          seg.length > 1
            ? `${d} L${seg[seg.length - 1].x.toFixed(2)},${height - pad} L${seg[0].x.toFixed(2)},${height - pad} Z`
            : "";
        return (
          <g key={i}>
            {area ? <path d={area} fill={fill} /> : null}
            <path d={d} fill="none" stroke={stroke} strokeWidth={1.5} strokeLinecap="round" />
          </g>
        );
      })}
      {showPoints && lastValid ? (
        <circle cx={lastValid.x} cy={lastValid.y} r={2.6} fill={stroke} />
      ) : null}
    </svg>
  );
}
