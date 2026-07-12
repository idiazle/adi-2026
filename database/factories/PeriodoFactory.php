<?php

namespace Database\Factories;

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

        return [
            'nombre'                    => "Ciclo {$year}-" . fake()->randomElement(['1', '2']),
            'fecha_inicio'              => "{$year}-03-01",
            'fecha_fin'                 => "{$year}-12-15",
            'preinscripciones_activas'  => false,
            'preinscripciones_apertura' => null,
            'preinscripciones_cierre'   => null,
            'activo'                    => true,
        ];
    }

    public function inactivo(): static
    {
        return $this->state(fn () => ['activo' => false]);
    }
}