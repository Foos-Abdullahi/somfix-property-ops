import { Head, Link, router } from '@inertiajs/react';
import { ExternalLink, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Can } from '@/components/can';
import { ConfirmDeleteDialog } from '@/components/confirm-delete-dialog';
import { formatDate } from '@/components/finance/format';
import { DefinitionList, PageHeader, Panel, StatusBadge, useMoney } from '@/components/finance/kit';
import { MarkPaidDialog } from '@/components/finance/mark-paid-dialog';
import { RESOURCES, type Ctx } from '@/components/finance/resources';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { BreadcrumbItem } from '@/types';

type Rec = Record<string, unknown> & { id: number; status?: string; created_at?: string };

export default function ResourceShow({ resource, record, detail, options }: { resource: string; record: Rec; detail: Record<string, unknown>; options: Record<string, unknown> }) {
    const cfg = RESOURCES[resource];
    const money = useMoney();
    const ctx: Ctx = { money, options };
    const view = cfg.show(record, ctx, detail);
    const [confirm, setConfirm] = useState(false);
    const [busy, setBusy] = useState(false);
    const methods = (options.methods ?? {}) as Record<string, string>;
    const canPay = (resource === 'commissions' && record.status === 'pending') || (resource === 'payroll' && record.status === 'pending');
    const amountTone = { success: 'text-emerald-600 dark:text-emerald-300', danger: 'text-red-600 dark:text-red-300', warning: 'text-amber-600 dark:text-amber-300', default: '' }[view.amount?.tone ?? 'default'];
    const Icon = cfg.icon;

    return (
        <>
            <Head title={`${view.title} — Finance`} />
            <div className="mx-auto flex w-full max-w-5xl flex-col gap-5 p-4 md:p-6">
                <PageHeader
                    title={view.title}
                    description={
                        <span className="flex flex-wrap items-center gap-2">
                            {view.subtitle}
                            {view.status && <StatusBadge status={view.status} />}
                        </span>
                    }
                    icon={Icon}
                    back={{ href: cfg.base, label: cfg.plural }}
                    actions={
                        <Can permission="finance.manage">
                            {canPay && (
                                <MarkPaidDialog
                                    url={`${cfg.base}/${record.id}/pay`}
                                    title={resource === 'payroll' ? 'Pay salary' : 'Pay commission'}
                                    description={`Confirms ${view.amount?.value ?? ''} was handed over. It will appear in the cash ledger on the date you choose.`}
                                    methods={methods}
                                />
                            )}
                            {(cfg.canEdit?.(record) ?? true) && (
                                <Button asChild variant="outline" size="sm">
                                    <Link href={`${cfg.base}/${record.id}/edit`}>
                                        <Pencil className="size-4" />
                                        Edit
                                    </Link>
                                </Button>
                            )}
                            <Button variant="outline" size="sm" className="text-destructive hover:text-destructive" onClick={() => setConfirm(true)}>
                                <Trash2 className="size-4" />
                                Delete
                            </Button>
                        </Can>
                    }
                />

                {view.alert && <div className="fin-rise rounded-lg border border-amber-300/60 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-200">{view.alert}</div>}

                <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
                    <div className="grid min-w-0 gap-5">
                        {view.amount && (
                            <Panel>
                                <p className="text-xs font-medium tracking-wider text-muted-foreground uppercase">{view.amount.label}</p>
                                <p className={cn('mt-1 text-3xl font-semibold tracking-tight tabular-nums', amountTone)}>{view.amount.value}</p>
                            </Panel>
                        )}
                        <div className="grid gap-5 md:grid-cols-2">
                            {view.sections
                                .filter((s) => s.items.length)
                                .map((s) => (
                                    <Panel key={s.title} title={s.title}>
                                        <DefinitionList items={s.items} />
                                    </Panel>
                                ))}
                        </div>
                        {view.notes && (
                            <Panel title="Notes">
                                <p className="text-sm whitespace-pre-wrap">{view.notes}</p>
                            </Panel>
                        )}
                    </div>
                    <div className="grid h-fit gap-5">
                        <Panel title="Connected records" description="Every money movement is tied to what it was for.">
                            {view.related.length ? (
                                <ul className="grid gap-2">
                                    {view.related.map((r) => (
                                        <li key={r.href}>
                                            <Link href={r.href} className="group flex items-start justify-between gap-2 rounded-lg border p-3 transition-colors hover:border-primary/40 hover:bg-primary/5">
                                                <span className="min-w-0">
                                                    <span className="block text-[11px] tracking-wider text-muted-foreground uppercase">{r.label}</span>
                                                    <span className="block truncate text-sm font-medium">{r.text}</span>
                                                </span>
                                                <ExternalLink className="mt-1 size-3.5 shrink-0 text-muted-foreground group-hover:text-primary" />
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-muted-foreground">Not linked to a job, property or invoice.</p>
                            )}
                        </Panel>
                        <Panel>
                            <p className="text-xs text-muted-foreground">Recorded {formatDate(record.created_at)}</p>
                        </Panel>
                    </div>
                </div>
            </div>
            <ConfirmDeleteDialog
                open={confirm}
                onOpenChange={setConfirm}
                title={`Delete ${cfg.singular.toLowerCase()}`}
                description={`Delete ${cfg.titleOf(record)}? Related balances are recalculated. This cannot be undone.`}
                processing={busy}
                onConfirm={() => router.delete(`${cfg.base}/${record.id}`, { onStart: () => setBusy(true), onFinish: () => setBusy(false) })}
            />
        </>
    );
}

ResourceShow.layout = (): { breadcrumbs: BreadcrumbItem[] } => ({ breadcrumbs: [{ title: 'Finance', href: '/finance-report' }] });
