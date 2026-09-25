import { BarChart3 } from 'lucide-react';
import { ModulePage } from '@/components/module-page';
import { index as reportsIndex } from '@/routes/reports';

export default function ReportsIndex() {
    return (
        <ModulePage
            title="Reports"
            description="Review operational and financial performance across properties, repairs, teams, and cash movement."
            phase="Phase 5"
            icon={BarChart3}
            emptyTitle="No reports available"
            emptyDescription="Reports become useful after property, maintenance, inventory, and finance records begin flowing into the system."
            actionLabel="Build your first report"
            capabilities={[
                'Occupancy and portfolio summaries',
                'Maintenance volume and job performance',
                'Revenue, expenses, and profit analysis',
                'Searchable tables, filters, and exports',
            ]}
        />
    );
}

ReportsIndex.layout = {
    breadcrumbs: [
        {
            title: 'Reports',
            href: reportsIndex(),
        },
    ],
};
