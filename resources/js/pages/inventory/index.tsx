import { Head, Link } from "@inertiajs/react";
import { AlertTriangle, Box, Package, Plus, ShoppingBag } from "lucide-react";
import { inventoryColumns, type InventoryRow } from "@/components/inventory/columns";
import { StatsCard, type StatSection } from "@/components/tools/StatsCard";
import { DataTable } from "@/components/tools/table/main-table";
import { Button } from "@/components/ui/button";
import { create, index } from "@/routes/inventory";

export default function InventoryIndex({ inventories, stats }: { inventories: InventoryRow[]; stats: { totalItems: number; inStock: number; lowStock: number; outOfStock: number } }) {
    const sections: StatSection[] = [{ title: "Total items", value: stats.totalItems, description: "All inventory items", icon: Package, color: "primary" }, { title: "In stock", value: stats.inStock, description: "Available items", icon: Box, color: "success" }, { title: "Low stock", value: stats.lowStock, description: "Below reorder level", icon: AlertTriangle, color: "warning" }, { title: "Out of stock", value: stats.outOfStock, description: "Unavailable items", icon: ShoppingBag, color: "destructive" }];
    return <><Head title="Inventory — SOMFIX" /><div className="p-4 md:p-6"><div className="flex items-start justify-between gap-4"><div><h1 className="text-lg font-semibold">Inventory</h1><p className="text-xs text-muted-foreground">Track materials, stock levels, and supplier information.</p></div><Button asChild size="sm"><Link href={create()}><Plus className="size-4" />Add <span className="hidden sm:inline">item</span></Link></Button></div><StatsCard sections={sections} /><div className="mt-6 animate-in fade-in slide-in-from-bottom-6 duration-1000"><DataTable title="Inventory" searchTitle="Filter items by name, SKU, category or supplier..." columns={inventoryColumns} data={inventories} /></div></div></>;
}

InventoryIndex.layout = {
    breadcrumbs: [
        {
            title: 'Inventory',
            href: index(),
        },
    ],
};
