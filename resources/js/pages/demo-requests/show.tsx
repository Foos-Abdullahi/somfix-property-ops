import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { stages, type Inquiry } from './index';
type Tenant = {
    id: number;
    first_name: string;
    last_name: string;
    email: string | null;
};
const localDate = (value: string | null) => {
    if (!value) return '';
    const date = new Date(value);
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
};
export default function RequestShow({
    inquiry,
    tenants,
}: {
    inquiry: Inquiry;
    tenants: Tenant[];
}) {
    const { auth } = usePage<{ auth: { permissions: string[] } }>().props;
    const canManage = auth.permissions.includes('demo-requests.manage');
    const canManageTenants = auth.permissions.includes('tenants.manage');
    const form = useForm({
        status: inquiry.status,
        follow_up_at: localDate(inquiry.follow_up_at),
        walkthrough_at: localDate(inquiry.walkthrough_at),
        notes: inquiry.notes ?? '',
        tenant_id: inquiry.tenant_id?.toString() ?? '',
    });
    return (
        <div className="mx-auto w-full max-w-4xl space-y-6 p-6">
            <Head title={`Request from ${inquiry.name}`} />
            <Link className="underline" href="/demo-requests">
                Back to Demo Requests
            </Link>
            <header>
                <h1 className="text-2xl font-bold">{inquiry.name}</h1>
                <p className="text-muted-foreground">
                    {inquiry.company} · {inquiry.team_size} team members
                </p>
            </header>
            <section className="space-y-3 rounded border bg-card p-5">
                <h2 className="font-semibold">Inquiry and contact</h2>
                <a
                    className="inline-block underline"
                    href={`mailto:${inquiry.email}?subject=${encodeURIComponent('Your SOMFIX walkthrough request')}`}
                >
                    Email {inquiry.email}
                </a>
                <p className="whitespace-pre-wrap">
                    {inquiry.message || 'No message provided.'}
                </p>
                <p className="text-sm text-muted-foreground">
                    Received {new Date(inquiry.created_at).toLocaleString()}.
                    Email opens your mail application; it does not send
                    automatically.
                </p>
            </section>
            <section className="rounded border bg-card p-5">
                <h2 className="font-semibold">Follow-up process</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                    Review the inquiry → contact the person → agree a
                    walkthrough time → complete the walkthrough → record the
                    outcome. Create the Tenant record in Tenants and link it
                    here, assign the property and unit, then create the lease.
                    Close requests that do not proceed.
                </p>
            </section>
            <form
                className="space-y-4 rounded border bg-card p-5"
                onSubmit={(e) => {
                    e.preventDefault();
                    form.transform((data) => ({
                        ...data,
                        follow_up_at: data.follow_up_at
                            ? new Date(data.follow_up_at).toISOString()
                            : null,
                        walkthrough_at: data.walkthrough_at
                            ? new Date(data.walkthrough_at).toISOString()
                            : null,
                        tenant_id: data.tenant_id || null,
                    }));
                    form.put(`/demo-requests/${inquiry.id}`);
                }}
            >
                <fieldset
                    disabled={!canManage || form.processing}
                    className="space-y-4"
                >
                    <div>
                        <Label htmlFor="stage">Stage</Label>
                        <select
                            id="stage"
                            className="mt-2 block w-full rounded border bg-background p-2"
                            value={form.data.status}
                            onChange={(e) =>
                                form.setData(
                                    'status',
                                    e.target.value as Inquiry['status'],
                                )
                            }
                        >
                            {Object.entries(stages).map(([value, label]) => (
                                <option
                                    key={value}
                                    value={value}
                                    disabled={
                                        value === 'converted' &&
                                        !canManageTenants &&
                                        !inquiry.tenant_id
                                    }
                                >
                                    {label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <Label htmlFor="follow-up">
                                Next follow-up (your local time)
                            </Label>
                            <Input
                                id="follow-up"
                                type="datetime-local"
                                value={form.data.follow_up_at}
                                onChange={(e) =>
                                    form.setData('follow_up_at', e.target.value)
                                }
                            />
                        </div>
                        <div>
                            <Label htmlFor="walkthrough">
                                Walkthrough time (your local time)
                            </Label>
                            <Input
                                id="walkthrough"
                                type="datetime-local"
                                value={form.data.walkthrough_at}
                                onChange={(e) =>
                                    form.setData(
                                        'walkthrough_at',
                                        e.target.value,
                                    )
                                }
                            />
                        </div>
                    </div>
                    {canManageTenants && (
                        <div>
                            <Label htmlFor="tenant">
                                Link an existing tenant, if applicable
                            </Label>
                            <select
                                id="tenant"
                                className="mt-2 block w-full rounded border bg-background p-2"
                                value={form.data.tenant_id}
                                onChange={(e) =>
                                    form.setData('tenant_id', e.target.value)
                                }
                            >
                                <option value="">No tenant linked</option>
                                {tenants.map((tenant) => (
                                    <option key={tenant.id} value={tenant.id}>
                                        {tenant.first_name} {tenant.last_name} —{' '}
                                        {tenant.email || 'No email'}
                                    </option>
                                ))}
                            </select>
                            <Link
                                className="mt-2 inline-block text-sm underline"
                                href="/tenants/create"
                            >
                                Create a tenant first
                            </Link>
                        </div>
                    )}
                    {inquiry.tenant_id && (
                        <Link
                            className="block underline"
                            href={`/tenants/${inquiry.tenant_id}`}
                        >
                            Open linked tenant
                        </Link>
                    )}
                    <div>
                        <Label htmlFor="notes">Contact notes and outcome</Label>
                        <Textarea
                            id="notes"
                            rows={5}
                            maxLength={10000}
                            value={form.data.notes}
                            onChange={(e) =>
                                form.setData('notes', e.target.value)
                            }
                        />
                    </div>
                    {Object.entries(form.errors).map(([field, error]) => (
                        <p
                            key={field}
                            role="alert"
                            className="text-sm text-destructive"
                        >
                            {error}
                        </p>
                    ))}
                    {canManage && <Button type="submit">Save follow-up</Button>}
                </fieldset>
            </form>
        </div>
    );
}
