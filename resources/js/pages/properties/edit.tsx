import { Head } from '@inertiajs/react';
import { Pencil } from 'lucide-react';
import {
    PropertyForm,
    type PropertyFormValues,
} from '@/pages/properties/components/property-form';
import { index } from '@/routes/properties';

type Property = PropertyFormValues & { id: number };

export default function PropertyEdit({ property }: { property: Property }) {
    return (
        <>
            <Head title={`Edit ${property.name} — SOMFIX`} />
            <div className="mx-auto w-full max-w-5xl p-4 md:p-6">
                <div className="mb-6 flex items-start gap-3">
                    <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Pencil className="size-5" />
                    </span>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Edit property
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Update the property profile and its starting
                            operations setup.
                        </p>
                    </div>
                </div>
                <PropertyForm mode="edit" property={property} />
            </div>
        </>
    );
}

PropertyEdit.layout = {
    breadcrumbs: [
        { title: 'Properties', href: index() },
        { title: 'Edit property', href: index() },
    ],
};
