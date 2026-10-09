import { Link } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import { Edit, Eye } from 'lucide-react';
import { Badge, badgeToneClasses } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { edit, show } from '@/routes/units';

export type UnitRow = {
    id: number;
    unit_number: string;
    unit_type: string;
    floor: string | null;
    bedrooms: number;
    monthly_rent: string;
    status: 'vacant' | 'occupied' | 'maintenance' | 'inactive';
    property: { id: number; name: string };
};
const statusClass = {
    vacant: badgeToneClasses.success,
    occupied: badgeToneClasses.info,
    maintenance: badgeToneClasses.warning,
    inactive: badgeToneClasses.neutral,
};
export const unitColumns: ColumnDef<UnitRow>[] = [
    {
        accessorKey: 'unit_number',
        header: 'Unit',
        cell: ({ row }) => (
            <div>
                <p className="font-semibold">{row.original.unit_number}</p>
                <p className="text-xs text-muted-foreground">
                    {row.original.unit_type}
                </p>
            </div>
        ),
    },
    {
        accessorKey: 'property.name',
        header: 'Property',
        cell: ({ row }) => row.original.property.name,
    },
    {
        accessorKey: 'floor',
        header: 'Floor',
        cell: ({ row }) => row.original.floor ?? '—',
    },
    { accessorKey: 'bedrooms', header: 'Beds' },
    {
        accessorKey: 'monthly_rent',
        header: 'Monthly rent',
        cell: ({ row }) =>
            `$${Number(row.original.monthly_rent).toLocaleString()}`,
    },
    {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => (
            <Badge
                variant="outline"
                className={statusClass[row.original.status]}
            >
                {row.original.status}
            </Badge>
        ),
    },
    {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
            <div className="flex gap-1">
                <Button asChild size="icon" variant="ghost">
                    <Link href={show(row.original.id)}>
                        <Eye className="size-4 text-[#FF8500]" />
                    </Link>
                </Button>
                <Button asChild size="icon" variant="ghost">
                    <Link href={edit(row.original.id)}>
                        <Edit className="size-4 text-[#004317] dark:text-green-300" />
                    </Link>
                </Button>
            </div>
        ),
    },
];
