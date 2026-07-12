<?php

/*
 * Tests de confirmación de contraseña.
 *
 * Estarán deshabilitados hasta que la vista auth/confirm-password exista.
 */

beforeEach(function () {
    $this->markTestSkipped('Pendiente del frontend: requiere vista auth/confirm-password');
});

test('placeholder', function () {
    expect(true)->toBeTrue();
});
