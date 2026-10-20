import { Head, Link, router } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import { Building2, Edit, Eye, Plus, Trash2, Users } from 'lucide-react';
import { useMemo, useState, type ReactNode } from 'react';
import { toast } from 'sonner';
import { ConfirmDeleteDialog } from '@/components/confirm-delete-dialog';
import { StatsCard, type StatSection } from '@/components/tools/StatsCard';
import { DataTable } from '@/components/tools/table/main-table';
import { Badge, badgeToneClasses } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Can } from '@/components/can';
import { usePermissions } from '@/hooks/use-permissions';

type Customer = { id: number; name: string; type: string; phone: string; email: string | null; status: string; jobs_count: number; leads_count: number };
export default function Customers({ customers }: { customers: Customer[] }) {
    const [target, setTarget] = useState<Customer | null>(null); const [deleting, setDeleting] = useState(false);
    const columns = useMemo<ColumnDef<Customer>[]>(() => [
        { accessorKey: 'name', header: 'Customer', cell: ({ row }) => <div><Link className="font-semibold text-primary hover:underline" href={`/sales/customers/${row.original.id}`}>{row.original.name}</Link><p className="text-xs text-muted-foreground">{row.original.email || row.original.phone}</p></div> },
        { accessorKey: 'phone', header: 'Phone' }, { accessorKey: 'type', header: 'Type', cell: ({ row }) => <span className="capitalize">{row.original.type}</span> }, { accessorKey: 'jobs_count', header: 'Jobs' }, { accessorKey: 'leads_count', header: 'Leads' },
        { accessorKey: 'status', header: 'Status', cell: ({ row }) => <Badge variant="outline" className={row.original.status === 'active' ? badgeToneClasses.success : badgeToneClasses.neutral}>{row.original.status}</Badge> },
        { id: 'actions', header: 'Actions', cell: ({ row }) => <div className="flex gap-1"><IconLink href={`/sales/customers/${row.original.id}`} label="View"><Eye /></IconLink><Can permission="sales.manage"><IconLink href={`/sales/customers/${row.original.id}/edit`} label="Edit"><Edit className="text-primary" /></IconLink><Button size="icon" variant="ghost" title="Delete" className="text-destructive" onClick={() => setTarget(row.original)}><Trash2 /></Button></Can></div> },
    ], []);
    const sections: StatSection[] = [{ title: 'Customers', value: customers.length, description: 'People and companies', icon: Users, color: 'primary' }, { title: 'Active customers', value: customers.filter(c => c.status === 'active').length, description: 'Available for service', icon: Building2, color: 'success' }, { title: 'Open leads', value: customers.reduce((sum, c) => sum + c.leads_count, 0), description: 'Customer enquiries', icon: Users, color: 'info' }];
    const remove = () => { if (!target) return; setDeleting(true); router.delete(`/sales/customers/${target.id}`, { onSuccess: () => { toast.success('Customer deleted'); setTarget(null); }, onError: () => toast.error('Could not delete customer'), onFinish: () => setDeleting(false) }); };
    return <><Head title="Customers — SOMFIX" /><div className="p-4 md:p-6"><div className="flex items-start justify-between gap-4"><div><h1 className="page-title-enter text-lg font-semibold">Customers</h1><p className="page-description-enter text-xs text-muted-foreground">Manage service customers, companies, contacts, and job history.</p></div><Can permission="sales.manage"><Button asChild size="sm"><Link href="/sales/customers/create"><Plus />Add customer</Link></Button></Can></div><StatsCard sections={sections} /><div className="mt-6 animate-in fade-in slide-in-from-bottom-6 duration-1000"><DataTable title="Customers" searchTitle="Filter customers by name, phone or email..." columns={columns} data={customers} /></div></div><ConfirmDeleteDialog open={!!target} onOpenChange={(open) => !open && setTarget(null)} title="Delete Customer" description={<>Delete <strong>{target?.name}</strong>? Linked jobs and leads will remain, but no longer have this customer.</>} processing={deleting} onConfirm={remove} /></>;
}
function IconLink({ href, label, children }: { href: string; label: string; children: ReactNode }) { return <Button asChild size="icon" variant="ghost" title={label}><Link href={href}>{children}</Link></Button>; }
Customers.layout = { breadcrumbs: [{ title: 'Sales & Jobs', href: '/sales' }, { title: 'Customers', href: '/sales/customers' }] };
