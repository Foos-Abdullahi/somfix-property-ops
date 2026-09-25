import { Users } from 'lucide-react';
import { ModulePage } from '@/components/module-page';
import { index as tenantsIndex } from '@/routes/tenants';

export default function TenantsIndex() {
    return (
        <ModulePage
            title="Tenants"
            description="Keep tenant contact details, communication preferences, leases, requests, and follow-ups together."
            phase="Phase 2"
            icon={Users}
            emptyTitle="No tenant records"
            emptyDescription="Add a tenant to connect contact details, active leases, maintenance requests, and service history."
            actionLabel="Add your first tenant"
            capabilities={[
                'Phone, WhatsApp, email, and contact preference',
                'Active units and lease summaries',
                'Maintenance requests and interactions',
                'Complaints, follow-ups, and satisfaction',
            ]}
        />
    );
}

TenantsIndex.layout = {
    breadcrumbs: [
        {
            title: 'Tenants',
            href: tenantsIndex(),
        },
    ],
};
