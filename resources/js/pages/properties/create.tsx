import { Head } from '@inertiajs/react';
import { Building2 } from 'lucide-react';
import { PropertyForm } from '@/pages/properties/components/property-form';
import { create, index } from '@/routes/properties';

export default function PropertyCreate() {
    return (
        <>
            <Head title="Add property — SOMFIX" />
            <div className="mx-auto w-full max-w-5xl p-4 md:p-6">
                <div className="mb-6 flex items-start gap-3">
                    <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Building2 className="size-5" />
                    </span>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Add a property
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Register the property before adding its units,
                            leases and maintenance history.
                        </p>
                    </div>
                </div>
                <PropertyForm mode="create" />
            </div>
        </>
    );
}

PropertyCreate.layout = {
    breadcrumbs: [
        { title: 'Properties', href: index() },
        { title: 'Add property', href: create() },
    ],
};
