import { Head, Link, router } from "@inertiajs/react";
import { useState } from "react";
import { ArrowLeft, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { destroy, edit, index } from "@/routes/work-orders";

export default function WorkOrderShow({ workOrder }: { workOrder: { id: number; title: string; description: string; status: string; assigned_date: string | null; started_date: string | null; completed_date: string | null; estimated_hours: string | null; actual_hours: string | null; notes: string | null; maintenance: { title: string; category: string; priority: string } | null; serviceTeam: { name: string; specialization: string } | null } }) {
    const [confirming, setConfirming] = useState(false);
    return <><Head title={`Work Order ${workOrder.title} — SOMFIX`} /><div className="w-full p-4 md:p-6"><div className="flex flex-wrap items-start justify-between gap-4 border-b pb-5"><div><div className="flex gap-2"><h1 className="text-2xl font-bold">{workOrder.title}</h1><Badge variant="outline">{workOrder.status}</Badge></div><p className="mt-1 text-sm text-muted-foreground">{workOrder.maintenance?.title ?? "No maintenance"} · {workOrder.serviceTeam?.name ?? "Unassigned"}</p></div><div className="flex gap-2"><Button asChild size="sm" variant="outline"><Link href={edit(workOrder.id)}><Edit />Edit</Link></Button>{confirming ? <Button size="sm" variant="destructive" onClick={() => router.delete(destroy.url(workOrder.id))}>Confirm delete</Button> : <Button size="sm" variant="outline" onClick={() => setConfirming(true)}><Trash2 />Delete</Button>}<Button asChild size="sm" variant="outline"><Link href={index()}><ArrowLeft />Back</Link></Button></div></div><div className="mt-6 grid gap-4 rounded-2xl border bg-card p-5 sm:grid-cols-3"><Detail label="Assigned date" value={workOrder.assigned_date ?? "—"} /><Detail label="Started date" value={workOrder.started_date ?? "—"} /><Detail label="Completed date" value={workOrder.completed_date ?? "—"} /><Detail label="Estimated hours" value={workOrder.estimated_hours ? `${workOrder.estimated_hours}h` : "—"} /><Detail label="Actual hours" value={workOrder.actual_hours ? `${workOrder.actual_hours}h` : "—"} /><Detail label="Service team" value={workOrder.serviceTeam?.name ?? "Unassigned"} /><div className="sm:col-span-3"><Detail label="Description" value={workOrder.description} /></div><div className="sm:col-span-3"><Detail label="Notes" value={workOrder.notes ?? "No notes added."} /></div></div></div></>;
}

function Detail({ label, value }: { label: string; value: string }) { return <div><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 font-medium">{value}</p></div>; }

WorkOrderShow.layout = { breadcrumbs: [{ title: "Work Orders", href: index() }, { title: "Work order details", href: index() }] };
