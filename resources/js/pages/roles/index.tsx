import { Users, ShieldCheck, Pencil, Plus } from 'lucide-react';
import type { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/tools/table/main-table';
import { Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import {
    AccessPage,
    DeleteRecord,
    Errors,
} from '@/components/access-management';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

type Role = {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    permissions: string[];
    is_system: boolean;
    users_count: number;
};
function RoleEditor({
    role,
    permissions,
    grantable,
    onClose,
}: {
    role: Role | null;
    permissions: Record<string, string>;
    grantable: string[];
    onClose: () => void;
}) {
    const form = useForm({
        name: role?.name ?? '',
        description: role?.description ?? '',
        permissions: role?.permissions ?? ([] as string[]),
    });
    const groups = [
        ...new Set(Object.keys(permissions).map((key) => key.split('.')[0])),
    ];
    return (
        <Dialog
            open
            onOpenChange={(open) => {
                if (!open && !form.processing) onClose();
            }}
        >
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>
                        {role ? 'Edit role' : 'Create role'}
                    </DialogTitle>
                    <DialogDescription>
                        View allows reading records. Manage allows creating,
                        updating, and deleting records. Changes apply to all
                        assigned users.
                    </DialogDescription>
                </DialogHeader>
                <form
                    className="space-y-4"
                    onSubmit={(e) => {
                        e.preventDefault();
                        if (role)
                            form.put(`/settings/roles/${role.id}`, {
                                onSuccess: onClose,
                            });
                        else
                            form.post('/settings/roles', {
                                onSuccess: onClose,
                            });
                    }}
                >
                    <Errors errors={form.errors} />
                    <div className="space-y-2">
                        <Label htmlFor="role-name">Role name</Label>
                        <Input
                            id="role-name"
                            required
                            value={form.data.name}
                            onChange={(e) =>
                                form.setData('name', e.target.value)
                            }
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
                    <div className="grid gap-3 sm:grid-cols-2">
                        {groups.map((group) => (
                            <fieldset
                                key={group}
                                className="space-y-2 rounded-xs border p-3"
                            >
                                <legend className="px-1 text-sm font-medium capitalize">
                                    {group.replaceAll('-', ' ')}
                                </legend>
                                {Object.entries(permissions)
                                    .filter(([key]) =>
                                        key.startsWith(group + '.'),
                                    )
                                    .map(([key, title]) => (
                                        <label
                                            key={key}
                                            className="flex items-start gap-2 text-sm"
                                        >
                                            <input
                                                type="checkbox"
                                                className="mt-1"
                                                disabled={
                                                    !grantable.includes(key)
                                                }
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
                                                                      value !==
                                                                      key,
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
            </DialogContent>
        </Dialog>
    );
}
export default function Roles({
    roles,
    permissions,
    grantablePermissions,
}: {
    roles: Role[];
    permissions: Record<string, string>;
    grantablePermissions: string[];
}) {
    const [editing, setEditing] = useState<Role | null | undefined>();
    const [deleting, setDeleting] = useState<Role | null>(null);
    const [search, setSearch] = useState('');
    const matches = roles.filter((role) =>
        role.name.toLowerCase().includes(search.toLowerCase()),
    );
    const columns: ColumnDef<Role>[] = [
        {
            id: 'column0',
            header: 'Role',
            cell: ({ row }) => {
                const role = row.original;
                return (
                    <>
                        <p className="font-medium">{role.name}</p>
                        <p className="text-xs text-muted-foreground">
                            {role.description}
                        </p>
                    </>
                );
            },
        },
        {
            id: 'column1',
            header: 'Permissions',
            cell: ({ row }) => {
                const role = row.original;
                return <>{role.permissions.length}</>;
            },
        },
        {
            id: 'column2',
            header: 'Users',
            cell: ({ row }) => {
                const role = row.original;
                return <>{role.users_count}</>;
            },
        },
        {
            id: 'column3',
            header: 'Actions',
            cell: ({ row }) => {
                const role = row.original;
                return (
                    <>
                        <div className="flex gap-2">
                            <Button asChild variant="outline" size="sm">
                                <Link href={`/settings/roles/${role.id}`}>
                                    View
                                </Link>
                            </Button>
                            {role.slug !== 'administrator' && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setEditing(role)}
                                >
                                    Edit
                                </Button>
                            )}
                            {!role.is_system && role.users_count === 0 && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setDeleting(role)}
                                >
                                    Delete
                                </Button>
                            )}
                        </div>
                    </>
                );
            },
        },
    ];
    return (
        <AccessPage
            title="Roles & permissions"
            actions={
                <Button size="sm" onClick={() => setEditing(null)}>
                    <Plus className="size-4" />
                    Add role
                </Button>
            }
            stats={[
                {
                    title: 'Total roles',
                    value: roles.length,
                    icon: ShieldCheck,
                    color: 'primary',
                },
                {
                    title: 'System roles',
                    value: roles.filter((role) => role.is_system).length,
                    icon: ShieldCheck,
                    color: 'info',
                },
                {
                    title: 'Custom roles',
                    value: roles.filter((role) => !role.is_system).length,
                    icon: Pencil,
                    color: 'success',
                },
                {
                    title: 'Assigned users',
                    value: roles.reduce(
                        (total, role) => total + role.users_count,
                        0,
                    ),
                    icon: Users,
                    color: 'warning',
                },
            ]}
            description="Define which records and settings each role can access."
        >
            <div className="flex justify-between gap-3">
                <Input
                    aria-label="Search roles"
                    placeholder="Search roles"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="max-w-xs"
                />
            </div>
            <DataTable
                title="Roles"
                searchTitle="Search..."
                columns={columns}
                data={matches}
                searchable={false}
                hidePagination
            />
            {editing !== undefined && (
                <RoleEditor
                    role={editing}
                    permissions={permissions}
                    grantable={grantablePermissions}
                    onClose={() => setEditing(undefined)}
                />
            )}
            {deleting && (
                <DeleteRecord
                    url={`/settings/roles/${deleting.id}`}
                    name={deleting.name}
                    onClose={() => setDeleting(null)}
                />
            )}
        </AccessPage>
    );
}
Roles.layout = {
    breadcrumbs: [{ title: 'Roles & Permissions', href: '/settings/roles' }],
};
