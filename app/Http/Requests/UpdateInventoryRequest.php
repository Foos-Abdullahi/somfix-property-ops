<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Validation\Rule;

class UpdateInventoryRequest extends StoreInventoryRequest
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
            'name' => ['sometimes', 'string', 'max:255'],
            'description' => ['sometimes', 'string'],
            'sku' => ['sometimes', 'string', Rule::unique('inventories', 'sku')->ignore($this->route('inventory'))],
            'unit_of_measure' => ['sometimes', 'string', 'max:50'],
            'category' => ['sometimes', 'string', 'max:255'],
            'opening_stock' => ['sometimes', 'integer', 'min:0'],
            'current_stock' => ['sometimes', 'integer', 'min:0'],
            'reorder_level' => ['sometimes', 'integer', 'min:0'],
            'supplier' => ['sometimes', 'string', 'max:255'],
            'unit_cost' => ['sometimes', 'numeric', 'min:0'],
            'total_value' => ['sometimes', 'numeric', 'min:0'],
            'status' => ['sometimes', Rule::in(['in_stock', 'low_stock', 'out_of_stock', 'discontinued'])],
            'notes' => ['nullable', 'string'],
        ];
    }
}
