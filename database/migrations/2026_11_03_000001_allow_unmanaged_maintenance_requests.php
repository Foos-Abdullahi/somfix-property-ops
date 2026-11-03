<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('maintenances', function (Blueprint $table): void {
            $table->foreignId('property_id')->nullable()->change();
            $table->foreignId('customer_id')->nullable()->after('tenant_id')->constrained()->nullOnDelete();
            $table->string('location')->nullable()->after('customer_id');
        });
    }

    public function down(): void
    {
        Schema::table('maintenances', function (Blueprint $table): void {
            $table->dropConstrainedForeignId('customer_id');
            $table->dropColumn('location');
        });
    }
};
