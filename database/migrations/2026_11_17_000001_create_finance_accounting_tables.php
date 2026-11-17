<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('finance_settings', function (Blueprint $table): void {
            $table->id();
            $table->string('key')->unique();
            $table->text('value')->nullable();
            $table->timestamps();
        });

        // How each technician is paid: salary (in-house) or commission on jobs (external).
        Schema::table('service_teams', function (Blueprint $table): void {
            $table->string('staff_type')->default('external')->after('status');
            $table->decimal('commission_percent', 5, 2)->nullable()->after('staff_type');
            $table->decimal('monthly_salary', 12, 2)->nullable()->after('commission_percent');
            $table->decimal('monthly_allowances', 12, 2)->nullable()->after('monthly_salary');
        });

        // How SOMFIX is paid for managing each property.
        Schema::table('properties', function (Blueprint $table): void {
            $table->string('owner_phone')->nullable()->after('owner_name');
            $table->string('management_fee_type')->default('percent')->after('owner_phone');
            $table->decimal('management_fee_percent', 5, 2)->nullable()->after('management_fee_type');
            $table->decimal('management_fee_fixed', 12, 2)->nullable()->after('management_fee_percent');
        });

        Schema::create('expenses', function (Blueprint $table): void {
            $table->id();
            $table->string('expense_number')->unique();
            $table->date('expense_date');
            $table->string('category');
            $table->string('description');
            $table->string('vendor')->nullable();
            $table->decimal('amount', 12, 2);
            $table->string('payment_method')->default('cash');
            $table->string('reference')->nullable();
            $table->string('approved_by')->nullable();
            $table->string('status')->default('paid');
            $table->foreignId('job_id')->nullable()->constrained('service_jobs')->nullOnDelete();
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->index(['expense_date', 'category']);
        });

        Schema::create('rent_collections', function (Blueprint $table): void {
            $table->id();
            $table->string('receipt_number')->unique();
            $table->foreignId('property_id')->constrained()->restrictOnDelete();
            $table->foreignId('unit_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('tenant_id')->nullable()->constrained()->nullOnDelete();
            $table->string('tenant_name')->nullable();
            $table->date('rent_month');
            $table->date('received_date');
            $table->decimal('rent_due', 12, 2)->default(0);
            $table->decimal('amount_collected', 12, 2);
            $table->decimal('arrears', 12, 2)->default(0);
            $table->string('payment_method')->default('cash');
            $table->string('reference')->nullable();
            $table->string('fee_type');
            $table->decimal('fee_amount', 12, 2)->default(0);
            $table->decimal('net_to_owner', 12, 2)->default(0);
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->index(['property_id', 'received_date']);
        });

        Schema::create('property_expenses', function (Blueprint $table): void {
            $table->id();
            $table->string('expense_number')->unique();
            $table->foreignId('property_id')->constrained()->restrictOnDelete();
            $table->date('expense_date');
            $table->string('category');
            $table->string('description');
            $table->string('vendor')->nullable();
            $table->decimal('amount', 12, 2);
            $table->string('payment_method')->default('cash');
            $table->string('reference')->nullable();
            $table->foreignId('job_id')->nullable()->constrained('service_jobs')->nullOnDelete();
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->index(['property_id', 'expense_date']);
        });

        Schema::create('owner_payouts', function (Blueprint $table): void {
            $table->id();
            $table->string('payout_number')->unique();
            $table->foreignId('property_id')->constrained()->restrictOnDelete();
            $table->date('payout_date');
            $table->decimal('amount', 12, 2);
            $table->string('payment_method')->default('bank_transfer');
            $table->string('reference')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->index(['property_id', 'payout_date']);
        });

        Schema::create('technician_payouts', function (Blueprint $table): void {
            $table->id();
            $table->string('payout_number')->unique();
            $table->foreignId('service_team_id')->constrained()->restrictOnDelete();
            $table->foreignId('job_id')->nullable()->constrained('service_jobs')->nullOnDelete();
            $table->date('earned_date');
            $table->decimal('base_amount', 12, 2)->default(0);
            $table->decimal('percent', 5, 2)->default(0);
            $table->decimal('amount', 12, 2);
            $table->string('status')->default('pending');
            $table->date('paid_at')->nullable();
            $table->string('payment_method')->nullable();
            $table->string('reference')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->index(['service_team_id', 'status']);
        });

        Schema::create('payroll_entries', function (Blueprint $table): void {
            $table->id();
            $table->string('payroll_number')->unique();
            $table->foreignId('service_team_id')->constrained()->restrictOnDelete();
            $table->date('pay_month');
            $table->decimal('basic_salary', 12, 2)->default(0);
            $table->decimal('allowances', 12, 2)->default(0);
            $table->decimal('overtime', 12, 2)->default(0);
            $table->decimal('bonus', 12, 2)->default(0);
            $table->decimal('gross_pay', 12, 2)->default(0);
            $table->decimal('advance_deduction', 12, 2)->default(0);
            $table->decimal('absence_deduction', 12, 2)->default(0);
            $table->decimal('other_deduction', 12, 2)->default(0);
            $table->decimal('total_deductions', 12, 2)->default(0);
            $table->decimal('net_pay', 12, 2)->default(0);
            $table->string('status')->default('pending');
            $table->date('paid_at')->nullable();
            $table->string('payment_method')->nullable();
            $table->string('reference')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->unique(['service_team_id', 'pay_month']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payroll_entries');
        Schema::dropIfExists('technician_payouts');
        Schema::dropIfExists('owner_payouts');
        Schema::dropIfExists('property_expenses');
        Schema::dropIfExists('rent_collections');
        Schema::dropIfExists('expenses');
        Schema::table('properties', fn (Blueprint $table) => $table->dropColumn(['owner_phone', 'management_fee_type', 'management_fee_percent', 'management_fee_fixed']));
        Schema::table('service_teams', fn (Blueprint $table) => $table->dropColumn(['staff_type', 'commission_percent', 'monthly_salary', 'monthly_allowances']));
        Schema::dropIfExists('finance_settings');
    }
};
