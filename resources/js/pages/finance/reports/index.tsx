import { Head, router } from '@inertiajs/react';
import { FileBarChart, Printer } from 'lucide-react';
import { FilterSelect, KpiGrid, PageHeader, Panel, useMoney } from '@/components/finance/kit';
import { TrendChart } from '@/components/finance/charts';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { BreadcrumbItem } from '@/types';
import { PiggyBank, Percent, TrendingUp, Wallet } from 'lucide-react';

type Line = { label: string; months: number[]; total: number };
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function Reports({ report, years }: { report: Any; years: number[] }) {
    const money = useMoney();
    const cell = (v: number) => (v === 0 ? <span className="text-muted-foreground/50">–</span> : <span className={v < 0 ? 'text-destructive' : ''}>{money(v)}</span>);
    const Row = ({ line, kind }: { line: Line; kind?: 'total' | 'head' | 'sub' }) => (
        <tr className={cn('border-b border-border/60', kind === 'total' && 'bg-muted/50 font-semibold', kind === 'sub' && 'text-muted-foreground')}>
            <td className={cn('sticky left-0 z-10 bg-card py-1.5 pr-3 pl-4 whitespace-nowrap', kind === 'total' && 'bg-muted', kind === 'sub' && 'pl-8')}>{line.label}</td>
            {line.months.map((v, i) => (<td key={i} className="px-2 py-1.5 text-right tabular-nums whitespace-nowrap">{cell(v)}</td>))}
            <td className="px-3 py-1.5 text-right font-semibold tabular-nums whitespace-nowrap">{cell(line.total)}</td>
        </tr>
    );
    const Head_ = ({ children }: { children: string }) => (<tr><td colSpan={14} className="bg-secondary/40 py-1.5 pl-4 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">{children}</td></tr>);
    const trend = MONTHS.map((m, i) => ({ month: m, revenue: report.revenue.total.months[i], expenses: report.costOfServices.commissions.months[i] + report.operating.total.months[i], profit: report.netProfit.months[i] }));

    return (
        <>
            <Head title="Profit & Loss — Finance" />
            <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-5 p-4 md:p-6">
                <PageHeader title={`Profit & loss ${report.year}`} description="Monthly income statement. Client funds (rent, owner costs, materials at cost) are memo lines — never SOMFIX income." icon={FileBarChart}
                    actions={<><FilterSelect label="Year" value={String(report.year)} onChange={(v) => router.get('/finance/reports', { year: v }, { preserveScroll: true })} options={years.map((y) => ({ value: String(y), label: String(y) }))} /><Button size="sm" variant="outline" onClick={() => window.print()}><Printer className="size-4" />Print</Button></>} />
                <KpiGrid items={[
                    { title: 'Total revenue', value: report.revenue.total.total, icon: TrendingUp, tone: 'primary', compact: true },
                    { title: 'Gross profit', value: report.grossProfit.total, icon: Percent, tone: 'info', compact: true, hint: `${report.margins.gross}% gross margin` },
                    { title: 'Operating expenses', value: report.operating.total.total, icon: Wallet, tone: 'warning', compact: true },
                    { title: 'Net profit', value: report.netProfit.total, icon: PiggyBank, tone: report.netProfit.total >= 0 ? 'success' : 'danger', compact: true, hint: `${report.margins.net}% net margin` },
                ]} />
                <Panel title="Monthly trend"><TrendChart data={trend} /></Panel>
                <Panel flush>
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[1100px] border-collapse text-sm">
                            <thead><tr className="border-b-2 text-xs text-muted-foreground"><th className="sticky left-0 z-10 bg-card py-2 pl-4 text-left font-medium">USD</th>{MONTHS.map((m) => (<th key={m} className="px-2 py-2 text-right font-medium">{m}</th>))}<th className="px-3 py-2 text-right font-semibold text-foreground">Full year</th></tr></thead>
                            <tbody>
                                <Head_>Revenue</Head_>
                                <Row line={report.revenue.management} /><Row line={report.revenue.maintenance} /><Row line={report.revenue.total} kind="total" />
                                <Head_>Cost of services</Head_>
                                <Row line={report.costOfServices.commissions} /><Row line={report.grossProfit} kind="total" />
                                <Head_>Operating expenses</Head_>
                                <Row line={report.operating.payroll} />{report.operating.expenses.map((l: Line) => <Row key={l.label} line={l} />)}<Row line={report.operating.total} kind="total" />
                                <Row line={report.netProfit} kind="total" />
                                <Head_>Memo — client funds handled at cost (not SOMFIX income)</Head_>
                                {Object.values(report.memo).map((l) => <Row key={(l as Line).label} line={l as Line} kind="sub" />)}
                            </tbody>
                        </table>
                    </div>
                </Panel>
            </div>
        </>
    );
}
Reports.layout = (): { breadcrumbs: BreadcrumbItem[] } => ({ breadcrumbs: [{ title: 'Finance', href: '/finance-report' }, { title: 'Profit & loss', href: '/finance/reports' }] });
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Any = Record<string, any>;
