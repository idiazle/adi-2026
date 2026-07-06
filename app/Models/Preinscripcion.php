<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Preinscripcion extends Model
{
    use HasFactory;

    protected $fillable = [
        'nombre_completo',
        'email',
        'telefono',
        'fecha_nacimiento',
        'sexo',
        'nivel',
        'grado',
        'grupo',
        'nombre_tutor',
        'telefono_tutor',
        'parentesco_tutor',
        'periodo_id',
        'estado',
        'notas',
        'revisado_por',
        'revisado_at',
    ];

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

    public function alumno(): HasOne
    {
        return $this->hasOne(User::class, 'preinscripcion_id');
    }

    public function estaPendiente(): bool
    {
        return $this->estado === self::ESTADO_PENDIENTE;
    }

    public function estaAprobada(): bool
    {
        return $this->estado === self::ESTADO_APROBADA;
    }

    public function puedeInscribirse(): bool
    {
        return $this->estado === self::ESTADO_APROBADA && !$this->alumno;
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
