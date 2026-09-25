import { Package } from 'lucide-react';
import { ModulePage } from '@/components/module-page';
import { index as inventoryIndex } from '@/routes/inventory';

export default function InventoryIndex() {
    return (
        <ModulePage
            title="Inventory"
            description="Track materials, stock movements, supplier purchases, job usage, and reorder levels."
            phase="Phase 4"
            icon={Package}
            emptyTitle="No inventory items"
            emptyDescription="Add stocked materials to connect purchases, job usage, supplier balances, and reorder alerts."
            actionLabel="Add your first inventory item"
            capabilities={[
                'Item units, opening stock, and reorder levels',
                'Supplier purchases and payment status',
                'Usage and movements linked to work orders',
                'On-hand quantities and low-stock alerts',
            ]}
        />
    );
}

InventoryIndex.layout = {
    breadcrumbs: [
        {
            title: 'Inventory',
            href: inventoryIndex(),
        },
    ],
};
