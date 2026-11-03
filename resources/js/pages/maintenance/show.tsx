import { Wrench } from 'lucide-react';
import DetailPage, { date, label, money } from '@/components/detail-page';
import { destroy, edit, index } from '@/routes/maintenance';

type Maintenance = {
    id: number;
    property_id: number | null;
    customer_id: number | null;
    location: string | null;
    unit_id: number | null;
    tenant_id: number | null;
    category: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    title: string;
    description: string;
    status: 'open' | 'in_progress' | 'scheduled' | 'completed' | 'cancelled';
    assigned_to: string | null;
    scheduled_date: string | null;
    completed_date: string | null;
    estimated_cost: number | null;
    actual_cost: number | null;
    notes: string | null;
    created_at: string;
    updated_at: string;
    property?: {
        id: number;
        name: string;
        address: string | null;
    };
    unit?: {
        id: number;
        unit_number: string;
    };
    customer?: {
        id: number;
        name: string;
        phone: string | null;
        email: string | null;
    } | null;
    tenant?: {
        id: number;
        first_name: string;
        last_name: string;
        email: string | null;
        phone: string | null;
    };
};

export default function MaintenanceShow({
    maintenance,
}: {
    maintenance: Maintenance;
}) {
    return (
        <DetailPage
            title={maintenance.title}
            subtitle={label(maintenance.category)}
            badge={`${label(maintenance.priority)} priority`}
            summary={[
                {
                    title: 'Costs',
                    metric: {
                        label: 'Estimated cost',
                        value: money(maintenance.estimated_cost),
                    },
                    fields: [
                        {
                            label: 'Actual cost',
                            value: money(maintenance.actual_cost),
                        },
                    ],
                },
                {
                    title: 'Schedule',
                    fields: [
                        {
                            label: 'Assigned to',
                            value: maintenance.assigned_to,
                        },
                        {
                            label: 'Scheduled',
                            value: date(maintenance.scheduled_date),
                        },
                        {
                            label: 'Completed',
                            value: date(maintenance.completed_date),
                        },
                    ],
                },
            ]}
            sections={[
                { title: 'Request description', text: maintenance.description },
                ...(maintenance.notes &&
                maintenance.notes !== maintenance.description
                    ? [{ title: 'Notes', text: maintenance.notes }]
                    : []),
            ]}
            aside={[
                {
                    title: 'Location & contact',
                    fields: [
                        {
                            label: 'Property',
                            value: maintenance.property?.name ?? 'Not a managed property',
                        },
                        { label: 'Location', value: maintenance.location },
                        { label: 'Unit', value: maintenance.unit?.unit_number },
                        { label: 'Customer', value: maintenance.customer?.name },
                        {
                            label: 'Tenant',
                            value: maintenance.tenant
                                ? `${maintenance.tenant.first_name} ${maintenance.tenant.last_name}`
                                : null,
                        },
                        { label: 'Email', value: maintenance.tenant?.email ?? maintenance.customer?.email },
                        { label: 'Phone', value: maintenance.tenant?.phone ?? maintenance.customer?.phone },
                    ],
                },
            ]}
            status={maintenance.status}
            icon={Wrench}
            managePermission="maintenance.manage"
            backHref={index.url()}
            editHref={edit.url(maintenance.id)}
            deleteHref={destroy.url(maintenance.id)}
        />
    );
}

MaintenanceShow.layout = {
    breadcrumbs: [
        { title: 'Maintenance', href: index() },
        { title: 'Request details', href: index() },
    ],
};
