import { useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import { useMoney } from './kit';

const PALETTE = ['#16a34a', '#0ea5e9', '#f59e0b', '#8b5cf6', '#ef4444', '#14b8a6', '#64748b'];

function niceStep(raw: number): number {
    const pow = Math.pow(10, Math.floor(Math.log10(Math.max(raw, 1))));
    const n = raw / pow;
    return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * pow;
}

type TrendPoint = { month: string; revenue: number; expenses: number; profit: number };

/** Revenue vs cost bars with a net-profit line. Hover a month for the exact numbers. */
export function TrendChart({ data }: { data: TrendPoint[] }) {
    const money = useMoney();
    const [hover, setHover] = useState<number | null>(null);
    const W = 640;
    const H = 240;
    const pad = { t: 16, r: 12, b: 28, l: 44 };
    const rawMax = Math.max(1, ...data.flatMap((d) => [d.revenue, d.expenses, d.profit]));
    const rawMin = Math.min(0, ...data.map((d) => d.profit));
    const step = niceStep((rawMax - rawMin) / 4);
    const max = Math.ceil(rawMax / step) * step;
    const min = Math.floor(rawMin / step) * step;
    const span = max - min || 1;
    const y = (v: number) => pad.t + (1 - (v - min) / span) * (H - pad.t - pad.b);
    const slot = (W - pad.l - pad.r) / Math.max(1, data.length);
    const bar = Math.min(26, slot * 0.28);
    const ticks = Array.from({ length: Math.round(span / step) + 1 }, (_, i) => min + i * step);
    const line = data.map((d, i) => `${i === 0 ? 'M' : 'L'}${pad.l + slot * i + slot / 2},${y(d.profit)}`).join(' ');

    return (
        <div className="relative">
            <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Revenue, expenses and profit by month">
                {ticks.map((t) => (
                    <g key={t}>
                        <line x1={pad.l} x2={W - pad.r} y1={y(t)} y2={y(t)} className="stroke-border" strokeDasharray="3 4" />
                        <text x={pad.l - 6} y={y(t) + 3} textAnchor="end" className="fill-muted-foreground text-[9px]">
                            {money(t, { compact: true }).replace(/\.00$/, '')}
                        </text>
                    </g>
                ))}
                {data.map((d, i) => {
                    const cx = pad.l + slot * i + slot / 2;
                    return (
                        <g key={d.month} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} onFocus={() => setHover(i)} onBlur={() => setHover(null)} tabIndex={0}>
                            <rect x={cx - slot / 2} y={pad.t} width={slot} height={H - pad.t - pad.b} fill="transparent" />
                            {hover === i && <rect x={cx - slot / 2 + 2} y={pad.t} width={slot - 4} height={H - pad.t - pad.b} className="fill-muted/60" rx={6} />}
                            <rect className="fin-grow-y" style={{ animationDelay: `${i * 70}ms` }} x={cx - bar - 1.5} y={y(Math.max(d.revenue, 0))} width={bar} height={Math.max(0, y(0) - y(Math.max(d.revenue, 0)))} rx={3} fill="#16a34a" />
                            <rect className="fin-grow-y" style={{ animationDelay: `${i * 70 + 40}ms` }} x={cx + 1.5} y={y(Math.max(d.expenses, 0))} width={bar} height={Math.max(0, y(0) - y(Math.max(d.expenses, 0)))} rx={3} fill="#f59e0b" />
                            <text x={cx} y={H - 8} textAnchor="middle" className="fill-muted-foreground text-[10px]">
                                {d.month}
                            </text>
                        </g>
                    );
                })}
                <path d={line} fill="none" stroke="#0ea5e9" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="fin-draw" style={{ ['--len' as string]: 1200 }} />
                {data.map((d, i) => (
                    <circle key={d.month} cx={pad.l + slot * i + slot / 2} cy={y(d.profit)} r={hover === i ? 4.5 : 3} fill="#0ea5e9" className="stroke-card transition-all" strokeWidth={1.5} />
                ))}
            </svg>
            <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                {[['Revenue', '#16a34a'], ['Costs', '#f59e0b'], ['Net profit', '#0ea5e9']].map(([label, color]) => (
                    <span key={label} className="inline-flex items-center gap-1.5">
                        <span className="size-2.5 rounded-sm" style={{ background: color }} />
                        {label}
                    </span>
                ))}
            </div>
            {hover !== null && data[hover] && (
                <div className="pointer-events-none absolute top-2 right-2 rounded-lg border bg-popover px-3 py-2 text-xs shadow-md">
                    <p className="font-semibold">{data[hover].month}</p>
                    <p className="text-emerald-600 dark:text-emerald-300">Revenue {money(data[hover].revenue)}</p>
                    <p className="text-amber-600 dark:text-amber-300">Costs {money(data[hover].expenses)}</p>
                    <p className="text-sky-600 dark:text-sky-300">Profit {money(data[hover].profit)}</p>
                </div>
            )}
        </div>
    );
}

export type Slice = { label: string; value: number };

