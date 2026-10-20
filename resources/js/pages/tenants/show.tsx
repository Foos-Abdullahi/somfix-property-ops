import { UserRound } from 'lucide-react';
import DetailPage, { date } from '@/components/detail-page';
import { usePermissions } from '@/hooks/use-permissions';
import { destroy, edit, index } from '@/routes/tenants';

type RecordDetail = {
    id: number;
    first_name: string;
    last_name: string;
    phone: string;
    email: string | null;
    whatsapp: string | null;
    emergency_contact: string | null;
    status: string;
    move_in_date: string | null;
    notes: string | null;
    unit: { unit_number: string; property: { name: string } } | null;
};

export default function TenantShow({ tenant }: { tenant: RecordDetail }) {
    const { canManage } = usePermissions();
    return (
        <DetailPage
            title={`${tenant.first_name} ${tenant.last_name}`}
            summary={[
                {
                    title: 'Residence',
                    fields: [
                        {
                            label: 'Property',
                            value: tenant.unit?.property.name,
                        },
                        { label: 'Unit', value: tenant.unit?.unit_number },
                        {
                            label: 'Move-in date',
                            value: date(tenant.move_in_date),
                        },
                    ],
                },
            ]}
            sections={[
                {
                    title: 'Contact',
                    fields: [
                        { label: 'Phone', value: tenant.phone },
                        { label: 'Email', value: tenant.email },
                        ...(tenant.whatsapp && tenant.whatsapp !== tenant.phone
                            ? [{ label: 'WhatsApp', value: tenant.whatsapp }]
                            : []),
                        {
                            label: 'Emergency contact',
                            value: tenant.emergency_contact,
                        },
                    ],
                },
                { title: 'Notes', text: tenant.notes },
            ]}
            status={tenant.status}
            icon={UserRound}
            backHref={index.url()}
            editHref={canManage('tenants') ? edit.url(tenant.id) : undefined}
            deleteHref={canManage('tenants') ? destroy.url(tenant.id) : undefined}
        />
    );
}

TenantShow.layout = {
    breadcrumbs: [
        { title: 'Tenants', href: index() },
        { title: 'Tenant details', href: index() },
    ],
};
