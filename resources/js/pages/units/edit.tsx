import { Head } from '@inertiajs/react';
import {
    UnitForm,
    type UnitFormValues,
} from '@/pages/units/components/unit-form';
import { index } from '@/routes/units';
export default function UnitEdit({
    unit,
    properties,
}: {
    unit: UnitFormValues & { id: number };
    properties: { id: number; name: string }[];
}) {
    return (
        <>
            <Head title="Edit unit — SOMFIX" />
            <div className="w-full p-4 md:p-6">
                <h1 className="text-2xl font-bold">Edit unit</h1>
                <p className="mt-1 mb-6 text-sm text-muted-foreground">
                    Update unit details, occupancy and rent.
                </p>
                <UnitForm mode="edit" unit={unit} properties={properties} />
            </div>
        </>
    );
}
UnitEdit.layout = {
    breadcrumbs: [
        { title: 'Units', href: index() },
        { title: 'Edit unit', href: index() },
    ],
};
