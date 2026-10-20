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
    const isViewer = auth?.user?.role?.slug === 'viewer';

    const can = (permission: string) => permissions.includes(permission);
    const canManage = (module: string) =>
        !isViewer && permissions.includes(`${module}.manage`);

    return {
        permissions,
        isViewer,
        can,
        canManage,
    };
}
