<?php

/*
 * Tests de la pantalla /settings/profile.
 *
 * Estarán deshabilitados hasta que la vista profile esté implementada.
 * La lógica del controlador (username + person) se valida en tests/Feature/Backend/.
 */

beforeEach(function () {
    $this->markTestSkipped(
        'Pendiente del frontend: requiere vista settings/profile y rutas profile.*'
    );
});

test('placeholder', function () {
    expect(true)->toBeTrue();
});
