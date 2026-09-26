<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreTenantRequest extends FormRequest
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
            'unit_id' => ['nullable', 'integer', Rule::exists('units', 'id')],
            'first_name' => ['required', 'string', 'max:100'],
            'last_name' => ['required', 'string', 'max:100'],
            'phone' => ['required', 'string', 'max:30'],
            'email' => ['nullable', 'email', 'max:255'],
            'whatsapp' => ['nullable', 'string', 'max:30'],
            'emergency_contact' => ['nullable', 'string', 'max:255'],
            'status' => ['required', Rule::in(['active', 'inactive'])],
            'move_in_date' => ['nullable', 'date'],
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
            'unit_id.exists' => 'The selected unit does not exist.',
            'first_name.required' => 'Please enter the first name.',
            'first_name.max' => 'First name must be 100 characters or less.',
            'last_name.required' => 'Please enter the last name.',
            'last_name.max' => 'Last name must be 100 characters or less.',
            'phone.required' => 'Please enter a phone number.',
            'phone.max' => 'Phone number must be 30 characters or less.',
            'email.email' => 'Please enter a valid email address.',
            'email.max' => 'Email must be 255 characters or less.',
            'whatsapp.max' => 'WhatsApp number must be 30 characters or less.',
            'emergency_contact.max' => 'Emergency contact must be 255 characters or less.',
            'status.required' => 'Please select a status.',
            'status.in' => 'Please select a valid status.',
            'move_in_date.date' => 'Please enter a valid move-in date.',
            'notes.max' => 'Notes must be 5000 characters or less.',
        ];
    }
}
