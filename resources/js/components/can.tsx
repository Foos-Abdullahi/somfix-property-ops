import type { ReactNode } from 'react';
import { usePermissions } from '@/hooks/use-permissions';

interface CanProps {
    /** Single permission — user must have this */
    permission?: string;
    /** User must have at least one of these */
    anyOf?: string[];
    /** User must have all of these */
    allOf?: string[];
    /** User must have this exact role slug */
    role?: string;
    /** User must have at least one of these role slugs */
    anyRole?: string[];
    /** Rendered when access is denied (default: nothing) */
    fallback?: ReactNode;
    children: ReactNode;
}

/**
 * Declarative permission gate.
 *
 * @example
 * // Hide edit button from viewers
 * <Can permission="properties.manage">
 *   <Button>Edit</Button>
 * </Can>
 *
 * @example
 * // Show fallback for unauthorised users
 * <Can permission="finance.manage" fallback={<span>Read-only</span>}>
 *   <Button>Create invoice</Button>
 * </Can>
 */
export function Can({
    permission,
    anyOf,
    allOf,
    role,
    anyRole,
    fallback = null,
    children,
}: CanProps) {
    const { can, canAny, canAll, hasRole } = usePermissions();

    const allowed =
        (!permission || can(permission)) &&
        (!anyOf?.length || canAny(anyOf)) &&
        (!allOf?.length || canAll(allOf)) &&
        (!role || hasRole(role)) &&
        (!anyRole?.length || anyRole.some(hasRole));

    return <>{allowed ? children : fallback}</>;
}
