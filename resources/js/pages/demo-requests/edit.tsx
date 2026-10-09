import { Head } from '@inertiajs/react';
import RequestForm from './components/request-form';
import type { Inquiry, TenantOption } from './types';
export default function RequestEdit({
    inquiry,
    tenants,
}: {
    inquiry: Inquiry;
    tenants: TenantOption[];
}) {
    return (
        <>
            <Head title="Edit demo request — SOMFIX" />
            <div className="w-full space-y-6 p-4 md:p-6">
                <header>
                    <h1 className="page-title-enter text-lg font-semibold">
                        Edit request from {inquiry.name}
                    </h1>
                    <p className="page-description-enter text-xs text-muted-foreground">
                        Update contact details, scheduling and the tenant
                        outcome.
                    </p>
                </header>
                <RequestForm inquiry={inquiry} tenants={tenants} />
            </div>
        </>
    );
}
RequestEdit.layout = {
    breadcrumbs: [
        { title: 'Demo Requests', href: '/demo-requests' },
        { title: 'Edit request', href: '/demo-requests' },
    ],
};
