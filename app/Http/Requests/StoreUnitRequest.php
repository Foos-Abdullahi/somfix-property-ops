<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreUnitRequest extends FormRequest
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
            'property_id' => ['required', 'integer', Rule::exists('properties', 'id')],
            'unit_number' => ['required', 'string', 'max:50', Rule::unique('units', 'unit_number')->where('property_id', $this->integer('property_id'))],
            'unit_type' => ['required', 'string', 'max:100'],
            'floor' => ['nullable', 'string', 'max:50'],
            'bedrooms' => ['required', 'integer', 'min:0', 'max:20'],
            'bathrooms' => ['required', 'integer', 'min:0', 'max:20'],
            'monthly_rent' => ['required', 'numeric', 'min:0', 'max:99999999.99'],
            'status' => ['required', Rule::in(['vacant', 'occupied', 'maintenance', 'inactive'])],
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
            'unit_number.required' => 'Please enter a unit number.',
            'unit_number.max' => 'Unit number must be 50 characters or less.',
            'unit_number.unique' => 'This unit number already exists for this property.',
            'unit_type.required' => 'Please select a unit type.',
            'unit_type.max' => 'Unit type must be 100 characters or less.',
            'floor.max' => 'Floor must be 50 characters or less.',
            'bedrooms.required' => 'Please enter the number of bedrooms.',
            'bedrooms.integer' => 'Bedrooms must be a number.',
            'bedrooms.min' => 'Bedrooms cannot be negative.',
            'bedrooms.max' => 'Bedrooms cannot exceed 20.',
            'bathrooms.required' => 'Please enter the number of bathrooms.',
            'bathrooms.integer' => 'Bathrooms must be a number.',
            'bathrooms.min' => 'Bathrooms cannot be negative.',
            'bathrooms.max' => 'Bathrooms cannot exceed 20.',
            'monthly_rent.required' => 'Please enter the monthly rent.',
            'monthly_rent.numeric' => 'Please enter a valid monthly rent amount.',
            'monthly_rent.min' => 'Monthly rent cannot be negative.',
            'monthly_rent.max' => 'Monthly rent cannot exceed 99,999,999.99.',
            'status.required' => 'Please select a status.',
            'status.in' => 'Please select a valid status.',
            'notes.max' => 'Notes must be 5000 characters or less.',
        ];
    }
}
