import { Head } from '@inertiajs/react';
import { ServiceForm } from '@/pages/service-list/components/service-form';
import { create, index } from '@/routes/service-list';

export default function ServiceListCreate({
    categories,
}: {
    categories: string[];
}) {
    return (
        <>
            <Head title="Add service — SOMFIX" />
            <div className="w-full p-4 md:p-6">
                <h1 className="text-2xl font-bold">Add a service</h1>
                <p className="mt-1 mb-6 text-sm text-muted-foreground">
                    Record a service SOMFIX offers.
                </p>
                <ServiceForm mode="create" categories={categories} />
            </div>
        </>
    );
}

ServiceListCreate.layout = {
    breadcrumbs: [
        { title: 'Service List', href: index() },
        { title: 'Add service', href: create() },
    ],
};
