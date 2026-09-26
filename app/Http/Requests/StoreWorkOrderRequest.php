<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreWorkOrderRequest extends FormRequest
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
            'maintenance_id' => ['required', 'exists:maintenances,id'],
            'service_team_id' => ['nullable', 'exists:service_teams,id'],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string'],
            'status' => ['required', Rule::in(['pending', 'assigned', 'in_progress', 'completed', 'cancelled'])],
            'assigned_date' => ['nullable', 'date'],
            'started_date' => ['nullable', 'date'],
            'completed_date' => ['nullable', 'date'],
            'estimated_hours' => ['nullable', 'numeric', 'min:0'],
            'actual_hours' => ['nullable', 'numeric', 'min:0'],
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
            'maintenance_id.required' => 'Please select a maintenance request.',
            'maintenance_id.exists' => 'The selected maintenance request does not exist.',
            'service_team_id.exists' => 'The selected service team member does not exist.',
            'title.required' => 'Please enter a work order title.',
            'title.max' => 'The title may not be greater than 255 characters.',
            'description.required' => 'Please enter a description.',
            'status.required' => 'Please select a status.',
            'status.in' => 'The selected status is invalid.',
            'assigned_date.date' => 'The assigned date must be a valid date.',
            'started_date.date' => 'The started date must be a valid date.',
            'completed_date.date' => 'The completed date must be a valid date.',
            'estimated_hours.numeric' => 'The estimated hours must be a number.',
            'estimated_hours.min' => 'The estimated hours must be at least 0.',
            'actual_hours.numeric' => 'The actual hours must be a number.',
            'actual_hours.min' => 'The actual hours must be at least 0.',
        ];
    }
}
