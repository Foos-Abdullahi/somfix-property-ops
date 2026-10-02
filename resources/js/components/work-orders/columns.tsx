import { Link } from "@inertiajs/react";
import type { ColumnDef } from "@tanstack/react-table";
import { Edit, Eye } from "lucide-react";
import { Badge, badgeToneClasses } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { edit, show } from "@/routes/work-orders";

export type WorkOrderRow = { id: number; title: string; status: "pending" | "assigned" | "in_progress" | "completed" | "cancelled"; assigned_date: string | null; maintenance: { id: number; title: string; category: string; priority: string } | null; serviceTeam: { id: number; name: string; specialization: string } | null };
const statusClass = { pending: badgeToneClasses.warning, assigned: badgeToneClasses.info, in_progress: badgeToneClasses.progress, completed: badgeToneClasses.success, cancelled: badgeToneClasses.danger };
export const workOrderColumns: ColumnDef<WorkOrderRow>[] = [
    { accessorKey: "title", header: "Title", cell: ({ row }) => <div><p className="font-semibold">{row.original.title}</p><p className="text-xs text-muted-foreground">{row.original.maintenance?.category ?? "—"}</p></div> },
    { accessorKey: "maintenance.title", header: "Maintenance", cell: ({ row }) => row.original.maintenance?.title ?? "—" },
    { accessorKey: "serviceTeam.name", header: "Service team", cell: ({ row }) => row.original.serviceTeam?.name ?? "Unassigned" },
    { accessorKey: "assigned_date", header: "Assigned date", cell: ({ row }) => row.original.assigned_date ?? "—" },
    { accessorKey: "status", header: "Status", cell: ({ row }) => <Badge variant="outline" className={statusClass[row.original.status]}>{row.original.status.replace("_", " ").toUpperCase()}</Badge> },
    { id: "actions", header: "Actions", cell: ({ row }) => <div className="flex gap-1"><Button asChild size="icon" variant="ghost"><Link href={show(row.original.id)}><Eye className="size-4" /></Link></Button><Button asChild size="icon" variant="ghost"><Link href={edit(row.original.id)}><Edit className="size-4" /></Link></Button></div> },
];
