<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('customers')) {
        Schema::create('customers', function (Blueprint $table): void {
            $table->id();
            $table->string('name');
            $table->string('type')->default('individual');
            $table->string('phone');
            $table->string('email')->nullable();
            $table->string('address')->nullable();
            $table->string('status')->default('active');
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->index(['status', 'name']);
        });
        }

        if (! Schema::hasTable('leads')) {
        Schema::create('leads', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('customer_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('property_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('unit_id')->nullable()->constrained()->nullOnDelete();
            $table->string('source')->default('walk_in');
            $table->string('service_category');
            $table->string('title');
            $table->text('description');
            $table->string('status')->default('new');
            $table->decimal('estimated_value', 12, 2)->nullable();
            $table->date('preferred_visit_date')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->index(['status', 'created_at']);
        });
        }

        Schema::create('service_jobs', function (Blueprint $table): void {
            $table->id();
            $table->string('job_number')->unique();
            $table->foreignId('customer_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('lead_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('property_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('unit_id')->nullable()->constrained()->nullOnDelete();
            $table->string('title');
            $table->text('scope')->nullable();
            $table->string('status')->default('approved');
            $table->decimal('approved_value', 12, 2)->default(0);
            $table->date('approved_date')->nullable();
            $table->date('scheduled_date')->nullable();
            $table->date('completed_date')->nullable();
            $table->text('completion_notes')->nullable();
            $table->timestamps();
            $table->index(['status', 'scheduled_date']);
        });

        Schema::create('job_materials', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('job_id')->constrained('service_jobs')->cascadeOnDelete();
            $table->foreignId('inventory_id')->constrained()->restrictOnDelete();
            $table->decimal('quantity', 10, 2);
            $table->decimal('unit_cost', 12, 2);
            $table->decimal('selling_price', 12, 2)->default(0);
            $table->string('status')->default('confirmed');
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('job_labors', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('job_id')->constrained('service_jobs')->cascadeOnDelete();
            $table->foreignId('service_team_id')->nullable()->constrained()->nullOnDelete();
            $table->decimal('hours', 8, 2);
            $table->decimal('cost_rate', 12, 2)->default(0);
            $table->decimal('selling_rate', 12, 2)->default(0);
            $table->date('work_date')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::table('finances', function (Blueprint $table): void {
            $table->foreignId('job_id')->nullable()->after('tenant_id')->constrained('service_jobs')->nullOnDelete();
            $table->foreignId('source_quote_id')->nullable()->after('job_id')->constrained('finances')->nullOnDelete();
        });

        Schema::table('work_orders', function (Blueprint $table): void {
            $table->foreignId('maintenance_id')->nullable()->change();
            $table->foreignId('job_id')->nullable()->after('maintenance_id')->constrained('service_jobs')->nullOnDelete();
        });

        Schema::table('maintenances', function (Blueprint $table): void {
            $table->foreignId('job_id')->nullable()->after('tenant_id')->constrained('service_jobs')->nullOnDelete();
        });

        Schema::create('payments', function (Blueprint $table): void {
            $table->id();
            $table->string('payment_number')->unique();
            $table->foreignId('finance_id')->constrained('finances')->cascadeOnDelete();
            $table->decimal('amount', 12, 2);
            $table->string('method');
            $table->string('reference')->nullable();
            $table->date('paid_at');
            $table->string('received_by')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->index(['finance_id', 'paid_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
        Schema::table('maintenances', fn (Blueprint $table) => $table->dropConstrainedForeignId('job_id'));
        Schema::table('work_orders', fn (Blueprint $table) => $table->dropConstrainedForeignId('job_id'));
        Schema::table('finances', function (Blueprint $table): void {
            $table->dropConstrainedForeignId('source_quote_id');
            $table->dropConstrainedForeignId('job_id');
        });
        Schema::dropIfExists('job_labors');
        Schema::dropIfExists('job_materials');
        Schema::dropIfExists('service_jobs');
        // customers and leads may predate this migration, so their records are preserved.
    }
};
