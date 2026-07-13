<?php

namespace App\Http\Controllers\Academia;

use App\Http\Controllers\Controller;
use App\Models\Inscripcion;
use App\Models\Matricula;
use App\Models\Periodo;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Listado de "alumnos" desde el punto de vista académico.
 *
 * Una Inscripcion pagada al 100% materializa una Matricula (estado='activa')
 * vía observer. Esta vista muestra exactamente eso: las Inscripciones pagadas
 * con su Matrícula activa asociada. Es la fuente de verdad de quién es
 * alumno activo en el período vigente.
 */
class AlumnoController extends Controller
{
    /**
     * Lista las inscripciones pagadas con matrícula activa en el período vigente.
     * Si no hay período vigente, se hace fallback al período más reciente que
     * no esté cerrado.
     */
    public function index(): Response
    {
        $periodo = Periodo::vigente();

        $inscripciones = Inscripcion::query()
            ->with(['person', 'periodo', 'matricula'])
            ->where('estado', Inscripcion::ESTADO_PAGADA)
            ->whereHas('matricula', function ($q) {
                $q->where('estado', Matricula::ESTADO_ACTIVA);
            })
            // Filtrar por período si lo encontramos; si no, mostramos todo.
            ->when($periodo, fn ($q) => $q->where('periodo_id', $periodo->id))
            ->latest('id')
            ->get()
            ->map(fn (Inscripcion $i) => $this->serialize($i));

        return Inertia::render('intranet/academia/Alumnos', [
            'alumnos' => $inscripciones,
            'periodo' => $periodo ? [
                'id'     => $periodo->id,
                'codigo' => $periodo->codigo,
                'nombre' => $periodo->nombre,
            ] : null,
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function serialize(Inscripcion $i): array
    {
        return [
            'id'              => $i->id,
            'matricula_id'    => $i->matricula?->id,
            'estado_matricula'=> $i->matricula?->estado,
            'fecha_matricula' => $i->matricula?->created_at?->toDateString(),

            'persona' => $i->person ? [
                'id'         => $i->person->id,
                'nombre'     => $i->person->full_name,
                'documento'  => trim(($i->person->document_type ?? '') . ' ' . ($i->person->document_number ?? '')),
                'documento_tipo'    => $i->person->document_type,
                'documento_numero'  => $i->person->document_number,
            ] : null,

            'periodo' => $i->periodo?->nombre,

            'nivel'  => $i->nivel,
            'grado'  => $i->grado,
            'grupo'  => $i->grupo,
            'sede'   => $i->sede_propuesta,
        ];
    }
}