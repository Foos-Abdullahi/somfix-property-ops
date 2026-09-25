<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePropertyRequest extends FormRequest
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
            'name' => ['required', 'string', 'max:255'],
            'property_type' => ['required', 'string', 'max:100'],
            'owner_name' => ['nullable', 'string', 'max:255'],
            'district' => ['nullable', 'string', 'max:100'],
            'city' => ['required', 'string', 'max:100'],
            'address' => ['nullable', 'string', 'max:255'],
            'units_count' => ['required', 'integer', 'min:0', 'max:10000'],
            'status' => ['required', Rule::in(['active', 'inactive'])],
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
            'name.required' => 'Please enter a property name.',
            'name.max' => 'Property name must be 255 characters or less.',
            'property_type.required' => 'Please select a property type.',
            'property_type.max' => 'Property type must be 100 characters or less.',
            'owner_name.max' => 'Owner name must be 255 characters or less.',
            'district.max' => 'District must be 100 characters or less.',
            'city.required' => 'Please enter a city.',
            'city.max' => 'City must be 100 characters or less.',
            'address.max' => 'Address must be 255 characters or less.',
            'units_count.required' => 'Please enter the number of units.',
            'units_count.integer' => 'Units count must be a number.',
            'units_count.min' => 'Units count cannot be negative.',
            'units_count.max' => 'Units count cannot exceed 10,000.',
            'status.required' => 'Please select a status.',
            'status.in' => 'Please select a valid status.',
            'notes.max' => 'Notes must be 5000 characters or less.',
        ];
    }
}
