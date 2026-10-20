import { DoorOpen } from 'lucide-react';
import DetailPage, { label, money } from '@/components/detail-page';
import { usePermissions } from '@/hooks/use-permissions';
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
    const { canManage } = usePermissions();
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
            editHref={canManage('units') ? edit.url(unit.id) : undefined}
            deleteHref={canManage('units') ? destroy.url(unit.id) : undefined}
        />
    );
}

UnitShow.layout = {
    breadcrumbs: [
        { title: 'Units', href: index() },
        { title: 'Unit details', href: index() },
    ],
};
