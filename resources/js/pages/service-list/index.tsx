import { Head, Link } from '@inertiajs/react';
import { CheckCircle2, Layers, Plus, Wrench } from 'lucide-react';
import { Can } from '@/components/can';
import { RecordImport } from '@/components/record-import';
import {
    serviceColumns,
    type ServiceRow,
} from '@/components/service-list/columns';
import { StatsCard, type StatSection } from '@/components/tools/StatsCard';
import { DataTable } from '@/components/tools/table/main-table';
import { Button } from '@/components/ui/button';
import { create, index } from '@/routes/service-list';

export default function ServiceListIndex({
    services,
    stats,
}: {
    services: ServiceRow[];
    stats: { total: number; active: number; categories: number };
}) {
    const sections: StatSection[] = [
        {
            title: 'Total services',
            value: stats.total,
            description: 'Services SOMFIX offers',
            icon: Wrench,
            color: 'primary',
        },
        {
            title: 'Active',
            value: stats.active,
            description: 'Currently offered',
            icon: CheckCircle2,
            color: 'success',
        },
        {
            title: 'Categories',
            value: stats.categories,
            description: 'Service categories',
            icon: Layers,
            color: 'warning',
        },
    ];
    return (
        <>
            <Head title="Service List — SOMFIX" />
            <div className="p-4 md:p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <h1 className="page-title-enter text-lg font-semibold">
                            Service list
                        </h1>
                        <p className="page-description-enter text-xs text-muted-foreground">
                            The services we offer, with category, price and
                            duration. Not linked to customers or tenants.
                        </p>
                    </div>
                    <div className="flex flex-wrap justify-end gap-2">
                        <Can permission="service-list.manage">
                            <RecordImport module="service-list" />
                            <Button asChild size="sm">
                                <Link href={create()}>
                                    <Plus className="size-4" />
                                    Add{' '}
                                    <span className="hidden sm:inline">
                                        service
                                    </span>
                                </Link>
                            </Button>
                        </Can>
                    </div>
                </div>
                <StatsCard sections={sections} />
                <div className="mt-6 animate-in duration-1000 fade-in slide-in-from-bottom-6">
                    <DataTable
                        title="Services"
                        searchTitle="Filter services by name, category or status..."
                        columns={serviceColumns}
                        data={services}
                    />
                </div>
            </div>
        </>
    );
}

ServiceListIndex.layout = {
    breadcrumbs: [{ title: 'Service List', href: index() }],
};
