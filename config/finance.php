<?php

/*
 * Finance & accounting configuration.
 *
 * Mirrors the SOMFIX Finance, Accounting & HR workbook: SOMFIX earns a
 * management fee on rent it collects for owners and a service fee on
 * maintenance jobs. Rent and materials are passed through at cost.
 * The "defaults" below are fallbacks; administrators can override them on
 * the Finance Settings page (stored in the finance_settings table).
 */
return [
    'defaults' => [
        'company_name' => env('APP_NAME', 'SOMFIX'),
        'company_address' => '',
        'company_phone' => '',
        'company_email' => '',
        'currency' => 'USD',
        // % of rent collected, used when a property has no fee of its own.
        'mgmt_fee_percent' => 10,
        // Fixed fee per unit / month when a property is on "fixed per unit".
        'mgmt_fee_fixed' => 25,
        // % of job service fee paid to external technicians.
        'technician_commission_percent' => 60,
    ],

    'payment_methods' => [
        'cash' => 'Cash',
        'evc_plus' => 'EVC Plus',
        'zaad' => 'ZAAD',
        'edahab' => 'eDahab',
        'bank_transfer' => 'Bank Transfer',
        'cheque' => 'Cheque',
        'other' => 'Other',
    ],

    'expense_categories' => [
        'Office Rent & Utilities',
        'Transport & Fuel',
        'Tools & Equipment',
        'Communication & Internet',
        'Marketing',
        'Office Supplies',
        'Bank & Mobile Money Charges',
        'Licenses & Fees',
        'Materials & Supplies',
        'Other',
    ],

    'owner_expense_categories' => [
        'Repairs & Maintenance',
        'Utilities',
        'Cleaning',
        'Security',
        'Taxes & Levies',
        'Insurance',
        'Other',
    ],

    'staff_types' => [
        'in_house' => 'In-house employee (salaried)',
        'external' => 'External technician (commission)',
    ],
];
