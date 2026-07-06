<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Periodo extends Model
{
    use HasFactory;

    protected $fillable = [
        'nombre',
        'fecha_inicio',
        'fecha_fin',
        'preinscripciones_activas',
        'preinscripciones_apertura',
        'preinscripciones_cierre',
        'activo',
    ];

    protected $casts = [
        'fecha_inicio' => 'date',
        'fecha_fin' => 'date',
        'preinscripciones_activas' => 'boolean',
        'preinscripciones_apertura' => 'datetime',
        'preinscripciones_cierre' => 'datetime',
        'activo' => 'boolean',
    ];

    /**
     * ¿Las preinscripciones están actualmente abiertas?
     */
    public function arePreinscripcionesAbiertas(): bool
    {
        if (!$this->preinscripciones_activas) {
            return false;
        }

        $ahora = now();

        if ($this->preinscripciones_apertura && $ahora < $this->preinscripciones_apertura) {
            return false;
        }

        if ($this->preinscripciones_cierre && $ahora > $this->preinscripciones_cierre) {
            return false;
        }

        return true;
    }

    public function preinscripciones(): HasMany
    {
        return $this->hasMany(Preinscripcion::class);
    }

    public function alumnos(): HasMany
    {
        return $this->hasMany(User::class)->where('is_alumno', true);
    }
}
