import { Head } from '@inertiajs/react';
import { Wrench } from 'lucide-react';
import { MaintenanceForm } from '@/pages/maintenance/components/maintenance-form';
import { create, index } from '@/routes/maintenance';

type Props = {
    properties?: Array<{ id: number; name: string }>;
    units?: Array<{
        id: number;
        unit_number: string;
        property?: { name: string };
    }>;
    tenants?: Array<{ id: number; first_name: string; last_name: string }>;
};

export default function MaintenanceCreate({
    properties = [],
    units = [],
    tenants = [],
}: Props) {
    return (
        <>
            <Head title="Add maintenance request — SOMFIX" />
            <div className="mx-auto w-full max-w-5xl p-4 md:p-6">
                <div className="mb-6 flex items-start gap-3">
                    <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Wrench className="size-5" />
                    </span>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Add a maintenance request
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Create a new maintenance request for property
                            repairs or services.
                        </p>
                    </div>
                </div>
                <MaintenanceForm
                    mode="create"
                    properties={properties}
                    units={units}
                    tenants={tenants}
                />
            </div>
        </>
    );
}

MaintenanceCreate.layout = {
    breadcrumbs: [
        { title: 'Maintenance', href: index() },
        { title: 'Add request', href: create() },
    ],
};
