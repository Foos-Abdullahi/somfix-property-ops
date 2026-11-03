<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreMaintenanceRequest extends FormRequest
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
            'property_id' => ['required', 'exists:properties,id'],
            'unit_id' => ['nullable', 'exists:units,id'],
            'tenant_id' => ['nullable', 'exists:tenants,id'],
            'category' => ['required', 'string', 'max:100'],
            'priority' => ['required', 'in:low,medium,high,urgent'],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string'],
            'status' => ['required', 'in:open,in_progress,scheduled,completed,cancelled'],
            'assigned_to' => ['nullable', 'string', 'max:255'],
            'scheduled_date' => ['nullable', 'date'],
            'completed_date' => ['nullable', 'date'],
            'estimated_cost' => ['nullable', 'numeric', 'min:0', 'max:999999.99'],
            'actual_cost' => ['nullable', 'numeric', 'min:0', 'max:999999.99'],
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
            'property_id.required' => 'Please select a property.',
            'property_id.exists' => 'The selected property does not exist.',
            'unit_id.exists' => 'The selected unit does not exist.',
            'tenant_id.exists' => 'The selected tenant does not exist.',
            'category.required' => 'Please select a maintenance category.',
            'category.max' => 'Category must be 100 characters or less.',
            'priority.required' => 'Please select a priority level.',
            'priority.in' => 'Please select a valid priority level.',
            'title.required' => 'Please enter a title for the maintenance request.',
            'title.max' => 'Title must be 255 characters or less.',
            'description.required' => 'Please provide a description of the maintenance issue.',
            'status.required' => 'Please select a status.',
            'status.in' => 'Please select a valid status.',
            'assigned_to.max' => 'Assigned to field must be 255 characters or less.',
            'scheduled_date.date' => 'Please enter a valid scheduled date.',
            'completed_date.date' => 'Please enter a valid completed date.',
            'estimated_cost.numeric' => 'Please enter a valid estimated cost.',
            'estimated_cost.min' => 'Estimated cost cannot be negative.',
            'estimated_cost.max' => 'Estimated cost cannot exceed 999,999.99.',
            'actual_cost.numeric' => 'Please enter a valid actual cost.',
            'actual_cost.min' => 'Actual cost cannot be negative.',
            'actual_cost.max' => 'Actual cost cannot exceed 999,999.99.',
            'notes.max' => 'Notes must be 5000 characters or less.',
        ];
    }
}
