<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

/**
 * Middleware genérico de autorización por rol.
 *
 * Uso en rutas:
 *   ->middleware('role:admin')
 *   ->middleware('role:admin,secretaria')   // OR: pasa con cualquiera
 *
 * Si la ruta es invocada por un usuario no autenticado, lo redirige al login.
 * Si está autenticado pero sin el rol, devuelve 403.
 */
class EnsureUserHasRole
{
    /**
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response) $next
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = Auth::user();

        if (! $user) {
            return redirect('/intranet/login');
        }

        foreach ($roles as $role) {
            if ($user->hasRole($role)) {
                return $next($request);
            }
        }

        abort(403, 'No tienes permisos para acceder a esta sección.');
    }
}