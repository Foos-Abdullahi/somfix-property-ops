import { ShieldCheck } from 'lucide-react';
import DetailPage from '@/components/detail-page';

type Role = {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    is_system: boolean;
    users_count: number;
    permissions: string[];
};

export default function RoleShow({
    role,
    permissions,
}: {
    role: Role;
    permissions: Record<string, string>;
}) {
    const groups = [
        ...new Set(
            role.permissions.map((permission) => permission.split('.')[0]),
        ),
    ];
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
                        { label: 'Assigned users', value: role.users_count },
                    ],
                },
                ...(role.description
                    ? [{ title: 'Description', text: role.description }]
                    : []),
            ]}
            sections={
                groups.length
                    ? groups.map((group) => ({
                          title: group.replaceAll('-', ' '),
                          fields: role.permissions
                              .filter((key) => key.startsWith(group + '.'))
                              .map((key) => ({
                                  label: permissions[key] ?? key,
                                  value: 'Allowed',
                              })),
                      }))
                    : [
                          {
                              title: 'Permissions',
                              text: 'No permissions are assigned to this role.',
                          },
                      ]
            }
        />
    );
}
RoleShow.layout = {
    breadcrumbs: [
        { title: 'Roles & Permissions', href: '/settings/roles' },
        { title: 'Role details', href: '#' },
    ],
};
