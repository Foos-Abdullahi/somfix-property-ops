<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /** @var list<string> */
    private array $tables = ['properties', 'units', 'tenants', 'inventories', 'maintenances', 'work_orders'];

    public function up(): void
    {
        foreach ($this->tables as $name) {
            if (! Schema::hasColumn($name, 'images')) {
                Schema::table($name, fn (Blueprint $table) => $table->json('images')->nullable());
            }
        }
    }

    public function down(): void
    {
        foreach ($this->tables as $name) {
            if (Schema::hasColumn($name, 'images')) {
                Schema::table($name, fn (Blueprint $table) => $table->dropColumn('images'));
            }
        }
    }
};
