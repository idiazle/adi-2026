<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int    $id
 * @property string $codigo
 * @property string $nombre
 * @property string|null $descripcion
 * @property bool   $activo
 */
class ConceptoPago extends Model
{
    use HasFactory;

    protected $table = 'conceptos_pago';

    protected $fillable = [
        'codigo',
        'nombre',
        'descripcion',
        'activo',
    ];

    protected $casts = [
        'activo' => 'boolean',
    ];

    // Constantes por código, no por id: son estables frente a seeds/migraciones.
    public const CODIGO_INSCRIPCION = 'inscripcion';
    public const CODIGO_MENSUALIDAD = 'mensualidad';

    /**
     * @return HasMany<Pago, $this>
     */
    public function pagos(): HasMany
    {
        return $this->hasMany(Pago::class);
    }

    public static function inscripcion(): ?self
    {
        return static::query()->where('codigo', self::CODIGO_INSCRIPCION)->first();
    }

    public static function mensualidad(): ?self
    {
        return static::query()->where('codigo', self::CODIGO_MENSUALIDAD)->first();
    }
}