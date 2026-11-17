<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

// Actions réservées aux étudiants (publier, réserver, contacter, favoris).
// L'administrateur modère la plateforme mais ne participe pas aux échanges.
class EnsureEtudiant
{
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->user()?->isAdmin()) {
            return response()->json(['message' => 'Action réservée aux étudiants : un administrateur ne peut pas publier ni échanger.'], 403);
        }

        return $next($request);
    }
}
