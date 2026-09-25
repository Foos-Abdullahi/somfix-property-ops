import { Head } from "@inertiajs/react";
import { FileText } from "lucide-react";
import { LeaseForm } from "@/pages/leases/components/lease-form";
import { create, index } from "@/routes/leases";

type Props = {
    tenants?: Array<{ id: number; first_name: string; last_name: string }>;
    units?: Array<{ id: number; unit_number: string; property?: { name: string } }>;
};

export default function LeaseCreate({ tenants = [], units = [] }: Props) {
    return (
        <>
            <Head title="Add lease — SOMFIX" />
            <div className="mx-auto w-full max-w-5xl p-4 md:p-6">
                <div className="mb-6 flex items-start gap-3">
                    <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <FileText className="size-5" />
                    </span>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Add a lease
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Create a lease agreement to connect a tenant with a unit and define payment terms.
                        </p>
                    </div>
                </div>
                <LeaseForm mode="create" tenants={tenants} units={units} />
            </div>
        </>
    );
}

LeaseCreate.layout = {
    breadcrumbs: [
        { title: "Leases", href: index() },
        { title: "Add lease", href: create() },
    ],
};
