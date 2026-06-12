<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'confirmed', Password::defaults()],
            'country' => ['required', 'string', 'regex:/^[A-Z]{2}$/'],
            'currency' => ['required', 'string', 'regex:/^[A-Z]{3}$/'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'country.regex' => 'The country must be an ISO 3166-1 alpha-2 code (e.g. BR, PT).',
            'currency.regex' => 'The currency must be an ISO 4217 code (e.g. BRL, EUR).',
        ];
    }
}
