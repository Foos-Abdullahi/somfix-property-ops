import { Building2 } from 'lucide-react';
import { ModulePage } from '@/components/module-page';
import { index as propertiesIndex } from '@/routes/properties';

export default function PropertiesIndex() {
    return (
        <ModulePage
            title="Properties"
            description="Register properties, owners, locations, facilities, photos, and inspection records."
            phase="Phase 2"
            icon={Building2}
            emptyTitle="No properties registered"
            emptyDescription="Add the first property to begin tracking its units, leases, and maintenance history."
            actionLabel="Add your first property"
            capabilities={[
                'Property identity, ownership, and location',
                'Unit inventory and occupancy status',
                'Photos, documents, and inspections',
                'Linked leases and maintenance history',
            ]}
        />
    );
}

PropertiesIndex.layout = {
    breadcrumbs: [
        {
            title: 'Properties',
            href: propertiesIndex(),
        },
    ],
};
