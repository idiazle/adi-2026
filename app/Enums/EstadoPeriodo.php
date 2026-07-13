<?php

namespace App\Enums;

enum EstadoPeriodo: string
{
    case Borrador = 'borrador';
    case Activo = 'activo';
    case Cerrado = 'cerrado';

    public function label(): string
    {
        return match ($this) {
            self::Borrador => 'Borrador',
            self::Activo => 'Activo',
            self::Cerrado => 'Cerrado',
        };
    }

    /**
     * Devuelve los valores como array (útil para selects / reglas in:).
     *
     * @return array<int, string>
     */
    public static function values(): array
    {
        return array_map(fn (self $c) => $c->value, self::cases());
    }
}