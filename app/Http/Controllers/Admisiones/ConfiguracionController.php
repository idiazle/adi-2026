<?php

namespace App\Http\Controllers\Admisiones;

use App\Enums\EstadoPeriodo;
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
     * Pantalla principal: precarga el período vigente (estado = activo).
     * Como respaldo, Periodo::vigente() devuelve el más reciente que no
     * esté cerrado, para que la pantalla nunca quede vacía.
     */
    public function index(): Response
    {
        return $this->render(Periodo::vigente());
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
            $ultimo = Periodo::query()->latest('id')->first();

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
            ->latest('id')
            ->get()
            ->map(fn (Periodo $p) => [
                'id' => $p->id,
                'codigo' => $p->codigo,
                'nombre' => $p->nombre,
                'fecha_inicio' => $p->fecha_inicio?->toDateString(),
                'fecha_fin' => $p->fecha_fin?->toDateString(),
                'estado' => $p->estado->value,
                'estado_label' => $p->estado->label(),
                'preinscripciones_pausadas' => $p->preinscripciones_pausadas,
            ]);

        return Inertia::render('intranet/admisiones/pages/Configuracion', [
            'periodo' => $periodoSeleccionado ? $this->formatPeriodo($periodoSeleccionado) : null,
            'historial' => $historial,
        ]);
    }

    /**
     * Crea un nuevo período. Si se crea en estado `activo`, cierra los
     * demás (los marca como `cerrado`) para mantener un único ciclo
     * vigente a la vez.
     */
    public function store(PeriodoRequest $request): RedirectResponse
    {
        $data = $this->normalizeData($request->validated());

        $periodo = DB::transaction(function () use ($data) {
            if (($data['estado'] ?? null) === EstadoPeriodo::Activo->value) {
                Periodo::query()
                    ->where('estado', EstadoPeriodo::Activo->value)
                    ->update(['estado' => EstadoPeriodo::Cerrado->value]);
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
        $data = $this->normalizeData($request->validated());

        DB::transaction(function () use ($data, $periodo) {
            if (($data['estado'] ?? null) === EstadoPeriodo::Activo->value) {
                Periodo::query()
                    ->where('estado', EstadoPeriodo::Activo->value)
                    ->whereKeyNot($periodo->id)
                    ->update(['estado' => EstadoPeriodo::Cerrado->value]);
            }

            $periodo->update($data);
        });

        return redirect()
            ->route('intranet.admisiones.configuracion')
            ->with('success', "Período \"{$periodo->nombre}\" actualizado correctamente.");
    }

    /**
     * Si no llega `estado` (frontend legacy), por defecto el nuevo período
     * se crea como `borrador` para evitar activar dos a la vez por accidente.
     *
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    private function normalizeData(array $data): array
    {
        $data['estado'] = $data['estado'] ?? EstadoPeriodo::Borrador->value;
        return $data;
    }

    /**
     * @return array<string, mixed>
     */
    private function formatPeriodo(Periodo $p): array
    {
        return [
            'id' => $p->id,
            'codigo' => $p->codigo,
            'nombre' => $p->nombre,
            'fecha_inicio' => $p->fecha_inicio?->toDateString(),
            'fecha_fin' => $p->fecha_fin?->toDateString(),
            'estado' => $p->estado->value,
            'estado_label' => $p->estado->label(),
            'preinscripciones_pausadas' => $p->preinscripciones_pausadas,
            'preinscripciones_apertura' => $p->preinscripciones_apertura?->format('Y-m-d\TH:i'),
            'preinscripciones_cierre' => $p->preinscripciones_cierre?->format('Y-m-d\TH:i'),
        ];
    }
}
