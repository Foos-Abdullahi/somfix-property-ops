<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('demo_requests', function (Blueprint $table) {
            $table->string('status')->default('new');
            $table->dateTime('follow_up_at')->nullable();
            $table->dateTime('walkthrough_at')->nullable();
            $table->text('notes')->nullable();
            $table->foreignId('tenant_id')->nullable()->constrained()->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('demo_requests', function (Blueprint $table) {
            $table->dropForeign(['tenant_id']);
            $table->dropColumn(['status', 'follow_up_at', 'walkthrough_at', 'notes', 'tenant_id']);
        });
    }
};
