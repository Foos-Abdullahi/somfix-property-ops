import { ClipboardList } from 'lucide-react';
import DetailPage, { date, label } from '@/components/detail-page';
import { destroy, edit, index } from '@/routes/work-orders';

type RecordDetail = {
    id: number;
    title: string;
    description: string;
    status: string;
    assigned_date: string | null;
    started_date: string | null;
    completed_date: string | null;
    estimated_hours: string | null;
    actual_hours: string | null;
    notes: string | null;
    maintenance: { title: string; category: string; priority: string } | null;
    service_team: { name: string; specialization: string } | null;
};

export default function WorkOrderShow({
    workOrder,
}: {
    workOrder: RecordDetail;
}) {
    return (
        <DetailPage
            title={workOrder.title}
            summary={[
                {
                    title: 'Time allocation',
                    metric: {
                        label: 'Estimated hours',
                        value:
                            workOrder.estimated_hours == null
                                ? 'Not estimated'
                                : `${workOrder.estimated_hours} h`,
                    },
                    fields: [
                        {
                            label: 'Actual hours',
                            value:
                                workOrder.actual_hours == null
                                    ? 'Not recorded'
                                    : `${workOrder.actual_hours} h`,
                        },
                    ],
                },
                {
                    title: 'Schedule',
                    fields: [
                        {
                            label: 'Assigned',
                            value: date(workOrder.assigned_date),
                        },
                        {
                            label: 'Started',
                            value: date(workOrder.started_date),
                        },
                        {
                            label: 'Completed',
                            value: date(workOrder.completed_date),
                        },
                    ],
                },
            ]}
            sections={[
                { title: 'Work description', text: workOrder.description },
                ...(workOrder.notes && workOrder.notes !== workOrder.description
                    ? [{ title: 'Notes', text: workOrder.notes }]
                    : []),
            ]}
            aside={[
                {
                    title: 'Assignment',
                    fields: [
                        {
                            label: 'Maintenance request',
                            value: workOrder.maintenance?.title,
                        },
                        {
                            label: 'Category',
                            value: workOrder.maintenance
                                ? label(workOrder.maintenance.category)
                                : null,
                        },
                        {
                            label: 'Priority',
                            value: workOrder.maintenance
                                ? label(workOrder.maintenance.priority)
                                : null,
                        },
                        {
                            label: 'Service team',
                            value: workOrder.service_team?.name,
                        },
                        {
                            label: 'Specialization',
                            value: workOrder.service_team?.specialization,
                        },
                    ],
                },
            ]}
            status={workOrder.status}
            icon={ClipboardList}
            backHref={index.url()}
            editHref={edit.url(workOrder.id)}
            deleteHref={destroy.url(workOrder.id)}
        />
    );
}

WorkOrderShow.layout = {
    breadcrumbs: [
        { title: 'Work Orders', href: index() },
        { title: 'Work order details', href: index() },
    ],
};