/** Donut with a legend; each slice shows its share of the total. */
export function DonutChart({ data, centerLabel = 'Total' }: { data: Slice[]; centerLabel?: string }) {
    const money = useMoney();
    const [active, setActive] = useState<number | null>(null);
    const total = data.reduce((s, d) => s + Math.max(0, d.value), 0);
    const R = 52;
    const C = 2 * Math.PI * R;
    const arcs = useMemo(() => {
        let offset = 0;
        return data.map((d) => {
            const len = total > 0 ? (Math.max(0, d.value) / total) * C : 0;
            const arc = { len, offset };
            offset += len;
            return arc;
        });
    }, [data, total, C]);

    if (total <= 0) return <p className="py-8 text-center text-sm text-muted-foreground">No data yet.</p>;
    const focus = active !== null ? data[active] : null;

    return (
        <div className="flex flex-col items-center gap-4">
            <svg viewBox="0 0 140 140" className="size-36 shrink-0 -rotate-90" role="img" aria-label="Breakdown">
                <circle cx={70} cy={70} r={R} fill="none" className="stroke-muted" strokeWidth={16} />
                {data.map((d, i) => (
                    <circle key={d.label} cx={70} cy={70} r={R} fill="none" stroke={PALETTE[i % PALETTE.length]} strokeWidth={active === i ? 19 : 16} strokeDasharray={`${arcs[i].len} ${C - arcs[i].len}`} strokeDashoffset={-arcs[i].offset} className="transition-all duration-300" onMouseEnter={() => setActive(i)} onMouseLeave={() => setActive(null)} />
                ))}
                <g className="rotate-90" style={{ transformOrigin: '70px 70px' }}>
                    <text x={70} y={66} textAnchor="middle" className="fill-muted-foreground text-[8px]">
                        {focus ? focus.label : centerLabel}
                    </text>
                    <text x={70} y={80} textAnchor="middle" className="fill-foreground text-[11px] font-semibold">
                        {money(focus ? focus.value : total, { compact: true })}
                    </text>
                </g>
            </svg>
            <ul className="grid w-full gap-1.5 text-sm">
                {data.map((d, i) => (
                    <li key={d.label} className={cn('flex items-center justify-between gap-3 rounded-md px-2 py-1 transition-colors', active === i && 'bg-muted')} onMouseEnter={() => setActive(i)} onMouseLeave={() => setActive(null)}>
                        <span className="flex min-w-0 items-center gap-2">
                            <span className="size-2.5 shrink-0 rounded-sm" style={{ background: PALETTE[i % PALETTE.length] }} />
                            <span className="truncate">{d.label}</span>
                        </span>
                        <span className="shrink-0 tabular-nums text-muted-foreground">
                            {money(d.value, { compact: true })} · {Math.round((d.value / total) * 100)}%
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    );
}

/** Ranked horizontal bars (categories, technicians, methods…). */
export function BarList({ data, color = '#16a34a', limit = 6 }: { data: Slice[]; color?: string; limit?: number }) {
    const money = useMoney();
    const rows = data.slice(0, limit);
    const max = Math.max(1, ...rows.map((r) => r.value));
    if (!rows.length) return <p className="py-6 text-center text-sm text-muted-foreground">No data yet.</p>;
    return (
        <ul className="grid gap-3">
            {rows.map((r, i) => (
                <li key={r.label} className="grid gap-1">
                    <div className="flex items-center justify-between gap-3 text-sm">
                        <span className="truncate">{r.label}</span>
                        <span className="shrink-0 font-medium tabular-nums">{money(r.value)}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                        <div className="fin-grow-x h-full rounded-full" style={{ width: `${(r.value / max) * 100}%`, background: color, animationDelay: `${i * 80}ms` }} />
                    </div>
                </li>
            ))}
        </ul>
    );
}

/** Stacked receivables-aging bar. */
export function AgingBar({ aging }: { aging: { current: number; d1_30: number; d31_60: number; d60_plus: number } }) {
    const money = useMoney();
    const parts = [
        { key: 'current', label: 'Not yet due', value: aging.current, color: '#16a34a' },
        { key: 'd1_30', label: '1–30 days late', value: aging.d1_30, color: '#f59e0b' },
        { key: 'd31_60', label: '31–60 days late', value: aging.d31_60, color: '#f97316' },
        { key: 'd60_plus', label: '60+ days late', value: aging.d60_plus, color: '#ef4444' },
    ];
    const total = parts.reduce((s, p) => s + p.value, 0);
    return (
        <div className="grid gap-3">
            <div className="flex h-3 overflow-hidden rounded-full bg-muted">
                {total > 0 &&
                    parts.map((p) => <div key={p.key} className="fin-grow-x h-full" style={{ width: `${(p.value / total) * 100}%`, background: p.color }} title={`${p.label}: ${money(p.value)}`} />)}
            </div>
            <ul className="grid grid-cols-2 gap-2 text-xs">
                {parts.map((p) => (
                    <li key={p.key} className="flex items-center justify-between gap-2 rounded-md border px-2 py-1.5">
                        <span className="flex items-center gap-1.5 text-muted-foreground">
                            <span className="size-2 rounded-full" style={{ background: p.color }} />
                            {p.label}
                        </span>
                        <span className="font-medium tabular-nums">{money(p.value)}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}
