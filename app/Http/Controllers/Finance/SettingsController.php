<?php

namespace App\Http\Controllers\Finance;

use App\Http\Controllers\Controller;
use App\Models\FinanceSetting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SettingsController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('finance/settings/index', ['settings' => FinanceSetting::values()]);
    }

    public function update(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'company_name' => ['required', 'string', 'max:120'],
            'company_address' => ['nullable', 'string', 'max:255'],
            'company_phone' => ['nullable', 'string', 'max:50'],
            'company_email' => ['nullable', 'email', 'max:255'],
            'currency' => ['required', 'string', 'size:3'],
            'mgmt_fee_percent' => ['required', 'numeric', 'min:0', 'max:100'],
            'mgmt_fee_fixed' => ['required', 'numeric', 'min:0', 'max:99999999'],
            'technician_commission_percent' => ['required', 'numeric', 'min:0', 'max:100'],
        ]);
        FinanceSetting::put([...$data, 'currency' => strtoupper($data['currency'])]);
        Inertia::flash('toast', ['type' => 'success', 'message' => 'Finance settings saved.']);

        return back();
    }
}
