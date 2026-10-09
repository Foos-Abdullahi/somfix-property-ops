import { Head } from '@inertiajs/react';
import { Pencil } from 'lucide-react';
import {
    LeaseForm,
    type LeaseFormValues,
} from '@/pages/leases/components/lease-form';
import { index } from '@/routes/leases';

type Lease = LeaseFormValues & { id: number };

type Props = {
    lease: Lease;
    tenants?: Array<{ id: number; first_name: string; last_name: string }>;
    units?: Array<{
        id: number;
        unit_number: string;
        property?: { name: string };
    }>;
};

export default function LeaseEdit({ lease, tenants = [], units = [] }: Props) {
    return (
        <>
            <Head title={`Edit lease — SOMFIX`} />
            <div className="mx-auto w-full max-w-5xl p-4 md:p-6">
                <div className="mb-6 flex items-start gap-3">
                    <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Pencil className="size-5" />
                    </span>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Edit lease
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Update the lease agreement details and payment
                            terms.
                        </p>
                    </div>
                </div>
                <LeaseForm
                    mode="edit"
                    lease={lease}
                    tenants={tenants}
                    units={units}
                />
            </div>
        </>
    );
}

LeaseEdit.layout = {
    breadcrumbs: [
        { title: 'Leases', href: index() },
        { title: 'Edit lease', href: index() },
    ],
};
