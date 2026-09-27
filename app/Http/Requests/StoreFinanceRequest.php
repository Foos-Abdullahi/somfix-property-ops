<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreFinanceRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return (bool) $this->user();
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'invoice_number' => ['required', 'string', 'unique:finances,invoice_number'],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string'],
            'type' => ['required', Rule::in(['invoice', 'quote', 'expense'])],
            'currency' => ['required', Rule::in(['USD', 'SOS'])],
            'amount' => ['required', 'numeric', 'min:0'],
            'paid_amount' => ['required', 'numeric', 'min:0'],
            'balance' => ['required', 'numeric', 'min:0'],
            'due_date' => ['nullable', 'date'],
            'paid_date' => ['nullable', 'date'],
            'status' => ['required', Rule::in(['draft', 'sent', 'paid', 'overdue', 'cancelled'])],
            'property_id' => ['nullable', 'exists:properties,id'],
            'unit_id' => ['nullable', 'exists:units,id'],
            'tenant_id' => ['nullable', 'exists:tenants,id'],
            'recipient_name' => ['nullable', 'string', 'max:255'],
            'recipient_email' => ['nullable', 'email', 'max:255'],
            'notes' => ['nullable', 'string'],
        ];
    }

    /**
     * Get the validation messages that apply to the request.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'invoice_number.required' => 'Please enter an invoice number.',
            'invoice_number.unique' => 'The invoice number must be unique.',
            'title.required' => 'Please enter a title.',
            'title.max' => 'The title may not be greater than 255 characters.',
            'description.required' => 'Please enter a description.',
            'type.required' => 'Please select a type.',
            'type.in' => 'The selected type is invalid.',
            'currency.required' => 'Please select a currency.',
            'currency.in' => 'The selected currency is invalid.',
            'amount.required' => 'Please enter an amount.',
            'amount.numeric' => 'The amount must be a number.',
            'amount.min' => 'The amount must be at least 0.',
            'paid_amount.required' => 'Please enter the paid amount.',
            'paid_amount.numeric' => 'The paid amount must be a number.',
            'paid_amount.min' => 'The paid amount must be at least 0.',
            'balance.required' => 'Please enter the balance.',
            'balance.numeric' => 'The balance must be a number.',
            'balance.min' => 'The balance must be at least 0.',
            'due_date.date' => 'The due date must be a valid date.',
            'paid_date.date' => 'The paid date must be a valid date.',
            'status.required' => 'Please select a status.',
            'status.in' => 'The selected status is invalid.',
            'property_id.exists' => 'The selected property does not exist.',
            'unit_id.exists' => 'The selected unit does not exist.',
            'tenant_id.exists' => 'The selected tenant does not exist.',
            'recipient_name.max' => 'The recipient name may not be greater than 255 characters.',
            'recipient_email.email' => 'Please enter a valid email address.',
            'recipient_email.max' => 'The email may not be greater than 255 characters.',
        ];
    }
}
