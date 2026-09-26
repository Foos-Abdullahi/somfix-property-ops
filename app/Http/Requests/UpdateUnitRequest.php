<?php

namespace App\Http\Requests;

class UpdateUnitRequest extends StoreUnitRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $rules = parent::rules();
        $rules['unit_number'] = ['required', 'string', 'max:50', \Illuminate\Validation\Rule::unique('units', 'unit_number')->where('property_id', $this->integer('property_id'))->ignore($this->route('unit'))];
        return $rules;
    }
}
