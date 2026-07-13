<?php

namespace App\Http\Requests\Admisiones;

use App\Models\Pago;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Valida el registro de un pago contra una Inscripcion.
 *
 * Lo usan tanto el operador de caja (secretaria/admin) en intranet como el
 * alumno desde el portal público de preinscripciones: la única diferencia
 * es el `registrado_por`, que se asigna en el controller.
 */
class RegistrarPagoRequest extends FormRequest
{
    public function authorize(): bool
    {
        // La autorización fina la hace el controller según el origen
        // (portal público vs intranet) y el rol del usuario.
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'monto'              => ['required', 'numeric', 'min:0.01', 'max:99999.99'],
            'metodo'             => ['required', Rule::in([
                Pago::METODO_EFECTIVO,
                Pago::METODO_TRANSFERENCIA,
                Pago::METODO_YAPE,
                Pago::METODO_PLIN,
                Pago::METODO_OTRO,
            ])],
            'referencia_externa' => ['nullable', 'string', 'max:100'],
            // El comprobante se sube aparte (multipart). El controller
            // procesa `comprobante` (UploadedFile) si está presente.
            'fecha_pago'         => ['nullable', 'date'],
            'notas'              => ['nullable', 'string', 'max:500'],
        ];
    }

    public function messages(): array
    {
        return [
            'monto.required' => 'El monto es obligatorio.',
            'monto.min'      => 'El monto debe ser mayor a 0.',
            'metodo.required' => 'Selecciona un método de pago.',
            'metodo.in'       => 'Método de pago no válido.',
        ];
    }
}