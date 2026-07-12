<?php

namespace App\Http\Requests\Admisiones;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class PeriodoRequest extends FormRequest
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
        $periodoId = $this->route('periodo')?->id;

        return [
            'nombre' => [
                'required',
                'string',
                'max:120',
                Rule::unique('periodos', 'nombre')->ignore($periodoId),
            ],
            'fecha_inicio' => ['required', 'date'],
            'fecha_fin' => ['required', 'date', 'after_or_equal:fecha_inicio'],
            'activo' => ['sometimes', 'boolean'],
            'preinscripciones_activas' => ['sometimes', 'boolean'],
            'preinscripciones_apertura' => ['nullable', 'date'],
            'preinscripciones_cierre' => [
                'nullable',
                'date',
                'after_or_equal:preinscripciones_apertura',
            ],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'nombre.unique' => 'Ya existe un período con ese nombre.',
            'fecha_fin.after_or_equal' => 'La fecha de fin debe ser igual o posterior a la fecha de inicio.',
            'preinscripciones_cierre.after_or_equal' => 'La fecha de cierre debe ser igual o posterior a la fecha de apertura.',
        ];
    }

    /**
     * Normaliza los booleanos que llegan desde el frontend.
     */
    protected function prepareForValidation(): void
    {
        $this->merge([
            'activo' => $this->boolean('activo'),
            'preinscripciones_activas' => $this->boolean('preinscripciones_activas'),
        ]);
    }
}
