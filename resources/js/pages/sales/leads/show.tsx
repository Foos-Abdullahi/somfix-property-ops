import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    ArrowRight,
    Building2,
    CalendarDays,
    Edit,
    Target,
    Trash2,
    UserRound,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { ConfirmDeleteDialog } from '@/components/confirm-delete-dialog';
import { Can } from '@/components/can';
import { usePermissions } from '@/hooks/use-permissions';
import { Badge, badgeToneClasses } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
const tone = (status: string) =>
    status === 'converted'
        ? badgeToneClasses.success
        : status === 'closed'
          ? badgeToneClasses.neutral
          : status === 'quoted'
            ? badgeToneClasses.info
            : badgeToneClasses.warning;
export default function LeadShow({ lead }: { lead: any }) {
    const [open, setOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const job = () => router.post(`/sales/leads/${lead.id}/create-job`);
    const remove = () => {
        setDeleting(true);
        router.delete(`/sales/leads/${lead.id}`, {
            onSuccess: () => toast.success('Lead deleted'),
            onFinish: () => setDeleting(false),
        });
    };
    return (
        <>
            <Head title={`${lead.title} — SOMFIX`} />
            <div className="w-full space-y-4 p-4 md:p-6">
                <header className="flex flex-col gap-4 rounded-xs border bg-card p-4 shadow-none sm:p-5 xl:flex-row xl:items-center xl:justify-between">
                    <div className="flex min-w-0 items-center gap-4">
                        <div className="flex size-14 shrink-0 items-center justify-center rounded-xs border border-amber-500/20 bg-amber-500/10 text-amber-600">
                            <Target className="size-6" />
                        </div>
                        <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                                <h1 className="text-xl font-bold break-words">
                                    {lead.title}
                                </h1>
                                <Badge
                                    variant="outline"
                                    className={tone(lead.status)}
                                >
                                    {lead.status.replaceAll('_', ' ')}
                                </Badge>
                            </div>
                            <p className="mt-1 text-sm text-muted-foreground">
                                {lead.customer?.name ?? 'Unassigned customer'} ·{' '}
                                {lead.service_category}
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button asChild variant="outline" size="sm">
                            <Link href="/sales/leads">
                                <ArrowLeft />
                                Back
                            </Link>
                        </Button>
                        <Can permission="sales.manage">
                            <Button asChild variant="outline" size="sm">
                                <Link href={`/sales/leads/${lead.id}/edit`}>
                                    <Edit />
                                    Edit
                                </Link>
                            </Button>
                            {lead.status !== 'converted' && (
                                <Button size="sm" onClick={job}>
                                    <ArrowRight />
                                    Create job
                                </Button>
                            )}
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
                                    Service request
                                </h2>
                            </CardHeader>
                            <CardContent className="px-4 pb-4">
                                <p className="text-sm leading-6 whitespace-pre-wrap">
                                    {lead.description}
                                </p>
                                {lead.notes && (
                                    <div className="mt-5 border-t pt-4">
                                        <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                            Internal notes
                                        </p>
                                        <p className="mt-2 text-sm whitespace-pre-wrap text-muted-foreground">
                                            {lead.notes}
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                    <div className="space-y-4 lg:col-span-4">
                        <Card className="rounded-xs shadow-none">
                            <CardHeader className="px-4 py-4">
                                <h2 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                    Lead details
                                </h2>
                            </CardHeader>
                            <CardContent className="space-y-4 px-4 pb-4">
                                <Detail
                                    icon={<UserRound />}
                                    label="Customer"
                                    value={
                                        lead.customer?.name ?? 'Not assigned'
                                    }
                                />
                                <Detail
                                    icon={<Target />}
                                    label="Source"
                                    value={lead.source.replaceAll('_', ' ')}
                                />
                                <Detail
                                    icon={<CalendarDays />}
                                    label="Preferred visit"
                                    value={
                                        lead.preferred_visit_date ?? 'Not set'
                                    }
                                />
                                <Detail
                                    icon={<Building2 />}
                                    label="Property / unit"
                                    value={`${lead.property?.name ?? 'Not set'}${lead.unit ? ` · ${lead.unit.unit_number}` : ''}`}
                                />
                                <Detail
                                    icon={<Target />}
                                    label="Estimated value"
                                    value={
                                        lead.estimated_value
                                            ? `$${Number(lead.estimated_value).toFixed(2)}`
                                            : 'Not estimated'
                                    }
                                />
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
            <ConfirmDeleteDialog
                open={open}
                onOpenChange={setOpen}
                title="Delete Lead"
                description={
                    <>
                        Delete <strong>{lead.title}</strong>? This cannot be
                        undone.
                    </>
                }
                processing={deleting}
                onConfirm={remove}
            />
        </>
    );
}
function Detail({
    icon,
    label,
    value,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
}) {
    return (
        <div className="flex gap-3">
            <span className="text-muted-foreground [&>svg]:size-4">{icon}</span>
            <div>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-sm font-medium capitalize">{value}</p>
            </div>
        </div>
    );
}
LeadShow.layout = {
    breadcrumbs: [
        { title: 'Sales & Jobs', href: '/sales' },
        { title: 'Leads', href: '/sales/leads' },
        { title: 'Lead' },
    ],
};
