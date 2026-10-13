<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreFinanceRequest;
use App\Http\Requests\UpdateFinanceRequest;
use App\Models\Finance;
use App\Models\Property;
use App\Models\Tenant;
use App\Models\Unit;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class FinanceController extends Controller
{
    /**
     * Display the main Finance module overview.
     */
    public function index(): Response
    {
        $finances = Finance::query()
            ->with(['property', 'unit', 'tenant'])
            ->latest()
            ->get();

        $invoices = $finances->where('type', 'invoice')->values();
        $quotes = $finances->where('type', 'quote')->values();

        return Inertia::render('finance/index', [
            'finances' => $finances,
            'invoices' => $invoices,
            'quotations' => $quotes,
            'stats' => [
                'totalRecords' => $finances->count(),
                'totalAmount' => (float) $finances->sum('amount'),
                'totalPaid' => (float) $finances->sum('paid_amount'),
                'totalBalance' => (float) $finances->sum('balance'),
                'invoicesCount' => $invoices->count(),
                'quotationsCount' => $quotes->count(),
                'invoicedAmount' => (float) $invoices->sum('amount'),
                'quotedAmount' => (float) $quotes->sum('amount'),
            ],
        ]);
    }

    /**
     * Display the Invoices list.
     */
    public function invoicesIndex(): Response
    {
        $invoices = Finance::query()
            ->where('type', 'invoice')
            ->with(['property', 'unit', 'tenant'])
            ->latest()
            ->get();

        return Inertia::render('finance/invoices/index', [
            'invoices' => $invoices,
            'stats' => [
                'totalInvoices' => $invoices->count(),
                'totalAmount' => (float) $invoices->sum('amount'),
                'totalPaid' => (float) $invoices->sum('paid_amount'),
                'totalBalance' => (float) $invoices->sum('balance'),
                'overdueCount' => $invoices->where('status', 'overdue')->count(),
                'paidCount' => $invoices->where('status', 'paid')->count(),
            ],
        ]);
    }

    /**
     * Display the Quotations list.
     */
    public function quotationsIndex(): Response
    {
        $quotations = Finance::query()
            ->where('type', 'quote')
            ->with(['property', 'unit', 'tenant'])
            ->latest()
            ->get();

        return Inertia::render('finance/quotations/index', [
            'quotations' => $quotations,
            'stats' => [
                'totalQuotations' => $quotations->count(),
                'totalAmount' => (float) $quotations->sum('amount'),
                'draftCount' => $quotations->where('status', 'draft')->count(),
                'sentCount' => $quotations->where('status', 'sent')->count(),
            ],
        ]);
    }

    /**
     * Show the document type selector (invoice vs quotation).
     */
    public function create(): Response
    {
        return Inertia::render('finance/create');
    }

    /**
     * Show the Invoice creation form.
     */
    public function createInvoice(): Response
    {
        return Inertia::render('finance/invoices/create', $this->formCatalog());
    }

    /**
     * Store a newly created invoice.
     */
    public function storeInvoice(StoreFinanceRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $validated['type'] = 'invoice';

        $finance = Finance::create($validated);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Invoice created successfully.',
        ]);

        return to_route('finance.invoices.show', $finance);
    }

    /**
     * Display the specified invoice.
     */
    public function showInvoice(Finance $finance): Response
    {
        $finance->load(['property', 'unit', 'tenant']);

        return Inertia::render('finance/invoices/show', [
            'finance' => $finance,
        ]);
    }

    /**
     * Show the invoice edit form.
     */
    public function editInvoice(Finance $finance): Response
    {
        $finance->load(['property', 'unit', 'tenant']);

        return Inertia::render('finance/invoices/edit', [
            'finance' => $finance,
            ...$this->formCatalog(),
        ]);
    }

    /**
     * Update the specified invoice.
     */
    public function updateInvoice(UpdateFinanceRequest $request, Finance $finance): RedirectResponse
    {
        $validated = $request->validated();
        $validated['type'] = 'invoice';

        $finance->update($validated);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Invoice updated successfully.',
        ]);

        return to_route('finance.invoices.show', $finance);
    }

    /**
     * Delete the specified invoice.
     */
    public function destroyInvoice(Finance $finance): RedirectResponse
    {
        $finance->delete();

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Invoice deleted successfully.',
        ]);

        return to_route('finance.invoices.index');
    }

    /**
     * Show the Quotation creation form.
     */
    public function createQuote(): Response
    {
        return Inertia::render('finance/quotations/create', $this->formCatalog());
    }

    /**
     * Store a newly created quotation.
     */
    public function storeQuote(StoreFinanceRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $validated['type'] = 'quote';

        $finance = Finance::create($validated);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Quotation created successfully.',
        ]);

        return to_route('finance.quotations.show', $finance);
    }

    /**
     * Display the specified quotation.
     */
    public function showQuote(Finance $finance): Response
    {
        $finance->load(['property', 'unit', 'tenant']);

        return Inertia::render('finance/quotations/show', [
            'finance' => $finance,
        ]);
    }

    /**
     * Show the quotation edit form.
     */
    public function editQuote(Finance $finance): Response
    {
        $finance->load(['property', 'unit', 'tenant']);

        return Inertia::render('finance/quotations/edit', [
            'finance' => $finance,
            ...$this->formCatalog(),
        ]);
    }

    /**
     * Update the specified quotation.
     */
    public function updateQuote(UpdateFinanceRequest $request, Finance $finance): RedirectResponse
    {
        $validated = $request->validated();
        $validated['type'] = 'quote';

        $finance->update($validated);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Quotation updated successfully.',
        ]);

        return to_route('finance.quotations.show', $finance);
    }

    /**
     * Convert quotation to invoice.
     */
    public function convertQuote(Finance $finance): RedirectResponse
    {
        $invoiceNumber = 'INV-'.date('Ym').'-'.rand(1000, 9999);

        $finance->update([
            'type' => 'invoice',
            'invoice_number' => $invoiceNumber,
            'status' => 'sent',
        ]);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => "Quotation converted to Invoice {$invoiceNumber} successfully.",
        ]);

        return to_route('finance.invoices.show', $finance);
    }

    /**
     * Delete the specified quotation.
     */
    public function destroyQuote(Finance $finance): RedirectResponse
    {
        $finance->delete();

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Quotation deleted successfully.',
        ]);

        return to_route('finance.quotations.index');
    }

    /**
     * Show the printable Invoice / Quotation document.
     */
    public function print(Finance $finance): Response
    {
        $finance->load(['property', 'unit', 'tenant']);

        return Inertia::render('finance/print', [
            'finance' => $finance,
            'company' => [
                'name' => config('app.name', 'SOMFIX Property Ops'),
                'address' => config('company.address', ''),
                'phone' => config('company.phone', ''),
                'email' => config('company.email', ''),
            ],
        ]);
    }

    /**
     * Generic store fallback.
     */
    public function store(StoreFinanceRequest $request): RedirectResponse
    {
        $finance = Finance::create($request->validated());

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Finance record created successfully.',
        ]);

        if ($finance->type === 'quote') {
            return to_route('finance.quotations.show', $finance);
        }

        return to_route('finance.invoices.show', $finance);
    }

    /**
     * Generic show fallback.
     */
    public function show(Finance $finance): Response|RedirectResponse
    {
        if ($finance->type === 'quote') {
            return to_route('finance.quotations.show', $finance);
        }

        return to_route('finance.invoices.show', $finance);
    }

    /**
     * Generic edit fallback.
     */
    public function edit(Finance $finance): Response|RedirectResponse
    {
        if ($finance->type === 'quote') {
            return to_route('finance.quotations.edit', $finance);
        }

        return to_route('finance.invoices.edit', $finance);
    }

    /**
     * Generic update fallback.
     */
    public function update(UpdateFinanceRequest $request, Finance $finance): RedirectResponse
    {
        $finance->update($request->validated());

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Finance record updated successfully.',
        ]);

        if ($finance->type === 'quote') {
            return to_route('finance.quotations.show', $finance);
        }

        return to_route('finance.invoices.show', $finance);
    }

    /**
     * Generic destroy fallback.
     */
    public function destroy(Finance $finance): RedirectResponse
    {
        $type = $finance->type;
        $finance->delete();

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Finance record deleted successfully.',
        ]);

        if ($type === 'quote') {
            return to_route('finance.quotations.index');
        }

        return to_route('finance.invoices.index');
    }

    /**
     * Shared form catalog data (properties, units, tenants).
     */
    private function formCatalog(): array
    {
        return [
            'properties' => Property::query()->orderBy('name')->get(['id', 'name']),
            'units' => Unit::query()->orderBy('unit_number')->get(['id', 'unit_number']),
            'tenants' => Tenant::query()->orderBy('first_name')->get(['id', 'first_name', 'last_name']),
        ];
    }
}
