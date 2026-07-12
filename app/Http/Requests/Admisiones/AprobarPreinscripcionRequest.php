<?php

namespace App\Http\Requests\Admisiones;

use App\Models\Matricula;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AprobarPreinscripcionRequest extends FormRequest
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
            'sede' => ['required', Rule::in([
                Matricula::SEDE_CENTRAL,
                Matricula::SEDE_NORTE,
                Matricula::SEDE_SUR,
            ])],
            'grupo' => ['nullable', 'string', 'max:5'],
            'notas' => ['nullable', 'string', 'max:500'],
        ];
    }

    public function attributes(): array
    {
        return [
            'sede' => 'sede',
            'grupo' => 'grupo',
            'notas' => 'notas',
        ];
    }
}
