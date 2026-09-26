import { Link } from "@inertiajs/react";
import type { ColumnDef } from "@tanstack/react-table";
import { Edit, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { edit, show } from "@/routes/inventory";

export type InventoryRow = { id: number; name: string; sku: string; category: string; unit_of_measure: string; current_stock: number; reorder_level: number; unit_cost: string; supplier: string; status: "in_stock" | "low_stock" | "out_of_stock" | "discontinued" };
const statusClass = { in_stock: "border-green-500/20 bg-green-500/10 text-green-700", low_stock: "border-yellow-500/20 bg-yellow-500/10 text-yellow-700", out_of_stock: "border-red-500/20 bg-red-500/10 text-red-700", discontinued: "border-gray-500/20 bg-gray-500/10 text-gray-700" };
export const inventoryColumns: ColumnDef<InventoryRow>[] = [
    { accessorKey: "name", header: "Name", cell: ({ row }) => <div><p className="font-semibold">{row.original.name}</p><p className="text-xs text-muted-foreground">{row.original.sku}</p></div> },
    { accessorKey: "category", header: "Category", cell: ({ row }) => row.original.category },
    { accessorKey: "current_stock", header: "Stock", cell: ({ row }) => <div><p className="font-medium">{row.original.current_stock} {row.original.unit_of_measure}</p><p className="text-xs text-muted-foreground">Reorder: {row.original.reorder_level}</p></div> },
    { accessorKey: "unit_cost", header: "Unit cost", cell: ({ row }) => `$${Number(row.original.unit_cost).toFixed(2)}` },
    { accessorKey: "supplier", header: "Supplier", cell: ({ row }) => row.original.supplier },
    { accessorKey: "status", header: "Status", cell: ({ row }) => <Badge variant="outline" className={statusClass[row.original.status]}>{row.original.status.replace("_", " ").toUpperCase()}</Badge> },
    { id: "actions", header: "Actions", cell: ({ row }) => <div className="flex gap-1"><Button asChild size="icon" variant="ghost"><Link href={show(row.original.id)}><Eye className="size-4" /></Link></Button><Button asChild size="icon" variant="ghost"><Link href={edit(row.original.id)}><Edit className="size-4" /></Link></Button></div> },
];
