import { Head } from '@inertiajs/react';
import { WorkOrderForm } from '@/pages/work-orders/components/work-order-form';
import { create, index } from '@/routes/work-orders';

export default function WorkOrderCreate({
    maintenances,
    serviceTeams,
}: {
    maintenances: {
        id: number;
        title: string;
        category: string;
        priority: string;
        status: string;
    }[];
    serviceTeams: {
        id: number;
        name: string;
        specialization: string;
        status: string;
    }[];
}) {
    return (
        <>
            <Head title="Add work order — SOMFIX" />
            <div className="w-full p-4 md:p-6">
                <h1 className="text-2xl font-bold">Add a work order</h1>
                <p className="mt-1 mb-6 text-sm text-muted-foreground">
                    Create a work order from a maintenance request.
                </p>
                <WorkOrderForm
                    mode="create"
                    maintenances={maintenances}
                    serviceTeams={serviceTeams}
                />
            </div>
        </>
    );
}

WorkOrderCreate.layout = {
    breadcrumbs: [
        { title: 'Work Orders', href: index() },
        { title: 'Add work order', href: create() },
    ],
};
