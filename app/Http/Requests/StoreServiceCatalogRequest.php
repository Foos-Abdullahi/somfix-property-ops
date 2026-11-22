<?php

namespace App\Http\Requests;

use App\Support\ImageUploads;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreServiceCatalogRequest extends FormRequest
{
    public function authorize(): bool
    {
        return (bool) $this->user();
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $service = $this->route('service_list');

        return [
            'name' => ['required', 'string', 'max:255', Rule::unique('service_catalog', 'name')->ignore($service)],
            'category' => ['required', 'string', 'max:100'],
            'description' => ['nullable', 'string', 'max:2000'],
            'unit' => ['nullable', 'string', 'max:50'],
            'price' => ['nullable', 'numeric', 'min:0', 'max:9999999999'],
            'duration' => ['nullable', 'string', 'max:100'],
            'status' => ['required', Rule::in(['active', 'inactive'])],
            'notes' => ['nullable', 'string'],
            ...ImageUploads::rules(),
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            ...ImageUploads::messages(),
            'name.required' => 'Please enter the service name.',
            'name.unique' => 'This service is already in the list.',
            'category.required' => 'Please enter a category.',
            'price.numeric' => 'Price must be a number.',
            'status.in' => 'Status must be active or inactive.',
        ];
    }
}
