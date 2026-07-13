<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Storage;

/**
 * @property int $id
 * @property int $inscripcion_id
 * @property int $concepto_pago_id
 * @property float $monto
 * @property string $metodo
 * @property string|null $referencia_externa
 * @property string|null $comprobante_url
 * @property string $estado
 * @property Carbon|null $fecha_pago
 * @property Carbon|null $fecha_validacion
 * @property int|null $validado_por
 * @property string|null $motivo_rechazo
 * @property string|null $notas
 * @property int|null $registrado_por
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Inscripcion $inscripcion
 * @property-read ConceptoPago $concepto
 * @property-read User|null $validador
 * @property-read User|null $registrador
 */
class Pago extends Model
{
    use HasFactory;

    protected $table = 'pagos';

    protected $fillable = [
        'inscripcion_id',
        'concepto_pago_id',
        'monto',
        'metodo',
        'referencia_externa',
        'comprobante_url',
        'estado',
        'fecha_pago',
        'fecha_validacion',
        'validado_por',
        'motivo_rechazo',
        'notas',
        'registrado_por',
    ];

    protected $casts = [
        'monto'           => 'decimal:2',
        'fecha_pago'      => 'date',
        'fecha_validacion'=> 'datetime',
    ];

    public const ESTADO_PENDIENTE = 'pendiente';
    public const ESTADO_VALIDADO  = 'validado';
    public const ESTADO_RECHAZADO = 'rechazado';

    public const METODO_EFECTIVO       = 'efectivo';
    public const METODO_TRANSFERENCIA  = 'transferencia';
    public const METODO_YAPE           = 'yape';
    public const METODO_PLIN           = 'plin';
    public const METODO_OTRO           = 'otro';

    // -------------------------------------------------------------------
    // Relaciones
    // -------------------------------------------------------------------

    public function inscripcion(): BelongsTo
    {
        return $this->belongsTo(Inscripcion::class);
    }

    public function concepto(): BelongsTo
    {
        return $this->belongsTo(ConceptoPago::class, 'concepto_pago_id');
    }

    /**
     * URL pública servible vía HTTP del comprobante adjunto.
     *
     * En BD guardamos el path relativo (ej: "comprobantes/2/abc.png")
     * porque es lo que devuelve `Storage::disk('public')->store(...)`.
     * Este accesor lo transforma a URL absoluta (`/storage/...`) lista
     * para usar en `<a href>` / `<img src>` sin que el navegador la
     * resuelva como ruta relativa.
     */
    protected function comprobantePublicUrl(): Attribute
    {
        return Attribute::get(function (): ?string {
            $path = $this->comprobante_url;

            if (empty($path)) {
                return null;
            }

            // Si por error se guardó una URL completa, devuélvela tal cual.
            if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
                return $path;
            }

            return Storage::disk('public')->url($path);
        });
    }

    public function validador(): BelongsTo
    {
        return $this->belongsTo(User::class, 'validado_por');
    }

    public function registrador(): BelongsTo
    {
        return $this->belongsTo(User::class, 'registrado_por');
    }

    // -------------------------------------------------------------------
    // Helpers de estado
    // -------------------------------------------------------------------

    public function estaPendiente(): bool
    {
        return $this->estado === self::ESTADO_PENDIENTE;
    }

    public function estaValidado(): bool
    {
        return $this->estado === self::ESTADO_VALIDADO;
    }

    public function fueRechazado(): bool
    {
        return $this->estado === self::ESTADO_RECHAZADO;
    }

    // -------------------------------------------------------------------
    // Scopes
    // -------------------------------------------------------------------

    /**
     * @param  \Illuminate\Database\Eloquent\Builder<Pago> $query
     * @return \Illuminate\Database\Eloquent\Builder<Pago>
     */
    public function scopePendientes($query)
    {
        return $query->where('estado', self::ESTADO_PENDIENTE);
    }

    /**
     * @param  \Illuminate\Database\Eloquent\Builder<Pago> $query
     * @return \Illuminate\Database\Eloquent\Builder<Pago>
     */
    public function scopeValidados($query)
    {
        return $query->where('estado', self::ESTADO_VALIDADO);
    }

    /**
     * @param  \Illuminate\Database\Eloquent\Builder<Pago> $query
     * @return \Illuminate\Database\Eloquent\Builder<Pago>
     */
    public function scopeDelPeriodo($query, int $periodoId)
    {
        return $query->whereHas('inscripcion', fn ($q) => $q->where('periodo_id', $periodoId));
    }
}