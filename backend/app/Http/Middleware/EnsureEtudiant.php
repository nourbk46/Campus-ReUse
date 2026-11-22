<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

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
