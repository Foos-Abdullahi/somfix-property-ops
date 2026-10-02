import { useAccessFilters } from '@/hooks/use-access-filters';
import { FilterSelect } from '@/components/tools/table/filter-select';
import {
    Users as UsersIcon,
    ShieldCheck,
    UserCheck,
    UserX,
    Plus,
} from 'lucide-react';
import { Edit, Trash2 } from 'lucide-react';
import type { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/tools/table/main-table';
import { Link } from '@inertiajs/react';
import { useState } from 'react';
import {
    AccessPage,
    DeleteRecord,
    Pagination,
    type Paginated,
} from '@/components/access-management';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

type Role = { id: number; name: string; slug: string; permissions: string[] };
type ManagedUser = {
    id: number;
    name: string;
    email: string;
    role_id: number | null;
    role: Role | null;
    is_active: boolean;
};

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
    const [deleting, setDeleting] = useState<ManagedUser | null>(null);
    const { values, update } = useAccessFilters('/settings/users', {
        search: filters.search ?? '',
        status: filters.status ?? '',
        role: String(filters.role ?? ''),
    });
    const columns: ColumnDef<ManagedUser>[] = [
        {
            accessorKey: 'name',
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
            accessorKey: 'email',
            header: 'Email',
            cell: ({ row }) => {
                const user = row.original;
                return <>{user.email}</>;
            },
        },
        {
            id: 'role',
            accessorFn: (user) => user.role?.name ?? 'No role',
            header: 'Role',
            cell: ({ row }) => {
                const user = row.original;
                return <>{user.role?.name ?? 'No role'}</>;
            },
        },
        {
            id: 'status',
            accessorFn: (user) => (user.is_active ? 'Active' : 'Inactive'),
            header: 'Status',
            cell: ({ row }) => {
                const user = row.original;
                return (
                    <>
                        <Badge
                            variant={user.is_active ? 'success' : 'neutral'}
                        >
                            {user.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                    </>
                );
            },
        },
        {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => {
                const user = row.original;
                return (
                    <>
                        <div className="flex gap-1">
                            {(isAdministrator ||
                                user.role?.slug !== 'administrator') && (
                                <Button asChild size="icon" variant="ghost">
                                    <Link
                                        href={`/settings/users/${user.id}/edit`}
                                        aria-label={`Edit ${user.name}`}
                                    >
                                        <Edit className="size-4 text-[#004317] dark:text-green-300" />
                                    </Link>
                                </Button>
                            )}
                            {user.id !== currentUserId &&
                                user.role?.slug !== 'administrator' && (
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        aria-label={`Delete ${user.name}`}
                                        onClick={() => setDeleting(user)}
                                    >
                                        <Trash2 className="size-4 text-destructive" />
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
                <Button asChild size="sm">
                    <Link href="/settings/users/create">
                        <Plus className="size-4" />
                        Add user
                    </Link>
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
            <DataTable
                title="Users"
                searchTitle="Filter users by name or email..."
                columns={columns}
                data={users.data}
                searchControl={{
                    value: values.search,
                    onChange: (search) => update({ ...values, search }, 300),
                }}
                filterControls={
                    <>
                        <FilterSelect
                            label="All statuses"
                            value={values.status}
                            options={[
                                { value: 'active', label: 'Active' },
                                { value: 'inactive', label: 'Inactive' },
                            ]}
                            onChange={(status) => update({ ...values, status })}
                        />
                        <FilterSelect
                            label="All roles"
                            value={values.role}
                            options={roles.map((role) => ({
                                value: String(role.id),
                                label: role.name,
                            }))}
                            onChange={(role) => update({ ...values, role })}
                        />
                        {Object.values(values).some(Boolean) && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                    update({ search: '', status: '', role: '' })
                                }
                            >
                                Reset
                            </Button>
                        )}
                    </>
                }
                hidePagination
            />
            <Pagination page={users} />
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
