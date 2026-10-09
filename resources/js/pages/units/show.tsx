import { DoorOpen } from 'lucide-react';
import DetailPage, { label, money } from '@/components/detail-page';
import { destroy, edit, index } from '@/routes/units';

type RecordDetail = {
    id: number;
    unit_number: string;
    unit_type: string;
    property: { name: string };
    floor: string | null;
    bedrooms: number;
    bathrooms: number;
    monthly_rent: string;
    status: string;
    notes: string | null;
};

export default function UnitShow({ unit }: { unit: RecordDetail }) {
    return (
        <DetailPage
            title={`Unit ${unit.unit_number}`}
            subtitle={`${unit.property.name} · ${label(unit.unit_type)}`}
            summary={[
                {
                    title: 'Rental',
                    metric: {
                        label: 'Monthly rent',
                        value: money(unit.monthly_rent),
                    },
                },
            ]}
            sections={[
                {
                    title: 'Unit layout',
                    fields: [
                        { label: 'Floor', value: unit.floor },
                        { label: 'Bedrooms', value: unit.bedrooms },
                        { label: 'Bathrooms', value: unit.bathrooms },
                    ],
                },
                { title: 'Notes', text: unit.notes },
            ]}
            status={unit.status}
            icon={DoorOpen}
            backHref={index.url()}
            editHref={edit.url(unit.id)}
            deleteHref={destroy.url(unit.id)}
        />
    );
}

UnitShow.layout = {
    breadcrumbs: [
        { title: 'Units', href: index() },
        { title: 'Unit details', href: index() },
    ],
};
