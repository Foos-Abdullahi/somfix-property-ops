<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** One salary line per in-house employee per month. */
class PayrollEntry extends Model
{
    protected $fillable = ['payroll_number', 'service_team_id', 'pay_month', 'basic_salary', 'allowances', 'overtime', 'bonus', 'gross_pay', 'advance_deduction', 'absence_deduction', 'other_deduction', 'total_deductions', 'net_pay', 'status', 'paid_at', 'payment_method', 'reference', 'notes'];

    protected function casts(): array
    {
        $money = fn () => 'decimal:2';

        return [
            'pay_month' => 'date', 'paid_at' => 'date',
            'basic_salary' => $money(), 'allowances' => $money(), 'overtime' => $money(), 'bonus' => $money(), 'gross_pay' => $money(),
            'advance_deduction' => $money(), 'absence_deduction' => $money(), 'other_deduction' => $money(), 'total_deductions' => $money(), 'net_pay' => $money(),
        ];
    }

    /** @return BelongsTo<ServiceTeam, $this> */
    public function serviceTeam(): BelongsTo
    {
        return $this->belongsTo(ServiceTeam::class);
    }
}
