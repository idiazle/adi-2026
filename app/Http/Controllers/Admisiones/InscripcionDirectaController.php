<?php

namespace App\Http\Controllers\Admisiones;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreInscripcionDirectaRequest;
use App\Models\Inscripcion;
use App\Models\Pago;
use App\Models\Periodo;
use App\Models\Person;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class InscripcionDirectaController extends Controller
{
    /**
     * Lista las Inscripciones del período activo (pendientes, pagadas, anuladas).
     * Una Inscripcion no es todavía una Matrícula hasta que se pague al 100%.
     */
    public function index(): Response
    {
        $inscripciones = Inscripcion::query()
            ->with(['person', 'periodo', 'preinscripcion', 'pagos', 'matricula'])
            ->latest('id')
            ->get()
            ->map(fn (Inscripcion $i) => $this->serialize($i));

        return Inertia::render('intranet/admisiones/pages/Inscripciones', [
            'inscripciones' => $inscripciones,
            'periodo_actual' => Periodo::vigente()?->nombre,
        ]);
    }

    /**
     * Crea una inscripción directa (admisión walk-in): Person + Inscripcion.
     *
     * NO crea User ni Matrícula: la Inscripcion queda en estado `pendiente`
     * hasta que se registren y validen los pagos. La Matrícula se materializa
     * automáticamente vía observer cuando el monto se cubre al 100%.
     */
    public function store(StoreInscripcionDirectaRequest $request): RedirectResponse
    {
        // Verificar primero que exista un periodo activo. Si no, devolvemos
        // un error de validación claro y evitamos filas huérfanas.
        $periodo = Periodo::vigente();

        if (! $periodo) {
            return back()
                ->withInput()
                ->withErrors([
                    'periodo' => 'No se puede crear la inscripción: no existe un período activo.',
                ]);
        }

        $data = $request->validated();

        $inscripcion = DB::transaction(function () use ($data, $periodo) {
            // Reusamos Person si ya existe por documento (caso típico: el
            // alumno intentó preinscribirse y la inscripción quedó pendiente).
            $person = Person::query()
                ->where('document_type', $data['document_type'])
                ->where('document_number', $data['document_number'])
                ->first();

            if (! $person) {
                $person = Person::create([
                    'document_type'   => $data['document_type'],
                    'document_number' => $data['document_number'],
                    'first_name'      => $data['first_name'],
                    'last_name'       => $data['last_name'],
                    'birth_date'      => $data['fecha_nacimiento'],
                    'gender'          => $data['genero'] ?? null,
                    'phone_number'    => $data['telefono'] ?? null,
                ]);
            }

            return Inscripcion::create([
                'person_id'         => $person->id,
                'periodo_id'        => $periodo->id,
                'nivel'             => $data['nivel'],
                'grado'             => $data['grado'],
                'grupo'             => $data['grupo'] ?? null,
                'sede_propuesta'    => $data['sede'],
                'monto_inscripcion' => $periodo->monto_inscripcion,
                'estado'            => Inscripcion::ESTADO_PENDIENTE,
                'created_by'        => Auth::id(),
                'notas'             => json_encode([
                    'tutor' => [
                        'first_name' => $data['tutor_first_name'],
                        'last_name'  => $data['tutor_last_name'],
                        'phone'      => $data['telefono_tutor'],
                        'parentesco' => $data['parentesco_tutor'],
                    ],
                ], JSON_THROW_ON_ERROR),
            ]);
        });

        return redirect()
            ->route('intranet.admisiones.inscripciones.show', $inscripcion->id)
            ->with('success', "Inscripción #{$inscripcion->id} registrada. Pendiente de pago.");
    }

    /**
     * @return array<string, mixed>
     */
    private function serialize(Inscripcion $i): array
    {
        return [
            'id'                 => $i->id,
            'persona'            => $i->person ? [
                'id'        => $i->person->id,
                'nombre'    => $i->person->full_name,
                'documento' => trim(($i->person->document_type ?? '') . ' ' . ($i->person->document_number ?? '')),
            ] : null,
            'preinscripcion_id'  => $i->preinscripcion_id,
            'periodo'            => $i->periodo?->nombre,
            'nivel'              => $i->nivel,
            'grado'              => $i->grado,
            'grupo'              => $i->grupo,
            'sede'               => $i->sede_propuesta,
            'monto_inscripcion'  => (float) $i->monto_inscripcion,
            'monto_pagado'       => (float) $i->monto_pagado,
            'saldo_pendiente'    => $i->saldoPendiente(),
            'estado'             => $i->estado,
            'tiene_matricula'    => $i->tieneMatricula(),
            'total_pagos'        => $i->pagos->count(),
            'pagos_pendientes'   => $i->pagos->where('estado', Pago::ESTADO_PENDIENTE)->count(),
            'fecha_inscripcion'  => $i->created_at?->toDateString(),
        ];
    }
}