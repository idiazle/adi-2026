<?php

namespace App\Http\Controllers\Admisiones;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admisiones\PeriodoRequest;
use App\Models\Periodo;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ConfiguracionController extends Controller
{
    /**
     * Pantalla principal: precarga SIEMPRE el período marcado como
     * `activo = true` (el ciclo vigente). Como respaldo, si no hay
     * ninguno activo, muestra el más reciente por `id` para que la
     * pantalla nunca quede con un período inactivo editable.
     */
    public function index(): Response
    {
        $periodoSeleccionado = Periodo::query()
            ->where('activo', true)
            ->orderByDesc('id')
            ->first()
            ?? Periodo::query()->orderByDesc('id')->first();

        return $this->render($periodoSeleccionado);
    }

    /**
     * Pantalla para crear un nuevo período: siempre llega con el
     * formulario en blanco (`periodo = null`).
     */
    public function create(): Response
    {
        return $this->render(null);
    }

    /**
     * Pantalla de edición de un período concreto del historial.
     *
     * Si el id solicitado no existe, redirige al último período
     * registrado para que la pantalla siempre muestre algo editable.
     */
    public function edit(int $periodo): Response|RedirectResponse
    {
        $periodoSeleccionado = Periodo::query()->find($periodo);

        if (! $periodoSeleccionado) {
            $ultimo = Periodo::query()->orderByDesc('id')->first();

            if ($ultimo) {
                return redirect()
                    ->route('intranet.admisiones.configuracion.edit', ['periodo' => $ultimo->id]);
            }

            return redirect()->route('intranet.admisiones.configuracion.create');
        }

        return $this->render($periodoSeleccionado);
    }

    /**
     * Centraliza el render de la vista para evitar duplicar el código
     * de transformación del historial en cada método.
     */
    private function render(?Periodo $periodoSeleccionado): Response
    {
        $historial = Periodo::query()
            ->orderByDesc('id')
            ->get()
            ->map(fn (Periodo $p) => [
                'id' => $p->id,
                'nombre' => $p->nombre,
                'fecha_inicio' => $p->fecha_inicio?->toDateString(),
                'fecha_fin' => $p->fecha_fin?->toDateString(),
                'activo' => (bool) $p->activo,
                'preinscripciones_activas' => (bool) $p->preinscripciones_activas,
            ]);

        return Inertia::render('intranet/admisiones/pages/Configuracion', [
            'periodo' => $periodoSeleccionado ? $this->formatPeriodo($periodoSeleccionado) : null,
            'historial' => $historial,
        ]);
    }

    /**
     * Crea un nuevo período. Si viene `activo=true`, desactiva los demás
     * para mantener un único período activo a la vez.
     */
    public function store(PeriodoRequest $request): RedirectResponse
    {
        $data = $request->validated();

        $periodo = DB::transaction(function () use ($data) {
            if (($data['activo'] ?? false) === true) {
                Periodo::query()->where('activo', true)->update(['activo' => false]);
            }

            return Periodo::create($data);
        });

        return redirect()
            ->route('intranet.admisiones.configuracion')
            ->with('success', "Período \"{$periodo->nombre}\" creado correctamente.");
    }

    /**
     * Actualiza un período existente. Sirve típicamente para asignar las
     * fechas de apertura/cierre de preinscripciones sin crear un ciclo nuevo.
     */
    public function update(PeriodoRequest $request, Periodo $periodo): RedirectResponse
    {
        $data = $request->validated();

        DB::transaction(function () use ($data, $periodo) {
            if (($data['activo'] ?? false) === true) {
                Periodo::query()
                    ->where('activo', true)
                    ->whereKeyNot($periodo->id)
                    ->update(['activo' => false]);
            }

            $periodo->update($data);
        });

        return redirect()
            ->route('intranet.admisiones.configuracion')
            ->with('success', "Período \"{$periodo->nombre}\" actualizado correctamente.");
    }

    /**
     * @return array<string, mixed>
     */
    private function formatPeriodo(Periodo $p): array
    {
        return [
            'id' => $p->id,
            'nombre' => $p->nombre,
            'fecha_inicio' => $p->fecha_inicio?->toDateString(),
            'fecha_fin' => $p->fecha_fin?->toDateString(),
            'activo' => (bool) $p->activo,
            'preinscripciones_activas' => (bool) $p->preinscripciones_activas,
            'preinscripciones_apertura' => $p->preinscripciones_apertura?->format('Y-m-d\TH:i'),
            'preinscripciones_cierre' => $p->preinscripciones_cierre?->format('Y-m-d\TH:i'),
        ];
    }
}
