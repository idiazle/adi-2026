<?php

namespace Database\Factories;

use App\Models\Person;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Person>
 */
class PersonFactory extends Factory
{
    protected $model = Person::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $gender = fake()->randomElement(['M', 'F']);

        return [
            'document_type'   => fake()->randomElement(['DNI', 'CE']),
            'document_number' => (string) fake()->unique()->numberBetween(10_000_000, 99_999_999),
            'first_name'      => fake()->firstName($gender === 'M' ? 'male' : 'female'),
            'last_name'       => fake()->lastName() . ' ' . fake()->lastName(),
            'birth_date'      => fake()->dateTimeBetween('-60 years', '-10 years')->format('Y-m-d'),
            'gender'          => $gender,
            'phone_number'    => fake()->numerify('9########'),
            'address'         => fake()->streetAddress(),
        ];
    }
}
