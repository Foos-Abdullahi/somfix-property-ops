<?php

namespace Database\Seeders;

use App\Models\Customer;
use App\Models\Expense;
use App\Models\Finance;
use App\Models\Inventory;
use App\Models\Job;
use App\Models\JobMaterial;
use App\Models\OwnerPayout;
use App\Models\Payment;
use App\Models\PayrollEntry;
use App\Models\Property;
use App\Models\PropertyExpense;
use App\Models\RentCollection;
use App\Models\ServiceTeam;
use App\Models\TechnicianPayout;
use App\Services\Finance\FeeCalculator;
use App\Services\Finance\InvoiceService;
use Illuminate\Database\Seeder;

/**
 * Optional sample data that mirrors the SOMFIX finance workbook (Oct–Nov).
 * Run with: php artisan db:seed --class=FinanceDemoSeeder
 */
class FinanceDemoSeeder extends Seeder
{
    public function run(): void
    {
        $fees = app(FeeCalculator::class);
        $m = now()->startOfMonth();

        $team = [
            'ahmed' => ServiceTeam::create(['name' => 'Ahmed Hassan', 'specialization' => 'General Manager', 'phone' => '+252 61 000 0001', 'email' => 'ahmed@example.test', 'status' => 'active', 'staff_type' => 'in_house', 'monthly_salary' => 900, 'monthly_allowances' => 150]),
            'hodan' => ServiceTeam::create(['name' => 'Hodan Ali', 'specialization' => 'Accountant', 'phone' => '+252 61 000 0002', 'email' => 'hodan@example.test', 'status' => 'active', 'staff_type' => 'in_house', 'monthly_salary' => 600, 'monthly_allowances' => 100]),
            'mohamed' => ServiceTeam::create(['name' => 'Mohamed Abdi', 'specialization' => 'Plumbing', 'phone' => '+252 61 000 0003', 'email' => 'mohamed@example.test', 'status' => 'active', 'staff_type' => 'in_house', 'monthly_salary' => 450, 'monthly_allowances' => 80]),
            'yusuf' => ServiceTeam::create(['name' => 'Yusuf Omar', 'specialization' => 'Electrical', 'phone' => '+252 61 000 0101', 'email' => 'yusuf@example.test', 'status' => 'active', 'staff_type' => 'external', 'commission_percent' => 60]),
            'abdullahi' => ServiceTeam::create(['name' => 'Abdullahi Farah', 'specialization' => 'AC & Cooling', 'phone' => '+252 61 000 0102', 'email' => 'abdullahi@example.test', 'status' => 'active', 'staff_type' => 'external', 'commission_percent' => 65]),
        ];

        foreach ([1, 0] as $back) {
            $month = $m->copy()->subMonths($back);
            foreach (['ahmed', 'hodan', 'mohamed'] as $k) {
                $t = $team[$k];
                $gross = (float) $t->monthly_salary + (float) $t->monthly_allowances;
                PayrollEntry::create(['payroll_number' => 'PAYR-'.$month->format('Ym').'-'.$t->id, 'service_team_id' => $t->id, 'pay_month' => $month, 'basic_salary' => $t->monthly_salary, 'allowances' => $t->monthly_allowances, 'gross_pay' => $gross, 'net_pay' => $gross, 'status' => $back ? 'paid' : 'pending', 'paid_at' => $back ? $month->copy()->endOfMonth() : null, 'payment_method' => $back ? 'evc_plus' : null]);
            }
        }

        $props = [
            Property::create(['name' => 'Hodan Apartments, Block A', 'property_type' => 'apartment', 'owner_name' => 'Faadumo Warsame', 'owner_phone' => '+252 61 100 0001', 'district' => 'Hodan', 'city' => 'Mogadishu', 'address' => 'Hodan', 'units_count' => 6, 'status' => 'active', 'management_fee_type' => 'percent', 'management_fee_percent' => 10]),
            Property::create(['name' => 'Villa 12, KM4', 'property_type' => 'house', 'owner_name' => 'Abdirahman Nur', 'owner_phone' => '+252 61 100 0002', 'district' => 'Wadajir', 'city' => 'Mogadishu', 'address' => 'KM4', 'units_count' => 1, 'status' => 'active', 'management_fee_type' => 'percent', 'management_fee_percent' => 8]),
            Property::create(['name' => 'Shops Complex, Bakara', 'property_type' => 'commercial', 'owner_name' => 'Sahra Mohamed', 'owner_phone' => '+252 61 100 0003', 'district' => 'Hawlwadaag', 'city' => 'Mogadishu', 'address' => 'Bakara', 'units_count' => 4, 'status' => 'active', 'management_fee_type' => 'fixed_per_unit', 'management_fee_fixed' => 20]),
        ];
        $rents = [[0, 'Ali Jama', 300], [0, 'Nimco Aden', 300], [1, 'Hassan Osman', 1200], [2, 'Bashir Shop', 400]];
        foreach ([1, 0] as $back) {
            $month = $m->copy()->subMonths($back);
            foreach ($rents as $i => [$p, $tenant, $amount]) {
                $fee = $fees->rent($props[$p], $amount);
                RentCollection::create(['receipt_number' => 'RC-'.$month->format('Ym').'-'.($i + 1), 'property_id' => $props[$p]->id, 'tenant_name' => $tenant, 'rent_month' => $month, 'received_date' => $month->copy()->addDays(3), 'rent_due' => $amount, 'amount_collected' => $amount, 'arrears' => 0, 'payment_method' => 'evc_plus', 'fee_type' => $fee['type'], 'fee_amount' => $fee['fee'], 'net_to_owner' => $fee['net']]);
            }
        }
        PropertyExpense::create(['expense_number' => 'OWX-DEMO-1', 'property_id' => $props[0]->id, 'expense_date' => $m->copy()->subMonth()->addDays(14), 'category' => 'Utilities', 'description' => 'Water bill Block A', 'vendor' => 'Benadir Water', 'amount' => 45, 'payment_method' => 'evc_plus']);
        PropertyExpense::create(['expense_number' => 'OWX-DEMO-2', 'property_id' => $props[2]->id, 'expense_date' => $m->copy()->addDays(9), 'category' => 'Security', 'description' => 'Night guard', 'vendor' => 'Guard service', 'amount' => 100, 'payment_method' => 'cash']);
        OwnerPayout::create(['payout_number' => 'OPY-DEMO-1', 'property_id' => $props[0]->id, 'payout_date' => $m->copy()->subMonth()->addDays(9), 'amount' => 495, 'payment_method' => 'bank_transfer', 'reference' => 'TRF-1001']);

        foreach ([['Office Rent & Utilities', 'Office rent', 400], ['Transport & Fuel', 'Fuel for service vehicle', 85], ['Tools & Equipment', 'Pipe wrench set & drill bits', 130], ['Communication & Internet', 'Internet & staff airtime', 60], ['Marketing', 'Facebook ads', 45]] as $i => [$cat, $desc, $amt]) {
            Expense::create(['expense_number' => 'EXP-DEMO-'.($i + 1), 'expense_date' => $m->copy()->subDays($i * 6), 'category' => $cat, 'description' => $desc, 'vendor' => 'Vendor '.($i + 1), 'amount' => $amt, 'payment_method' => $i % 2 ? 'cash' : 'bank_transfer', 'status' => $i === 4 ? 'pending' : 'paid', 'approved_by' => 'Ahmed Hassan']);
        }

        $jobs = [
            ['Khadra Yasin', 'Rewire kitchen & install sockets', 150, 210, 210, 'yusuf'],
            ['Hotel Lido', 'Service 4 split AC units', 120, 220, 120, 'abdullahi'],
            ['Faadumo Warsame', 'Replace leaking pipes Unit A2', 80, 92, 92, null],
            ['Omar Sharif', 'Repaint living room', 200, 260, 0, null],
        ];
        foreach ($jobs as $i => [$name, $title, $materials, $invoice, $paid, $tech]) {
            $customer = Customer::create(['name' => $name, 'phone' => '+252 61 200 000'.$i, 'type' => 'individual', 'status' => 'active']);
            $job = Job::create(['job_number' => 'JOB-DEMO-'.($i + 1), 'customer_id' => $customer->id, 'title' => $title, 'status' => 'completed', 'approved_value' => $invoice, 'approved_date' => $m->copy()->addDays($i), 'completed_date' => $m->copy()->addDays($i + 2)]);
            $item = Inventory::query()->create(['name' => 'Materials for '.$title, 'description' => $title, 'sku' => 'DEMO-'.($i + 1), 'category' => 'materials', 'unit_of_measure' => 'lot', 'supplier' => 'Local hardware', 'opening_stock' => 5, 'current_stock' => 4, 'reorder_level' => 1, 'unit_cost' => $materials, 'total_value' => $materials * 4, 'status' => 'in_stock']);
            JobMaterial::create(['job_id' => $job->id, 'inventory_id' => $item->id, 'quantity' => 1, 'unit_cost' => $materials, 'selling_price' => $materials]);
            $inv = Finance::create(['invoice_number' => 'INV-DEMO-'.($i + 1), 'title' => $title, 'description' => $title, 'type' => 'invoice', 'currency' => 'USD', 'amount' => $invoice, 'paid_amount' => 0, 'balance' => $invoice, 'due_date' => $m->copy()->addDays($i + 12), 'status' => 'sent', 'job_id' => $job->id, 'recipient_name' => $name]);
            if ($paid > 0) {
                Payment::create(['payment_number' => 'PAY-DEMO-'.($i + 1), 'finance_id' => $inv->id, 'amount' => $paid, 'method' => $i % 2 ? 'cash' : 'evc_plus', 'paid_at' => $m->copy()->addDays($i + 3), 'received_by' => 'Hodan Ali']);
            }
            app(InvoiceService::class)->recalculate($inv->fresh());
            if ($tech) {
                $base = $invoice - $materials;
                $pct = (float) $team[$tech]->commission_percent;
                TechnicianPayout::create(['payout_number' => 'COM-DEMO-'.($i + 1), 'service_team_id' => $team[$tech]->id, 'job_id' => $job->id, 'earned_date' => $m->copy()->addDays($i + 3), 'base_amount' => $base, 'percent' => $pct, 'amount' => $fees->commission($base, $pct), 'status' => $i ? 'pending' : 'paid', 'paid_at' => $i ? null : $m->copy()->addDays(5), 'payment_method' => $i ? null : 'evc_plus']);
            }
        }
    }
}
