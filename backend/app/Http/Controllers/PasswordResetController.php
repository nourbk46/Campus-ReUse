<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;

// SCRUM-12 — US-03 : Réinitialiser le mot de passe
// Durée de validité du lien : config/auth.php → passwords.users.expire = 30
class PasswordResetController extends Controller
{
    public function forgot(Request $request)
    {
        $request->validate(['email' => 'required|email']);

        Password::sendResetLink($request->only('email'));

        // Même réponse que l'e-mail existe ou non (on ne révèle pas les comptes existants)
        return response()->json([
            'message' => 'Si un compte existe pour cet e-mail, un lien valable 30 minutes a été envoyé.',
        ]);
    }

    public function reset(Request $request)
    {
        $request->validate([
            'token'    => 'required',
            'email'    => 'required|email',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function ($user, $password) {
                $user->forceFill([
                    'password'       => Hash::make($password), // crypté
                    'remember_token' => Str::random(60),
                ])->save();
                $user->tokens()->delete(); // déconnecte les anciennes sessions
            }
        );

        if ($status === Password::PASSWORD_RESET) {
            return response()->json(['message' => 'Mot de passe modifié. Vous pouvez vous connecter.']);
        }

        if ($status === Password::INVALID_TOKEN) {
            return response()->json(['message' => 'Ce lien est invalide ou a expiré. Refaites une demande.'], 422);
        }

        return response()->json(['message' => 'Impossible de réinitialiser le mot de passe.'], 422);
    }
}
