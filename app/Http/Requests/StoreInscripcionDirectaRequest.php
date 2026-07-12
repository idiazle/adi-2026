<?php

namespace App\Http\Requests;

use App\Models\Matricula;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreInscripcionDirectaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // El middleware de auth de la ruta se encarga
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            // Datos del alumno
            'first_name'      => ['required', 'string', 'max:120'],
            'last_name'       => ['required', 'string', 'max:120'],
            'document_type'   => ['required', Rule::in(['DNI', 'CE', 'PAS', 'PTP'])],
            'document_number' => ['required', 'string', 'max:30'],
            'fecha_nacimiento' => ['required', 'date'],
            'genero'          => ['nullable', Rule::in(['M', 'F', 'O'])],
            'telefono'        => ['nullable', 'string', 'max:30'],

            // Datos académicos
            'nivel'    => ['required', Rule::in(['primaria', 'secundaria', 'preparatoria'])],
            'grado'    => ['required', 'string', 'max:10'],
            'grupo'    => ['nullable', 'string', 'max:5'],
            'sede'     => ['required', Rule::in([
                Matricula::SEDE_CENTRAL,
                Matricula::SEDE_NORTE,
                Matricula::SEDE_SUR,
            ])],

            // `periodo_id` se asigna en el controller (último periodo activo).

            // Apoderado (nombres y apellidos; el backend los concatena para `nombre_tutor`)
            'tutor_first_name'  => ['required', 'string', 'max:120'],
            'tutor_last_name'   => ['required', 'string', 'max:120'],
            'telefono_tutor'    => ['required', 'string', 'max:30'],
            'parentesco_tutor'  => ['required', Rule::in(['madre', 'padre', 'tutor', 'abuelo', 'hermano', 'otro'])],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'required' => 'El campo :attribute es obligatorio.',
            'exists'   => 'El :attribute seleccionado no existe.',
            'in'       => 'El valor seleccionado para :attribute no es válido.',
        ];
    }
}
