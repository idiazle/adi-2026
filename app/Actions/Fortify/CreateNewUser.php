<?php

namespace App\Actions\Fortify;

use App\Concerns\PasswordValidationRules;
use App\Models\Person;
use App\Models\Role;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Laravel\Fortify\Contracts\CreatesNewUsers;

class CreateNewUser implements CreatesNewUsers
{
    use PasswordValidationRules;

    /**
     * Validate and create a newly registered user.
     *
     * Esquema de entrada esperado:
     *  - username                 (required, unique, ...)
     *  - password / password_confirmation
     *  - person.first_name, person.last_name              (required)
     *  - person.document_type, person.document_number    (optional)
     *  - person.birth_date, person.gender                (optional)
     *  - person.phone_number, person.address             (optional)
     *
     * @param  array<string, mixed>  $input
     */
    public function create(array $input): User
    {
        Validator::make($input, [
            'username' => [
                'required', 'string', 'max:255',
                Rule::unique(User::class, 'username'),
            ],
            'password' => $this->passwordRules(),

            'person'                          => ['required', 'array'],
            'person.first_name'               => ['required', 'string', 'max:120'],
            'person.last_name'                => ['required', 'string', 'max:120'],
            'person.document_type'            => ['nullable', Rule::in(['DNI', 'CE', 'PAS', 'PTP'])],
            'person.document_number'          => ['nullable', 'string', 'max:30'],
            'person.birth_date'               => ['nullable', 'date'],
            'person.gender'                   => ['nullable', Rule::in(['M', 'F', 'O'])],
            'person.phone_number'             => ['nullable', 'string', 'max:30'],
            'person.address'                  => ['nullable', 'string', 'max:255'],
        ], [], [
            'username'                 => 'nombre de usuario',
            'person.first_name'        => 'nombres',
            'person.last_name'         => 'apellidos',
            'person.document_type'     => 'tipo de documento',
            'person.document_number'   => 'número de documento',
            'person.birth_date'        => 'fecha de nacimiento',
            'person.gender'            => 'sexo',
            'person.phone_number'      => 'teléfono',
            'person.address'           => 'dirección',
        ])->validate();

        return DB::transaction(function () use ($input) {
            $person = Person::create($input['person']);

            $user = User::create([
                'person_id'     => $person->id,
                'username'      => $input['username'],
                'password_hash' => $input['password'],
                'is_active'     => true,
            ]);

            // Por defecto, los nuevos registros entran como "student".
            // Cambia esta lógica según la lógica de negocio.
            $user->assignRole(Role::STUDENT);

            return $user;
        });
    }
}
