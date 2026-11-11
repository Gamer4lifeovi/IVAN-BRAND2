"use client";
import { useId } from "react";

const MUTED = "var(--muted)";
const LINE = "var(--line)";

export function Sparkline({ data, color = "var(--accent-text)" }: { data: number[]; color?: string }) {
  const id = useId();
  const w = 112, h = 46;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const span = max - min || 1;
  const pts = data.map((v, i) => [(i / Math.max(data.length - 1, 1)) * w, h - 5 - ((v - min) / span) * (h - 10)]);
  const line = pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-11 w-28 shrink-0" fill="none" aria-hidden>
      <defs><linearGradient id={id} x1="0" x2="0" y1="0" y2="1"><stop offset="0" style={{ stopColor: color, stopOpacity: 0.3 }} /><stop offset="1" style={{ stopColor: color, stopOpacity: 0 }} /></linearGradient></defs>
      {pts.length > 1 && <path d={`${line} L${w},${h} L0,${h} Z`} style={{ fill: `url(#${id})` }} />}
      <path d={line} style={{ stroke: color }} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

type Series = { name: string; color: string; data: number[]; scaleToFirst?: boolean };

export function AreaChart({ labels, series, format }: { labels: string[]; series: Series[]; format: (n: number) => string }) {
  const id = useId();
  const W = 680, H = 250, L = 52, R = 14, T = 14, B = 28;
  const max0 = Math.max(...(series[0]?.data ?? []), 1);
  const x = (i: number) => L + (i / Math.max(labels.length - 1, 1)) * (W - L - R);
  const y = (v: number) => T + (1 - v / max0) * (H - T - B);
  const scaled = series.map(s => {
    if (!s.scaleToFirst) return s.data;
    const m = Math.max(...s.data, 1);
    return s.data.map(v => (v / m) * max0);
  });
  const step = Math.max(1, Math.ceil(labels.length / 6));
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Sales chart">
      <defs>
        {series.map((s, i) => <linearGradient key={i} id={`${id}-${i}`} x1="0" x2="0" y1="0" y2="1"><stop offset="0" style={{ stopColor: s.color, stopOpacity: 0.22 }} /><stop offset="1" style={{ stopColor: s.color, stopOpacity: 0 }} /></linearGradient>)}
      </defs>
      {[0, 0.25, 0.5, 0.75, 1].map(t => (
        <g key={t}>
          <line x1={L} x2={W - R} y1={y(t * max0)} y2={y(t * max0)} style={{ stroke: LINE }} />
          <text x={L - 8} y={y(t * max0) + 4} textAnchor="end" fontSize="10" style={{ fill: MUTED }}>{format(Math.round(t * max0))}</text>
        </g>
      ))}
      {labels.map((lb, i) => (i % step === 0 ? <text key={i} x={x(i)} y={H - 8} textAnchor="middle" fontSize="10" style={{ fill: MUTED }}>{lb}</text> : null))}
      {series.map((s, si) => {
        const d = scaled[si].map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
        return (
          <g key={s.name}>
            <path d={`${d} L${x(labels.length - 1)},${y(0)} L${x(0)},${y(0)} Z`} style={{ fill: `url(#${id}-${si})` }} />
            <path d={d} style={{ stroke: s.color }} strokeWidth="2" fill="none" strokeLinejoin="round" />
            {labels.length <= 14 && scaled[si].map((v, i) => <circle key={i} cx={x(i)} cy={y(v)} r="3" style={{ fill: "var(--surface)", stroke: s.color }} strokeWidth="1.5" />)}
          </g>
        );
      })}
    </svg>
  );
}

export function Radar({ axes, values, color = "var(--accent-text)" }: { axes: string[]; values: number[]; color?: string }) {
  const n = axes.length;
  if (n < 3) return null;
  const cx = 150, cy = 120, r = 76;
  const max = Math.max(...values, 1);
  const pt = (i: number, f: number) => {
    const a = -Math.PI / 2 + (i / n) * Math.PI * 2;
    return [cx + Math.cos(a) * r * f, cy + Math.sin(a) * r * f] as const;
  };
  const ring = (f: number) => axes.map((_, i) => pt(i, f).join(",")).join(" ");
  const shape = values.map((v, i) => pt(i, v / max).join(",")).join(" ");
  return (
    <svg viewBox="0 0 300 240" className="mx-auto w-full max-w-[340px]" role="img" aria-label="Revenue by category">
      {[0.25, 0.5, 0.75, 1].map(f => <polygon key={f} points={ring(f)} fill="none" style={{ stroke: LINE }} />)}
      {axes.map((_, i) => { const [px, py] = pt(i, 1); return <line key={i} x1={cx} y1={cy} x2={px} y2={py} style={{ stroke: LINE }} />; })}
      <polygon points={shape} style={{ fill: color, fillOpacity: 0.25, stroke: color }} strokeWidth="2" />
      {axes.map((lb, i) => { const [px, py] = pt(i, 1.24); return <text key={lb + i} x={px} y={py + 3} textAnchor="middle" fontSize="10" style={{ fill: MUTED }}>{lb.length > 14 ? `${lb.slice(0, 13)}…` : lb}</text>; })}
    </svg>
  );
}
