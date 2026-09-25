import { Wrench } from 'lucide-react';
import { ModulePage } from '@/components/module-page';
import { index as maintenanceIndex } from '@/routes/maintenance';

export default function MaintenanceIndex() {
    return (
        <ModulePage
            title="Maintenance"
            description="Receive, triage, quote, schedule, and close repair requests with a complete property history."
            phase="Phase 3"
            icon={Wrench}
            emptyTitle="No maintenance requests"
            emptyDescription="Create the first request to start the workflow from tenant report through inspection and closure."
            actionLabel="Create a maintenance request"
            capabilities={[
                'Category, priority, description, and photos',
                'Property, unit, tenant, and requester context',
                'Triage, approval, schedule, and status workflow',
                'Urgent attention and maintenance history',
            ]}
        />
    );
}

MaintenanceIndex.layout = {
    breadcrumbs: [
        {
            title: 'Maintenance',
            href: maintenanceIndex(),
        },
    ],
};
