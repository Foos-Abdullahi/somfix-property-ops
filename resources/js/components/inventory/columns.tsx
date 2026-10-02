import { Link } from "@inertiajs/react";
import type { ColumnDef } from "@tanstack/react-table";
import { Edit, Eye } from "lucide-react";
import { Badge, badgeToneClasses } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { edit, show } from "@/routes/inventory";

export type InventoryRow = { id: number; name: string; sku: string; category: string; unit_of_measure: string; current_stock: number; reorder_level: number; unit_cost: string; supplier: string; status: "in_stock" | "low_stock" | "out_of_stock" | "discontinued" };
const statusClass = { in_stock: badgeToneClasses.success, low_stock: badgeToneClasses.warning, out_of_stock: badgeToneClasses.danger, discontinued: badgeToneClasses.neutral };
export const inventoryColumns: ColumnDef<InventoryRow>[] = [
    { accessorKey: "name", header: "Name", cell: ({ row }) => <div><p className="font-semibold">{row.original.name}</p><p className="text-xs text-muted-foreground">{row.original.sku}</p></div> },
    { accessorKey: "category", header: "Category", cell: ({ row }) => row.original.category },
    { accessorKey: "current_stock", header: "Stock", cell: ({ row }) => <div><p className="font-medium">{row.original.current_stock} {row.original.unit_of_measure}</p><p className="text-xs text-muted-foreground">Reorder: {row.original.reorder_level}</p></div> },
    { accessorKey: "unit_cost", header: "Unit cost", cell: ({ row }) => `$${Number(row.original.unit_cost).toFixed(2)}` },
    { accessorKey: "supplier", header: "Supplier", cell: ({ row }) => row.original.supplier },
    { accessorKey: "status", header: "Status", cell: ({ row }) => <Badge variant="outline" className={statusClass[row.original.status]}>{row.original.status.replace("_", " ").toUpperCase()}</Badge> },
    { id: "actions", header: "Actions", cell: ({ row }) => <div className="flex gap-1"><Button asChild size="icon" variant="ghost"><Link href={show(row.original.id)}><Eye className="size-4 text-[#FF8500]" /></Link></Button><Button asChild size="icon" variant="ghost"><Link href={edit(row.original.id)}><Edit className="size-4 text-[#004317] dark:text-green-300" /></Link></Button></div> },
];
