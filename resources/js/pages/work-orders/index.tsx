import { ClipboardList } from 'lucide-react';
import { ModulePage } from '@/components/module-page';
import { index as workOrdersIndex } from '@/routes/work-orders';

export default function WorkOrdersIndex() {
    return (
        <ModulePage
            title="Work Orders"
            description="Plan field work, assign technicians, record materials, capture completion evidence, and close jobs."
            phase="Phase 3"
            icon={ClipboardList}
            emptyTitle="No work orders scheduled"
            emptyDescription="Convert an approved repair or simple fix into a scheduled job order with a clear scope of work."
            actionLabel="Create your first work order"
            capabilities={[
                'Scope, schedule, and assigned technician',
                'Checklist, materials, photos, and work notes',
                'Labor, transport, and material costs',
                'Completion, warranty, and invoice status',
            ]}
        />
    );
}

WorkOrdersIndex.layout = {
    breadcrumbs: [
        {
            title: 'Work Orders',
            href: workOrdersIndex(),
        },
    ],
};
