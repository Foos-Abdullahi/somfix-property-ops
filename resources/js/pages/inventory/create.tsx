import { Head } from "@inertiajs/react";
import { InventoryForm } from "@/pages/inventory/components/inventory-form";
import { create, index } from "@/routes/inventory";

export default function InventoryCreate() {
    return <><Head title="Add inventory item — SOMFIX" /><div className="w-full p-4 md:p-6"><h1 className="text-2xl font-bold">Add an inventory item</h1><p className="mt-1 mb-6 text-sm text-muted-foreground">Register a new inventory item with stock and supplier details.</p><InventoryForm mode="create" /></div></>;
}

InventoryCreate.layout = { breadcrumbs: [{ title: "Inventory", href: index() }, { title: "Add item", href: create() }] };
