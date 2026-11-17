import { Link, usePage } from '@inertiajs/react';
import { Loader2, type LucideIcon } from 'lucide-react';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Badge, badgeToneClasses } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { formatMoney, humanize } from './format';

/** Currency configured in Finance Settings (shared with every page). */
export function useMoney() {
    const currency = (usePage().props as { financeCurrency?: string }).financeCurrency ?? 'USD';
    return (value: number | string | null | undefined, opts?: { compact?: boolean; signed?: boolean }) => formatMoney(value, currency, opts);
}

export type Tone = 'primary' | 'success' | 'info' | 'warning' | 'danger' | 'neutral' | 'violet';

const toneStyles: Record<Tone, { chip: string; bar: string; text: string }> = {
    primary: { chip: 'bg-primary/10 text-primary border-primary/20', bar: 'bg-primary', text: 'text-primary' },
    success: { chip: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-300', bar: 'bg-emerald-500', text: 'text-emerald-600 dark:text-emerald-300' },
    info: { chip: 'bg-sky-500/10 text-sky-600 border-sky-500/20 dark:text-sky-300', bar: 'bg-sky-500', text: 'text-sky-600 dark:text-sky-300' },
    warning: { chip: 'bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-300', bar: 'bg-amber-500', text: 'text-amber-600 dark:text-amber-300' },
    danger: { chip: 'bg-red-500/10 text-red-600 border-red-500/20 dark:text-red-300', bar: 'bg-red-500', text: 'text-red-600 dark:text-red-300' },
    neutral: { chip: 'bg-slate-500/10 text-slate-600 border-slate-500/20 dark:text-slate-300', bar: 'bg-slate-400', text: 'text-muted-foreground' },
    violet: { chip: 'bg-violet-500/10 text-violet-600 border-violet-500/20 dark:text-violet-300', bar: 'bg-violet-500', text: 'text-violet-600 dark:text-violet-300' },
};
export const toneOf = (t: Tone) => toneStyles[t];

/** Animates a number from 0 to its value (respects reduced motion). */
export function useCountUp(target: number, duration = 700): number {
    const [value, setValue] = useState(0);
    const frame = useRef<number | null>(null);
    useEffect(() => {
        if (typeof window === 'undefined' || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
            setValue(target);
            return;
        }
        const start = performance.now();
        const tick = (now: number) => {
            const t = Math.min(1, (now - start) / duration);
            setValue(target * (1 - Math.pow(1 - t, 3)));
            if (t < 1) frame.current = requestAnimationFrame(tick);
        };
        frame.current = requestAnimationFrame(tick);
        return () => {
            if (frame.current) cancelAnimationFrame(frame.current);
        };
    }, [target, duration]);
    return value;
}

export function PageHeader({ title, description, icon: Icon, actions, back }: { title: string; description?: ReactNode; icon?: LucideIcon; actions?: ReactNode; back?: { href: string; label: string } }) {
    return (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex min-w-0 items-start gap-3">
                {Icon && (
                    <div className="fin-rise mt-0.5 hidden size-10 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary sm:flex">
                        <Icon className="size-5" />
                    </div>
                )}
                <div className="min-w-0">
                    {back && (
                        <Link href={back.href} className="mb-1 inline-block text-xs text-muted-foreground hover:text-foreground">
                            ← {back.label}
                        </Link>
                    )}
                    <h1 className="page-title-enter text-xl font-semibold tracking-tight">{title}</h1>
                    {description && <p className="page-description-enter mt-0.5 max-w-3xl text-sm text-muted-foreground">{description}</p>}
                </div>
            </div>
            {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
        </div>
    );
}

export type Kpi = { title: string; value: number; format?: 'money' | 'number' | 'percent'; hint?: ReactNode; icon: LucideIcon; tone?: Tone; compact?: boolean };

export function KpiCard({ kpi, index = 0 }: { kpi: Kpi; index?: number }) {
    const money = useMoney();
    const animated = useCountUp(kpi.value);
    const tone = toneStyles[kpi.tone ?? 'primary'];
    const shown = kpi.format === 'number' ? Math.round(animated).toLocaleString() : kpi.format === 'percent' ? `${animated.toFixed(1)}%` : money(animated, { compact: kpi.compact });
    const Icon = kpi.icon;
    return (
        <Card className="fin-rise group relative overflow-hidden rounded-xl border-border/70 py-0 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-md" style={{ animationDelay: `${index * 60}ms` }}>
            <span className={cn('absolute inset-x-0 top-0 h-0.5 opacity-70 transition-opacity group-hover:opacity-100', tone.bar)} />
            <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <p className="truncate text-[11px] font-medium tracking-wider text-muted-foreground uppercase">{kpi.title}</p>
                        <p className="mt-1.5 truncate text-2xl font-semibold tracking-tight tabular-nums">{shown}</p>
                        {kpi.hint && <p className="mt-1 truncate text-xs text-muted-foreground">{kpi.hint}</p>}
                    </div>
                    <div className={cn('flex size-9 shrink-0 items-center justify-center rounded-lg border transition-transform group-hover:scale-110', tone.chip)}>
                        <Icon className="size-4" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export function KpiGrid({ items, className }: { items: Kpi[]; className?: string }) {
    return (
        <div className={cn('grid gap-3 sm:grid-cols-2', items.length >= 4 ? 'xl:grid-cols-4' : items.length === 3 ? 'xl:grid-cols-3' : '', className)}>
            {items.map((kpi, i) => (
                <KpiCard key={kpi.title} kpi={kpi} index={i} />
            ))}
        </div>
    );
}

export function Panel({ title, description, action, children, className, flush }: { title?: ReactNode; description?: ReactNode; action?: ReactNode; children: ReactNode; className?: string; flush?: boolean }) {
    return (
        <section className={cn('fin-rise min-w-0 rounded-xl border border-border/70 bg-card shadow-sm', className)}>
            {(title || action) && (
                <header className="flex items-start justify-between gap-3 border-b border-border/60 px-4 py-3">
                    <div className="min-w-0">
                        <h2 className="text-sm font-semibold">{title}</h2>
                        {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
                    </div>
                    {action}
                </header>
            )}
            <div className={flush ? '' : 'p-4'}>{children}</div>
        </section>
    );
}

export function EmptyState({ icon: Icon, title, description, action }: { icon: LucideIcon; title: string; description?: string; action?: ReactNode }) {
    return (
        <div className="flex flex-col items-center justify-center gap-2 px-4 py-10 text-center">
            <div className="flex size-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <Icon className="size-5" />
            </div>
            <p className="text-sm font-medium">{title}</p>
            {description && <p className="max-w-sm text-xs text-muted-foreground">{description}</p>}
            {action}
        </div>
    );
}

const statusTone: Record<string, string> = {
    paid: badgeToneClasses.success, completed: badgeToneClasses.success, received: badgeToneClasses.success, active: badgeToneClasses.success, accepted: badgeToneClasses.success, in: badgeToneClasses.success,
    pending: badgeToneClasses.warning, partially_paid: badgeToneClasses.warning, sent: badgeToneClasses.info, in_progress: badgeToneClasses.progress,
    overdue: badgeToneClasses.danger, out: badgeToneClasses.danger,
    draft: badgeToneClasses.neutral, cancelled: badgeToneClasses.neutral, inactive: badgeToneClasses.neutral,
};

export function StatusBadge({ status, className }: { status: string | null | undefined; className?: string }) {
    if (!status) return <span className="text-muted-foreground">—</span>;
    return (
        <Badge variant="outline" className={cn('rounded-md text-[11px] font-medium', statusTone[status] ?? badgeToneClasses.neutral, className)}>
            {humanize(status)}
        </Badge>
    );
}

export function Field({ label, error, hint, children, className, required }: { label: string; error?: string; hint?: ReactNode; children: ReactNode; className?: string; required?: boolean }) {
    return (
        <div className={cn('grid gap-1.5', className)}>
            <Label className="text-xs font-medium">
                {label}
                {required && <span className="ml-0.5 text-destructive">*</span>}
            </Label>
            {children}
            {error ? <p className="text-xs text-destructive">{error}</p> : hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
        </div>
    );
}

export type Option = { value: string; label: string };

export function SelectField({ value, onChange, options, placeholder = 'Select…', allowEmpty, invalid, disabled }: { value: string | number | null | undefined; onChange: (v: string) => void; options: Option[]; placeholder?: string; allowEmpty?: string; invalid?: boolean; disabled?: boolean }) {
    const EMPTY = '__none__';
    return (
        <Select value={value === null || value === undefined || value === '' ? (allowEmpty ? EMPTY : '') : String(value)} onValueChange={(v) => onChange(v === EMPTY ? '' : v)} disabled={disabled}>
            <SelectTrigger className="w-full" aria-invalid={invalid}>
                <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
                {allowEmpty && <SelectItem value={EMPTY}>{allowEmpty}</SelectItem>}
                {options.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                        {o.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}

/** Small filter dropdown used above tables. */
export function FilterSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: Option[] }) {
    return (
        <Select value={value} onValueChange={onChange}>
            <SelectTrigger size="sm" className="h-8 min-w-36 gap-1 text-xs" aria-label={label}>
                <span className="text-muted-foreground">{label}:</span>
                <SelectValue />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {options.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                        {o.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}

export function MoneyInput(props: React.ComponentProps<typeof Input>) {
    return <Input type="number" inputMode="decimal" step="0.01" min="0" {...props} />;
}

export function SubmitButton({ processing, children, ...rest }: { processing: boolean; children: ReactNode } & React.ComponentProps<typeof Button>) {
    return (
        <Button type="submit" disabled={processing} {...rest}>
            {processing && <Loader2 className="size-4 animate-spin" />}
            {children}
        </Button>
    );
}

export function Meter({ value, max, tone = 'primary', label }: { value: number; max: number; tone?: Tone; label?: string }) {
    const pct = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0;
    return (
        <div role="meter" aria-label={label} aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100} className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div className={cn('fin-grow-x h-full rounded-full', toneStyles[tone].bar)} style={{ width: `${pct}%` }} />
        </div>
    );
}

export function DefinitionList({ items }: { items: { label: string; value: ReactNode }[] }) {
    return (
        <dl className="divide-y divide-border/60">
            {items.map((it) => (
                <div key={it.label} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5 py-2.5 first:pt-0 last:pb-0">
                    <dt className="text-sm text-muted-foreground">{it.label}</dt>
                    <dd className="min-w-0 text-right text-sm font-medium [overflow-wrap:anywhere]">{it.value === null || it.value === undefined || it.value === '' ? '—' : it.value}</dd>
                </div>
            ))}
        </dl>
    );
}
