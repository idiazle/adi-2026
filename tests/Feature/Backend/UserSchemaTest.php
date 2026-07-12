<?php

use App\Models\Person;
use App\Models\Role;
use App\Models\User;

test('user factory creates a user with a person and username', function () {
    $user = User::factory()->create();

    expect($user->person)->toBeInstanceOf(Person::class);
    expect($user->username)->toBeString();
    expect($user->is_active)->toBeTrue();
    expect($user->password_hash)->toBeString();
});

test('user auth password returns password_hash column', function () {
    $user = User::factory()->create();
    expect($user->getAuthPassword())->toBe($user->password_hash);
});

test('user can be assigned a role and check membership', function () {
    $user = User::factory()->create();
    $user->assignRole(Role::STUDENT);

    expect($user->fresh()->hasRole(Role::STUDENT))->toBeTrue();
    expect($user->fresh()->hasRole(Role::ADMIN))->toBeFalse();
    expect($user->fresh()->isStudent())->toBeTrue();
    expect($user->fresh()->isAdmin())->toBeFalse();
});

test('user roles relationship returns many roles', function () {
    $user = User::factory()->create();
    $user->assignRole(Role::TEACHER);
    $user->assignRole(Role::TUTOR);

    expect($user->fresh()->roles)->toHaveCount(2);
    expect($user->fresh()->roles->pluck('name')->sort()->values()->all())
        ->toBe(['teacher', 'tutor']);
});

test('user can be authenticated with password_hash via Hash::check', function () {
    $user = User::factory()->create();
    expect(\Illuminate\Support\Facades\Hash::check('password', $user->password_hash))->toBeTrue();
});

test('username must be unique', function () {
    User::factory()->create(['username' => 'taken-name']);

    expect(fn () => User::factory()->create(['username' => 'taken-name']))
        ->toThrow(\Illuminate\Database\QueryException::class);
});

test('user inactive state factory variant', function () {
    $user = User::factory()->inactive()->create();
    expect($user->is_active)->toBeFalse();
});

test('scope activos returns only active users', function () {
    User::factory()->count(2)->create();
    User::factory()->inactive()->count(3)->create();

    expect(User::query()->activos()->count())->toBe(2);
});

test('scope withRole filters users by role name', function () {
    $a = User::factory()->create();
    $a->assignRole(Role::ADMIN);

    $b = User::factory()->create();
    $b->assignRole(Role::STUDENT);

    $c = User::factory()->create();
    $c->assignRole(Role::STUDENT);

    expect(User::query()->withRole(Role::STUDENT)->count())->toBe(2);
    expect(User::query()->withRole(Role::ADMIN)->count())->toBe(1);
    expect(User::query()->withRole(Role::TEACHER)->count())->toBe(0);
});

test('deleting a person cascades and removes the associated user', function () {
    $user = User::factory()->create();
    $personId = $user->person_id;

    Person::find($personId)->delete();

    expect(User::find($user->id))->toBeNull();
});

test('person full_name attribute formats lastname, firstname', function () {
    $person = Person::factory()->create([
        'first_name' => 'Ada',
        'last_name'  => 'Lovelace Byron',
    ]);

    expect($person->full_name)->toBe('Lovelace Byron, Ada');
});

test('user_roles pivot table has composite primary key', function () {
    $user = User::factory()->create();
    $user->assignRole(Role::ADMIN);

    // Re-inserting same (user_id, role_id) must throw
    expect(fn () => DB::table('user_roles')->insert([
        'user_id' => $user->id,
        'role_id' => Role::where('name', Role::ADMIN)->first()->id,
    ]))->toThrow(\Illuminate\Database\QueryException::class);
});
