<?php

namespace App\Http\Controllers\Admisiones;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreInscripcionDirectaRequest;
use App\Models\Matricula;
use App\Models\Periodo;
use App\Models\Person;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class InscripcionDirectaController extends Controller
{
    /**
     * Lista las matrículas activas para mostrarlas en la tabla.
     */
    public function index(): Response
    {
        $matriculas = Matricula::query()
            ->with(['person', 'periodo'])
            ->latest('id')
            ->get()
            ->map(fn (Matricula $m) => [
                'id' => $m->id,
                'nombre' => $m->person->full_name,
                'telefono' => $m->person->phone_number,
                'nivel' => $m->nivel,
                'grado' => $m->grado,
                'grupo' => $m->grupo,
                'sede' => $m->sede,
                'periodo' => $m->periodo->nombre,
                'fecha_inscripcion' => $m->created_at?->toDateString(),
            ]);

        return Inertia::render('intranet/admisiones/pages/InscripcionesDirectas', [
            'inscripciones' => $matriculas,
            'periodo_actual' => Periodo::query()
                ->where('activo', true)
                ->latest('id')
                ->value('nombre'),
        ]);
    }

    /**
     * Crea una inscripción directa: Person + User (rol student) + Matricula.
     * Todo dentro de una transacción para garantizar atomicidad.
     */
    public function store(StoreInscripcionDirectaRequest $request): RedirectResponse
    {
        // 1. Verificar primero que exista un periodo activo. Si no, devolvemos
        //    un error de validación claro en lugar de un 404 genérico, y
        //    evitamos crear filas huérfanas (Person, User) que no podrían
        //    terminar de asociarse a una Matricula.
        $periodo = Periodo::query()
            ->where('activo', true)
            ->latest('id')
            ->first();

        if (!$periodo) {
            return back()
                ->withInput()
                ->withErrors([
                    'periodo' => 'No se puede crear la inscripción: no existe un período activo',
                ]);
        }

        $data = $request->validated();

        $resultado = DB::transaction(function () use ($data, $periodo) {
            $person = Person::create([
                'document_type'   => $data['document_type'],
                'document_number' => $data['document_number'],
                'first_name'      => $data['first_name'],
                'last_name'       => $data['last_name'],
                'birth_date'      => $data['fecha_nacimiento'],
                'gender'          => $data['genero'] ?? null,
                'phone_number'    => $data['telefono'] ?? null,
            ]);

            // username = document_number (criterio acordado)
            $user = User::create([
                'person_id'     => $person->id,
                'username'      => $data['document_number'],
                'password_hash' => Str::random(10),
                'is_active'     => true,
            ]);
            $user->assignRole(Role::STUDENT);

            $matricula = Matricula::create([
                'person_id'        => $person->id,
                'periodo_id'       => $periodo->id,
                'sede'             => $data['sede'],
                'nivel'            => $data['nivel'],
                'grado'            => $data['grado'],
                'grupo'            => $data['grupo'] ?? null,
                'estado'           => Matricula::ESTADO_ACTIVA,
                'nombre_tutor'     => trim($data['tutor_last_name'] . ', ' . $data['tutor_first_name']),
                'telefono_tutor'   => $data['telefono_tutor'],
                'parentesco_tutor' => $data['parentesco_tutor'],
            ]);

            return $matricula;
        });

        return redirect()
            ->route('intranet.admisiones.inscripciones')
            ->with('success', "Inscripción #{$resultado->id} registrada correctamente. Username: {$data['document_number']}");
    }
}
