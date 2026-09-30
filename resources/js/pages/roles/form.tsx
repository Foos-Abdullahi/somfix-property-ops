import { Head, router, useForm } from '@inertiajs/react';
import { Errors } from '@/components/access-management';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

type Role = {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    permissions: string[];
    is_system: boolean;
    users_count: number;
};
export default function RoleEditor({
    role,
    permissions,
    grantable,
}: {
    role: Role | null;
    permissions: Record<string, string>;
    grantable: string[];
}) {
    const onClose = () => router.visit('/settings/roles');
    const form = useForm({
        name: role?.name ?? '',
        description: role?.description ?? '',
        permissions: role?.permissions ?? ([] as string[]),
    });
    const groups = [
        ...new Set(Object.keys(permissions).map((key) => key.split('.')[0])),
    ];
    return (
        <div className="mx-auto w-full max-w-4xl space-y-6 p-4 md:p-6">
            <Head title={role ? 'Edit role' : 'Create role'} />
            <header>
                <h1 className="text-2xl font-bold">
                    {role ? 'Edit role' : 'Create role'}
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    View allows reading records. Manage allows creating,
                    updating, and deleting records. Changes apply to all
                    assigned users.
                </p>
            </header>
            <form
                className="space-y-4 rounded-xs border bg-card p-6"
                onSubmit={(e) => {
                    e.preventDefault();
                    if (role) form.put(`/settings/roles/${role.id}`, {});
                    else form.post('/settings/roles', {});
                }}
            >
                <Errors errors={form.errors} />
                <div className="space-y-2">
                    <Label htmlFor="role-name">Role name</Label>
                    <Input
                        id="role-name"
                        required
                        value={form.data.name}
                        onChange={(e) => form.setData('name', e.target.value)}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="role-description">Description</Label>
                    <Textarea
                        id="role-description"
                        value={form.data.description}
                        onChange={(e) =>
                            form.setData('description', e.target.value)
                        }
                    />
                </div>
                <div className="max-h-96 [scrollbar-width:none] space-y-4 overflow-y-auto rounded-xs border p-4 [&::-webkit-scrollbar]:hidden">
                    {groups.map((group) => (
                        <fieldset
                            key={group}
                            className="space-y-2 border-b pb-4 last:border-0"
                        >
                            <legend className="px-1 text-sm font-medium capitalize">
                                {group.replaceAll('-', ' ')}
                            </legend>
                            {Object.entries(permissions)
                                .filter(([key]) => key.startsWith(group + '.'))
                                .map(([key, title]) => (
                                    <label
                                        key={key}
                                        className="flex items-start gap-2 text-sm"
                                    >
                                        <input
                                            type="checkbox"
                                            className="mt-1"
                                            disabled={!grantable.includes(key)}
                                            checked={form.data.permissions.includes(
                                                key,
                                            )}
                                            onChange={(e) =>
                                                form.setData(
                                                    'permissions',
                                                    e.target.checked
                                                        ? [
                                                              ...form.data
                                                                  .permissions,
                                                              key,
                                                          ]
                                                        : form.data.permissions.filter(
                                                              (value) =>
                                                                  value !== key,
                                                          ),
                                                )
                                            }
                                        />
                                        {title}
                                    </label>
                                ))}
                        </fieldset>
                    ))}
                </div>
                <div className="flex justify-end gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        disabled={form.processing}
                        onClick={onClose}
                    >
                        Cancel
                    </Button>
                    <Button disabled={form.processing}>
                        {form.processing ? 'Saving…' : 'Save role'}
                    </Button>
                </div>
            </form>
        </div>
    );
}

RoleEditor.layout = {
    breadcrumbs: [
        { title: 'roles', href: '/settings/roles' },
        { title: 'Form', href: '#' },
    ],
};
