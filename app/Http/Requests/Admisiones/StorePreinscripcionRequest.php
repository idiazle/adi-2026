<?php

namespace App\Http\Requests\Admisiones;

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
            // Datos del estudiante
            'apellidos' => ['required', 'string', 'max:100'],
            'nombres' => ['required', 'string', 'max:100'],
            'tipo_documento' => ['required', Rule::in(['DNI', 'CE', 'PAS', 'PTP'])],
            'numero_documento' => ['required', 'string', 'max:20'],
            'fecha_nacimiento' => ['required', 'date'],
            'sexo' => ['required', Rule::in(['M', 'F'])],

            // Datos académicos
            'nivel' => ['required', Rule::in(['primaria', 'secundaria', 'preparatoria'])],
            'grado' => ['required', 'string', 'max:50'],
            'grupo' => ['nullable', 'string', 'max:5'],

            // Datos del tutor
            'nombre_tutor' => ['required', 'string', 'max:200'],
            'telefono_tutor' => ['required', 'string', 'max:20'],
            'email_tutor' => ['required', 'email', 'max:150'],
            'parentesco_tutor' => ['required', Rule::in(['madre', 'padre', 'tutor', 'abuelo', 'hermano', 'otro'])],
        ];
    }

    /**
     * Validación cruzada: el grado debe pertenecer al nivel elegido.
     */
    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $nivel = $this->input('nivel');
            $grado = $this->input('grado');

            if (!$nivel || !$grado) {
                return;
            }

            $permitidos = match ($nivel) {
                'primaria' => ['1ro', '2do', '3ro', '4to', '5to', '6to'],
                'secundaria' => ['1ro', '2do', '3ro', '4to', '5to'],
                'preparatoria' => ['1ro', '2do', '3ro'],
                default => [],
            };

            if (!in_array($grado, $permitidos, true)) {
                $validator->errors()->add(
                    'grado',
                    "El grado seleccionado no es válido para el nivel {$nivel}."
                );
            }
        });
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
            'fecha_nacimiento' => 'fecha de nacimiento',
            'sexo' => 'sexo',
            'nivel' => 'nivel',
            'grado' => 'grado',
            'grupo' => 'grupo',
            'nombre_tutor' => 'nombre del tutor',
            'telefono_tutor' => 'teléfono del tutor',
            'email_tutor' => 'correo del tutor',
            'parentesco_tutor' => 'parentesco del tutor',
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
            'date' => 'El :attribute debe ser una fecha válida.',
            'max' => 'El :attribute no debe superar los :max caracteres.',
            'in' => 'El :attribute seleccionado no es válido.',
        ];
    }
}
