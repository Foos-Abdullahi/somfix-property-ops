import type { ColumnDef } from "@tanstack/react-table";
import { Edit, Eye, MapPin } from "lucide-react";
import { Link } from "@inertiajs/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { edit, show } from "@/routes/properties";

export type PropertyRow = {
    id: number;
    name: string;
    property_type: string;
    owner_name: string | null;
    district: string | null;
    city: string;
    units_count: number;
    status: "active" | "inactive";
};

export const propertyColumns: ColumnDef<PropertyRow>[] = [
    {
        accessorKey: "id",
        header: "ID",
        cell: ({ row }) => (
            <span className="font-mono text-xs text-muted-foreground">#{row.original.id}</span>
        ),
    },
    {
        accessorKey: "name",
        header: "Property",
        cell: ({ row }) => (
            <div>
                <p className="font-semibold text-foreground">{row.original.name}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{row.original.property_type}</p>
            </div>
        ),
    },
    {
        id: "location",
        header: "Location",
        cell: ({ row }) => (
            <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin className="size-3.5 text-primary" />
                {[row.original.district, row.original.city].filter(Boolean).join(", ")}
            </span>
        ),
    },
    {
        accessorKey: "units_count",
        header: "Units",
        cell: ({ row }) => (
            <span className="font-mono font-semibold">{row.original.units_count}</span>
        ),
    },
    {
        accessorKey: "owner_name",
        header: "Owner",
        cell: ({ row }) => row.original.owner_name ?? "—",
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
            <Badge
                variant="outline"
                className={
                    row.original.status === "active"
                        ? "border-primary/20 bg-primary/10 text-primary"
                        : "border-border bg-muted text-muted-foreground"
                }
            >
                {row.original.status === "active" ? "Active" : "Inactive"}
            </Badge>
        ),
    },
    {
        id: "actions",
        header: () => <span className="block text-right">Actions</span>,
        cell: ({ row }) => (
            <div className="flex justify-end gap-1">
                <Button asChild size="icon" variant="ghost" className="size-8">
                    <Link href={show(row.original.id)} aria-label={`View ${row.original.name}`}>
                        <Eye className="size-4" />
                    </Link>
                </Button>
                <Button asChild size="icon" variant="ghost" className="size-8">
                    <Link href={edit(row.original.id)} aria-label={`Edit ${row.original.name}`}>
                        <Edit className="size-4" />
                    </Link>
                </Button>
            </div>
        ),
    },
];
