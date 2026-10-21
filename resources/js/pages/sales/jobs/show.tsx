import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    BriefcaseBusiness,
    Edit,
    FileText,
    Plus,
    Trash2,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { ConfirmDeleteDialog } from '@/components/confirm-delete-dialog';
import { Can } from '@/components/can';
import { Badge, badgeToneClasses } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

const tone = (status: string) =>
    status === 'closed' || status === 'completed'
        ? badgeToneClasses.success
        : status === 'cancelled'
          ? badgeToneClasses.danger
          : status === 'in_progress'
            ? badgeToneClasses.info
            : badgeToneClasses.warning;

export default function JobShow({
    job,
    catalog,
    profit,
}: {
    job: any;
    catalog: any;
    profit: any;
}) {
    const material = useForm({
        inventory_id: '',
        quantity: '1',
        selling_price: '',
        notes: '',
    });
    const labor = useForm({
        service_team_id: '',
        hours: '1',
        cost_rate: '0',
        selling_rate: '0',
        work_date: '',
        notes: '',
    });
    const [open, setOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const invoices = job.finances.filter(
        (finance: any) => finance.type === 'invoice',
    );
    const remove = () => {
        setDeleting(true);
        router.delete(`/sales/jobs/${job.id}`, {
            onSuccess: () => toast.success('Job deleted'),
            onFinish: () => setDeleting(false),
        });
    };

    return (
        <>
            <Head title={`${job.job_number} — SOMFIX`} />
            <div className="w-full space-y-4 p-4 md:p-6">
                <header className="flex flex-col gap-4 rounded-xs border bg-card p-4 shadow-none sm:p-5 xl:flex-row xl:items-center xl:justify-between">
                    <div className="flex min-w-0 items-center gap-4">
                        <div className="flex size-14 shrink-0 items-center justify-center rounded-xs border border-primary/20 bg-primary/10 text-primary">
                            <BriefcaseBusiness className="size-6" />
                        </div>
                        <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                                <h1 className="text-xl font-bold">
                                    {job.job_number}
                                </h1>
                                <Badge
                                    variant="outline"
                                    className={tone(job.status)}
                                >
                                    {job.status.replaceAll('_', ' ')}
                                </Badge>
                            </div>
                            <p className="mt-1 text-sm text-muted-foreground">
                                {job.title} ·{' '}
                                {job.customer?.name ?? 'Unassigned customer'}
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button asChild variant="outline" size="sm">
                            <Link href="/sales/jobs">
                                <ArrowLeft />
                                Back
                            </Link>
                        </Button>
                        <Can permission="sales.manage">
                            <Button asChild variant="outline" size="sm">
                                <Link
                                    href={`/finance/quotations/create?job_id=${job.id}`}
                                >
                                    <FileText />
                                    Quotation
                                </Link>
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                    router.post(
                                        `/sales/jobs/${job.id}/work-orders`,
                                    )
                                }
                            >
                                <Plus />
                                Work order
                            </Button>
                            <Button asChild size="sm">
                                <Link href={`/sales/jobs/${job.id}/edit`}>
                                    <Edit />
                                    Edit
                                </Link>
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                className="text-destructive"
                                onClick={() => setOpen(true)}
                            >
                                <Trash2 />
                            </Button>
                        </Can>
                    </div>
                </header>
                <div className="grid gap-4 lg:grid-cols-12">
                    <div className="space-y-4 lg:col-span-8">
                        <Card className="rounded-xs shadow-none">
                            <CardHeader className="px-4 py-4">
                                <h2 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                    Scope of work
                                </h2>
                            </CardHeader>
                            <CardContent className="px-4 pb-4">
                                <p className="text-sm leading-6 whitespace-pre-wrap">
                                    {job.scope || 'No scope recorded.'}
                                </p>
                                <div className="mt-4 grid gap-3 border-t pt-4 text-sm sm:grid-cols-3">
                                    <Metric
                                        label="Approved value"
                                        value={`$${Number(job.approved_value).toFixed(2)}`}
                                    />
                                    <Metric
                                        label="Scheduled"
                                        value={
                                            job.scheduled_date ??
                                            'Not scheduled'
                                        }
                                    />
                                    <Metric
                                        label="Completed"
                                        value={
                                            job.completed_date ??
                                            'Not completed'
                                        }
                                    />
                                </div>
                            </CardContent>
                        </Card>
                        <div className="grid gap-4 lg:grid-cols-2">
                            <Materials
                                job={job}
                                catalog={catalog}
                                form={material}
                            />
                            <Labor job={job} catalog={catalog} form={labor} />
                        </div>
                    </div>
                    <div className="space-y-4 lg:col-span-4">
                        <Card className="rounded-xs shadow-none">
                            <CardHeader className="px-4 py-4">
                                <h2 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                    Job profit
                                </h2>
                            </CardHeader>
                            <CardContent className="space-y-3 px-4 pb-4">
                                <Metric
                                    label="Invoiced revenue"
                                    value={`$${Number(profit.revenue).toFixed(2)}`}
                                />
                                <Metric
                                    label="Material cost"
                                    value={`$${Number(profit.materialCost).toFixed(2)}`}
                                />
                                <Metric
                                    label="Labor cost"
                                    value={`$${Number(profit.laborCost).toFixed(2)}`}
                                />
                                <div className="border-t pt-3">
                                    <Metric
                                        label="Gross profit"
                                        value={`$${Number(profit.grossProfit).toFixed(2)}`}
                                        strong
                                    />
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="rounded-xs shadow-none">
                            <CardHeader className="px-4 py-4">
                                <h2 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                    Invoices & payments
                                </h2>
                            </CardHeader>
                            <CardContent className="space-y-3 px-4 pb-4">
                                {invoices.length ? (
                                    invoices.map((invoice: any) => (
                                        <div
                                            className="rounded-xs border p-3"
                                            key={invoice.id}
                                        >
                                            <Link
                                                className="font-semibold text-primary hover:underline"
                                                href={`/finance/invoices/${invoice.id}`}
                                            >
                                                {invoice.invoice_number}
                                            </Link>
                                            <p className="mt-1 text-sm">
                                                $
                                                {Number(invoice.amount).toFixed(
                                                    2,
                                                )}{' '}
                                                · Balance $
                                                {Number(
                                                    invoice.balance,
                                                ).toFixed(2)}
                                            </p>
                                            {invoice.payments.map(
                                                (payment: any) => (
                                                    <Link
                                                        className="mt-1 block text-xs text-primary"
                                                        href={`/sales/payments/${payment.id}/receipt`}
                                                        key={payment.id}
                                                    >
                                                        Receipt{' '}
                                                        {payment.payment_number}{' '}
                                                        · $
                                                        {Number(
                                                            payment.amount,
                                                        ).toFixed(2)}
                                                    </Link>
                                                ),
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-muted-foreground">
                                        Create a quotation and convert it to an
                                        invoice to bill this job.
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
            <ConfirmDeleteDialog
                open={open}
                onOpenChange={setOpen}
                title="Delete Job"
                description={
                    <>
                        Delete <strong>{job.job_number}</strong>? All recorded
                        materials and labor entries will be removed.
                    </>
                }
                processing={deleting}
                onConfirm={remove}
            />
        </>
    );
}

function Materials({ job, catalog, form }: any) {
    return (
        <Card className="rounded-xs shadow-none">
            <CardHeader className="px-4 py-4">
                <h2 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                    Materials used
                </h2>
            </CardHeader>
            <CardContent className="px-4 pb-4">
                <Lines
                    lines={job.materials}
                    label={(item: any) => item.inventory.name}
                    value={(item: any) =>
                        `$${(Number(item.quantity) * Number(item.unit_cost)).toFixed(2)}`
                    }
                />
                <Can permission="sales.manage">
                    <form
                        onSubmit={(event) => {
                            event.preventDefault();
                            form.post(`/sales/jobs/${job.id}/materials`, {
                                onSuccess: () => form.reset(),
                            });
                        }}
                        className="mt-4 grid gap-2 border-t pt-4"
                    >
                        <Select
                            value={form.data.inventory_id}
                            onValueChange={(value) =>
                                form.setData('inventory_id', value)
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select inventory item" />
                            </SelectTrigger>
                            <SelectContent>
                                {catalog.inventories.map((item: any) => (
                                    <SelectItem
                                        key={item.id}
                                        value={String(item.id)}
                                    >
                                        {item.name} ({item.current_stock}{' '}
                                        available)
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Input
                            required
                            type="number"
                            min="0.01"
                            step="0.01"
                            placeholder="Quantity"
                            value={form.data.quantity}
                            onChange={(event) =>
                                form.setData('quantity', event.target.value)
                            }
                        />
                        <Button size="sm" disabled={form.processing}>
                            Record material
                        </Button>
                    </form>
                </Can>
            </CardContent>
        </Card>
    );
}
function Labor({ job, catalog, form }: any) {
    return (
        <Card className="rounded-xs shadow-none">
            <CardHeader className="px-4 py-4">
                <h2 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                    Labor recorded
                </h2>
            </CardHeader>
            <CardContent className="px-4 pb-4">
                <Lines
                    lines={job.labors}
                    label={(item: any) =>
                        item.service_team?.name ?? 'Unassigned technician'
                    }
                    value={(item: any) =>
                        `${item.hours} hr · $${(Number(item.hours) * Number(item.cost_rate)).toFixed(2)}`
                    }
                />
                <Can permission="sales.manage">
                    <form
                        onSubmit={(event) => {
                            event.preventDefault();
                            form.post(`/sales/jobs/${job.id}/labor`, {
                                onSuccess: () => form.reset(),
                            });
                        }}
                        className="mt-4 grid gap-2 border-t pt-4"
                    >
                        <Select
                            value={form.data.service_team_id || '__none__'}
                            onValueChange={(value) =>
                                form.setData(
                                    'service_team_id',
                                    value === '__none__' ? '' : value,
                                )
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Technician (optional)" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="__none__">
                                    Technician (optional)
                                </SelectItem>
                                {catalog.serviceTeams.map((team: any) => (
                                    <SelectItem
                                        key={team.id}
                                        value={String(team.id)}
                                    >
                                        {team.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <div className="grid grid-cols-3 gap-2">
                            <Input
                                required
                                type="number"
                                min="0.01"
                                step="0.01"
                                placeholder="Hours"
                                value={form.data.hours}
                                onChange={(event) =>
                                    form.setData('hours', event.target.value)
                                }
                            />
                            <Input
                                required
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder="Cost/hr"
                                value={form.data.cost_rate}
                                onChange={(event) =>
                                    form.setData(
                                        'cost_rate',
                                        event.target.value,
                                    )
                                }
                            />
                            <Input
                                required
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder="Sell/hr"
                                value={form.data.selling_rate}
                                onChange={(event) =>
                                    form.setData(
                                        'selling_rate',
                                        event.target.value,
                                    )
                                }
                            />
                        </div>
                        <Button size="sm" disabled={form.processing}>
                            Record labor
                        </Button>
                    </form>
                </Can>
            </CardContent>
        </Card>
    );
}
function Lines({ lines, label, value }: any) {
    return lines.length ? (
        <div className="divide-y">
            {lines.map((line: any) => (
                <div
                    className="flex justify-between gap-3 py-2 text-sm"
                    key={line.id}
                >
                    <span>{label(line)}</span>
                    <span className="font-medium whitespace-nowrap">
                        {value(line)}
                    </span>
                </div>
            ))}
        </div>
    ) : (
        <p className="text-sm text-muted-foreground">Nothing recorded yet.</p>
    );
}
function Metric({
    label,
    value,
    strong,
}: {
    label: string;
    value: string;
    strong?: boolean;
}) {
    return (
        <div
            className={`flex justify-between gap-3 text-sm ${strong ? 'font-semibold' : ''}`}
        >
            <span className="text-muted-foreground">{label}</span>
            <span className="text-right">{value}</span>
        </div>
    );
}

JobShow.layout = {
    breadcrumbs: [
        { title: 'Sales & Jobs', href: '/sales' },
        { title: 'Jobs', href: '/sales/jobs' },
        { title: 'Job' },
    ],
};
