<?php

use App\Models\Customer;
use App\Models\Finance;
use App\Models\Inventory;
use App\Models\Job;
use App\Models\JobLabor;
use App\Models\JobMaterial;
use App\Models\Lead;
use App\Models\Payment;
use App\Models\RepairRequest;
use App\Models\Role;
use App\Models\ServiceTeam;
use App\Models\User;
use App\Models\WorkOrder;
use Inertia\Testing\AssertableInertia as Assert;

it('runs the complete website request to paid and closed job workflow', function () {
    $this->get('/')->assertOk()->assertInertia(fn (Assert $page) => $page->component('welcome'));

    $this->post('/repair-requests', [
        'name' => 'Hodan Ali',
        'phone' => '0615210900',
        'area' => 'Hodan District',
        'service' => 'Plumbing',
        'message' => 'Kitchen pipe is leaking and needs an inspection.',
    ])->assertSessionHasNoErrors()->assertRedirect('/contact');

    $request = RepairRequest::query()->sole();
    $admin = User::factory()->create([
        'role_id' => Role::where('slug', 'administrator')->sole()->id,
        'is_active' => true,
    ]);

    $this->actingAs($admin)
        ->post(route('repair-requests.convert', $request))
        ->assertSessionHasNoErrors();

    $customer = Customer::query()->sole();
    $lead = Lead::query()->sole();
    expect($request->fresh()->status)->toBe('converted')
        ->and($request->fresh()->customer_id)->toBe($customer->id)
        ->and($request->fresh()->lead_id)->toBe($lead->id)
        ->and($lead->source)->toBe('website')
        ->and($lead->status)->toBe('new');

    $this->post(route('sales.leads.create-job', $lead))->assertSessionHasNoErrors();
    $job = Job::query()->sole();
    expect($lead->fresh()->status)->toBe('converted')
        ->and($job->customer_id)->toBe($customer->id)
        ->and($job->lead_id)->toBe($lead->id);

    $team = ServiceTeam::factory()->create(['status' => 'active']);
    $inventory = Inventory::factory()->create(['opening_stock' => 20, 'current_stock' => 20, 'reorder_level' => 5, 'unit_cost' => 12.50, 'total_value' => 250, 'status' => 'in_stock']);

    $this->post(route('sales.jobs.work-orders.store', $job))->assertSessionHasNoErrors();
    $workOrder = WorkOrder::query()->sole();
    expect($job->fresh()->status)->toBe('scheduled')->and($workOrder->job_id)->toBe($job->id);

    $this->put(route('work-orders.update', $workOrder), [
        'service_team_id' => $team->id,
        'title' => $workOrder->title,
        'description' => $workOrder->description,
        'status' => 'completed',
        'assigned_date' => now()->toDateString(),
        'started_date' => now()->toDateString(),
        'completed_date' => now()->toDateString(),
        'estimated_hours' => 3,
        'actual_hours' => 2.5,
        'notes' => 'Leak repaired and pressure tested.',
    ])->assertSessionHasNoErrors();

    $this->post(route('sales.jobs.materials.store', $job), [
        'inventory_id' => $inventory->id,
        'quantity' => 2,
        'selling_price' => 18,
        'notes' => 'Replacement fittings',
    ])->assertSessionHasNoErrors();

    $this->post(route('sales.jobs.labors.store', $job), [
        'service_team_id' => $team->id,
        'hours' => 2.5,
        'cost_rate' => 8,
        'selling_rate' => 15,
        'work_date' => now()->toDateString(),
        'notes' => 'On-site plumbing work',
    ])->assertSessionHasNoErrors();

    expect(JobMaterial::query()->count())->toBe(1)
        ->and(JobLabor::query()->count())->toBe(1)
        ->and((float) $inventory->fresh()->current_stock)->toBe(18.0);

    $this->post(route('finance.quotations.store'), [
        'invoice_number' => 'QUO-E2E-001',
        'title' => 'Kitchen plumbing repair',
        'description' => "• Replacement fittings (qty: 2 × USD 18)\n• Plumbing labor (qty: 2.5 × USD 15)",
        'type' => 'quote',
        'currency' => 'USD',
        'amount' => 73.50,
        'paid_amount' => 0,
        'balance' => 73.50,
        'due_date' => now()->addDays(7)->toDateString(),
        'status' => 'sent',
        'job_id' => $job->id,
        'recipient_name' => $customer->name,
        'notes' => 'Prepared from completed field work.',
    ])->assertSessionHasNoErrors();

    $quote = Finance::query()->where('type', 'quote')->sole();
    $this->post(route('finance.quotations.convert', $quote))->assertSessionHasNoErrors();
    $invoice = Finance::query()->where('type', 'invoice')->sole();
    expect($quote->fresh()->status)->toBe('accepted')
        ->and($invoice->source_quote_id)->toBe($quote->id)
        ->and($invoice->job_id)->toBe($job->id);

    $this->post(route('sales.invoices.payments.store', $invoice), [
        'amount' => 73.50,
        'method' => 'evc_plus',
        'reference' => '652109',
        'paid_at' => now()->toDateString(),
        'notes' => 'Paid through merchant number 65 21 09.',
    ])->assertSessionHasNoErrors();

    $payment = Payment::query()->sole();
    expect($invoice->fresh()->status)->toBe('paid')
        ->and((float) $invoice->fresh()->balance)->toBe(0.0)
        ->and($payment->reference)->toBe('652109');

    $this->put(route('sales.jobs.update', $job), [
        'customer_id' => $customer->id,
        'lead_id' => $lead->id,
        'title' => $job->title,
        'scope' => $job->scope,
        'status' => 'closed',
        'approved_value' => 73.50,
        'approved_date' => now()->toDateString(),
        'scheduled_date' => now()->toDateString(),
        'completed_date' => now()->toDateString(),
        'completion_notes' => 'Customer confirmed the repair and paid the invoice.',
    ])->assertSessionHasNoErrors();

    $this->get(route('sales.payments.receipt', $payment))->assertOk()->assertInertia(fn (Assert $page) => $page->component('sales/payments/receipt'));
    $this->get(route('sales.index'))->assertOk()->assertInertia(fn (Assert $page) => $page->component('sales/index'));
    expect($job->fresh()->status)->toBe('closed');
});
