import { FileText } from 'lucide-react';
import { ModulePage } from '@/components/module-page';
import { index as leasesIndex } from '@/routes/leases';

export default function LeasesIndex() {
    return (
        <ModulePage
            title="Leases"
            description="Track tenancy terms, deposits, payment dates, renewals, expiry alerts, and lease documents."
            phase="Phase 2"
            icon={FileText}
            emptyTitle="No leases recorded"
            emptyDescription="Create an active lease to connect a tenant and unit with payment terms and renewal dates."
            actionLabel="Create your first lease"
            capabilities={[
                'Tenant, unit, and lease period',
                'Rent, deposit, due day, and currency',
                'Status, expiry alerts, and renewals',
                'Contracts and signed lease documents',
            ]}
        />
    );
}

LeasesIndex.layout = {
    breadcrumbs: [
        {
            title: 'Leases',
            href: leasesIndex(),
        },
    ],
};
