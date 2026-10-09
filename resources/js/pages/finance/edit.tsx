import { Head } from '@inertiajs/react';
import {
    FinanceForm,
    type FinanceFormValues,
} from '@/pages/finance/components/finance-form';
import { index } from '@/routes/finance';

export default function FinanceEdit({
    finance,
    properties,
    units,
    tenants,
}: {
    finance: FinanceFormValues & { id: number };
    properties: { id: number; name: string }[];
    units: { id: number; unit_number: string }[];
    tenants: { id: number; first_name: string; last_name: string }[];
}) {
    return (
        <>
            <Head title="Edit finance record — SOMFIX" />
            <div className="w-full p-4 md:p-6">
                <h1 className="text-2xl font-bold">Edit finance record</h1>
                <p className="mt-1 mb-6 text-sm text-muted-foreground">
                    Update finance record details and payment status.
                </p>
                <FinanceForm
                    mode="edit"
                    finance={finance}
                    properties={properties}
                    units={units}
                    tenants={tenants}
                />
            </div>
        </>
    );
}

FinanceEdit.layout = {
    breadcrumbs: [
        { title: 'Finance', href: index() },
        { title: 'Edit record', href: index() },
    ],
};
