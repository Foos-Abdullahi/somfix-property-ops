<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Validation\Rule;

class UpdateUnitRequest extends StoreUnitRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $rules = parent::rules();
        $rules['unit_number'] = ['required', 'string', 'max:50', Rule::unique('units', 'unit_number')->where('property_id', $this->integer('property_id'))->ignore($this->route('unit'))];

        return $rules;
    }
}
