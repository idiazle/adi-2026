<?php

use App\Actions\Fortify\CreateNewUser;
use App\Models\Person;
use App\Models\Role;
use App\Models\User;

beforeEach(function () {
    foreach ([Role::STUDENT, Role::TEACHER, Role::PARENT, Role::TUTOR, Role::ADMIN] as $r) {
        Role::firstOrCreate(['name' => $r]);
    }
});

test('CreateNewUser creates a Person and a User with student role', function () {
    $action = new CreateNewUser;

    $user = $action->create([
        'username'      => 'new.student',
        'password'      => 'password',
        'password_confirmation' => 'password',
        'person'        => [
            'first_name'      => 'Ada',
            'last_name'       => 'Lovelace',
            'document_type'   => 'DNI',
            'document_number' => '12345678',
            'gender'          => 'F',
            'phone_number'    => '987654321',
        ],
    ]);

    expect($user)->toBeInstanceOf(User::class);
    expect($user->person)->toBeInstanceOf(Person::class);
    expect($user->username)->toBe('new.student');
    expect($user->is_active)->toBeTrue();
    expect($user->hasRole(Role::STUDENT))->toBeTrue();

    expect($user->person->first_name)->toBe('Ada');
    expect($user->person->document_number)->toBe('12345678');

    // La contraseña está hasheada y coincide con la original
    expect(\Illuminate\Support\Facades\Hash::check('password', $user->password_hash))->toBeTrue();
});

test('CreateNewUser fails if username is already taken', function () {
    User::factory()->create(['username' => 'taken']);

    $action = new CreateNewUser;

    expect(fn () => $action->create([
        'username'      => 'taken',
        'password'      => 'password',
        'password_confirmation' => 'password',
        'person'        => ['first_name' => 'A', 'last_name' => 'B'],
    ]))->toThrow(\Illuminate\Validation\ValidationException::class);
});

test('CreateNewUser requires person first_name and last_name', function () {
    $action = new CreateNewUser;

    expect(fn () => $action->create([
        'username'      => 'someuser',
        'password'      => 'password',
        'password_confirmation' => 'password',
        'person'        => ['first_name' => 'Solo'],
    ]))->toThrow(\Illuminate\Validation\ValidationException::class);
});
