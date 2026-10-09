import { Link } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import { Edit, Eye } from 'lucide-react';
import { Badge, badgeToneClasses } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { edit, show } from '@/routes/properties';

export type PropertyRow = {
    id: number;
    name: string;
    property_type: string;
    owner_name: string | null;
    district: string | null;
    city: string;
    units_count: number;
    status: 'active' | 'inactive';
};

export const propertyColumns: ColumnDef<PropertyRow>[] = [
    { accessorKey: 'id', header: 'ID', cell: ({ row }) => <span className="font-mono text-xs text-muted-foreground">#{row.original.id}</span> },
    { accessorKey: 'name', header: 'Property', cell: ({ row }) => <div><p className="font-semibold">{row.original.name}</p><p className="text-xs text-muted-foreground">{row.original.property_type}</p></div> },
    { id: 'location', header: 'Location', cell: ({ row }) => [row.original.district, row.original.city].filter(Boolean).join(', ') },
    { accessorKey: 'units_count', header: 'Units' },
    { accessorKey: 'owner_name', header: 'Owner', cell: ({ row }) => row.original.owner_name ?? '—' },
    { accessorKey: 'status', header: 'Status', cell: ({ row }) => <Badge variant="outline" className={row.original.status === 'active' ? badgeToneClasses.success : ''}>{row.original.status === 'active' ? 'Active' : 'Inactive'}</Badge> },
    { id: 'actions', header: 'Actions', cell: ({ row }) => <div className="flex gap-1"><Button asChild size="icon" variant="ghost"><Link href={show(row.original.id)}><Eye className="size-4 text-[#FF8500]" /></Link></Button><Button asChild size="icon" variant="ghost"><Link href={edit(row.original.id)}><Edit className="size-4 text-[#004317] dark:text-green-300" /></Link></Button></div> },
];
