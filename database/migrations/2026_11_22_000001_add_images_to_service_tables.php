<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        foreach (['service_catalog', 'service_teams'] as $table) {
            Schema::table($table, function (Blueprint $table): void {
                $table->json('images')->nullable();
            });
        }
    }

    public function down(): void
    {
        foreach (['service_catalog', 'service_teams'] as $table) {
            Schema::table($table, function (Blueprint $table): void {
                $table->dropColumn('images');
            });
        }
    }
};
