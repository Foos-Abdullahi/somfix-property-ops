<?php

use App\Models\Customer;
use App\Models\Expense;
use App\Models\Finance;
use App\Models\Inventory;
use App\Models\Job;
use App\Models\JobMaterial;
use App\Models\OwnerPayout;
use App\Models\PayrollEntry;
use App\Models\Property;
use App\Models\RentCollection;
use App\Models\Role;
use App\Models\ServiceTeam;
use App\Models\TechnicianPayout;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

function financeUser(string $role = 'administrator'): User
{
    return User::factory()->create(['role_id' => Role::where('slug', $role)->sole()->id, 'is_active' => true]);
}

function billedJob(float $materialsCost = 100, float $invoice = 300): array
{
    $customer = Customer::create(['name' => 'Khadra', 'phone' => '061', 'type' => 'individual', 'status' => 'active']);
    $job = Job::create(['job_number' => 'JOB-T-1', 'customer_id' => $customer->id, 'title' => 'Rewire', 'status' => 'completed', 'approved_value' => $invoice]);
    $item = Inventory::factory()->create(['unit_cost' => $materialsCost, 'current_stock' => 10]);
    JobMaterial::create(['job_id' => $job->id, 'inventory_id' => $item->id, 'quantity' => 1, 'unit_cost' => $materialsCost, 'selling_price' => $materialsCost]);
    $inv = Finance::factory()->create(['type' => 'invoice', 'status' => 'sent', 'job_id' => $job->id, 'amount' => $invoice, 'paid_amount' => 0, 'balance' => $invoice, 'due_date' => now()->addDays(10)]);

    return [$job, $inv];
}

it('records payments against an invoice and keeps balance and status in step', function () {
    [$job, $inv] = billedJob();
    $this->actingAs(financeUser());

    $this->post('/finance/payments', ['finance_id' => $inv->id, 'amount' => 100, 'method' => 'evc_plus', 'paid_at' => now()->toDateString()])->assertSessionHasNoErrors();
    expect($inv->fresh())->status->toBe('partially_paid')->and((float) $inv->fresh()->balance)->toBe(200.0);

    $this->post('/finance/payments', ['finance_id' => $inv->id, 'amount' => 250, 'method' => 'cash', 'paid_at' => now()->toDateString()])->assertSessionHasErrors('amount');

    $this->post('/finance/payments', ['finance_id' => $inv->id, 'amount' => 200, 'method' => 'cash', 'paid_at' => now()->toDateString()])->assertSessionHasNoErrors();
    expect($inv->fresh()->status)->toBe('paid');

    $payment = $inv->payments()->first();
    $this->delete('/finance/payments/'.$payment->id);
    expect((float) $inv->fresh()->balance)->toBe(100.0)->and($inv->fresh()->status)->toBe('partially_paid');
});

it('computes job margin from invoice, materials at cost, commission and job expenses', function () {
    [$job] = billedJob(100, 300);
    $tech = ServiceTeam::factory()->create(['staff_type' => 'external', 'commission_percent' => 60]);
    $this->actingAs(financeUser());

    $this->post('/finance/commissions', ['service_team_id' => $tech->id, 'job_id' => $job->id, 'earned_date' => now()->toDateString(), 'base_amount' => 200, 'percent' => 60, 'status' => 'pending'])->assertSessionHasNoErrors();
    $payout = TechnicianPayout::sole();
    expect((float) $payout->amount)->toBe(120.0);

    $this->post('/finance/expenses', ['expense_date' => now()->toDateString(), 'category' => 'Transport & Fuel', 'description' => 'Fuel', 'amount' => 20, 'payment_method' => 'cash', 'status' => 'paid', 'job_id' => $job->id])->assertSessionHasNoErrors();

    $this->get('/finance/jobs/'.$job->id)->assertInertia(fn (Assert $p) => $p->component('finance/jobs/show')
        ->where('summary.service_fee', 200)->where('summary.commission', 120)->where('summary.direct_expenses', 20)->where('summary.net_margin', 60));

    $this->post("/finance/commissions/{$payout->id}/pay", ['paid_at' => now()->toDateString(), 'payment_method' => 'cash'])->assertSessionHasNoErrors();
    expect($payout->fresh()->status)->toBe('paid');

    $this->get('/finance/ledger')->assertInertia(fn (Assert $p) => $p->where('totals.cashOut', 140));
});

it('only accepts external technicians for commission and in-house staff for payroll', function () {
    $inHouse = ServiceTeam::factory()->create(['staff_type' => 'in_house', 'monthly_salary' => 500, 'monthly_allowances' => 50, 'status' => 'active']);
    $this->actingAs(financeUser());

    $this->post('/finance/commissions', ['service_team_id' => $inHouse->id, 'earned_date' => now()->toDateString(), 'base_amount' => 10, 'percent' => 50, 'status' => 'pending'])->assertSessionHasErrors('service_team_id');

    $this->post('/finance/payroll/generate', ['pay_month' => now()->toDateString()]);
    $entry = PayrollEntry::sole();
    expect((float) $entry->net_pay)->toBe(550.0);

    $this->put('/finance/payroll/'.$entry->id, ['service_team_id' => $inHouse->id, 'pay_month' => now()->startOfMonth()->toDateString(), 'basic_salary' => 500, 'allowances' => 50, 'overtime' => 40, 'advance_deduction' => 100, 'status' => 'pending'])->assertSessionHasNoErrors();
    expect((float) $entry->fresh()->net_pay)->toBe(490.0);
    $this->post('/finance/payroll/generate', ['pay_month' => now()->toDateString()]);
    expect(PayrollEntry::count())->toBe(1);
});

