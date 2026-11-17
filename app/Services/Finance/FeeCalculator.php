<?php

namespace App\Services\Finance;

use App\Models\FinanceSetting;
use App\Models\Property;
use App\Models\ServiceTeam;

/** SOMFIX's earning rules: management fee on rent, commission to external technicians. */
class FeeCalculator
{
    /**
     * Fee SOMFIX keeps from one rent payment.
     *
     * @return array{type: string, fee: float, net: float}
     */
    public function rent(Property $property, float $collected): array
    {
        $settings = FinanceSetting::values();
        $type = $property->management_fee_type ?: 'percent';

        if ($type === 'fixed_per_unit') {
            $rate = $property->management_fee_fixed ?? $settings['mgmt_fee_fixed'];
            $fee = $collected > 0 ? (float) $rate : 0.0;
        } else {
            $rate = $property->management_fee_percent ?? $settings['mgmt_fee_percent'];
            $fee = $collected * (float) $rate / 100;
        }
        $fee = round(min($fee, $collected), 2);

        return ['type' => $type, 'fee' => $fee, 'net' => round($collected - $fee, 2)];
    }

    public function commissionPercent(?ServiceTeam $technician): float
    {
        return (float) ($technician?->commission_percent ?? FinanceSetting::get('technician_commission_percent'));
    }

    public function commission(float $base, float $percent): float
    {
        return round(max(0, $base) * $percent / 100, 2);
    }
}
