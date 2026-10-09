import { Head } from '@inertiajs/react';
import RequestForm from './components/request-form';
import type { TenantOption } from './types';
export default function RequestCreate({
    tenants,
}: {
    tenants: TenantOption[];
}) {
    return (
        <>
            <Head title="Add demo request — SOMFIX" />
            <div className="w-full space-y-6 p-4 md:p-6">
                <header>
                    <h1 className="page-title-enter text-lg font-semibold">
                        Add demo request
                    </h1>
                    <p className="page-description-enter text-xs text-muted-foreground">
                        Record an inquiry received by email, phone or in person.
                    </p>
                </header>
                <RequestForm tenants={tenants} />
            </div>
        </>
    );
}
RequestCreate.layout = {
    breadcrumbs: [
        { title: 'Demo Requests', href: '/demo-requests' },
        { title: 'Add request', href: '/demo-requests/create' },
    ],
};
