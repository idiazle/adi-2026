<?php

namespace App\Http\Requests\Admisiones;

use App\Models\Pago;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Valida la decisión del admin sobre un Pago pendiente.
 * Solo admin (validación centralizada en el controller vía policy/middleware).
 */
class ValidarPagoRequest extends FormRequest
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
            'accion'          => ['required', Rule::in(['validar', 'rechazar'])],
            'motivo_rechazo'  => ['required_if:accion,rechazar', 'nullable', 'string', 'max:500'],
        ];
    }

    public function messages(): array
    {
        return [
            'motivo_rechazo.required_if' => 'Indica el motivo del rechazo.',
        ];
    }
}