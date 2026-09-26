import { Link } from "@inertiajs/react";
import type { ColumnDef } from "@tanstack/react-table";
import { Edit, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { edit, show } from "@/routes/work-orders";

export type WorkOrderRow = { id: number; title: string; status: "pending" | "assigned" | "in_progress" | "completed" | "cancelled"; assigned_date: string | null; maintenance: { id: number; title: string; category: string; priority: string } | null; serviceTeam: { id: number; name: string; specialization: string } | null };
const statusClass = { pending: "border-yellow-500/20 bg-yellow-500/10 text-yellow-700", assigned: "border-blue-500/20 bg-blue-500/10 text-blue-700", in_progress: "border-orange-500/20 bg-orange-500/10 text-orange-700", completed: "border-green-500/20 bg-green-500/10 text-green-700", cancelled: "border-red-500/20 bg-red-500/10 text-red-700" };
export const workOrderColumns: ColumnDef<WorkOrderRow>[] = [
    { accessorKey: "title", header: "Title", cell: ({ row }) => <div><p className="font-semibold">{row.original.title}</p><p className="text-xs text-muted-foreground">{row.original.maintenance?.category ?? "—"}</p></div> },
    { accessorKey: "maintenance.title", header: "Maintenance", cell: ({ row }) => row.original.maintenance?.title ?? "—" },
    { accessorKey: "serviceTeam.name", header: "Service team", cell: ({ row }) => row.original.serviceTeam?.name ?? "Unassigned" },
    { accessorKey: "assigned_date", header: "Assigned date", cell: ({ row }) => row.original.assigned_date ?? "—" },
    { accessorKey: "status", header: "Status", cell: ({ row }) => <Badge variant="outline" className={statusClass[row.original.status]}>{row.original.status.replace("_", " ").toUpperCase()}</Badge> },
    { id: "actions", header: "Actions", cell: ({ row }) => <div className="flex gap-1"><Button asChild size="icon" variant="ghost"><Link href={show(row.original.id)}><Eye className="size-4" /></Link></Button><Button asChild size="icon" variant="ghost"><Link href={edit(row.original.id)}><Edit className="size-4" /></Link></Button></div> },
];
