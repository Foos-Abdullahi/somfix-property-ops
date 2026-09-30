import { Package } from 'lucide-react';
import DetailPage, { label, money } from '@/components/detail-page';
import { destroy, edit, index } from '@/routes/inventory';

type RecordDetail = {
    id: number;
    name: string;
    description: string;
    sku: string;
    unit_of_measure: string;
    category: string;
    opening_stock: number;
    current_stock: number;
    reorder_level: number;
    supplier: string;
    unit_cost: string;
    total_value: string;
    status: string;
    notes: string | null;
};

export default function InventoryShow({
    inventory,
}: {
    inventory: RecordDetail;
}) {
    return (
        <DetailPage
            title={inventory.name}
            subtitle={`${inventory.sku} · ${label(inventory.category)}`}
            summary={[
                {
                    title: 'Stock',
                    metric: {
                        label: 'Current stock',
                        value: `${inventory.current_stock} ${inventory.unit_of_measure}`,
                    },
                    fields: [
                        {
                            label: 'Opening stock',
                            value: inventory.opening_stock,
                        },
                        {
                            label: 'Reorder level',
                            value: inventory.reorder_level,
                        },
                    ],
                },
                {
                    title: 'Valuation',
                    metric: {
                        label: 'Total value',
                        value: money(inventory.total_value),
                    },
                    fields: [
                        {
                            label: 'Unit cost',
                            value: money(inventory.unit_cost),
                        },
                    ],
                },
            ]}
            sections={[
                { title: 'Item description', text: inventory.description },
                ...(inventory.notes && inventory.notes !== inventory.description
                    ? [{ title: 'Notes', text: inventory.notes }]
                    : []),
            ]}
            aside={[
                {
                    title: 'Supply',
                    fields: [{ label: 'Supplier', value: inventory.supplier }],
                },
            ]}
            status={inventory.status}
            icon={Package}
            backHref={index.url()}
            editHref={edit.url(inventory.id)}
            deleteHref={destroy.url(inventory.id)}
        />
    );
}

InventoryShow.layout = {
    breadcrumbs: [
        { title: 'Inventory', href: index() },
        { title: 'Item details', href: index() },
    ],
};
