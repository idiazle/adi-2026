<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $person_id
 * @property int $periodo_id
 * @property string $sede
 * @property string $nivel
 * @property string $grado
 * @property string|null $grupo
 * @property string $estado
 * @property string $nombre_tutor
 * @property string $telefono_tutor
 * @property string $parentesco_tutor
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Person $person
 * @property-read Periodo $periodo
 */
class Matricula extends Model
{
    use HasFactory;

    protected $fillable = [
        'person_id',
        'periodo_id',
        'sede',
        'nivel',
        'grado',
        'grupo',
        'estado',
        'nombre_tutor',
        'telefono_tutor',
        'parentesco_tutor',
    ];

    public const ESTADO_ACTIVA = 'activa';
    public const ESTADO_BAJA = 'baja';
    public const ESTADO_FINALIZADA = 'finalizada';

    public const SEDE_CENTRAL = 'central';
    public const SEDE_NORTE = 'norte';
    public const SEDE_SUR = 'sur';

    public function person(): BelongsTo
    {
        return $this->belongsTo(Person::class);
    }

    public function periodo(): BelongsTo
    {
        return $this->belongsTo(Periodo::class);
    }

    public function scopeActivas($query)
    {
        return $query->where('estado', self::ESTADO_ACTIVA);
    }
}
