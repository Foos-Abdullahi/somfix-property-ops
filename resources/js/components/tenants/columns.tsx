import { Link } from "@inertiajs/react";
import type { ColumnDef } from "@tanstack/react-table";
import { Edit, Eye } from "lucide-react";
import { Badge, badgeToneClasses } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { edit, show } from "@/routes/tenants";

export type TenantRow = { id: number; first_name: string; last_name: string; phone: string; email: string | null; status: "active" | "inactive"; unit: { id: number; unit_number: string; property: { id: number; name: string } } | null };
export const tenantColumns: ColumnDef<TenantRow>[] = [
    { id: "tenant", header: "Tenant", cell: ({ row }) => <div><p className="font-semibold">{row.original.first_name} {row.original.last_name}</p><p className="text-xs text-muted-foreground">{row.original.email ?? row.original.phone}</p></div> },
    { accessorKey: "phone", header: "Phone" },
    { id: "unit", header: "Assigned unit", cell: ({ row }) => row.original.unit ? <div><p>{row.original.unit.unit_number}</p><p className="text-xs text-muted-foreground">{row.original.unit.property.name}</p></div> : "Unassigned" },
    { accessorKey: "status", header: "Status", cell: ({ row }) => <Badge variant="outline" className={row.original.status === "active" ? badgeToneClasses.success : badgeToneClasses.neutral}>{row.original.status === "active" ? "Active" : "Inactive"}</Badge> },
    { id: "actions", header: "Actions", cell: ({ row }) => <div className="flex gap-1"><Button asChild size="icon" variant="ghost"><Link href={show(row.original.id)}><Eye className="size-4" /></Link></Button><Button asChild size="icon" variant="ghost"><Link href={edit(row.original.id)}><Edit className="size-4" /></Link></Button></div> },
];
