<?php

namespace App\Http\Requests\Admisiones;

use App\Enums\EstadoPeriodo;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class PeriodoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Resuelve el id del período en edición desde varias fuentes,
     * porque dentro del FormRequest `route('periodo')` aún no
     * contiene el modelo resuelto por route-model binding.
     *
     * Prioridad:
     *   1. Argumento inyectado en `rules()` (cuando se llama desde el
     *      ciclo de validación del controller con binding ya hecho).
     *   2. Modelo en la ruta (Laravel 11 lo enlaza después).
     *   3. Segmento numérico de la URL como fallback.
     *
     * @return array<string, mixed>
     */
    public function rules(?\App\Models\Periodo $periodo = null): array
    {
        $periodoId = $periodo?->id
            ?? $this->resolvePeriodoIdFromRoute();

        return [
            'codigo' => [
                'required',
                'string',
                'max:32',
                'regex:/^[A-Za-z0-9\-]+$/',
                Rule::unique('periodos', 'codigo')
                    ->ignore($periodoId)
                    ->whereNull('deleted_at'),
            ],
            'nombre' => ['required', 'string', 'max:120'],
            'fecha_inicio' => ['required', 'date'],
            'fecha_fin' => ['required', 'date', 'after_or_equal:fecha_inicio'],
            'estado' => ['required', Rule::enum(EstadoPeriodo::class)],
            'preinscripciones_pausadas' => ['sometimes', 'boolean'],
            'preinscripciones_apertura' => ['nullable', 'date'],
            'preinscripciones_cierre' => [
                'nullable',
                'date',
                'after_or_equal:preinscripciones_apertura',
            ],
            // Tarifas: el monto de inscripción se snapshota al crear la Inscripcion;
            // el de mensualidad se consultará al generar cargos mensuales.
            'monto_inscripcion' => ['nullable', 'numeric', 'min:0', 'max:99999.99'],
            'monto_mensualidad' => ['nullable', 'numeric', 'min:0', 'max:99999.99'],
        ];
    }

    /**
     * Intenta obtener el id del período desde el parámetro de ruta o,
     * en último caso, desde el último segmento numérico de la URL.
     */
    private function resolvePeriodoIdFromRoute(): ?int
    {
        $fromRoute = $this->route('periodo');

        if (is_object($fromRoute) && property_exists($fromRoute, 'id')) {
            return (int) $fromRoute->id;
        }

        if (is_numeric($fromRoute)) {
            return (int) $fromRoute;
        }

        // Fallback: último segmento numérico de la URL. Útil cuando el
        // route-model binding aún no se ha resuelto dentro del FormRequest.
        $segments = array_filter(explode('/', (string) $this->url()));
        foreach (array_reverse($segments) as $segment) {
            if (is_numeric($segment)) {
                return (int) $segment;
            }
        }

        return null;
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'codigo.unique' => 'Ya existe un período con ese código.',
            'codigo.regex' => 'El código solo puede contener letras, números y guiones.',
            'fecha_fin.after_or_equal' => 'La fecha de fin debe ser igual o posterior a la fecha de inicio.',
            'preinscripciones_cierre.after_or_equal' => 'La fecha de cierre debe ser igual o posterior a la fecha de apertura.',
        ];
    }

    /**
     * Normaliza booleanos que llegan desde el frontend.
     */
    protected function prepareForValidation(): void
    {
        $this->merge([
            'preinscripciones_pausadas' => $this->boolean('preinscripciones_pausadas'),
        ]);
    }

    /**
     * Compatibilidad hacia atrás: si el frontend aún envía `activo` (bool
     * legacy) lo mapeamos a `estado`. Esto evita romper la UI actual sin
     * obligar a tocar el frontend en el mismo PR.
     */
    protected function passedValidation(): void
    {
        if ($this->has('activo') && ! $this->has('estado')) {
            $this->merge([
                'estado' => $this->boolean('activo')
                    ? EstadoPeriodo::Activo->value
                    : EstadoPeriodo::Borrador->value,
            ]);
        }
    }
}