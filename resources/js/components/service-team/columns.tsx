import { Link } from "@inertiajs/react";
import type { ColumnDef } from "@tanstack/react-table";
import { Edit, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { edit, show } from "@/routes/service-team";

export type ServiceTeamRow = { id: number; name: string; specialization: string; phone: string; email: string; status: "active" | "inactive" | "on_leave" };
const statusClass = { active: "border-green-500/20 bg-green-500/10 text-green-700", inactive: "border-red-500/20 bg-red-500/10 text-red-700", on_leave: "border-yellow-500/20 bg-yellow-500/10 text-yellow-700" };
export const serviceTeamColumns: ColumnDef<ServiceTeamRow>[] = [
    { accessorKey: "name", header: "Name", cell: ({ row }) => <div><p className="font-semibold">{row.original.name}</p><p className="text-xs text-muted-foreground">{row.original.specialization}</p></div> },
    { accessorKey: "phone", header: "Phone", cell: ({ row }) => row.original.phone },
    { accessorKey: "email", header: "Email", cell: ({ row }) => row.original.email },
    { accessorKey: "status", header: "Status", cell: ({ row }) => <Badge variant="outline" className={statusClass[row.original.status]}>{row.original.status.replace("_", " ").toUpperCase()}</Badge> },
    { id: "actions", header: "Actions", cell: ({ row }) => <div className="flex gap-1"><Button asChild size="icon" variant="ghost"><Link href={show(row.original.id)}><Eye className="size-4" /></Link></Button><Button asChild size="icon" variant="ghost"><Link href={edit(row.original.id)}><Edit className="size-4" /></Link></Button></div> },
];
