import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Users as UsersIcon,
    ShieldCheck,
    UserCheck,
    UserX,
    Plus,
} from 'lucide-react';
import type { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/tools/table/main-table';
import { router, useForm } from '@inertiajs/react';
import { useState, type FormEvent } from 'react';
import {
    AccessPage,
    DeleteRecord,
    Errors,
    Pagination,
    selectClass,
    type Paginated,
} from '@/components/access-management';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

type Role = { id: number; name: string; slug: string; permissions: string[] };
type ManagedUser = {
    id: number;
    name: string;
    email: string;
    role_id: number | null;
    role: Role | null;
    is_active: boolean;
};

function UserEditor({
    user,
    roles,
    self,
    onClose,
}: {
    user: ManagedUser | null;
    roles: Role[];
    self: boolean;
    onClose: () => void;
}) {
    const form = useForm({
        name: user?.name ?? '',
        email: user?.email ?? '',
        password: '',
        password_confirmation: '',
        role_id: String(
            user?.role_id ??
                roles.find((role) => role.slug === 'viewer')?.id ??
                roles[0]?.id ??
                '',
        ),
        is_active: user?.is_active ?? true,
    });
    function submit(event: FormEvent) {
        event.preventDefault();
        const options = {
            onSuccess: () => {
                form.reset('password', 'password_confirmation');
                onClose();
            },
        };
        if (user) form.put(`/settings/users/${user.id}`, options);
        else form.post('/settings/users', options);
    }
    return (
        <Dialog
            open
            onOpenChange={(open) => {
                if (!open && !form.processing) onClose();
            }}
        >
            <DialogContent className="max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {user ? 'Edit user' : 'Create user'}
                    </DialogTitle>
                    <DialogDescription>
                        {user
                            ? 'Leave the password blank to keep the current password.'
                            : 'Create a verified staff account with a role and a password.'}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={submit} className="space-y-4">
                    <Errors errors={form.errors} />
                    <div className="space-y-2">
                        <Label htmlFor="user-name">Name</Label>
                        <Input
                            id="user-name"
                            required
                            value={form.data.name}
                            onChange={(e) =>
                                form.setData('name', e.target.value)
                            }
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="user-email">Email</Label>
                        <Input
                            id="user-email"
                            type="email"
                            required
                            value={form.data.email}
                            onChange={(e) =>
                                form.setData('email', e.target.value)
                            }
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="user-role">Role</Label>
                        <Select
                            disabled={self}
                            value={form.data.role_id}
                            onValueChange={(value) =>
                                form.setData('role_id', value)
                            }
                        >
                            <SelectTrigger id="user-role" className="w-full">
                                <SelectValue placeholder="Select a role" />
                            </SelectTrigger>
                            <SelectContent>
                                {roles.map((role) => (
                                    <SelectItem
                                        key={role.id}
                                        value={String(role.id)}
                                    >
                                        {role.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="user-password">
                            {user ? 'New password' : 'Password'} (12+
                            characters)
                        </Label>
                        <Input
                            id="user-password"
                            type="password"
                            autoComplete="new-password"
                            minLength={12}
                            required={!user}
                            value={form.data.password}
                            onChange={(e) =>
                                form.setData('password', e.target.value)
                            }
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="user-confirm">Confirm password</Label>
                        <Input
                            id="user-confirm"
                            type="password"
                            autoComplete="new-password"
                            required={!!form.data.password}
                            value={form.data.password_confirmation}
                            onChange={(e) =>
                                form.setData(
                                    'password_confirmation',
                                    e.target.value,
                                )
                            }
                        />
                    </div>
                    <label className="flex items-center gap-2 text-sm">
                        <input
                            type="checkbox"
                            disabled={self}
                            checked={form.data.is_active}
                            onChange={(e) =>
                                form.setData('is_active', e.target.checked)
                            }
                        />
                        Active account
                    </label>
                    <div className="flex justify-end gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            disabled={form.processing}
                            onClick={onClose}
                        >
                            Cancel
                        </Button>
                        <Button
                            disabled={form.processing || !form.data.role_id}
                        >
                            {form.processing ? 'Saving…' : 'Save user'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export default function Users({
    users,
    roles,
    filters,
    currentUserId,
    isAdministrator,
    stats,
}: {
    users: Paginated<ManagedUser>;
    roles: Role[];
    filters: { search?: string; status?: string; role?: string };
    currentUserId: number;
    isAdministrator: boolean;
    stats: { total: number; active: number; inactive: number; roles: number };
}) {
    const [editing, setEditing] = useState<ManagedUser | null | undefined>();
    const [deleting, setDeleting] = useState<ManagedUser | null>(null);
    const [search, setSearch] = useState(filters.search ?? '');
    const [status, setStatus] = useState(filters.status ?? '');
    const [role, setRole] = useState(filters.role ?? '');
    const columns: ColumnDef<ManagedUser>[] = [
        {
            id: 'column0',
            header: 'Name',
            cell: ({ row }) => {
                const user = row.original;
                return (
                    <>
                        {user.name}
                        {user.id === currentUserId ? ' (you)' : ''}
                    </>
                );
            },
        },
        {
            id: 'column1',
            header: 'Email',
            cell: ({ row }) => {
                const user = row.original;
                return <>{user.email}</>;
            },
        },
        {
            id: 'column2',
            header: 'Role',
            cell: ({ row }) => {
                const user = row.original;
                return <>{user.role?.name ?? 'No role'}</>;
            },
        },
        {
            id: 'column3',
            header: 'Status',
            cell: ({ row }) => {
                const user = row.original;
                return (
                    <>
                        <Badge
                            variant={user.is_active ? 'default' : 'secondary'}
                        >
                            {user.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                    </>
                );
            },
        },
        {
            id: 'column4',
            header: 'Actions',
            cell: ({ row }) => {
                const user = row.original;
                return (
                    <>
                        <div className="flex gap-2">
                            {(isAdministrator ||
                                user.role?.slug !== 'administrator') && (
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setEditing(user)}
                                >
                                    Edit
                                </Button>
                            )}
                            {user.id !== currentUserId &&
                                user.role?.slug !== 'administrator' && (
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => setDeleting(user)}
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
            title="User management"
            actions={
                <Button size="sm" onClick={() => setEditing(null)}>
                    <Plus className="size-4" />
                    Add user
                </Button>
            }
            stats={[
                {
                    title: 'Total users',
                    value: stats.total,
                    icon: UsersIcon,
                    color: 'primary',
                },
                {
                    title: 'Active users',
                    value: stats.active,
                    icon: UserCheck,
                    color: 'success',
                },
                {
                    title: 'Inactive users',
                    value: stats.inactive,
                    icon: UserX,
                    color: 'warning',
                },
                {
                    title: 'Access roles',
                    value: stats.roles,
                    icon: ShieldCheck,
                    color: 'info',
                },
            ]}
            description="Manage staff accounts, access roles, and account status."
        >
            <div className="flex flex-wrap justify-between gap-3">
                <form
                    className="flex flex-wrap gap-2"
                    onSubmit={(e) => {
                        e.preventDefault();
                        router.get(
                            '/settings/users',
                            { search, status, role },
                            { preserveState: true },
                        );
                    }}
                >
                    <Input
                        aria-label="Search users"
                        placeholder="Search name or email"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-64"
                    />
                    <select
                        aria-label="Account status"
                        className={selectClass}
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                    >
                        <option value="">All statuses</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                    <select
                        aria-label="Filter by role"
                        className={selectClass}
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                    >
                        <option value="">All roles</option>
                        {roles.map((r) => (
                            <option key={r.id} value={r.id}>
                                {r.name}
                            </option>
                        ))}
                    </select>
                    <Button variant="outline">Filter</Button>
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => {
                            setSearch('');
                            setStatus('');
                            setRole('');
                            router.get('/settings/users');
                        }}
                    >
                        Clear
                    </Button>
                </form>
            </div>
            <DataTable
                title="Users"
                searchTitle="Search..."
                columns={columns}
                data={users.data}
                searchable={false}
                hidePagination
            />
            <Pagination page={users} />
            {editing !== undefined && (
                <UserEditor
                    user={editing}
                    roles={roles.filter(
                        (r) => isAdministrator || r.slug !== 'administrator',
                    )}
                    self={editing?.id === currentUserId}
                    onClose={() => setEditing(undefined)}
                />
            )}
            {deleting && (
                <DeleteRecord
                    url={`/settings/users/${deleting.id}`}
                    name={deleting.name}
                    onClose={() => setDeleting(null)}
                />
            )}
        </AccessPage>
    );
}
Users.layout = {
    breadcrumbs: [{ title: 'User Management', href: '/settings/users' }],
};