it('splits rent into SOMFIX fee and owner money and blocks over-paying owners', function () {
    $property = Property::factory()->create(['management_fee_type' => 'percent', 'management_fee_percent' => 10]);
    $fixed = Property::factory()->create(['management_fee_type' => 'fixed_per_unit', 'management_fee_fixed' => 20]);
    $this->actingAs(financeUser());

    $this->post('/finance/rent', ['property_id' => $property->id, 'rent_month' => now()->toDateString(), 'received_date' => now()->toDateString(), 'rent_due' => 1000, 'amount_collected' => 900, 'payment_method' => 'cash'])->assertSessionHasNoErrors();
    $this->post('/finance/rent', ['property_id' => $fixed->id, 'rent_month' => now()->toDateString(), 'received_date' => now()->toDateString(), 'amount_collected' => 400, 'payment_method' => 'cash'])->assertSessionHasNoErrors();
    $rows = RentCollection::orderBy('id')->get();
    expect((float) $rows[0]->fee_amount)->toBe(90.0)->and((float) $rows[0]->net_to_owner)->toBe(810.0)->and((float) $rows[0]->arrears)->toBe(100.0)
        ->and((float) $rows[1]->fee_amount)->toBe(20.0);

    $this->post('/finance/property-expenses', ['property_id' => $property->id, 'expense_date' => now()->toDateString(), 'category' => 'Utilities', 'description' => 'Water', 'amount' => 10, 'payment_method' => 'cash'])->assertSessionHasNoErrors();

    $payout = ['property_id' => $property->id, 'payout_date' => now()->toDateString(), 'payment_method' => 'bank_transfer'];
    $this->post('/finance/owner-payouts', [...$payout, 'amount' => 900])->assertSessionHasErrors('amount');
    $this->post('/finance/owner-payouts', [...$payout, 'amount' => 800])->assertSessionHasNoErrors();
    expect(OwnerPayout::count())->toBe(1);

    $this->get('/finance/owners/'.$property->id)->assertInertia(fn (Assert $p) => $p->where('position.balance', 0)->where('totals.fees', 90));

    $this->get('/finance/reports?year='.now()->year)->assertInertia(fn (Assert $p) => $p->where('report.revenue.management.total', 110));
});

it('builds the overview and exports the ledger', function () {
    billedJob();
    Expense::create(['expense_number' => 'EXP-1', 'expense_date' => now(), 'category' => 'Marketing', 'description' => 'Ads', 'amount' => 50, 'payment_method' => 'cash', 'status' => 'paid']);
    $this->actingAs(financeUser());
    $this->get('/finance-report')->assertOk()->assertInertia(fn (Assert $p) => $p->component('finance/index')->where('kpis.receivables', 300)->where('kpis.spentThisMonth', 50));
    $this->get('/finance/ledger?export=csv')->assertOk()->assertHeader('content-type', 'text/csv; charset=UTF-8');
    foreach (['jobs', 'technicians', 'owners', 'settings', 'payments', 'expenses', 'commissions', 'payroll', 'rent', 'property-expenses', 'owner-payouts'] as $page) {
        $this->get('/finance/'.$page)->assertOk();
    }
});

it('lets viewers read finance but not change it', function () {
    $this->actingAs(financeUser('viewer'));
    $this->get('/finance/expenses')->assertOk();
    $this->get('/finance/expenses/create')->assertForbidden();
    $this->post('/finance/expenses', [])->assertForbidden();
    $this->put('/finance/settings', [])->assertForbidden();
});

it('saves finance settings and uses the fee defaults', function () {
    $this->actingAs(financeUser());
    $this->put('/finance/settings', ['company_name' => 'SOMFIX', 'currency' => 'usd', 'mgmt_fee_percent' => 12, 'mgmt_fee_fixed' => 30, 'technician_commission_percent' => 55])->assertSessionHasNoErrors();
    $property = Property::factory()->create(['management_fee_type' => 'percent', 'management_fee_percent' => null]);
    $this->post('/finance/rent', ['property_id' => $property->id, 'rent_month' => now()->toDateString(), 'received_date' => now()->toDateString(), 'amount_collected' => 100, 'payment_method' => 'cash']);
    expect((float) RentCollection::sole()->fee_amount)->toBe(12.0);
});

it('serves the finance reports hub at /finance-report and redirects the old /finance url', function () {
    $this->actingAs(financeUser());

    $this->get('/finance?year=2025&report=invoices')->assertRedirect('/finance-report?year=2025&report=invoices');
    $this->get('/finance-report?report=invoices')->assertOk()->assertInertia(fn (Assert $p) => $p->component('finance/index')->where('activeReport', 'invoices')->where('dataset.key', 'invoices'));
    $this->get('/finance/reports/invoices/export?format=csv')->assertOk()->assertHeader('content-type', 'text/csv; charset=UTF-8');
    $this->get('/finance/reports/invoices/export?format=xlsx')->assertOk();
    $this->get('/finance/reports/nope/export')->assertNotFound();
});
