import { Head } from '@inertiajs/react';
import { TenantForm } from '@/pages/tenants/components/tenant-form';
import { create, index } from '@/routes/tenants';
export default function TenantCreate({
    units,
}: {
    units: { id: number; unit_number: string; property: { name: string } }[];
}) {
    return (
        <>
            <Head title="Add tenant — SOMFIX" />
            <div className="w-full p-4 md:p-6">
                <h1 className="text-2xl font-bold">Add a tenant</h1>
                <p className="mt-1 mb-6 text-sm text-muted-foreground">
                    Create a tenant profile and optionally assign their unit.
                </p>
                <TenantForm mode="create" units={units} />
            </div>
        </>
    );
}
TenantCreate.layout = {
    breadcrumbs: [
        { title: 'Tenants', href: index() },
        { title: 'Add tenant', href: create() },
    ],
};
