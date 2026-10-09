<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreLeaseRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'tenant_id' => ['required', 'exists:tenants,id'],
            'unit_id' => ['required', 'exists:units,id'],
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after:start_date'],
            'monthly_rent' => ['required', 'numeric', 'min:0', 'max:999999.99'],
            'deposit_amount' => ['required', 'numeric', 'min:0', 'max:999999.99'],
            'status' => ['required', 'in:active,expired,pending,terminated'],
            'payment_due_day' => ['required', 'integer', 'min:1', 'max:28'],
            'currency' => ['required', 'string', 'max:3'],
            'notes' => ['nullable', 'string', 'max:5000'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'tenant_id.required' => 'Please select a tenant.',
            'tenant_id.exists' => 'The selected tenant does not exist.',
            'unit_id.required' => 'Please select a unit.',
            'unit_id.exists' => 'The selected unit does not exist.',
            'start_date.required' => 'Please enter a start date.',
            'start_date.date' => 'Please enter a valid start date.',
            'end_date.required' => 'Please enter an end date.',
            'end_date.date' => 'Please enter a valid end date.',
            'end_date.after' => 'The end date must be after the start date.',
            'monthly_rent.required' => 'Please enter the monthly rent amount.',
            'monthly_rent.numeric' => 'Please enter a valid monthly rent amount.',
            'monthly_rent.min' => 'Monthly rent cannot be negative.',
            'deposit_amount.required' => 'Please enter the deposit amount.',
            'deposit_amount.numeric' => 'Please enter a valid deposit amount.',
            'deposit_amount.min' => 'Deposit amount cannot be negative.',
            'status.required' => 'Please select a lease status.',
            'status.in' => 'Please select a valid lease status.',
            'payment_due_day.required' => 'Please select a payment due day.',
            'payment_due_day.integer' => 'Please select a valid payment due day.',
            'payment_due_day.min' => 'Payment due day must be between 1 and 28.',
            'payment_due_day.max' => 'Payment due day must be between 1 and 28.',
            'currency.required' => 'Please select a currency.',
            'currency.max' => 'Currency code must be 3 characters or less.',
        ];
    }
}
