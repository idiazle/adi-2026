<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Preinscripcion extends Model
{
    use HasFactory;

    /**
     * Forzamos el nombre de la tabla: Eloquent pluralizaría "Preinscripcion"
     * como "preinscripcions" (incorrecto en español).
     */
    protected $table = 'preinscripciones';

    protected $fillable = [
        'apellidos',
        'nombres',
        'direccion',
        'tipo_documento',
        'numero_documento',
        'fecha_nacimiento',
        'sexo',
        'nivel',
        'grado',
        'grupo',
        'nombre_tutor',
        'telefono_tutor',
        'email_tutor',
        'parentesco_tutor',
        'periodo_id',
        'estado',
        'notas',
        'revisado_por',
        'revisado_at',
    ];

    /**
     * Accessor: nombre completo compuesto a partir de nombres y apellidos.
     */
    protected $appends = ['nombre_completo'];

    public function getNombreCompletoAttribute(): string
    {
        return trim(($this->nombres ?? '') . ' ' . ($this->apellidos ?? ''));
    }

    protected $casts = [
        'fecha_nacimiento' => 'date',
        'revisado_at' => 'datetime',
    ];

    const ESTADO_PENDIENTE = 'pendiente';
    const ESTADO_APROBADA = 'aprobada';
    const ESTADO_RECHAZADA = 'rechazada';
    const ESTADO_INSCRITO = 'inscrito';

    public function periodo(): BelongsTo
    {
        return $this->belongsTo(Periodo::class);
    }

    public function revisadoPor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'revisado_por');
    }

    public function estaPendiente(): bool
    {
        return $this->estado === self::ESTADO_PENDIENTE;
    }

    public function estaAprobada(): bool
    {
        return $this->estado === self::ESTADO_APROBADA;
    }

    /**
     * Una preinscripción aprobada está lista para convertirse en usuario
     * mientras no exista aún un usuario asociado. Manténgalo sincronizado
     * con la lógica que crea el User desde la Preinscripcion.
     */
    public function puedeInscribirse(): bool
    {
        return $this->estado === self::ESTADO_APROBADA;
    }

    public function scopePendientes($query)
    {
        return $query->where('estado', self::ESTADO_PENDIENTE);
    }

    public function scopeAprobadas($query)
    {
        return $query->where('estado', self::ESTADO_APROBADA);
    }

    public function scopeDelPeriodo($query, $periodoId)
    {
        return $query->where('periodo_id', $periodoId);
    }
}
