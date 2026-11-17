<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Pas de page de connexion web : les visiteurs non connectés ne sont pas redirigés
        $middleware->redirectGuestsTo(fn () => null);

        // Middleware « admin » : réservé aux administrateurs
        $middleware->alias([
            'admin' => \App\Http\Middleware\EnsureAdmin::class,
            'etudiant' => \App\Http\Middleware\EnsureEtudiant::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // Les routes /api répondent toujours en JSON (ex. 401 Unauthenticated), même depuis le navigateur
        $exceptions->shouldRenderJsonWhen(
            fn ($request, $e) => $request->is('api/*') || $request->expectsJson()
        );
    })->create();
