import { Link, useForm } from '@inertiajs/react';
import { useId, type FormEvent } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { index, store, update } from '@/routes/work-orders';

export type WorkOrderFormValues = {
    maintenance_id: string;
    service_team_id: string;
    title: string;
    description: string;
    status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
    assigned_date: string;
    started_date: string;
    completed_date: string;
    estimated_hours: string;
    actual_hours: string;
    notes: string;
};
type MaintenanceOption = {
    id: number;
    title: string;
    category: string;
    priority: string;
    status: string;
};
type ServiceTeamOption = {
    id: number;
    name: string;
    specialization: string;
    status: string;
};
const inputClass =
    'h-10 rounded-xl border-border/70 bg-background shadow-none focus-visible:ring-primary/20';

export function WorkOrderForm({
    mode,
    workOrder,
    maintenances,
    serviceTeams,
}: {
    mode: 'create' | 'edit';
    workOrder?: WorkOrderFormValues & { id: number };
    maintenances: MaintenanceOption[];
    serviceTeams: ServiceTeamOption[];
}) {
    const form = useForm<WorkOrderFormValues>({
        maintenance_id: String(workOrder?.maintenance_id ?? ''),
        service_team_id: String(workOrder?.service_team_id ?? ''),
        title: workOrder?.title ?? '',
        description: workOrder?.description ?? '',
        status: workOrder?.status ?? 'pending',
        assigned_date: workOrder?.assigned_date ?? '',
        started_date: workOrder?.started_date ?? '',
        completed_date: workOrder?.completed_date ?? '',
        estimated_hours: workOrder?.estimated_hours ?? '',
        actual_hours: workOrder?.actual_hours ?? '',
        notes: workOrder?.notes ?? '',
    });
    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (mode === 'create') {
            form.post(store.url());
        } else {
            form.put(update.url(workOrder!.id));
        }
    };
    return (
        <form onSubmit={submit} className="space-y-6">
            <section className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm">
                <div className="border-b border-border/70 bg-secondary/35 px-5 py-4">
                    <h2 className="font-semibold">Work order details</h2>
                    <p className="mt-1 text-xs text-muted-foreground">
                        Assignment, schedule and scope information.
                    </p>
                </div>
                <div className="grid gap-5 p-5 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="maintenance_id">
                            Maintenance request
                        </Label>
                        <Select
                            value={form.data.maintenance_id}
                            onValueChange={(value) =>
                                form.setData('maintenance_id', value)
                            }
                        >
                            <SelectTrigger
                                id="maintenance_id"
                                className={`w-full ${inputClass}`}
                            >
                                <SelectValue placeholder="Select maintenance request" />
                            </SelectTrigger>
                            <SelectContent>
                                {maintenances.map((maintenance) => (
                                    <SelectItem
                                        key={maintenance.id}
                                        value={String(maintenance.id)}
                                    >
                                        {maintenance.title} (
                                        {maintenance.category}) —{' '}
                                        {maintenance.status.replaceAll(
                                            '_',
                                            ' ',
                                        )}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <InputError message={form.errors.maintenance_id} />
                        {maintenances.length === 0 && (
                            <p className="text-sm text-muted-foreground">
                                No maintenance requests yet.{' '}
                                <Link
                                    className="underline"
                                    href="/maintenance/create"
                                >
                                    Create a maintenance request
                                </Link>{' '}
                                first.
                            </p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="service_team_id">
                            Service team (optional)
                        </Label>
                        <Select
                            value={form.data.service_team_id || 'unassigned'}
                            onValueChange={(value) =>
                                form.setData(
                                    'service_team_id',
                                    value === 'unassigned' ? '' : value,
                                )
                            }
                        >
                            <SelectTrigger
                                id="service_team_id"
                                className={`w-full ${inputClass}`}
                            >
                                <SelectValue placeholder="Select service team" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="unassigned">
                                    Unassigned
                                </SelectItem>
                                {serviceTeams.map((team) => (
                                    <SelectItem
                                        key={team.id}
                                        value={String(team.id)}
                                    >
                                        {team.name} ({team.specialization}) —{' '}
                                        {team.status.replaceAll('_', ' ')}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <InputError message={form.errors.service_team_id} />
                        {serviceTeams.length === 0 && (
                            <p className="text-sm text-muted-foreground">
                                No service-team members yet. Leave unassigned or{' '}
                                <Link
                                    className="underline"
                                    href="/service-team/create"
                                >
                                    add a member
                                </Link>
                                .
                            </p>
                        )}
                    </div>
                    <Field
                        label="Title"
                        value={form.data.title}
                        onChange={(value) => form.setData('title', value)}
                        error={form.errors.title}
                    />
                    <div className="space-y-2">
                        <Label>Status</Label>
                        <Select
                            value={form.data.status}
                            onValueChange={(value) =>
                                form.setData(
                                    'status',
                                    value as WorkOrderFormValues['status'],
                                )
                            }
                        >
                            <SelectTrigger className={`w-full ${inputClass}`}>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {[
                                    'pending',
                                    'assigned',
                                    'in_progress',
                                    'completed',
                                    'cancelled',
                                ].map((status) => (
                                    <SelectItem key={status} value={status}>
                                        {status.replace('_', ' ').toUpperCase()}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <InputError message={form.errors.status} />
                    </div>
                    <Field
                        label="Assigned date"
                        type="date"
                        value={form.data.assigned_date}
                        onChange={(value) =>
                            form.setData('assigned_date', value)
                        }
                        error={form.errors.assigned_date}
                    />
                    <Field
                        label="Started date"
                        type="date"
                        value={form.data.started_date}
                        onChange={(value) =>
                            form.setData('started_date', value)
                        }
                        error={form.errors.started_date}
                    />
                    <Field
                        label="Completed date"
                        type="date"
                        value={form.data.completed_date}
                        onChange={(value) =>
                            form.setData('completed_date', value)
                        }
                        error={form.errors.completed_date}
                    />
                    <Field
                        label="Estimated hours"
                        type="number"
                        step="0.1"
                        value={form.data.estimated_hours}
                        onChange={(value) =>
                            form.setData('estimated_hours', value)
                        }
                        error={form.errors.estimated_hours}
                    />
                    <Field
                        label="Actual hours"
                        type="number"
                        step="0.1"
                        value={form.data.actual_hours}
                        onChange={(value) =>
                            form.setData('actual_hours', value)
                        }
                        error={form.errors.actual_hours}
                    />
                    <div className="space-y-2 md:col-span-2">
                        <Label>Description</Label>
                        <Textarea
                            value={form.data.description}
                            onChange={(event) =>
                                form.setData('description', event.target.value)
                            }
                            className="min-h-[120px] rounded-xl border-border/70 bg-background shadow-none focus-visible:ring-primary/20"
                        />
                        <InputError message={form.errors.description} />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                        <Label>Notes</Label>
                        <Textarea
                            value={form.data.notes}
                            onChange={(event) =>
                                form.setData('notes', event.target.value)
                            }
                            className="min-h-[80px] rounded-xl border-border/70 bg-background shadow-none focus-visible:ring-primary/20"
                        />
                        <InputError message={form.errors.notes} />
                    </div>
                </div>
            </section>
            <div className="flex items-center justify-end gap-2">
                <Button asChild variant="outline" type="button">
                    <Link href={index()}>
                        <ArrowLeft />
                        Back
                    </Link>
                </Button>
                <Button
                    type="submit"
                    disabled={form.processing || !form.data.maintenance_id}
                >
                    <Save />
                    {form.processing
                        ? 'Saving…'
                        : mode === 'create'
                          ? 'Create work order'
                          : 'Save changes'}
                </Button>
            </div>
        </form>
    );
}

function Field({
    label,
    value,
    onChange,
    error,
    type = 'text',
    step,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    error?: string;
    type?: string;
    step?: string;
}) {
    const id = useId();
    return (
        <div className="space-y-2">
            <Label htmlFor={id}>{label}</Label>
            <Input
                id={id}
                type={type}
                step={step}
                value={value}
                onChange={(event) => onChange(event.target.value)}
                className={inputClass}
            />
            <InputError message={error} />
        </div>
    );
}
