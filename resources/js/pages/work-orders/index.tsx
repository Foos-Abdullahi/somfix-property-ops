import { Head, Link } from "@inertiajs/react";
import { CheckCircle2, Clock, Plus, Wrench, AlertCircle } from "lucide-react";
import { workOrderColumns, type WorkOrderRow } from "@/components/work-orders/columns";
import { StatsCard, type StatSection } from "@/components/tools/StatsCard";
import { DataTable } from "@/components/tools/table/main-table";
import { Button } from "@/components/ui/button";
import { create, index } from "@/routes/work-orders";

export default function WorkOrdersIndex({ workOrders, stats }: { workOrders: WorkOrderRow[]; stats: { totalOrders: number; pendingOrders: number; inProgress: number; completedOrders: number } }) {
    const sections: StatSection[] = [{ title: "Total orders", value: stats.totalOrders, description: "All work orders", icon: Wrench, color: "primary" }, { title: "Pending", value: stats.pendingOrders, description: "Awaiting assignment", icon: Clock, color: "warning" }, { title: "In progress", value: stats.inProgress, description: "Currently being worked on", icon: AlertCircle, color: "info" }, { title: "Completed", value: stats.completedOrders, description: "Successfully finished", icon: CheckCircle2, color: "success" }];
    return <><Head title="Work Orders — SOMFIX" /><div className="p-4 md:p-6"><div className="flex items-start justify-between gap-4"><div><h1 className="text-lg font-semibold">Work orders</h1><p className="text-xs text-muted-foreground">Track maintenance work orders, assignments, and completion status.</p></div><Button asChild size="sm"><Link href={create()}><Plus className="size-4" />Add <span className="hidden sm:inline">work order</span></Link></Button></div><StatsCard sections={sections} /><div className="mt-6 animate-in fade-in slide-in-from-bottom-6 duration-1000"><DataTable title="Work Orders" searchTitle="Filter work orders by title, status or service team..." columns={workOrderColumns} data={workOrders} /></div></div></>;
}

WorkOrdersIndex.layout = {
    breadcrumbs: [
        {
            title: 'Work Orders',
            href: index(),
        },
    ],
};
