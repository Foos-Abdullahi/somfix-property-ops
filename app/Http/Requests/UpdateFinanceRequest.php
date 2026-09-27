<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Validation\Rule;

class UpdateFinanceRequest extends StoreFinanceRequest
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
        $financeId = $this->route('finance')?->id ?? $this->route('finance');

        return [
            'invoice_number' => ['sometimes', 'string', 'unique:finances,invoice_number,'.$financeId],
            'title' => ['sometimes', 'string', 'max:255'],
            'description' => ['sometimes', 'string'],
            'type' => ['sometimes', Rule::in(['invoice', 'quote', 'expense'])],
            'currency' => ['sometimes', Rule::in(['USD', 'SOS'])],
            'amount' => ['sometimes', 'numeric', 'min:0'],
            'paid_amount' => ['sometimes', 'numeric', 'min:0'],
            'balance' => ['sometimes', 'numeric', 'min:0'],
            'due_date' => ['nullable', 'date'],
            'paid_date' => ['nullable', 'date'],
            'status' => ['sometimes', Rule::in(['draft', 'sent', 'paid', 'overdue', 'cancelled'])],
            'property_id' => ['nullable', 'exists:properties,id'],
            'unit_id' => ['nullable', 'exists:units,id'],
            'tenant_id' => ['nullable', 'exists:tenants,id'],
            'recipient_name' => ['nullable', 'string', 'max:255'],
            'recipient_email' => ['nullable', 'email', 'max:255'],
            'notes' => ['nullable', 'string'],
        ];
    }
}
