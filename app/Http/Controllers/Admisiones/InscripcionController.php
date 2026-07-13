<?php

namespace App\Http\Controllers\Admisiones;

use App\Http\Controllers\Controller;
use App\Models\Inscripcion;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Vistas de detalle de Inscripcion. La lógica de creación está en
 * InscripcionDirectaController y el ciclo de pagos en PagoController.
 */
class InscripcionController extends Controller
{
    /**
     * Muestra el detalle de una Inscripcion: datos académicos, persona,
     * historial de pagos y estado de la matrícula asociada.
     */
    public function show(Inscripcion $inscripcion): Response
    {
        $inscripcion->load([
            'person',
            'periodo',
            'preinscripcion',
            'pagos' => fn ($q) => $q->latest('id'),
            'pagos.validador.person',
            'pagos.registrador.person',
            'matricula',
            'creador.person',
        ]);

        return Inertia::render('intranet/admisiones/pages/InscripcionDetalle', [
            'inscripcion' => $this->serialize($inscripcion),
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function serialize(Inscripcion $i): array
    {
        return [
            'id'                => $i->id,
            'estado'            => $i->estado,
            'nivel'             => $i->nivel,
            'grado'             => $i->grado,
            'grupo'             => $i->grupo,
            'sede'              => $i->sede_propuesta,
            'monto_inscripcion' => (float) $i->monto_inscripcion,
            'monto_pagado'      => (float) $i->monto_pagado,
            'saldo_pendiente'   => $i->saldoPendiente(),
            'notas'             => $i->notas,
            'created_at'        => $i->created_at?->toDateTimeString(),

            'persona' => $i->person ? [
                'id'         => $i->person->id,
                'nombre'     => $i->person->full_name,
                'documento'  => trim(($i->person->document_type ?? '') . ' ' . ($i->person->document_number ?? '')),
                'telefono'   => $i->person->phone_number,
                'nacimiento' => $i->person->birth_date?->toDateString(),
            ] : null,

            'periodo' => $i->periodo ? [
                'id'     => $i->periodo->id,
                'nombre' => $i->periodo->nombre,
                'codigo' => $i->periodo->codigo,
            ] : null,

            'preinscripcion' => $i->preinscripcion ? [
                'id'     => $i->preinscripcion->id,
                'estado' => $i->preinscripcion->estado,
                'origen' => 'preinscripcion',
            ] : null,

            'creador' => $i->creador?->person?->full_name,

            'tiene_matricula' => $i->tieneMatricula(),
            'matricula'       => $i->matricula ? [
                'id'     => $i->matricula->id,
                'estado' => $i->matricula->estado,
            ] : null,

            'pagos' => $i->pagos->map(fn ($p) => [
                'id'                => $p->id,
                'monto'             => (float) $p->monto,
                'metodo'            => $p->metodo,
                'referencia'        => $p->referencia_externa,
                'comprobante_url'   => $p->comprobante_public_url,
                'estado'            => $p->estado,
                'fecha_pago'        => $p->fecha_pago?->toDateString(),
                'fecha_validacion'  => $p->fecha_validacion?->toDateTimeString(),
                'motivo_rechazo'    => $p->motivo_rechazo,
                'notas'             => $p->notas,
                'validador'         => $p->validador?->person?->full_name,
                'registrador'       => $p->registrador?->person?->full_name,
                'created_at'        => $p->created_at?->toDateTimeString(),
            ])->all(),
        ];
    }
}