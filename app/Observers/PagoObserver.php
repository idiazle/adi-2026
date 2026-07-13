<?php

namespace App\Observers;

use App\Models\Pago;

/**
 * Mantiene sincronizado el `monto_pagado` de la Inscripcion cuando cambia el
 * estado de un Pago. Sin esto, dependeríamos de que cada controller recuerde
 * recalcular — fácil olvidarlo en una pantalla de validación manual.
 *
 * Flujo:
 *   1. Pago.validado → Inscripcion.recalcularMontoPagado() → procesarSiPagada()
 *      (si cubre el total, marca la inscripcion como pagada y crea la Matricula).
 *   2. Pago.rechazado → Inscripcion.recalcularMontoPagado().
 *      Si la inscripción ya estaba pagada y se elimina el último pago validado,
 *      NO revertimos a pendiente: la matrícula ya fue creada y eso requiere
 *      acción administrativa explícita. (En el futuro, definir una política.)
 *   3. Pago.created (estado=pendiente) → no hace nada; se recalcula solo al validar.
 */
class PagoObserver
{
    public function saved(Pago $pago): void
    {
        // Solo nos importan los pagos que afectan al monto (validados).
        // Los `pendientes` y `rechazados` no suman, así que un save sin
        // cambio de estado no debe disparar recálculo.
        if ($pago->estado !== Pago::ESTADO_VALIDADO) {
            // Si pasó de validado a otra cosa (caso raro, debería estar
            // restringido por validaciones), sí recalculamos.
            if ($pago->wasChanged('estado') && $pago->getOriginal('estado') === Pago::ESTADO_VALIDADO) {
                $this->recalcular($pago);
            }
            return;
        }

        $this->recalcular($pago);
    }

    public function deleted(Pago $pago): void
    {
        if ($pago->estado === Pago::ESTADO_VALIDADO) {
            $this->recalcular($pago);
        }
    }

    private function recalcular(Pago $pago): void
    {
        $inscripcion = $pago->inscripcion;
        if (! $inscripcion) {
            return;
        }

        $inscripcion->recalcularMontoPagado();
        $inscripcion->procesarSiPagada();
    }
}