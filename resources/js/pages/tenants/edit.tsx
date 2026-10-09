import { Head } from '@inertiajs/react';
import {
    TenantForm,
    type TenantFormValues,
} from '@/pages/tenants/components/tenant-form';
import { index } from '@/routes/tenants';
export default function TenantEdit({
    tenant,
    units,
}: {
    tenant: TenantFormValues & { id: number };
    units: { id: number; unit_number: string; property: { name: string } }[];
}) {
    return (
        <>
            <Head title="Edit tenant — SOMFIX" />
            <div className="w-full p-4 md:p-6">
                <h1 className="text-2xl font-bold">Edit tenant</h1>
                <p className="mt-1 mb-6 text-sm text-muted-foreground">
                    Keep tenant details and their accommodation assignment
                    current.
                </p>
                <TenantForm mode="edit" tenant={tenant} units={units} />
            </div>
        </>
    );
}
TenantEdit.layout = {
    breadcrumbs: [
        { title: 'Tenants', href: index() },
        { title: 'Edit tenant', href: index() },
    ],
};
