import { Head } from "@inertiajs/react";
import { WorkOrderForm, type WorkOrderFormValues } from "@/pages/work-orders/components/work-order-form";
import { index } from "@/routes/work-orders";

export default function WorkOrderEdit({ workOrder, maintenances, serviceTeams }: { workOrder: WorkOrderFormValues & { id: number }; maintenances: { id: number; title: string; category: string; priority: string }[]; serviceTeams: { id: number; name: string; specialization: string }[] }) {
    return <><Head title="Edit work order — SOMFIX" /><div className="w-full p-4 md:p-6"><h1 className="text-2xl font-bold">Edit work order</h1><p className="mt-1 mb-6 text-sm text-muted-foreground">Update work order details, assignment and progress.</p><WorkOrderForm mode="edit" workOrder={workOrder} maintenances={maintenances} serviceTeams={serviceTeams} /></div></>;
}

WorkOrderEdit.layout = { breadcrumbs: [{ title: "Work Orders", href: index() }, { title: "Edit work order", href: index() }] };
