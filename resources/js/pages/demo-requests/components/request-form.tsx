import { Link, useForm, usePage } from '@inertiajs/react';
import { Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { stages, type Inquiry, type TenantOption } from '../types';
const localDate = (value?: string | null) => {
    if (!value) return '';
    const date = new Date(value);
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
};
export default function RequestForm({
    inquiry,
    tenants,
}: {
    inquiry?: Inquiry;
    tenants: TenantOption[];
}) {
    const { auth } = usePage<{ auth: { permissions: string[] } }>().props;
    const canManageTenants = auth.permissions.includes('tenants.manage');
    const form = useForm({
        name: inquiry?.name ?? '',
        email: inquiry?.email ?? '',
        company: inquiry?.company ?? '',
        team_size: inquiry?.team_size ?? '1-5',
        message: inquiry?.message ?? '',
        status: inquiry?.status ?? 'new',
        follow_up_at: localDate(inquiry?.follow_up_at),
        walkthrough_at: localDate(inquiry?.walkthrough_at),
        notes: inquiry?.notes ?? '',
        tenant_id: inquiry?.tenant_id?.toString() ?? '',
    });
    const error = (field: keyof typeof form.data) =>
        form.errors[field] && (
            <p role="alert" className="text-xs text-destructive">
                {form.errors[field]}
            </p>
        );
    return (
        <form
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
                if (inquiry) form.put(`/demo-requests/${inquiry.id}`);
                else form.post('/demo-requests/admin');
            }}
            className="animate-in space-y-4 duration-700 fade-in slide-in-from-bottom-6"
        >
            <fieldset
                disabled={form.processing}
                className="grid gap-4 xl:grid-cols-2"
            >
                <Card className="rounded-xs shadow-none">
                    <CardHeader>
                        <h2 className="text-sm font-semibold">
                            Person and inquiry
                        </h2>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {(['name', 'email', 'company'] as const).map(
                            (field) => (
                                <div key={field} className="space-y-2">
                                    <Label htmlFor={field}>
                                        {field === 'name'
                                            ? 'Full name'
                                            : field === 'email'
                                              ? 'Work email'
                                              : 'Company name'}
                                    </Label>
                                    <Input
                                        id={field}
                                        required
                                        type={
                                            field === 'email' ? 'email' : 'text'
                                        }
                                        maxLength={
                                            field === 'name'
                                                ? 120
                                                : field === 'company'
                                                  ? 160
                                                  : 255
                                        }
                                        value={form.data[field]}
                                        onChange={(e) =>
                                            form.setData(field, e.target.value)
                                        }
                                    />
                                    {error(field)}
                                </div>
                            ),
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="team-size">Team size</Label>
                            <select
                                id="team-size"
                                className="w-full rounded-xs border bg-background p-2 text-sm"
                                value={form.data.team_size}
                                onChange={(e) =>
                                    form.setData('team_size', e.target.value)
                                }
                            >
                                {['1-5', '6-20', '21-50', '51+'].map(
                                    (value) => (
                                        <option key={value} value={value}>
                                            {value} people
                                        </option>
                                    ),
                                )}
                            </select>
                            {error('team_size')}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="message">Inquiry message</Label>
                            <Textarea
                                id="message"
                                maxLength={2000}
                                rows={5}
                                value={form.data.message}
                                onChange={(e) =>
                                    form.setData('message', e.target.value)
                                }
                            />
                            {error('message')}
                        </div>
                    </CardContent>
                </Card>
                <Card className="rounded-xs shadow-none">
                    <CardHeader>
                        <h2 className="text-sm font-semibold">
                            Walkthrough and outcome
                        </h2>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="stage">Stage</Label>
                            <select
                                id="stage"
                                className="w-full rounded-xs border bg-background p-2 text-sm"
                                value={form.data.status}
                                onChange={(e) =>
                                    form.setData(
                                        'status',
                                        e.target.value as Inquiry['status'],
                                    )
                                }
                            >
                                {Object.entries(stages).map(
                                    ([value, label]) => (
                                        <option
                                            key={value}
                                            value={value}
                                            disabled={
                                                value === 'converted' &&
                                                !canManageTenants &&
                                                !inquiry?.tenant_id
                                            }
                                        >
                                            {label}
                                        </option>
                                    ),
                                )}
                            </select>
                            {error('status')}
                        </div>
                        {(['follow_up_at', 'walkthrough_at'] as const).map(
                            (field) => (
                                <div key={field} className="space-y-2">
                                    <Label htmlFor={field}>
                                        {field === 'follow_up_at'
                                            ? 'Next follow-up'
                                            : 'Walkthrough time'}{' '}
                                        (your local time)
                                    </Label>
                                    <Input
                                        id={field}
                                        type="datetime-local"
                                        value={form.data[field]}
                                        onChange={(e) =>
                                            form.setData(field, e.target.value)
                                        }
                                    />
                                    {error(field)}
                                </div>
                            ),
                        )}
                        {canManageTenants && (
                            <div className="space-y-2">
                                <Label htmlFor="tenant">
                                    Link an existing tenant, if applicable
                                </Label>
                                <select
                                    id="tenant"
                                    className="w-full rounded-xs border bg-background p-2 text-sm"
                                    value={form.data.tenant_id}
                                    onChange={(e) =>
                                        form.setData(
                                            'tenant_id',
                                            e.target.value,
                                        )
                                    }
                                >
                                    <option value="">No tenant linked</option>
                                    {tenants.map((tenant) => (
                                        <option
                                            key={tenant.id}
                                            value={tenant.id}
                                        >
                                            {tenant.first_name}{' '}
                                            {tenant.last_name} —{' '}
                                            {tenant.email || 'No email'}
                                        </option>
                                    ))}
                                </select>
                                <Link
                                    href="/tenants/create"
                                    className="text-xs underline"
                                >
                                    Create a tenant first
                                </Link>
                            </div>
                        )}
                        {error('tenant_id')}
                        <div className="space-y-2">
                            <Label htmlFor="notes">
                                Contact notes and outcome
                            </Label>
                            <Textarea
                                id="notes"
                                rows={5}
                                maxLength={10000}
                                value={form.data.notes}
                                onChange={(e) =>
                                    form.setData('notes', e.target.value)
                                }
                            />
                            {error('notes')}
                        </div>
                    </CardContent>
                </Card>
            </fieldset>
            <div className="flex justify-end gap-2">
                <Button asChild variant="outline">
                    <Link
                        href={
                            inquiry
                                ? `/demo-requests/${inquiry.id}`
                                : '/demo-requests'
                        }
                    >
                        Cancel
                    </Link>
                </Button>
                <Button disabled={form.processing}>
                    <Save className="size-4" />
                    {form.processing
                        ? 'Saving...'
                        : inquiry
                          ? 'Save changes'
                          : 'Create request'}
                </Button>
            </div>
        </form>
    );
}
