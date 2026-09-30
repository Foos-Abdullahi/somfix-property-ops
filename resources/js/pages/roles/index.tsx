import { Users, ShieldCheck, Pencil, Plus } from 'lucide-react';
import { Eye, Edit, Trash2 } from 'lucide-react';
import type { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/tools/table/main-table';
import { Link } from '@inertiajs/react';
import { useState } from 'react';
import { AccessPage, DeleteRecord } from '@/components/access-management';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type Role = {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    permissions: string[];
    is_system: boolean;
    users_count: number;
    users: { id: number; name: string }[];
};
export default function Roles({
    roles,
}: {
    roles: Role[];
    permissions: Record<string, string>;
    grantablePermissions: string[];
}) {
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
                return (
                    <div className="max-w-sm break-words whitespace-normal">
                        {role.users.map((user) => user.name).join(', ') ||
                            'No assigned users'}
                    </div>
                );
            },
        },
        {
            id: 'column3',
            header: 'Actions',
            cell: ({ row }) => {
                const role = row.original;
                return (
                    <>
                        <div className="flex gap-1">
                            <Button asChild variant="ghost" size="icon">
                                <Link
                                    href={`/settings/roles/${role.id}`}
                                    aria-label={`View ${role.name}`}
                                >
                                    <Eye className="size-4" />
                                </Link>
                            </Button>
                            {role.slug !== 'administrator' && (
                                <Button asChild size="icon" variant="ghost">
                                    <Link
                                        href={`/settings/roles/${role.id}/edit`}
                                        aria-label={`Edit ${role.name}`}
                                    >
                                        <Edit className="size-4" />
                                    </Link>
                                </Button>
                            )}
                            {!role.is_system && role.users_count === 0 && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    aria-label={`Delete ${role.name}`}
                                    onClick={() => setDeleting(role)}
                                >
                                    <Trash2 className="size-4" />
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
                <Button asChild size="sm">
                    <Link href="/settings/roles/create">
                        <Plus className="size-4" />
                        Add role
                    </Link>
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
