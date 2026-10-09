import { ShieldCheck } from 'lucide-react';
import DetailPage from '@/components/detail-page';

type Role = {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    is_system: boolean;
    users_count: number;
    users: { id: number; name: string }[];
    permissions: string[];
};

export default function RoleShow({
    role,
    permissions,
}: {
    role: Role;
    permissions: Record<string, string>;
}) {
    return (
        <DetailPage
            title={role.name}
            status={role.is_system ? 'system_role' : 'custom_role'}
            icon={ShieldCheck}
            backHref="/settings/roles"
            summary={[
                {
                    title: 'Access',
                    metric: {
                        label: 'Permissions',
                        value: role.permissions.length,
                    },
                    fields: [
                        {
                            label: 'Assigned users',
                            value:
                                role.users
                                    .map((user) => user.name)
                                    .join(', ') || 'No assigned users',
                        },
                    ],
                },
                ...(role.description
                    ? [{ title: 'Description', text: role.description }]
                    : []),
            ]}
            sections={[
                {
                    title: 'Permissions',
                    content: (
                        <div
                            tabIndex={0}
                            aria-label="Role permissions"
                            className="max-h-96 [scrollbar-width:none] overflow-y-auto [&::-webkit-scrollbar]:hidden"
                        >
                            {role.permissions.length ? (
                                <ul className="divide-y">
                                    {role.permissions.map((key) => (
                                        <li
                                            key={key}
                                            className="flex items-center justify-between gap-4 py-3 text-sm"
                                        >
                                            <span>
                                                {permissions[key] ?? key}
                                            </span>
                                            <span className="text-muted-foreground">
                                                Allowed
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-muted-foreground">
                                    No permissions are assigned to this role.
                                </p>
                            )}
                        </div>
                    ),
                },
            ]}
        />
    );
}
RoleShow.layout = {
    breadcrumbs: [
        { title: 'Roles & Permissions', href: '/settings/roles' },
        { title: 'Role details', href: '#' },
    ],
};
