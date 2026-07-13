<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int|null $preinscripcion_id
 * @property int|null $person_id
 * @property int $periodo_id
 * @property string $nivel
 * @property string $grado
 * @property string|null $grupo
 * @property string $sede_propuesta
 * @property float $monto_inscripcion
 * @property float $monto_pagado
 * @property string $estado
 * @property int|null $created_by
 * @property string|null $notas
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Preinscripcion|null $preinscripcion
 * @property-read Person|null $person
 * @property-read Periodo $periodo
 * @property-read User|null $creador
 * @property-read \Illuminate\Database\Eloquent\Collection<int, Pago> $pagos
 * @property-read Pago|null $ultimoPago
 * @property-read Matricula|null $matricula
 */
class Inscripcion extends Model
{
    use HasFactory;

    protected $table = 'inscripciones';

    protected $fillable = [
        'preinscripcion_id',
        'person_id',
        'periodo_id',
        'nivel',
        'grado',
        'grupo',
        'sede_propuesta',
        'monto_inscripcion',
        'monto_pagado',
        'estado',
        'created_by',
        'notas',
    ];

    protected $casts = [
        'monto_inscripcion' => 'decimal:2',
        'monto_pagado'      => 'decimal:2',
    ];

    public const ESTADO_PENDIENTE = 'pendiente';
    public const ESTADO_PAGADA    = 'pagada';
    public const ESTADO_ANULADA   = 'anulada';

    // -------------------------------------------------------------------
    // Relaciones
    // -------------------------------------------------------------------

    public function preinscripcion(): BelongsTo
    {
        return $this->belongsTo(Preinscripcion::class);
    }

    public function person(): BelongsTo
    {
        return $this->belongsTo(Person::class);
    }

    public function periodo(): BelongsTo
    {
        return $this->belongsTo(Periodo::class);
    }

    public function creador(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * @return HasMany<Pago, $this>
     */
    public function pagos(): HasMany
    {
        return $this->hasMany(Pago::class);
    }

    /**
     * Solo pagos validados son los que cuentan para el monto.
     *
     * @return HasMany<Pago, $this>
     */
    public function pagosValidados(): HasMany
    {
        return $this->hasMany(Pago::class)->where('estado', Pago::ESTADO_VALIDADO);
    }

    /**
     * @return HasOne<Matricula, $this>
     */
    public function matricula(): HasOne
    {
        return $this->hasOne(Matricula::class);
    }

    // -------------------------------------------------------------------
    // Helpers de estado
    // -------------------------------------------------------------------

    public function estaPendiente(): bool
    {
        return $this->estado === self::ESTADO_PENDIENTE;
    }

    public function estaPagada(): bool
    {
        return $this->estado === self::ESTADO_PAGADA;
    }

    public function fueAnulada(): bool
    {
        return $this->estado === self::ESTADO_ANULADA;
    }

    public function tieneMatricula(): bool
    {
        return $this->matricula()->exists();
    }

    /**
     * Saldo restante por pagar. Nunca negativo (clamp a 0).
     */
    public function saldoPendiente(): float
    {
        $saldo = (float) $this->monto_inscripcion - (float) $this->monto_pagado;
        return $saldo > 0 ? $saldo : 0.0;
    }

    /**
     * ¿La inscripción está completamente pagada?
     * Usa una tolerancia de 0.01 para evitar problemas de redondeo decimal.
     */
    public function pagadaCompleta(): bool
    {
        return ((float) $this->monto_pagado) + 0.01 >= (float) $this->monto_inscripcion;
    }

    // -------------------------------------------------------------------
    // Recalculo de monto_pagado
    // -------------------------------------------------------------------

    /**
     * Recalcula `monto_pagado` desde los Pagos en estado `validado`.
     * Debe llamarse desde un observer de Pago (en saved/deleted/restored).
     *
     * NO cambia `estado` aquí: eso lo hace `procesarSiPagada()` que es el
     * único punto donde se decide si la inscripción se vuelve `pagada` y
     * se crea la Matrícula.
     */
    public function recalcularMontoPagado(): void
    {
        $total = (float) $this->pagosValidados()->sum('monto');
        $this->forceFill(['monto_pagado' => $total])->save();
    }

    /**
     * Llamar tras recalcular el monto: si ya está pagada y todavía no tiene
     * matrícula, crea la Matrícula y marca la Inscripcion como `pagada`.
     *
     * Si la Inscripcion ya estaba pagada pero por algún motivo se borró la
     * matrícula, vuelve a crearla.
     */
    public function procesarSiPagada(): void
    {
        if (! $this->pagadaCompleta() || $this->fueAnulada()) {
            return;
        }

        if (! $this->estaPagada()) {
            $this->forceFill(['estado' => self::ESTADO_PAGADA])->save();
        }

        if (! $this->tieneMatricula()) {
            $this->crearMatriculaSiFalta();
        }
    }

    /**
     * Crea la Matrícula a partir del snapshot de la Inscripcion.
     * Centralizado aquí para que tanto el flujo de aprobación como el observer
     * de Pago pasen por el mismo código.
     */
    public function crearMatriculaSiFalta(): Matricula
    {
        if ($this->matricula) {
            return $this->matricula;
        }

        // Para inscripciones ligadas a una preinscripción, los datos del tutor
        // vienen de ahí. Para admisiones directas, los toma del request (el
        // controller los copió a la Inscripcion.notas como JSON o similar).
        $pre = $this->preinscripcion;

        return Matricula::create([
            'inscripcion_id'    => $this->id,
            'person_id'         => $this->person_id,
            'periodo_id'        => $this->periodo_id,
            'sede'              => $this->sede_propuesta,
            'nivel'             => $this->nivel,
            'grado'             => $this->grado,
            'grupo'             => $this->grupo,
            'estado'            => Matricula::ESTADO_ACTIVA,
            'nombre_tutor'      => $pre?->nombre_tutor      ?? '',
            'telefono_tutor'    => $pre?->telefono_tutor    ?? '',
            'parentesco_tutor'  => $pre?->parentesco_tutor  ?? 'tutor',
        ]);
    }

    // -------------------------------------------------------------------
    // Scopes
    // -------------------------------------------------------------------

    /**
     * @param  \Illuminate\Database\Eloquent\Builder<Inscripcion> $query
     * @return \Illuminate\Database\Eloquent\Builder<Inscripcion>
     */
    public function scopePendientes($query)
    {
        return $query->where('estado', self::ESTADO_PENDIENTE);
    }

    /**
     * @param  \Illuminate\Database\Eloquent\Builder<Inscripcion> $query
     * @return \Illuminate\Database\Eloquent\Builder<Inscripcion>
     */
    public function scopePagadas($query)
    {
        return $query->where('estado', self::ESTADO_PAGADA);
    }

    /**
     * @param  \Illuminate\Database\Eloquent\Builder<Inscripcion> $query
     * @return \Illuminate\Database\Eloquent\Builder<Inscripcion>
     */
    public function scopeDelPeriodo($query, int $periodoId)
    {
        return $query->where('periodo_id', $periodoId);
    }
}