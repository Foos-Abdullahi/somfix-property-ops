import { Head } from '@inertiajs/react';
import {
    ServiceForm,
    type ServiceFormValues,
} from '@/pages/service-list/components/service-form';
import { index } from '@/routes/service-list';

export default function ServiceListEdit({
    service,
    categories,
}: {
    service: {
        [K in keyof ServiceFormValues]: ServiceFormValues[K] | null;
    } & { id: number };
    categories: string[];
}) {
    return (
        <>
            <Head title="Edit service — SOMFIX" />
            <div className="mx-auto w-full max-w-5xl p-4 md:p-6">
                <h1 className="text-2xl font-bold">Edit service</h1>
                <p className="mt-1 mb-6 text-sm text-muted-foreground">
                    Update the service details, price and status.
                </p>
                <ServiceForm
                    mode="edit"
                    service={service}
                    categories={categories}
                />
            </div>
        </>
    );
}

ServiceListEdit.layout = {
    breadcrumbs: [
        { title: 'Service List', href: index() },
        { title: 'Edit service', href: index() },
    ],
};
