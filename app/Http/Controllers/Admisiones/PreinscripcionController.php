<?php

namespace App\Http\Controllers\Admisiones;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admisiones\AprobarPreinscripcionRequest;
use App\Http\Requests\Admisiones\StorePreinscripcionRequest;
use App\Models\Matricula;
use App\Models\Periodo;
use App\Models\Person;
use App\Models\Preinscripcion;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class PreinscripcionController extends Controller
{
    /**
     * Display the preinscription form.
     */
    public function create(): Response
    {
        $periodo = Periodo::query()
            ->where('activo', true)
            ->where('preinscripciones_activas', true)
            ->first();

        $abierto = $periodo?->arePreinscripcionesAbiertas() ?? false;

        return Inertia::render('landing/PreInscriptions', [
            'periodo' => $periodo
                ? [
                    'id' => $periodo->id,
                    'nombre' => $periodo->nombre,
                    'fecha_inicio' => $periodo->fecha_inicio?->toDateString(),
                    'fecha_fin' => $periodo->fecha_fin?->toDateString(),
                    'preinscripciones_apertura' => $periodo->preinscripciones_apertura?->toIso8601String(),
                    'preinscripciones_cierre' => $periodo->preinscripciones_cierre?->toIso8601String(),
                ]
                : null,
            'abierto' => $abierto,
        ]);
    }

    /**
     * Store a newly created preinscription in storage.
     */
    public function store(StorePreinscripcionRequest $request): RedirectResponse
    {
        $data = $request->validated();

        // Buscar el período activo con preinscripciones abiertas
        $periodo = Periodo::query()
            ->where('activo', true)
            ->where('preinscripciones_activas', true)
            ->first();

        if (!$periodo || !$periodo->arePreinscripcionesAbiertas()) {
            throw ValidationException::withMessages([
                'periodo' => 'No hay un período de preinscripciones activo en este momento.',
            ]);
        }

        // Unicidad por período: el mismo DNI puede preinscribirse en
        // distintos períodos, pero solo una vez dentro del actual.
        $duplicado = Preinscripcion::query()
            ->where('periodo_id', $periodo->id)
            ->where('numero_documento', $data['numero_documento'])
            ->exists();

        if ($duplicado) {
            throw ValidationException::withMessages([
                'numero_documento' => 'Ya existe una preinscripción registrada con este documento en el período actual.',
            ]);
        }

        // Asignar período y estado
        $data['periodo_id'] = $periodo->id;
        $data['estado'] = Preinscripcion::ESTADO_PENDIENTE;

        $preinscripcion = Preinscripcion::create($data);

        return redirect()
            ->route('preinscripciones')
            ->with('success', 'Tu preinscripción fue registrada correctamente. Te contactaremos pronto.')
            ->with('preinscripcion_id', $preinscripcion->id);
    }

    /**
     * Listado de preinscripciones para revisión en la intranet.
     */
    public function index(): Response
    {
        $preinscripciones = Preinscripcion::query()
            ->with(['periodo', 'revisadoPor.person'])
            ->latest('id')
            ->get()
            ->map(fn (Preinscripcion $p) => $this->serialize($p));

        $periodoActivo = Periodo::query()->where('activo', true)->latest('id')->first();

        return Inertia::render('intranet/admisiones/pages/Preinscripciones', [
            'preinscripciones' => $preinscripciones,
            'periodo_actual' => $periodoActivo?->nombre,
            'sedes' => [
                ['value' => Matricula::SEDE_CENTRAL, 'label' => 'Central'],
                ['value' => Matricula::SEDE_NORTE, 'label' => 'Norte'],
                ['value' => Matricula::SEDE_SUR, 'label' => 'Sur'],
            ],
        ]);
    }

    /**
     * Aprueba una preinscripción: crea Person + User (rol student) + Matricula
     * en una transacción, y marca la preinscripción como aprobada.
     */
    public function aprobar(AprobarPreinscripcionRequest $request, Preinscripcion $preinscripcion): RedirectResponse
    {
        if ($preinscripcion->estado === Preinscripcion::ESTADO_INSCRITO) {
            throw ValidationException::withMessages([
                'preinscripcion' => 'Esta preinscripción ya fue inscrita.',
            ]);
        }

        if ($preinscripcion->estado === Preinscripcion::ESTADO_RECHAZADA) {
            throw ValidationException::withMessages([
                'preinscripcion' => 'No se puede aprobar una preinscripción rechazada.',
            ]);
        }

        $data = $request->validated();

        DB::transaction(function () use ($preinscripcion, $data) {
            // 1. Person (upsert por documento: si ya existe por inscripción
            //    directa previa, reusamos para no duplicar).
            $person = Person::query()
                ->where('document_type', $preinscripcion->tipo_documento)
                ->where('document_number', $preinscripcion->numero_documento)
                ->first();

            if (!$person) {
                $person = Person::create([
                    'document_type' => $preinscripcion->tipo_documento,
                    'document_number' => $preinscripcion->numero_documento,
                    'first_name' => $preinscripcion->nombres,
                    'last_name' => $preinscripcion->apellidos,
                    'birth_date' => $preinscripcion->fecha_nacimiento,
                    'gender' => $preinscripcion->sexo,
                    'phone_number' => $preinscripcion->telefono_tutor,
                ]);
            }

            // 2. User con username = documento (criterio del proyecto)
            $user = User::query()
                ->where('username', $preinscripcion->numero_documento)
                ->first();

            if (!$user) {
                $user = User::create([
                    'person_id' => $person->id,
                    'username' => $preinscripcion->numero_documento,
                    'password_hash' => Str::random(10),
                    'is_active' => true,
                ]);
                $user->assignRole(Role::STUDENT);
            }

            // 3. Matrícula (índice único person_id+periodo_id la hace idempotente)
            Matricula::query()->updateOrCreate(
                [
                    'person_id' => $person->id,
                    'periodo_id' => $preinscripcion->periodo_id,
                ],
                [
                    'sede' => $data['sede'],
                    'nivel' => $preinscripcion->nivel,
                    'grado' => $preinscripcion->grado,
                    'grupo' => $data['grupo'] ?? $preinscripcion->grupo,
                    'estado' => Matricula::ESTADO_ACTIVA,
                    'nombre_tutor' => $preinscripcion->nombre_tutor,
                    'telefono_tutor' => $preinscripcion->telefono_tutor,
                    'parentesco_tutor' => $preinscripcion->parentesco_tutor,
                ]
            );

            // 4. Marcar la preinscripción como inscrita
            $preinscripcion->update([
                'estado' => Preinscripcion::ESTADO_INSCRITO,
                'revisado_por' => Auth::id(),
                'revisado_at' => now(),
                'notas' => $data['notas'] ?? $preinscripcion->notas,
            ]);
        });

        return redirect()
            ->route('intranet.admisiones.preinscripciones')
            ->with('success', "Preinscripción #{$preinscripcion->id} aprobada e inscrita correctamente.");
    }

    /**
     * Rechaza una preinscripción con notas opcionales.
     */
    public function rechazar(Preinscripcion $preinscripcion): RedirectResponse
    {
        if ($preinscripcion->estado === Preinscripcion::ESTADO_INSCRITO) {
            throw ValidationException::withMessages([
                'preinscripcion' => 'No se puede rechazar: ya fue inscrita.',
            ]);
        }

        $data = request()->validate([
            'notas' => ['nullable', 'string', 'max:500'],
        ]);

        $preinscripcion->update([
            'estado' => Preinscripcion::ESTADO_RECHAZADA,
            'revisado_por' => Auth::id(),
            'revisado_at' => now(),
            'notas' => $data['notas'] ?? $preinscripcion->notas,
        ]);

        return redirect()
            ->route('intranet.admisiones.preinscripciones')
            ->with('success', "Preinscripción #{$preinscripcion->id} rechazada.");
    }

    private function serialize(Preinscripcion $p): array
    {
        return [
            'id' => $p->id,
            'nombres' => $p->nombres,
            'apellidos' => $p->apellidos,
            'nombre_completo' => $p->nombre_completo,
            'tipo_documento' => $p->tipo_documento,
            'numero_documento' => $p->numero_documento,
            'fecha_nacimiento' => $p->fecha_nacimiento?->toDateString(),
            'sexo' => $p->sexo,
            'nivel' => $p->nivel,
            'grado' => $p->grado,
            'grupo' => $p->grupo,
            'nombre_tutor' => $p->nombre_tutor,
            'telefono_tutor' => $p->telefono_tutor,
            'email_tutor' => $p->email_tutor,
            'parentesco_tutor' => $p->parentesco_tutor,
            'periodo' => $p->periodo?->nombre,
            'estado' => $p->estado,
            'notas' => $p->notas,
            'revisado_por' => $p->revisadoPor?->person?->full_name,
            'revisado_at' => $p->revisado_at?->toDateTimeString(),
            'created_at' => $p->created_at?->toDateString(),
        ];
    }
}
