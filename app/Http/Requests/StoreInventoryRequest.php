<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreInventoryRequest extends FormRequest
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
            'name' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string'],
            'sku' => ['required', 'string', 'unique:inventories,sku'],
            'unit_of_measure' => ['required', 'string', 'max:50'],
            'category' => ['required', 'string', 'max:255'],
            'opening_stock' => ['required', 'integer', 'min:0'],
            'current_stock' => ['required', 'integer', 'min:0'],
            'reorder_level' => ['required', 'integer', 'min:0'],
            'supplier' => ['required', 'string', 'max:255'],
            'unit_cost' => ['required', 'numeric', 'min:0'],
            'total_value' => ['required', 'numeric', 'min:0'],
            'status' => ['required', Rule::in(['in_stock', 'low_stock', 'out_of_stock', 'discontinued'])],
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
            'name.required' => 'Please enter an item name.',
            'name.max' => 'The name may not be greater than 255 characters.',
            'description.required' => 'Please enter a description.',
            'sku.required' => 'Please enter a SKU.',
            'sku.unique' => 'The SKU must be unique.',
            'unit_of_measure.required' => 'Please enter a unit of measure.',
            'unit_of_measure.max' => 'The unit of measure may not be greater than 50 characters.',
            'category.required' => 'Please enter a category.',
            'category.max' => 'The category may not be greater than 255 characters.',
            'opening_stock.required' => 'Please enter opening stock.',
            'opening_stock.integer' => 'Opening stock must be a whole number.',
            'opening_stock.min' => 'Opening stock must be at least 0.',
            'current_stock.required' => 'Please enter current stock.',
            'current_stock.integer' => 'Current stock must be a whole number.',
            'current_stock.min' => 'Current stock must be at least 0.',
            'reorder_level.required' => 'Please enter reorder level.',
            'reorder_level.integer' => 'Reorder level must be a whole number.',
            'reorder_level.min' => 'Reorder level must be at least 0.',
            'supplier.required' => 'Please enter a supplier.',
            'supplier.max' => 'The supplier may not be greater than 255 characters.',
            'unit_cost.required' => 'Please enter unit cost.',
            'unit_cost.numeric' => 'Unit cost must be a number.',
            'unit_cost.min' => 'Unit cost must be at least 0.',
            'total_value.required' => 'Please enter total value.',
            'total_value.numeric' => 'Total value must be a number.',
            'total_value.min' => 'Total value must be at least 0.',
            'status.required' => 'Please select a status.',
            'status.in' => 'The selected status is invalid.',
        ];
    }
}
