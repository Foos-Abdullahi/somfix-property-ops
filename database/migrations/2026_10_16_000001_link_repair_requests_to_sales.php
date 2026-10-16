<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('repair_requests', function (Blueprint $table): void {
            $table->string('status')->default('new')->after('photo_path');
            $table->foreignId('customer_id')->nullable()->after('status')->constrained()->nullOnDelete();
            $table->foreignId('lead_id')->nullable()->after('customer_id')->constrained()->nullOnDelete();
            $table->timestamp('converted_at')->nullable()->after('lead_id');
            $table->index(['status', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::table('repair_requests', function (Blueprint $table): void {
            $table->dropIndex(['status', 'created_at']);
            $table->dropConstrainedForeignId('lead_id');
            $table->dropConstrainedForeignId('customer_id');
            $table->dropColumn(['status', 'converted_at']);
        });
    }
};
