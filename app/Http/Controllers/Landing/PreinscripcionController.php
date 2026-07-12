<?php

namespace App\Http\Controllers\Landing;

use App\Http\Controllers\Controller;
use App\Http\Requests\Landing\StorePreinscripcionRequest;
use App\Models\Periodo;
use App\Models\Preinscripcion;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class PreinscripcionController extends Controller
{
    /**
     * Display the preinscription form.
     */
    public function create(): Response
    {
        return Inertia::render('landing/PreInscriptions');
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

        if (!$periodo) {
            return back()->withErrors([
                'periodo' => 'No hay un período de preinscripciones activo en este momento.',
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
}
