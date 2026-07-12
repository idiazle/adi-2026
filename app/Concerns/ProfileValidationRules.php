<?php

namespace App\Concerns;

use App\Models\User;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Validation\Rule;

trait ProfileValidationRules
{
    /**
     * Reglas de validación para el perfil de usuario.
     *
     * Valida el username único y los datos personales editables.
     *
     * @return array<string, array<int, ValidationRule|array<mixed>|string>>
     */
    protected function profileRules(?int $userId = null): array
    {
        return [
            'username' => $this->usernameRules($userId),

            // Datos de persona (anidados bajo person.*)
            'person'                          => ['sometimes', 'array'],
            'person.first_name'               => ['required_with:person', 'string', 'max:120'],
            'person.last_name'                => ['required_with:person', 'string', 'max:120'],
            'person.document_type'            => ['nullable', Rule::in(['DNI', 'CE', 'PAS', 'PTP'])],
            'person.document_number'          => ['nullable', 'string', 'max:30'],
            'person.birth_date'               => ['nullable', 'date'],
            'person.gender'                   => ['nullable', Rule::in(['M', 'F', 'O'])],
            'person.phone_number'             => ['nullable', 'string', 'max:30'],
            'person.address'                  => ['nullable', 'string', 'max:255'],
        ];
    }

    /**
     * Reglas para el campo username.
     *
     * @return array<int, ValidationRule|array<mixed>|string>
     */
    protected function usernameRules(?int $userId = null): array
    {
        return [
            'required',
            'string',
            'max:255',
            $userId === null
                ? Rule::unique(User::class, 'username')
                : Rule::unique(User::class, 'username')->ignore($userId),
        ];
    }
}
