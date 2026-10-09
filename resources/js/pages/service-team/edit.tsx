import { Head } from '@inertiajs/react';
import {
    ServiceTeamForm,
    type ServiceTeamFormValues,
} from '@/pages/service-team/components/service-team-form';
import { index } from '@/routes/service-team';

export default function ServiceTeamEdit({
    serviceTeam,
}: {
    serviceTeam: ServiceTeamFormValues & { id: number };
}) {
    return (
        <>
            <Head title="Edit service team member — SOMFIX" />
            <div className="w-full p-4 md:p-6">
                <h1 className="text-2xl font-bold">Edit service team member</h1>
                <p className="mt-1 mb-6 text-sm text-muted-foreground">
                    Update service team member details and availability.
                </p>
                <ServiceTeamForm mode="edit" serviceTeam={serviceTeam} />
            </div>
        </>
    );
}

ServiceTeamEdit.layout = {
    breadcrumbs: [
        { title: 'Service Team', href: index() },
        { title: 'Edit member', href: index() },
    ],
};
