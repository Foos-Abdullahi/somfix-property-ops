<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('roles', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->json('permissions');
            $table->boolean('is_system')->default(false);
            $table->timestamps();
        });
        $permissions = array_filter(array_keys(config('permissions')), 'is_string');
        $operational = array_values(array_filter($permissions, fn ($key) => ! in_array($key, ['users.manage', 'roles.manage', 'audit-log.view'])));
        foreach ([
            ['Administrator', 'administrator', $permissions],
            ['Operator', 'operator', $operational],
            ['Viewer', 'viewer', array_values(array_filter($operational, fn ($key) => str_ends_with($key, '.view')))],
        ] as [$name, $slug, $grants]) {
            DB::table('roles')->insert(['name' => $name, 'slug' => $slug, 'permissions' => json_encode($grants), 'is_system' => true, 'created_at' => now(), 'updated_at' => now()]);
        }
        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('role_id')->nullable()->constrained()->restrictOnDelete();
            $table->boolean('is_active')->default(true);
        });
        DB::table('users')->update(['role_id' => DB::table('roles')->where('slug', 'operator')->value('id')]);
        DB::table('users')->where('email', strtolower(trim(config('seeders.admin.email'))))->update([
            'role_id' => DB::table('roles')->where('slug', 'administrator')->value('id'),
        ]);
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('actor_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('actor_name')->nullable();
            $table->string('action')->index();
            $table->string('subject_type')->index();
            $table->unsignedBigInteger('subject_id')->nullable();
            $table->json('changes')->nullable();
            $table->timestamp('created_at')->useCurrent()->index();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
        Schema::table('users', function (Blueprint $table) {
            $table->dropConstrainedForeignId('role_id');
            $table->dropColumn('is_active');
        });
        Schema::dropIfExists('roles');
    }
};
