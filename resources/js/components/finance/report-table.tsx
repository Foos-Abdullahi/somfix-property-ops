import { Download, FileSpreadsheet, Printer } from 'lucide-react';
import { useMemo, useState } from 'react';
import { EmptyState, Panel, StatusBadge, useMoney } from '@/components/finance/kit';
import { formatDate } from '@/components/finance/format';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export type ReportColumn = { key: string; label: string; type: 'text' | 'date' | 'month' | 'money' | 'percent' | 'number'; total?: boolean };
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ReportRow = Record<string, any>;
export type Dataset = { key: string; title: string; description: string; year: number; columns: ReportColumn[]; rows: ReportRow[]; totals: Record<string, number> };

const exportUrl = (key: string, year: number, format: 'csv' | 'xlsx') => `/finance/reports/${key}/export?format=${format}&year=${year}`;

export function ReportTable({ dataset }: { dataset: Dataset }) {
    const money = useMoney();
    const [query, setQuery] = useState('');
    const isPl = dataset.key === 'profit_loss';
    const rows = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return dataset.rows;
        return dataset.rows.filter((r) => dataset.columns.some((c) => String(r[c.key] ?? '').toLowerCase().includes(q)));
    }, [dataset, query]);
    // Totals follow the filtered rows so the screen matches what is printed.
    const totals = useMemo(() => {
        const out: Record<string, number> = {};
        for (const key of Object.keys(dataset.totals)) out[key] = rows.reduce((s, r) => s + Number(r[key] ?? 0), 0);
        return out;
    }, [dataset, rows]);

    const cell = (c: ReportColumn, r: ReportRow) => {
        const v = r[c.key];
        if (v === null || v === undefined || v === '') return <span className="text-muted-foreground/60">—</span>;
        switch (c.type) {
            case 'money':
                return Number(v) === 0 && isPl ? <span className="text-muted-foreground/50">–</span> : <span className={cn(Number(v) < 0 && 'text-destructive')}>{money(v)}</span>;
            case 'percent':
                return `${Number(v).toFixed(1)}%`;
            case 'number':
                return Number(v).toLocaleString();
            case 'date':
                return formatDate(v);
            default:
                return c.key === 'status' ? <StatusBadge status={String(v).toLowerCase().replaceAll(' ', '_')} /> : String(v);
        }
    };
    const align = (c: ReportColumn) => (['money', 'percent', 'number'].includes(c.type) ? 'text-right tabular-nums' : 'text-left');
    const emphasized = (r: ReportRow) => isPl && /^(Total|Gross profit|Net profit)/.test(String(r.line));

    return (
        <Panel
            title={dataset.title}
            description={dataset.description}
            flush
            action={
                <div className="no-print flex flex-wrap items-center justify-end gap-2">
                    <Button size="sm" variant="outline" asChild><a href={exportUrl(dataset.key, dataset.year, 'csv')}><Download className="size-4" />CSV / Excel</a></Button>
                    <Button size="sm" variant="outline" onClick={() => window.print()}><Printer className="size-4" />Print</Button>
                </div>
            }
        >
            <div className="print-only px-4 pt-2 text-xs">SOMFIX · {dataset.title} · {dataset.year} · generated {new Date().toLocaleDateString('en')}</div>
            {!isPl && dataset.rows.length > 0 && (
                <div className="no-print flex items-center justify-between gap-3 border-b px-4 py-2.5">
                    <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search this report…" className="h-9 max-w-xs" />
                    <span className="text-xs whitespace-nowrap text-muted-foreground">{rows.length} of {dataset.rows.length} rows</span>
                </div>
            )}
            {dataset.rows.length === 0 ? (
                <EmptyState icon={FileSpreadsheet} title="No data for this period" description="Records dated in the selected year will appear here." />
            ) : (
                <div className="print-scroll overflow-x-auto">
                    <table className="print-table w-full min-w-max border-collapse text-sm">
                        <thead>
                            <tr className="border-b-2 bg-muted/40 text-xs text-muted-foreground">
                                {dataset.columns.map((c, i) => (
                                    <th key={c.key} className={cn('px-3 py-2 font-medium whitespace-nowrap', align(c), isPl && i === 0 && 'sticky left-0 z-10 bg-muted')}>{c.label}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((r, idx) => (
                                <tr key={idx} className={cn('border-b border-border/60 hover:bg-muted/30', emphasized(r) && 'bg-muted/50 font-semibold')}>
                                    {dataset.columns.map((c, i) => (
                                        <td key={c.key} className={cn('px-3 py-1.5 whitespace-nowrap', align(c), isPl && i === 0 && 'sticky left-0 z-10 bg-card', isPl && i === 0 && emphasized(r) && 'bg-muted')}>{cell(c, r)}</td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                        {!isPl && Object.keys(totals).length > 0 && (
                            <tfoot>
                                <tr className="border-t-2 bg-muted/50 font-semibold">
                                    {dataset.columns.map((c, i) => (
                                        <td key={c.key} className={cn('px-3 py-2 whitespace-nowrap', align(c))}>{i === 0 ? 'Total' : c.key in totals ? money(totals[c.key]) : ''}</td>
                                    ))}
                                </tr>
                            </tfoot>
                        )}
                    </table>
                </div>
            )}
        </Panel>
    );
}
