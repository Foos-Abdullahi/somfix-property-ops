import { Head, Link, router, useForm } from '@inertiajs/react';
import { CalendarPlus, Plus, Wallet } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Can } from '@/components/can';
import { ConfirmDeleteDialog } from '@/components/confirm-delete-dialog';
import { FilterSelect, KpiGrid, PageHeader, Panel, SubmitButton, useMoney, Field } from '@/components/finance/kit';
import { RowActions } from '@/components/finance/row-actions';
import { RESOURCES, type Ctx } from '@/components/finance/resources';
import { DataTable } from '@/components/tools/table/main-table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import type { BreadcrumbItem } from '@/types';

type Row = Record<string, unknown> & { id: number };

function GeneratePayroll() {
    const [open, setOpen] = useState(false);
    const form = useForm({ pay_month: new Date().toISOString().slice(0, 7) + '-01' });
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    <CalendarPlus className="size-4" />
                    Generate month
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        form.post('/finance/payroll/generate', { preserveScroll: true, onSuccess: () => setOpen(false) });
                    }}
                    className="grid gap-4"
                >
                    <DialogHeader>
                        <DialogTitle>Generate monthly payroll</DialogTitle>
                        <DialogDescription>Creates a pending salary line for every active in-house employee that does not have one for the month yet, using their salary from Technician Pay.</DialogDescription>
                    </DialogHeader>
                    <Field label="Pay month" error={form.errors.pay_month}>
                        <Input type="month" value={form.data.pay_month.slice(0, 7)} onChange={(e) => form.setData('pay_month', e.target.value + '-01')} />
                    </Field>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <SubmitButton processing={form.processing}>Generate</SubmitButton>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export default function ResourceIndex({ resource, records, stats, options }: { resource: string; records: Row[]; stats: Record<string, unknown>; options: Record<string, unknown> }) {
    const cfg = RESOURCES[resource];
    const money = useMoney();
    const ctx: Ctx = { money, options };
    const [filters, setFilters] = useState<Record<string, string>>({});
    const [toDelete, setToDelete] = useState<Row | null>(null);
    const [deleting, setDeleting] = useState(false);

    const data = useMemo(() => records.filter((r) => (cfg.filters ?? []).every((f) => !filters[f.key] || filters[f.key] === 'all' || f.value(r) === filters[f.key])), [records, filters, cfg]);

    const columns = useMemo(
        () => [
            ...cfg.columns(ctx),
            {
                id: 'actions',
                header: '',
                enableSorting: false,
                cell: ({ row }: { row: { original: Row } }) => <RowActions base={cfg.base} id={row.original.id} canEdit={cfg.canEdit?.(row.original) ?? true} onDelete={() => setToDelete(row.original)} />,
            },
        ],
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [cfg, money, options],
    );

    const insight = cfg.insight?.(stats);
    const Icon = cfg.icon;

    return (
        <>
            <Head title={`${cfg.plural} — Finance`} />
            <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-5 p-4 md:p-6">
                <PageHeader
                    title={cfg.plural}
                    description={cfg.description}
                    icon={Icon}
                    actions={
                        <Can permission="finance.manage">
                            {resource === 'payroll' && <GeneratePayroll />}
                            <Button asChild size="sm">
                                <Link href={`${cfg.base}/create`}>
                                    <Plus className="size-4" />
                                    New {cfg.singular.toLowerCase()}
                                </Link>
                            </Button>
                        </Can>
                    }
                />
                <KpiGrid items={cfg.kpis(stats, ctx)} />
                <div className={insight ? 'grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]' : ''}>
                    <div className="min-w-0">
                        <DataTable
                            columns={columns as never}
                            data={data}
                            title={cfg.plural}
                            searchTitle={cfg.searchHint}
                            rowHref={(row) => `${cfg.base}/${(row.original as Row).id}`}
                            filterControls={
                                cfg.filters?.length ? (
                                    <div className="flex flex-wrap items-center gap-2">
                                        {cfg.filters.map((f) => (
                                            <FilterSelect key={f.key} label={f.label} value={filters[f.key] ?? 'all'} onChange={(v) => setFilters((s) => ({ ...s, [f.key]: v }))} options={f.options(ctx, records)} />
                                        ))}
                                    </div>
                                ) : undefined
                            }
                        />
                        {records.length === 0 && (
                            <p className="mt-3 text-center text-sm text-muted-foreground">
                                Nothing recorded yet. <Link className="text-primary hover:underline" href={`${cfg.base}/create`}>Add the first {cfg.singular.toLowerCase()}</Link>.
                            </p>
                        )}
                    </div>
                    {insight && (
                        <Panel title={insight.title} className="h-fit">
                            {insight.node}
                        </Panel>
                    )}
                </div>
            </div>
            <ConfirmDeleteDialog
                open={!!toDelete}
                onOpenChange={(o) => !o && setToDelete(null)}
                title={`Delete ${cfg.singular.toLowerCase()}`}
                description={`Delete ${toDelete ? cfg.titleOf(toDelete) : ''}? Related balances are recalculated. This cannot be undone.`}
                processing={deleting}
                onConfirm={() => toDelete && router.delete(`${cfg.base}/${toDelete.id}`, { onStart: () => setDeleting(true), onFinish: () => { setDeleting(false); setToDelete(null); } })}
            />
        </>
    );
}

ResourceIndex.layout = (): { breadcrumbs: BreadcrumbItem[] } => ({ breadcrumbs: [{ title: 'Finance', href: '/finance' }] });
export { Wallet };
