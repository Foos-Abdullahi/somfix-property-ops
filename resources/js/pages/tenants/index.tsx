import { Head, Link } from '@inertiajs/react';
import { Home, Plus, UserCheck, UserPlus, Users } from 'lucide-react';
import { tenantColumns, type TenantRow } from '@/components/tenants/columns';
import { StatsCard, type StatSection } from '@/components/tools/StatsCard';
import { DataTable } from '@/components/tools/table/main-table';
import { Button } from '@/components/ui/button';
import { create, index } from '@/routes/tenants';

export default function TenantsIndex({
    tenants,
    stats,
}: {
    tenants: TenantRow[];
    stats: {
        totalTenants: number;
        activeTenants: number;
        assignedTenants: number;
        unassignedTenants: number;
    };
}) {
    const sections: StatSection[] = [
        {
            title: 'Total tenants',
            value: stats.totalTenants,
            description: 'Tenant records in the portfolio',
            icon: Users,
            color: 'primary',
        },
        {
            title: 'Active tenants',
            value: stats.activeTenants,
            description: 'Current working relationships',
            icon: UserCheck,
            color: 'success',
        },
        {
            title: 'Assigned to units',
            value: stats.assignedTenants,
            description: 'Linked to current accommodation',
            icon: Home,
            color: 'info',
        },
        {
            title: 'Unassigned',
            value: stats.unassignedTenants,
            description: 'Needs a unit allocation',
            icon: UserPlus,
            color: 'warning',
        },
    ];
    return (
        <>
            <Head title="Tenants Management — SOMFIX" />
            <div className="p-4 md:p-6">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h1 className="page-title-enter text-lg font-semibold">
                            Tenants management
                        </h1>
                        <p className="page-description-enter text-xs text-muted-foreground">
                            Manage tenant contacts, accommodation assignments
                            and service context.
                        </p>
                    </div>
                    <Button asChild size="sm">
                        <Link href={create()}>
                            <Plus className="size-4" />
                            Add <span className="hidden sm:inline">tenant</span>
                        </Link>
                    </Button>
                </div>
                <StatsCard sections={sections} />
                <div className="mt-6 animate-in duration-1000 fade-in slide-in-from-bottom-6">
                    <DataTable
                        title="Tenants"
                        searchTitle="Filter tenants by name, phone or assigned unit..."
                        columns={tenantColumns}
                        data={tenants}
                    />
                </div>
            </div>
        </>
    );
}

TenantsIndex.layout = {
    breadcrumbs: [
        {
            title: 'Tenants',
            href: index(),
        },
    ],
};
