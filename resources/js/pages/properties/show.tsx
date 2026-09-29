import { Building2 } from 'lucide-react';
import DetailPage, { label } from '@/components/detail-page';
import { destroy, edit, index } from '@/routes/properties';

type Property = {
    id: number;
    name: string;
    property_type: string;
    owner_name: string | null;
    district: string | null;
    city: string;
    address: string | null;
    units_count: number;
    status: 'active' | 'inactive';
    notes: string | null;
    created_at: string;
    updated_at: string;
};

export default function PropertyShow({ property }: { property: Property }) {
    return (
        <DetailPage
            title={property.name}
            subtitle={label(property.property_type)}
            summary={[
                {
                    title: 'Portfolio',
                    metric: {
                        label: 'Registered units',
                        value: property.units_count,
                    },
                    fields: [{ label: 'Owner', value: property.owner_name }],
                },
            ]}
            sections={[
                {
                    title: 'Location',
                    fields: [
                        { label: 'Address', value: property.address },
                        { label: 'District', value: property.district },
                        { label: 'City', value: property.city },
                    ],
                },
                { title: 'Operational notes', text: property.notes },
            ]}
            status={property.status}
            icon={Building2}
            backHref={index.url()}
            editHref={edit.url(property.id)}
            deleteHref={destroy.url(property.id)}
        />
    );
}

PropertyShow.layout = {
    breadcrumbs: [
        { title: 'Properties', href: index() },
        { title: 'Property details', href: index() },
    ],
};
