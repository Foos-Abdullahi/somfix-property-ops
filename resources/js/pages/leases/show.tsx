import { FileText } from 'lucide-react';
import DetailPage, { date, money } from '@/components/detail-page';
import { destroy, edit, index } from '@/routes/leases';

type Lease = {
    id: number;
    tenant_id: number;
    unit_id: number;
    start_date: string;
    end_date: string;
    monthly_rent: number;
    deposit_amount: number;
    status: 'active' | 'expired' | 'pending' | 'terminated';
    payment_due_day: number;
    currency: string;
    notes: string | null;
    created_at: string;
    updated_at: string;
    tenant?: {
        id: number;
        first_name: string;
        last_name: string;
        email: string | null;
        phone: string | null;
    };
    unit?: {
        id: number;
        unit_number: string;
        property?: {
            id: number;
            name: string;
            address: string | null;
        };
    };
};

export default function LeaseShow({ lease }: { lease: Lease }) {
    return (
        <DetailPage
            title={`Lease #${lease.id}`}
            summary={[
                {
                    title: 'Payment terms',
                    metric: {
                        label: 'Monthly rent',
                        value: money(lease.monthly_rent, lease.currency),
                    },
                    fields: [
                        {
                            label: 'Deposit',
                            value: money(lease.deposit_amount, lease.currency),
                        },
                        {
                            label: 'Payment due',
                            value: `Day ${lease.payment_due_day} of each month`,
                        },
                    ],
                },
            ]}
            sections={[
                {
                    title: 'Agreement',
                    fields: [
                        {
                            label: 'Tenant',
                            value: lease.tenant
                                ? `${lease.tenant.first_name} ${lease.tenant.last_name}`
                                : null,
                        },
                        {
                            label: 'Property',
                            value: lease.unit?.property?.name,
                        },
                        { label: 'Unit', value: lease.unit?.unit_number },
                        { label: 'Start date', value: date(lease.start_date) },
                        { label: 'End date', value: date(lease.end_date) },
                    ],
                },
                { title: 'Lease notes', text: lease.notes },
            ]}
            aside={[
                {
                    title: 'Tenant contact',
                    fields: [
                        { label: 'Email', value: lease.tenant?.email },
                        { label: 'Phone', value: lease.tenant?.phone },
                    ],
                },
            ]}
            status={lease.status}
            icon={FileText}
            backHref={index.url()}
            editHref={edit.url(lease.id)}
            deleteHref={destroy.url(lease.id)}
        />
    );
}

LeaseShow.layout = {
    breadcrumbs: [
        { title: 'Leases', href: index() },
        { title: 'Lease details', href: index() },
    ],
};
