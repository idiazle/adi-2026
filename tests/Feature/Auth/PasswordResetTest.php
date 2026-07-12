<?php

/*
 * Reset password está deshabilitado en este esquema porque users
 * ya no tiene columna `email`. Mantener este archivo como placeholder.
 */

beforeEach(function () {
    $this->markTestSkipped('Features::resetPasswords() deshabilitado en este esquema');
});

test('placeholder', function () {
    expect(true)->toBeTrue();
});
