<?php

namespace App\Http\Controllers\Admisiones;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admisiones\RegistrarPagoRequest;
use App\Http\Requests\Admisiones\ValidarPagoRequest;
use App\Models\ConceptoPago;
use App\Models\Inscripcion;
use App\Models\Pago;
use App\Models\Periodo;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class PagoController extends Controller
{
    /**
     * Cola de pagos pendientes para validación.
     * Solo accesible para admin (la ruta usa middleware de rol).
     */
    public function index(Request $request): Response
    {
        $estado = $request->query('estado', Pago::ESTADO_PENDIENTE);

        $pagos = Pago::query()
            ->with(['inscripcion.person', 'inscripcion.periodo', 'concepto', 'validador.person'])
            ->when($estado, fn ($q) => $q->where('estado', $estado))
            ->latest('id')
            ->paginate(20)
            ->through(fn (Pago $p) => $this->serialize($p));

        return Inertia::render('intranet/finanzas/pages/Pagos', [
            'pagos'   => $pagos,
            'estado'  => $estado,
            'filtros' => [
                'estados' => [
                    Pago::ESTADO_PENDIENTE => 'Pendientes',
                    Pago::ESTADO_VALIDADO  => 'Validados',
                    Pago::ESTADO_RECHAZADO => 'Rechazados',
                ],
            ],
        ]);
    }

    /**
     * Registra un pago contra una Inscripcion. Lo puede hacer:
     *  - Secretaria/admin desde la intranet (ruta protegida).
     *  - El alumno desde el portal público (ruta con token de Inscripcion).
     *
     * El comprobante es opcional: si la secretaria cobra en efectivo,
     * no necesita subir foto.
     */
    public function store(RegistrarPagoRequest $request, Inscripcion $inscripcion): RedirectResponse
    {
        // No se pueden registrar pagos en inscripciones anuladas.
        if ($inscripcion->fueAnulada()) {
            throw ValidationException::withMessages([
                'inscripcion' => 'No se pueden registrar pagos en una inscripción anulada.',
            ]);
        }

        // Ya pagada: no debería llegar aquí, pero por seguridad cortamos.
        if ($inscripcion->estaPagada()) {
            return back()->with('success', 'La inscripción ya está pagada en su totalidad.');
        }

        $data = $request->validated();
        $concepto = ConceptoPago::inscripcion();

        if (! $concepto) {
            throw ValidationException::withMessages([
                'concepto' => 'No existe el concepto de pago "inscripcion" en el catálogo. Ejecuta los seeders.',
            ]);
        }

        $comprobanteUrl = null;
        if ($request->hasFile('comprobante')) {
            $comprobanteUrl = $request->file('comprobante')
                ->store("comprobantes/{$inscripcion->id}", 'public');
        }

        $registradoPor = Auth::id();

        // Si el usuario no está autenticado (portal público), dejamos NULL.
        // El caller del portal debe haber pasado el filtro de autorización
        // correspondiente (ver InscripcionPortalController si se implementa).
        if (! $registradoPor) {
            // El portal público sube comprobantes sin user logueado.
            // No rechazamos: simplemente registramos `registrado_por = NULL`.
        }

        DB::transaction(function () use ($inscripcion, $data, $concepto, $comprobanteUrl, $registradoPor) {
            Pago::create([
                'inscripcion_id'    => $inscripcion->id,
                'concepto_pago_id'  => $concepto->id,
                'monto'             => $data['monto'],
                'metodo'            => $data['metodo'],
                'referencia_externa'=> $data['referencia_externa'] ?? null,
                'comprobante_url'   => $comprobanteUrl,
                'estado'            => Pago::ESTADO_PENDIENTE,
                'fecha_pago'        => $data['fecha_pago'] ?? now()->toDateString(),
                'registrado_por'    => $registradoPor,
                'notas'             => $data['notas'] ?? null,
            ]);
        });

        return back()->with('success', 'Pago registrado. Quedará pendiente hasta que un administrador lo valide.');
    }

    /**
     * Valida o rechaza un Pago. Solo admin.
     * El observer PagoObserver se encarga de recalcular el monto de la
     * Inscripcion y (si corresponde) crear la Matrícula.
     */
    public function decidir(ValidarPagoRequest $request, Pago $pago): RedirectResponse
    {
        if ($pago->estaValidado()) {
            throw ValidationException::withMessages([
                'pago' => 'Este pago ya fue validado.',
            ]);
        }

        $data = $request->validated();
        $userId = Auth::id();

        if ($data['accion'] === 'validar') {
            $pago->update([
                'estado'           => Pago::ESTADO_VALIDADO,
                'validado_por'     => $userId,
                'fecha_validacion' => now(),
                'motivo_rechazo'   => null,
            ]);
            $msg = 'Pago validado.';
        } else {
            $pago->update([
                'estado'          => Pago::ESTADO_RECHAZADO,
                'validado_por'    => $userId,
                'fecha_validacion'=> now(),
                'motivo_rechazo'  => $data['motivo_rechazo'],
            ]);
            $msg = 'Pago rechazado.';
        }

        return back()->with('success', $msg);
    }

    /**
     * @return array<string, mixed>
     */
    private function serialize(Pago $p): array
    {
        return [
            'id'               => $p->id,
            'monto'            => (float) $p->monto,
            'metodo'           => $p->metodo,
            'estado'           => $p->estado,
            'referencia'       => $p->referencia_externa,
            'comprobante_url'  => $p->comprobante_public_url,
            'fecha_pago'       => $p->fecha_pago?->toDateString(),
            'fecha_validacion' => $p->fecha_validacion?->toDateTimeString(),
            'motivo_rechazo'   => $p->motivo_rechazo,
            'notas'            => $p->notas,
            'created_at'       => $p->created_at?->toDateTimeString(),
            'inscripcion'      => $p->inscripcion ? [
                'id'      => $p->inscripcion->id,
                'persona' => $p->inscripcion->person?->full_name,
                'documento' => trim(($p->inscripcion->person->document_type ?? '') . ' ' . ($p->inscripcion->person->document_number ?? '')),
                'periodo' => $p->inscripcion->periodo?->nombre,
                'monto_inscripcion' => (float) $p->inscripcion->monto_inscripcion,
                'monto_pagado'      => (float) $p->inscripcion->monto_pagado,
                'saldo_pendiente'   => $p->inscripcion->saldoPendiente(),
            ] : null,
            'concepto' => $p->concepto?->nombre,
            'validador' => $p->validador?->person?->full_name,
        ];
    }
}