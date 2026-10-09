import { Head } from '@inertiajs/react';
import { UnitForm } from '@/pages/units/components/unit-form';
import { create, index } from '@/routes/units';
export default function UnitCreate({
    properties,
}: {
    properties: { id: number; name: string }[];
}) {
    return (
        <>
            <Head title="Add unit — SOMFIX" />
            <div className="w-full p-4 md:p-6">
                <h1 className="text-2xl font-bold">Add a unit</h1>
                <p className="mt-1 mb-6 text-sm text-muted-foreground">
                    Register a unit within an active property.
                </p>
                <UnitForm mode="create" properties={properties} />
            </div>
        </>
    );
}
UnitCreate.layout = {
    breadcrumbs: [
        { title: 'Units', href: index() },
        { title: 'Add unit', href: create() },
    ],
};
