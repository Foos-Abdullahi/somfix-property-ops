<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $permissions = array_values(array_filter(array_keys(config('permissions')), 'is_string'));
        $operational = array_values(array_filter(
            $permissions,
            fn (string $permission) => ! in_array($permission, ['users.manage', 'roles.manage', 'audit-log.view'], true),
        ));

        $roles = [
            'administrator' => [
                'name' => 'Administrator',
                'description' => 'Full access to all operational and system settings.',
                'permissions' => $permissions,
            ],
            'operator' => [
                'name' => 'Operator',
                'description' => 'Can view and manage all operational modules, but not users, roles, or audit logs.',
                'permissions' => $operational,
            ],
            'viewer' => [
                'name' => 'Viewer',
                'description' => 'Read-only access to all operational modules.',
                'permissions' => array_values(array_filter($operational, fn (string $permission) => str_ends_with($permission, '.view'))),
            ],
            'standard-user' => [
                'name' => 'Standard User',
                'description' => 'No operational access until an administrator assigns a more suitable role.',
                'permissions' => [],
            ],
        ];

        foreach ($roles as $slug => $role) {
            $values = [
                ...$role,
                'permissions' => json_encode($role['permissions']),
                'is_system' => true,
                'updated_at' => now(),
            ];

            if (DB::table('roles')->where('slug', $slug)->exists()) {
                DB::table('roles')->where('slug', $slug)->update($values);
            } else {
                DB::table('roles')->insert([...$values, 'slug' => $slug, 'created_at' => now()]);
            }
        }
    }

    public function down(): void
    {
        $roleId = DB::table('roles')->where('slug', 'standard-user')->value('id');

        if ($roleId && ! DB::table('users')->where('role_id', $roleId)->exists()) {
            DB::table('roles')->where('id', $roleId)->delete();
        }
    }
};
