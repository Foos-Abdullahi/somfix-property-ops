import { usePage } from '@inertiajs/react';
import type { Auth } from '@/types/auth';

export function usePermissions() {
    const { auth } = usePage<{
        auth?: Auth & {
            user?: {
                role?: {
                    id?: number;
                    slug?: string;
                    name?: string;
                };
            };
        };
    }>().props;

    const permissions = auth?.permissions ?? [];
    const roleSlug = (auth?.user as { role?: { slug?: string } } | undefined)?.role?.slug ?? '';
    const isViewer = roleSlug === 'viewer';

    const can = (permission: string) => {
        if (isViewer && (permission.endsWith('.manage') || permission.includes('.manage'))) {
            return false;
        }
        return permissions.includes(permission);
    };
    const canAny = (perms: string[]) => perms.some((p) => can(p));
    const canAll = (perms: string[]) => perms.every((p) => can(p));
    const hasRole = (slug: string) => roleSlug === slug;
    const canManage = (module: string) =>
        !isViewer && permissions.includes(`${module}.manage`);

    return {
        permissions,
        roleSlug,
        isViewer,
        can,
        canAny,
        canAll,
        hasRole,
        canManage,
    };
}
