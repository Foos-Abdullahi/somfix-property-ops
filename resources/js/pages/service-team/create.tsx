import { Head } from '@inertiajs/react';
import { ServiceTeamForm } from '@/pages/service-team/components/service-team-form';
import { create, index } from '@/routes/service-team';

export default function ServiceTeamCreate() {
    return (
        <>
            <Head title="Add service team member — SOMFIX" />
            <div className="w-full p-4 md:p-6">
                <h1 className="text-2xl font-bold">
                    Add a service team member
                </h1>
                <p className="mt-1 mb-6 text-sm text-muted-foreground">
                    Register a new service team member with their contact
                    details and specialization.
                </p>
                <ServiceTeamForm mode="create" />
            </div>
        </>
    );
}

ServiceTeamCreate.layout = {
    breadcrumbs: [
        { title: 'Service Team', href: index() },
        { title: 'Add member', href: create() },
    ],
};
