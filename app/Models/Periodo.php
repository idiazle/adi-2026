<?php

namespace App\Models;

use App\Enums\EstadoPeriodo;
use Database\Factories\PeriodoFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $codigo
 * @property string $nombre
 * @property Carbon|null $fecha_inicio
 * @property Carbon|null $fecha_fin
 * @property Carbon|null $preinscripciones_apertura
 * @property Carbon|null $preinscripciones_cierre
 * @property bool $preinscripciones_pausadas
 * @property float $monto_inscripcion
 * @property float $monto_mensualidad
 * @property EstadoPeriodo $estado
 * @property Carbon|null $deleted_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Preinscripcion> $preinscripciones
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Inscripcion> $inscripciones
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Matricula> $matriculas
 */
class Periodo extends Model
{
    /** @use HasFactory<PeriodoFactory> */
    use HasFactory;

    use SoftDeletes;

    protected $fillable = [
        'codigo',
        'nombre',
        'fecha_inicio',
        'fecha_fin',
        'preinscripciones_pausadas',
        'preinscripciones_apertura',
        'preinscripciones_cierre',
        'estado',
        'monto_inscripcion',
        'monto_mensualidad',
    ];

    protected $casts = [
        'fecha_inicio' => 'date',
        'fecha_fin' => 'date',
        'preinscripciones_apertura' => 'datetime',
        'preinscripciones_cierre' => 'datetime',
        'preinscripciones_pausadas' => 'boolean',
        'estado' => EstadoPeriodo::class,
        'monto_inscripcion' => 'decimal:2',
        'monto_mensualidad' => 'decimal:2',
    ];

    // -------------------------------------------------------------------
    // Reglas de negocio (la ventana temporal es la fuente de verdad)
    // -------------------------------------------------------------------

    /**
     * Las preinscripciones están abiertas si:
     *   - el período no está pausado manualmente, y
     *   - estamos dentro de la ventana apertura/cierre (si está definida).
     *
     * Sin ventana explícita, no se considera abierto: forzamos a configurar
     * las fechas para evitar aperturas accidentales.
     */
    public function arePreinscripcionesAbiertas(): bool
    {
        if ($this->preinscripciones_pausadas) {
            return false;
        }

        $now = now();

        if ($this->preinscripciones_apertura && $now->lt($this->preinscripciones_apertura)) {
            return false;
        }

        if ($this->preinscripciones_cierre && $now->gt($this->preinscripciones_cierre)) {
            return false;
        }

        return $this->preinscripciones_apertura !== null
            || $this->preinscripciones_cierre !== null;
    }

    /**
     * ¿El ciclo está en curso según sus fechas?
     */
    public function enCurso(): bool
    {
        if (! $this->fecha_inicio || ! $this->fecha_fin) {
            return false;
        }

        $today = now()->startOfDay();

        return $today->betweenIncluded($this->fecha_inicio, $this->fecha_fin);
    }

    // -------------------------------------------------------------------
    // Scopes y helpers estáticos
    // -------------------------------------------------------------------

    /**
     * @param  Builder<Periodo>  $query
     * @return Builder<Periodo>
     */
    public function scopeVigente(Builder $query): Builder
    {
        return $query->where('estado', EstadoPeriodo::Activo->value);
    }

    /**
     * @param  Builder<Periodo>  $query
     * @return Builder<Periodo>
     */
    public function scopeConPreinscripcionesAbiertas(Builder $query): Builder
    {
        $now = now();

        return $query
            ->vigente()
            ->where('preinscripciones_pausadas', false)
            ->where(function (Builder $q) use ($now) {
                $q->whereNull('preinscripciones_apertura')
                    ->orWhere('preinscripciones_apertura', '<=', $now);
            })
            ->where(function (Builder $q) use ($now) {
                $q->whereNull('preinscripciones_cierre')
                    ->orWhere('preinscripciones_cierre', '>=', $now);
            });
    }

    /**
     * Devuelve el único período vigente (estado = activo).
     * Respaldo: el más reciente que no esté cerrado.
     */
    public static function vigente(): ?self
    {
        return static::query()
            ->vigente()
            ->latest('id')
            ->first()
            ?? static::query()
                ->where('estado', '!=', EstadoPeriodo::Cerrado->value)
                ->latest('id')
                ->first();
    }

    // -------------------------------------------------------------------
    // Relaciones
    // -------------------------------------------------------------------

    /**
     * @return HasMany<Preinscripcion, $this>
     */
    public function preinscripciones(): HasMany
    {
        return $this->hasMany(Preinscripcion::class);
    }

    /**
     * @return HasMany<Inscripcion, $this>
     */
    public function inscripciones(): HasMany
    {
        return $this->hasMany(Inscripcion::class);
    }

    /**
     * @return HasMany<Matricula, $this>
     */
    public function matriculas(): HasMany
    {
        return $this->hasMany(Matricula::class);
    }
}