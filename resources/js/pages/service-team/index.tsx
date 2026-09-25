import { HardHat } from 'lucide-react';
import { ModulePage } from '@/components/module-page';
import { index as serviceTeamIndex } from '@/routes/service-team';

export default function ServiceTeamIndex() {
    return (
        <ModulePage
            title="Vendors & Technicians"
            description="Maintain the service team directory, skills, contact details, availability, and assigned work."
            phase="Phase 3"
            icon={HardHat}
            emptyTitle="No vendors or technicians"
            emptyDescription="Add service providers so maintenance work can be estimated, scheduled, and assigned with confidence."
            actionLabel="Add a vendor or technician"
            capabilities={[
                'Skills, categories, and service areas',
                'Phone, WhatsApp, and availability',
                'Quotes, job assignments, and schedules',
                'Performance, balances, and warranty work',
            ]}
        />
    );
}

ServiceTeamIndex.layout = {
    breadcrumbs: [
        {
            title: 'Vendors & Technicians',
            href: serviceTeamIndex(),
        },
    ],
};
