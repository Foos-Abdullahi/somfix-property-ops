import { Head, Link } from '@inertiajs/react';
import { Building2, Home, Plus, Users, Wrench } from 'lucide-react';
import {
    propertyColumns,
    type PropertyRow,
} from '@/components/properties/columns';
import { StatsCard, type StatSection } from '@/components/tools/StatsCard';
import { DataTable } from '@/components/tools/table/main-table';
import { Button } from '@/components/ui/button';
import { create, index } from '@/routes/properties';

type Props = {
    properties: PropertyRow[];
    stats: {
        totalProperties: number;
        totalUnits: number;
        activeProperties: number;
    };
};

export default function PropertiesIndex({ properties, stats }: Props) {
    const sections: StatSection[] = [
        {
            title: 'Total properties',
            value: stats.totalProperties,
            description: 'Registered portfolio locations',
            icon: Building2,
            color: 'primary',
        },
        {
            title: 'Registered units',
            value: stats.totalUnits,
            description: 'Units across all properties',
            icon: Home,
            color: 'info',
        },
        {
            title: 'Active properties',
            value: stats.activeProperties,
            description: 'Available for operations',
            icon: Users,
            color: 'success',
        },
        {
            title: 'Open maintenance',
            value: '—',
            description: 'Connects in the maintenance module',
            icon: Wrench,
            color: 'warning',
        },
    ];

    return (
        <>
            <Head title="Properties Management — SOMFIX" />

            <div className="p-4 md:p-6">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h1 className="page-title-enter text-lg font-semibold">
                            Properties management
                        </h1>
                        <p className="page-description-enter text-xs text-muted-foreground">
                            Manage property details, units, ownership and
                            portfolio status.
                        </p>
                    </div>

                    <Button asChild size="sm">
                        <Link href={create()}>
                            <Plus className="size-4" />
                            Add{' '}
                            <span className="hidden sm:inline">property</span>
                        </Link>
                    </Button>
                </div>

                <StatsCard sections={sections} />

                <div className="mt-6 animate-in duration-1000 ease-in-out fade-in slide-in-from-bottom-6">
                    <DataTable
                        title="Properties"
                        searchTitle="Filter properties by name, owner or district..."
                        columns={propertyColumns}
                        data={properties}
                    />
                </div>
            </div>
        </>
    );
}

PropertiesIndex.layout = {
    breadcrumbs: [{ title: 'Properties', href: index() }],
};
