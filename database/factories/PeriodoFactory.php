<?php

namespace Database\Factories;

use App\Enums\EstadoPeriodo;
use App\Models\Periodo;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Periodo>
 */
class PeriodoFactory extends Factory
{
    protected $model = Periodo::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $year = fake()->numberBetween(2025, 2030);
        $semestre = fake()->randomElement(['1', '2']);
        $codigo = "{$year}-{$semestre}";

        return [
            'codigo'                     => $codigo . '-' . fake()->unique()->numberBetween(100, 999),
            'nombre'                     => "Ciclo {$year}-{$semestre}",
            'fecha_inicio'               => "{$year}-03-01",
            'fecha_fin'                  => "{$year}-12-15",
            'estado'                     => EstadoPeriodo::Borrador,
            'preinscripciones_pausadas'  => false,
            'preinscripciones_apertura'  => null,
            'preinscripciones_cierre'    => null,
        ];
    }

    public function inactivo(): static
    {
        return $this->state(fn () => ['estado' => EstadoPeriodo::Cerrado]);
    }

    public function activo(): static
    {
        return $this->state(fn () => ['estado' => EstadoPeriodo::Activo]);
    }

    public function conPreinscripcionesAbiertas(): static
    {
        return $this->state(fn () => [
            'estado' => EstadoPeriodo::Activo,
            'preinscripciones_pausadas' => false,
            'preinscripciones_apertura' => now()->subDay(),
            'preinscripciones_cierre' => now()->addDays(30),
        ]);
    }
}