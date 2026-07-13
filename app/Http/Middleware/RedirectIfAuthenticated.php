<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

/**
 * Cierra la página de login si el usuario ya está autenticado.
 * Lo usamos para /intranet/login (intranet) y para /login (Fortify).
 */
class RedirectIfAuthenticated
{
    public function handle(Request $request, Closure $next, ?string $guard = null): Response
    {
        if (Auth::guard($guard)->check()) {
            return redirect('/intranet');
        }

        return $next($request);
    }
}
