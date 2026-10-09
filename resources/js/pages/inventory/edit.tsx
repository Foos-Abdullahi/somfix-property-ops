import { Head } from '@inertiajs/react';
import {
    InventoryForm,
    type InventoryFormValues,
} from '@/pages/inventory/components/inventory-form';
import { index } from '@/routes/inventory';

export default function InventoryEdit({
    inventory,
}: {
    inventory: InventoryFormValues & { id: number };
}) {
    return (
        <>
            <Head title="Edit inventory item — SOMFIX" />
            <div className="w-full p-4 md:p-6">
                <h1 className="text-2xl font-bold">Edit inventory item</h1>
                <p className="mt-1 mb-6 text-sm text-muted-foreground">
                    Update inventory item details and stock levels.
                </p>
                <InventoryForm mode="edit" inventory={inventory} />
            </div>
        </>
    );
}

InventoryEdit.layout = {
    breadcrumbs: [
        { title: 'Inventory', href: index() },
        { title: 'Edit item', href: index() },
    ],
};
