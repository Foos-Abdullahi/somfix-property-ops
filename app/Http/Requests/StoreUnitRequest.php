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
}
