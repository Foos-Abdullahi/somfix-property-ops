import { Link } from "@inertiajs/react";
import type { ColumnDef } from "@tanstack/react-table";
import { Edit, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { edit, show } from "@/routes/finance";

export type FinanceRow = { id: number; invoice_number: string; title: string; type: string; currency: string; amount: string; paid_amount: string; balance: string; status: string; due_date: string | null; property: { name: string } | null; unit: { unit_number: string } | null; tenant: { first_name: string; last_name: string } | null };
const statusClass = { draft: "border-gray-500/20 bg-gray-500/10 text-gray-700", sent: "border-blue-500/20 bg-blue-500/10 text-blue-700", paid: "border-green-500/20 bg-green-500/10 text-green-700", overdue: "border-red-500/20 bg-red-500/10 text-red-700", cancelled: "border-gray-500/20 bg-gray-500/10 text-gray-700" };
export const financeColumns: ColumnDef<FinanceRow>[] = [
    { accessorKey: "invoice_number", header: "Invoice #", cell: ({ row }) => <div><p className="font-semibold">{row.original.invoice_number}</p><p className="text-xs text-muted-foreground">{row.original.title}</p></div> },
    { accessorKey: "type", header: "Type", cell: ({ row }) => row.original.type.toUpperCase() },
    { accessorKey: "currency", header: "Currency", cell: ({ row }) => row.original.currency },
    { accessorKey: "amount", header: "Amount", cell: ({ row }) => `${row.original.currency} ${Number(row.original.amount).toFixed(2)}` },
    { accessorKey: "paid_amount", header: "Paid", cell: ({ row }) => `${row.original.currency} ${Number(row.original.paid_amount).toFixed(2)}` },
    { accessorKey: "balance", header: "Balance", cell: ({ row }) => `${row.original.currency} ${Number(row.original.balance).toFixed(2)}` },
    { accessorKey: "status", header: "Status", cell: ({ row }) => <Badge variant="outline" className={statusClass[row.original.status]}>{row.original.status.toUpperCase()}</Badge> },
    { id: "actions", header: "Actions", cell: ({ row }) => <div className="flex gap-1"><Button asChild size="icon" variant="ghost"><Link href={show(row.original.id)}><Eye className="size-4" /></Link></Button><Button asChild size="icon" variant="ghost"><Link href={edit(row.original.id)}><Edit className="size-4" /></Link></Button></div> },
];
