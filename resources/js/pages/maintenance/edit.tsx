import { Head } from '@inertiajs/react';
import { Pencil } from 'lucide-react';
import {
    MaintenanceForm,
    type MaintenanceFormValues,
} from '@/pages/maintenance/components/maintenance-form';
import { index } from '@/routes/maintenance';

type Maintenance = MaintenanceFormValues & { id: number };

type Props = {
    maintenance: Maintenance;
    properties?: Array<{ id: number; name: string }>;
    units?: Array<{
        id: number;
        unit_number: string;
        property?: { name: string };
    }>;
    tenants?: Array<{ id: number; first_name: string; last_name: string }>;
};

export default function MaintenanceEdit({
    maintenance,
    properties = [],
    units = [],
    tenants = [],
}: Props) {
    return (
        <>
            <Head title={`Edit maintenance request — SOMFIX`} />
            <div className="mx-auto w-full max-w-5xl p-4 md:p-6">
                <div className="mb-6 flex items-start gap-3">
                    <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Pencil className="size-5" />
                    </span>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Edit maintenance request
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Update the maintenance request details and status.
                        </p>
                    </div>
                </div>
                <MaintenanceForm
                    mode="edit"
                    maintenance={maintenance}
                    properties={properties}
                    units={units}
                    tenants={tenants}
                />
            </div>
        </>
    );
}

MaintenanceEdit.layout = {
    breadcrumbs: [
        { title: 'Maintenance', href: index() },
        { title: 'Edit request', href: index() },
    ],
};
