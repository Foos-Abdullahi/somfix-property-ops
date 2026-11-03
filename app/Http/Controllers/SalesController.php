<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\Finance;
use App\Models\Inventory;
use App\Models\Job;
use App\Models\JobLabor;
use App\Models\JobMaterial;
use App\Models\Lead;
use App\Models\Payment;
use App\Models\Property;
use App\Models\ServiceTeam;
use App\Models\Unit;
use App\Models\WorkOrder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class SalesController extends Controller
{
    public function index(): Response
    {
        $leads = Lead::query()->latest()->get();
        $jobs = Job::query()->latest()->get();
        $invoices = Finance::query()->where('type', 'invoice')->get();
        $payments = Payment::query()->whereBetween('paid_at', [now()->startOfMonth(), now()->endOfMonth()])->get();
        $convertedLeads = $leads->where('status', 'converted')->count();
        $completedJobs = $jobs->whereIn('status', ['completed', 'closed'])->count();
        $totalInvoiced = (float) $invoices->sum('amount');
        $totalPaid = (float) $invoices->sum('paid_amount');

        $monthlyTrend = collect(range(5, 0))->map(function (int $monthsAgo) use ($leads, $jobs): array {
            $month = now()->subMonths($monthsAgo);

            return [
                'month' => $month->format('M'),
                'leads' => $leads->filter(fn (Lead $lead): bool => $lead->created_at?->isSameMonth($month) ?? false)->count(),
                'jobs' => $jobs->filter(fn (Job $job): bool => $job->created_at?->isSameMonth($month) ?? false)->count(),
            ];
        })->values();

        return Inertia::render('sales/index', [
            'stats' => [
                'newLeads' => $leads->whereIn('status', ['new', 'contacted', 'inspection_scheduled'])->count(),
                'quoteValue' => (float) Finance::query()->where('type', 'quote')->whereIn('status', ['draft', 'sent', 'accepted'])->sum('amount'),
                'jobsInProgress' => $jobs->whereIn('status', ['approved', 'scheduled', 'in_progress', 'awaiting_verification'])->count(),
                'outstandingBalance' => (float) $invoices->sum('balance'),
                'collectedThisMonth' => (float) $payments->sum('amount'),
                'totalCustomers' => Customer::query()->where('status', 'active')->count(),
                'leadConversionRate' => $leads->isNotEmpty() ? (int) round(($convertedLeads / $leads->count()) * 100) : 0,
                'jobCompletionRate' => $jobs->isNotEmpty() ? (int) round(($completedJobs / $jobs->count()) * 100) : 0,
                'collectionRate' => $totalInvoiced > 0 ? (int) min(100, round(($totalPaid / $totalInvoiced) * 100)) : 0,
            ],
            'monthlyTrend' => $monthlyTrend,
            'recentJobs' => Job::query()->with('customer:id,name')->latest()->take(6)->get(),
            'recentLeads' => Lead::query()->with('customer:id,name')->latest()->take(6)->get(),
        ]);
    }

    public function customers(): Response
    {
        return Inertia::render('sales/customers/index', ['customers' => Customer::query()->withCount(['jobs', 'leads'])->latest()->get()]);
    }

    public function customerCreate(): Response { return Inertia::render('sales/customers/form'); }

    public function customerStore(Request $request): RedirectResponse
    {
        $customer = Customer::create($this->customerData($request));
        return to_route('sales.customers.show', $customer)->with('toast', ['type' => 'success', 'message' => 'Customer created successfully.']);
    }

    public function customerShow(Customer $customer): Response
    {
        return Inertia::render('sales/customers/show', ['customer' => $customer, 'jobs' => $customer->jobs()->latest()->get(), 'leads' => $customer->leads()->latest()->get()]);
    }

    public function customerEdit(Customer $customer): Response { return Inertia::render('sales/customers/form', ['customer' => $customer]); }

    public function customerUpdate(Request $request, Customer $customer): RedirectResponse
    {
        $customer->update($this->customerData($request));
        return to_route('sales.customers.show', $customer)->with('toast', ['type' => 'success', 'message' => 'Customer updated successfully.']);
    }

    public function customerDestroy(Customer $customer): RedirectResponse
    {
        $customer->delete();
        return to_route('sales.customers.index')->with('toast', ['type' => 'success', 'message' => 'Customer deleted successfully.']);
    }

    public function leads(): Response
    {
        return Inertia::render('sales/leads/index', ['leads' => Lead::query()->with('customer:id,name')->latest()->get()]);
    }

    public function leadCreate(): Response { return Inertia::render('sales/leads/form', $this->catalog()); }

    public function leadStore(Request $request): RedirectResponse
    {
        $lead = Lead::create($this->leadData($request));
        return to_route('sales.leads.show', $lead)->with('toast', ['type' => 'success', 'message' => 'Lead created successfully.']);
    }

    public function leadShow(Lead $lead): Response { return Inertia::render('sales/leads/show', ['lead' => $lead->load(['customer', 'property', 'unit'])]); }
    public function leadEdit(Lead $lead): Response { return Inertia::render('sales/leads/form', ['lead' => $lead, ...$this->catalog()]); }

    public function leadUpdate(Request $request, Lead $lead): RedirectResponse
    {
        $lead->update($this->leadData($request));
        return to_route('sales.leads.show', $lead)->with('toast', ['type' => 'success', 'message' => 'Lead updated successfully.']);
    }

    public function leadDestroy(Lead $lead): RedirectResponse
    {
        $lead->delete();
        return to_route('sales.leads.index')->with('toast', ['type' => 'success', 'message' => 'Lead deleted successfully.']);
    }

    public function createJobFromLead(Lead $lead): RedirectResponse
    {
        $job = Job::create([
            'job_number' => $this->nextNumber('JOB'), 'customer_id' => $lead->customer_id, 'lead_id' => $lead->id,
            'property_id' => $lead->property_id, 'unit_id' => $lead->unit_id, 'title' => $lead->title,
            'scope' => $lead->description, 'status' => 'approved', 'approved_value' => $lead->estimated_value ?? 0,
            'approved_date' => now(),
        ]);
        $lead->update(['status' => 'converted']);
        return to_route('sales.jobs.show', $job)->with('toast', ['type' => 'success', 'message' => 'Job created from lead.']);
    }

    public function jobs(): Response
    {
        return Inertia::render('sales/jobs/index', ['jobs' => Job::query()->with('customer:id,name')->latest()->get()]);
    }

    public function jobCreate(): Response { return Inertia::render('sales/jobs/form', $this->catalog()); }

    public function jobStore(Request $request): RedirectResponse
    {
        $job = Job::create(['job_number' => $this->nextNumber('JOB'), ...$this->jobData($request)]);
        return to_route('sales.jobs.show', $job)->with('toast', ['type' => 'success', 'message' => 'Job created successfully.']);
    }

    public function jobShow(Job $job): Response
    {
        $job->load(['customer', 'lead', 'property', 'unit', 'materials.inventory', 'labors.serviceTeam', 'finances.payments', 'workOrders.serviceTeam']);
        $materialCost = $job->materials->sum(fn (JobMaterial $line) => (float) $line->quantity * (float) $line->unit_cost);
        $laborCost = $job->labors->sum(fn (JobLabor $line) => (float) $line->hours * (float) $line->cost_rate);
        $invoiced = $job->finances->where('type', 'invoice')->sum('amount');
        return Inertia::render('sales/jobs/show', ['job' => $job, 'catalog' => $this->catalog(), 'profit' => ['revenue' => (float) $invoiced, 'materialCost' => $materialCost, 'laborCost' => $laborCost, 'grossProfit' => (float) $invoiced - $materialCost - $laborCost]]);
    }

    public function jobEdit(Job $job): Response { return Inertia::render('sales/jobs/form', ['job' => $job, ...$this->catalog()]); }

    public function jobUpdate(Request $request, Job $job): RedirectResponse
    {
        $job->update($this->jobData($request));
        return to_route('sales.jobs.show', $job)->with('toast', ['type' => 'success', 'message' => 'Job updated successfully.']);
    }

    public function jobDestroy(Job $job): RedirectResponse
    {
        $job->delete();
        return to_route('sales.jobs.index')->with('toast', ['type' => 'success', 'message' => 'Job deleted successfully.']);
    }

    public function addMaterial(Request $request, Job $job): RedirectResponse
    {
        $data = $request->validate(['inventory_id' => ['required', 'exists:inventories,id'], 'quantity' => ['required', 'numeric', 'gt:0'], 'selling_price' => ['nullable', 'numeric', 'min:0'], 'notes' => ['nullable', 'string']]);
        DB::transaction(function () use ($data, $job): void {
            $inventory = Inventory::lockForUpdate()->findOrFail($data['inventory_id']);
            if ((float) $inventory->current_stock < (float) $data['quantity']) abort(422, 'Not enough stock for this material.');
            JobMaterial::create(['job_id' => $job->id, 'inventory_id' => $inventory->id, 'quantity' => $data['quantity'], 'unit_cost' => $inventory->unit_cost, 'selling_price' => $data['selling_price'] ?? $inventory->unit_cost, 'notes' => $data['notes'] ?? null]);
            $stock = (float) $inventory->current_stock - (float) $data['quantity'];
            $inventory->update(['current_stock' => $stock, 'total_value' => $stock * (float) $inventory->unit_cost, 'status' => $stock <= 0 ? 'out_of_stock' : ($stock <= (float) $inventory->reorder_level ? 'low_stock' : 'in_stock')]);
        });
        return back()->with('toast', ['type' => 'success', 'message' => 'Material recorded and stock updated.']);
    }

    public function createWorkOrder(Job $job): RedirectResponse
    {
        $workOrder = WorkOrder::create([
            'job_id' => $job->id,
            'title' => $job->title,
            'description' => $job->scope ?: $job->title,
            'status' => 'pending',
            'assigned_date' => $job->scheduled_date,
        ]);

        if ($job->status === 'approved') {
            $job->update(['status' => 'scheduled']);
        }

        return to_route('work-orders.show', $workOrder)->with('toast', ['type' => 'success', 'message' => 'Work order created and linked to this job.']);
    }

    public function addLabor(Request $request, Job $job): RedirectResponse
    {
        $data = $request->validate(['service_team_id' => ['nullable', 'exists:service_teams,id'], 'hours' => ['required', 'numeric', 'gt:0'], 'cost_rate' => ['required', 'numeric', 'min:0'], 'selling_rate' => ['required', 'numeric', 'min:0'], 'work_date' => ['nullable', 'date'], 'notes' => ['nullable', 'string']]);
        $job->labors()->create($data);
        return back()->with('toast', ['type' => 'success', 'message' => 'Labor cost recorded.']);
    }

    public function recordPayment(Request $request, Finance $finance): RedirectResponse
    {
        abort_unless($finance->type === 'invoice', 404);
        $data = $request->validate(['amount' => ['required', 'numeric', 'gt:0', 'lte:'.$finance->balance], 'method' => ['required', Rule::in(['cash', 'evc_plus', 'bank_transfer', 'other'])], 'reference' => ['nullable', 'string', 'max:255'], 'paid_at' => ['required', 'date'], 'notes' => ['nullable', 'string']]);
        DB::transaction(function () use ($data, $finance, $request): void {
            Payment::create(['payment_number' => $this->nextNumber('PAY'), 'finance_id' => $finance->id, ...$data, 'received_by' => $request->user()?->name]);
            $paid = (float) $finance->payments()->sum('amount');
            $balance = max(0, (float) $finance->amount - $paid);
            $finance->update(['paid_amount' => $paid, 'balance' => $balance, 'paid_date' => $balance == 0.0 ? $data['paid_at'] : null, 'status' => $balance == 0.0 ? 'paid' : 'partially_paid']);
        });
        return back()->with('toast', ['type' => 'success', 'message' => 'Payment recorded successfully.']);
    }

    public function paymentCreate(Finance $finance): Response
    {
        abort_unless($finance->type === 'invoice', 404);
        return Inertia::render('sales/payments/create', ['invoice' => $finance->load('job.customer')]);
    }

    public function receipt(Payment $payment): Response
    {
        return Inertia::render('sales/payments/receipt', ['payment' => $payment->load('invoice.job.customer')]);
    }

    private function customerData(Request $request): array
    {
        return $request->validate(['name' => ['required', 'string', 'max:255'], 'type' => ['required', Rule::in(['individual', 'company'])], 'phone' => ['required', 'string', 'max:50'], 'email' => ['nullable', 'email', 'max:255'], 'address' => ['nullable', 'string', 'max:255'], 'status' => ['required', Rule::in(['active', 'inactive'])], 'notes' => ['nullable', 'string']]);
    }
    private function leadData(Request $request): array
    {
        return $request->validate(['customer_id' => ['nullable', 'exists:customers,id'], 'property_id' => ['nullable', 'exists:properties,id'], 'unit_id' => ['nullable', 'exists:units,id'], 'source' => ['required', Rule::in(['website', 'phone', 'whatsapp', 'walk_in', 'referral'])], 'service_category' => ['required', 'string', 'max:100'], 'title' => ['required', 'string', 'max:255'], 'description' => ['required', 'string'], 'status' => ['required', Rule::in(['new', 'contacted', 'inspection_scheduled', 'quoted', 'converted', 'closed'])], 'estimated_value' => ['nullable', 'numeric', 'min:0'], 'preferred_visit_date' => ['nullable', 'date'], 'notes' => ['nullable', 'string']]);
    }
    private function jobData(Request $request): array
    {
        return $request->validate(['customer_id' => ['nullable', 'exists:customers,id'], 'lead_id' => ['nullable', 'exists:leads,id'], 'property_id' => ['nullable', 'exists:properties,id'], 'unit_id' => ['nullable', 'exists:units,id'], 'title' => ['required', 'string', 'max:255'], 'scope' => ['nullable', 'string'], 'status' => ['required', Rule::in(['approved', 'scheduled', 'in_progress', 'awaiting_verification', 'completed', 'invoiced', 'closed', 'cancelled'])], 'approved_value' => ['required', 'numeric', 'min:0'], 'approved_date' => ['nullable', 'date'], 'scheduled_date' => ['nullable', 'date'], 'completed_date' => ['nullable', 'date'], 'completion_notes' => ['nullable', 'string']]);
    }
    private function catalog(): array
    {
        return ['customers' => Customer::orderBy('name')->get(['id', 'name']), 'properties' => Property::orderBy('name')->get(['id', 'name']), 'units' => Unit::orderBy('unit_number')->get(['id', 'unit_number', 'property_id']), 'inventories' => Inventory::where('current_stock', '>', 0)->orderBy('name')->get(['id', 'name', 'current_stock', 'unit_cost']), 'serviceTeams' => ServiceTeam::where('status', 'active')->orderBy('name')->get(['id', 'name', 'specialization'])];
    }
    private function nextNumber(string $prefix): string
    {
        return $prefix.'-'.now()->format('Ym').'-'.str_pad((string) random_int(1, 9999), 4, '0', STR_PAD_LEFT);
    }
}
