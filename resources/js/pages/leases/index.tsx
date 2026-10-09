import { Head, Link } from '@inertiajs/react';
import { Calendar, FileText, Plus, Users, AlertCircle } from 'lucide-react';
import { leaseColumns, type LeaseRow } from '@/components/leases/columns';
import { StatsCard, type StatSection } from '@/components/tools/StatsCard';
import { DataTable } from '@/components/tools/table/main-table';
import { Button } from '@/components/ui/button';
import { create, index } from '@/routes/leases';

type Props = {
    leases: LeaseRow[];
    stats: {
        totalLeases: number;
        activeLeases: number;
        expiringSoon: number;
    };
};

export default function LeasesIndex({ leases, stats }: Props) {
    const sections: StatSection[] = [
        {
            title: 'Total leases',
            value: stats.totalLeases,
            description: 'Registered lease agreements',
            icon: FileText,
            color: 'primary',
        },
        {
            title: 'Active leases',
            value: stats.activeLeases,
            description: 'Currently in effect',
            icon: Users,
            color: 'success',
        },
        {
            title: 'Expiring soon',
            value: stats.expiringSoon,
            description: 'Within 30 days',
            icon: AlertCircle,
            color: 'warning',
        },
        {
            title: 'Monthly revenue',
            value: '—',
            description: 'From active leases',
            icon: Calendar,
            color: 'info',
        },
    ];

    return (
        <>
            <Head title="Leases Management — SOMFIX" />

            <div className="p-4 md:p-6">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h1 className="page-title-enter text-lg font-semibold">
                            Leases management
                        </h1>
                        <p className="page-description-enter text-xs text-muted-foreground">
                            Manage lease agreements, payment terms, and tenant
                            relationships.
                        </p>
                    </div>

                    <Button asChild size="sm">
                        <Link href={create()}>
                            <Plus className="size-4" />
                            Add <span className="hidden sm:inline">lease</span>
                        </Link>
                    </Button>
                </div>

                <StatsCard sections={sections} />

                <div className="mt-6 animate-in duration-1000 ease-in-out fade-in slide-in-from-bottom-6">
                    <DataTable
                        title="Leases"
                        searchTitle="Filter leases by tenant, unit, or status..."
                        columns={leaseColumns}
                        data={leases}
                    />
                </div>
            </div>
        </>
    );
}

LeasesIndex.layout = {
    breadcrumbs: [{ title: 'Leases', href: index() }],
};
