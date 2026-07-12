<?php

namespace App\Models;

use Database\Factories\PersonFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string|null $document_type
 * @property string|null $document_number
 * @property string $first_name
 * @property string $last_name
 * @property Carbon|null $birth_date
 * @property string|null $gender
 * @property string|null $phone_number
 * @property string|null $address
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable([
    'document_type',
    'document_number',
    'first_name',
    'last_name',
    'birth_date',
    'gender',
    'phone_number',
    'address',
])]
class Person extends Model
{
    /** @use HasFactory<PersonFactory> */
    use HasFactory;

    /**
     * Forzamos el nombre de la tabla para evitar la pluralización a "people".
     */
    protected $table = 'persons';

    protected $casts = [
        'birth_date' => 'date',
    ];

    /**
     * Acceso al nombre completo ("Apellido, Nombre").
     */
    public function getFullNameAttribute(): string
    {
        return trim(($this->last_name ?? '') . ', ' . ($this->first_name ?? ''));
    }

    /**
     * Usuario asociado a esta persona (relación 1:1).
     */
    public function user(): HasMany
    {
        return $this->hasMany(User::class);
    }

    /**
     * Historial de matrículas de esta persona en distintos períodos.
     * Permite consultar en qué ciclos estuvo inscrita.
     */
    public function matriculas(): HasMany
    {
        return $this->hasMany(Matricula::class);
    }
}
