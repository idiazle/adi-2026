<?php

namespace App\Http\Requests\Landing;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePreinscripcionRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'apellidos' => ['required', 'string', 'max:100'],
            'nombres' => ['required', 'string', 'max:100'],
            'tipo_documento' => ['required', Rule::in(['DNI', 'CE', 'PAS', 'PTP'])],
            'numero_documento' => [
                'required',
                'string',
                'max:20',
                Rule::unique('preinscripciones', 'numero_documento'),
            ],
            'email' => ['required', 'email', 'max:150'],
            'telefono' => ['required', 'string', 'max:20'],
            'direccion' => ['required', 'string', 'max:255'],
            'grado' => ['required', 'string', 'max:50'],
        ];
    }

    /**
     * Get custom attribute names for validator errors.
     *
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'apellidos' => 'apellidos',
            'nombres' => 'nombres',
            'tipo_documento' => 'tipo de documento',
            'numero_documento' => 'número de documento',
            'email' => 'correo electrónico',
            'telefono' => 'teléfono',
            'direccion' => 'dirección',
            'grado' => 'grado/año',
        ];
    }

    /**
     * Get the error messages for the defined validation rules.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'required' => 'El campo :attribute es obligatorio.',
            'email' => 'El :attribute debe ser una dirección de correo válida.',
            'max' => 'El :attribute no debe superar los :max caracteres.',
            'in' => 'El :attribute seleccionado no es válido.',
            'unique' => 'Este :attribute ya se encuentra registrado.',
        ];
    }
}
