<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Standalone list of services SOMFIX offers. Intentionally has no
        // customer, tenant, property or job foreign keys.
        Schema::create('service_catalog', function (Blueprint $table): void {
            $table->id();
            $table->string('name')->unique();
            $table->string('category');
            $table->text('description')->nullable();
            $table->string('unit')->nullable();
            $table->decimal('price', 12, 2)->nullable();
            $table->string('duration')->nullable();
            $table->string('status')->default('active');
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['status', 'category']);
        });

        $this->grant(function (array $permissions, string $slug): array {
            if (in_array('service-team.view', $permissions, true)) {
                $permissions[] = 'service-list.view';
            }
            if (in_array('service-team.manage', $permissions, true) && $slug !== 'viewer') {
                $permissions[] = 'service-list.manage';
            }

            return $permissions;
        });
    }

    public function down(): void
    {
        $this->grant(fn (array $permissions) => array_values(array_filter(
            $permissions,
            fn ($permission) => ! str_starts_with($permission, 'service-list.'),
        )));
        Schema::dropIfExists('service_catalog');
    }

    private function grant(callable $change): void
    {
        if (! Schema::hasTable('roles')) {
            return;
        }
        foreach (DB::table('roles')->get(['id', 'slug', 'permissions']) as $role) {
            $permissions = json_decode($role->permissions, true) ?: [];
            $updated = array_values(array_unique($change($permissions, $role->slug)));
            if ($updated !== $permissions) {
                DB::table('roles')->where('id', $role->id)->update(['permissions' => json_encode($updated)]);
            }
        }
    }
};
