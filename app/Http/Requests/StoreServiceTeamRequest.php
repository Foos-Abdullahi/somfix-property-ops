<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreServiceTeamRequest extends FormRequest
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
            'specialization' => ['required', 'string', 'max:255'],
            'phone' => ['required', 'string', 'max:20'],
            'email' => ['required', 'email', 'max:255'],
            'status' => ['required', Rule::in(['active', 'inactive', 'on_leave'])],
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
            'name.required' => 'Please enter a name.',
            'name.max' => 'The name may not be greater than 255 characters.',
            'specialization.required' => 'Please enter a specialization.',
            'specialization.max' => 'The specialization may not be greater than 255 characters.',
            'phone.required' => 'Please enter a phone number.',
            'phone.max' => 'The phone number may not be greater than 20 characters.',
            'email.required' => 'Please enter an email address.',
            'email.email' => 'Please enter a valid email address.',
            'email.max' => 'The email may not be greater than 255 characters.',
            'status.required' => 'Please select a status.',
            'status.in' => 'The selected status is invalid.',
        ];
    }
}
