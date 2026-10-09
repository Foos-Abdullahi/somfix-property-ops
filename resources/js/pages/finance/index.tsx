import { Head, Link } from '@inertiajs/react';
import { CheckCircle2, DollarSign, Plus, Wallet } from 'lucide-react';
import { financeColumns, type FinanceRow } from '@/components/finance/columns';
import { StatsCard, type StatSection } from '@/components/tools/StatsCard';
import { DataTable } from '@/components/tools/table/main-table';
import { Button } from '@/components/ui/button';
import { create, index } from '@/routes/finance';

export default function FinanceIndex({
    finances,
    stats,
}: {
    finances: FinanceRow[];
    stats: {
        totalRecords: number;
        totalAmount: number;
        totalPaid: number;
        totalBalance: number;
    };
}) {
    const sections: StatSection[] = [
        {
            title: 'Total records',
            value: stats.totalRecords,
            description: 'All financial records',
            icon: Wallet,
            color: 'primary',
        },
        {
            title: 'Total amount',
            value: `$${stats.totalAmount.toLocaleString()}`,
            description: 'Total invoice value',
            icon: DollarSign,
            color: 'info',
        },
        {
            title: 'Total paid',
            value: `$${stats.totalPaid.toLocaleString()}`,
            description: 'Amount collected',
            icon: CheckCircle2,
            color: 'success',
        },
        {
            title: 'Balance due',
            value: `$${stats.totalBalance.toLocaleString()}`,
            description: 'Outstanding balance',
            icon: DollarSign,
            color: 'warning',
        },
    ];
    return (
        <>
            <Head title="Finance — SOMFIX" />
            <div className="p-4 md:p-6">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h1 className="page-title-enter text-lg font-semibold">
                            Finance
                        </h1>
                        <p className="page-description-enter text-xs text-muted-foreground">
                            Manage invoices, quotes, expenses, and payment
                            tracking.
                        </p>
                    </div>
                    <Button asChild size="sm">
                        <Link href={create()}>
                            <Plus className="size-4" />
                            Add <span className="hidden sm:inline">record</span>
                        </Link>
                    </Button>
                </div>
                <StatsCard sections={sections} />
                <div className="mt-6 animate-in duration-1000 fade-in slide-in-from-bottom-6">
                    <DataTable
                        title="Finance"
                        searchTitle="Filter records by invoice number, title or status..."
                        columns={financeColumns}
                        data={finances}
                    />
                </div>
            </div>
        </>
    );
}

FinanceIndex.layout = {
    breadcrumbs: [
        {
            title: 'Finance',
            href: index(),
        },
    ],
};
