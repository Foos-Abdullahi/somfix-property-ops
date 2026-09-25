import { DoorOpen } from 'lucide-react';
import { ModulePage } from '@/components/module-page';
import { index as unitsIndex } from '@/routes/units';

export default function UnitsIndex() {
    return (
        <ModulePage
            title="Units"
            description="Manage unit numbers, occupancy, rent, facilities, and current tenancy from one place."
            phase="Phase 2"
            icon={DoorOpen}
            emptyTitle="No units available"
            emptyDescription="Create units within a property to track occupancy, leases, rent, and maintenance history."
            actionLabel="Add your first unit"
            capabilities={[
                'Unit details, size, rooms, and facilities',
                'Vacant, occupied, and maintenance status',
                'Current tenant and lease summary',
                'Unit-level repair and payment history',
            ]}
        />
    );
}

UnitsIndex.layout = {
    breadcrumbs: [
        {
            title: 'Units',
            href: unitsIndex(),
        },
    ],
};
