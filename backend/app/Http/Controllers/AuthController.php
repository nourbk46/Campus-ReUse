<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Auth\Events\Verified;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;

class AuthController extends Controller
{
    // SCRUM-10 — US-01 : Créer un compte
    public function register(Request $request)
    {
        $data = $request->validate([
            'name'          => 'required|string|max:100',
            'prenom'        => 'required|string|max:100',
            'email'         => 'required|email|max:191|unique:users,email',
            'password'      => 'required|string|min:8|confirmed',
            'filiere'       => 'required|string|max:100',
            'niveau'        => 'required|string|max:50',
            'etablissement' => 'required|string|max:150',
        ], [
            'email.unique'       => 'Cet e-mail est déjà utilisé.',
            'password.min'       => 'Le mot de passe doit contenir au moins 8 caractères.',
            'password.confirmed' => 'Les mots de passe ne correspondent pas.',
        ]);

        $data['password'] = Hash::make($data['password']); // mot de passe crypté
        $data['role'] = 'etudiant';

        $user = User::create($data);

        event(new Registered($user)); // envoie l'e-mail de confirmation

        return response()->json([
            'message' => 'Compte créé. Un e-mail de confirmation vous a été envoyé.',
        ], 201);
    }

    // Lien du mail de confirmation (route nommée verification.verify)
    public function verifyEmail(Request $request, $id, $hash)
    {
        $user = User::findOrFail($id);

        if (! hash_equals((string) $hash, sha1($user->getEmailForVerification()))) {
            abort(403, 'Lien de confirmation invalide.');
        }

        if (! $user->hasVerifiedEmail()) {
            $user->markEmailAsVerified();
            event(new Verified($user));
        }

        return redirect(env('FRONTEND_URL', 'http://localhost:5173') . '/login?verified=1');
    }

    public function resendVerification(Request $request)
    {
        if ($request->user()->hasVerifiedEmail()) {
            return response()->json(['message' => 'E-mail déjà confirmé.']);
        }
        $request->user()->sendEmailVerificationNotification();

        return response()->json(['message' => 'E-mail de confirmation renvoyé.']);
    }

    // SCRUM-11 — US-02 : Se connecter (blocage 15 min après 5 échecs)
    public function login(Request $request)
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string',
        ]);

        $key = 'login:' . strtolower($request->email) . '|' . $request->ip();

        if (RateLimiter::tooManyAttempts($key, 5)) {
            $minutes = ceil(RateLimiter::availableIn($key) / 60);
            return response()->json([
                'message' => "Trop de tentatives. Réessayez dans $minutes minute(s).",
            ], 429);
        }

        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            RateLimiter::hit($key, 15 * 60);
            $restantes = RateLimiter::remaining($key, 5);
            return response()->json([
                'message' => "E-mail ou mot de passe incorrect. Tentatives restantes : $restantes.",
            ], 401);
        }

        if ($user->bloque) {
            return response()->json(['message' => 'Votre compte a été bloqué par un administrateur.'], 403);
        }

        RateLimiter::clear($key);

        return response()->json([
            'token' => $user->createToken('campus-reuse')->plainTextToken,
            'user'  => $user,
        ]);
    }

    // SCRUM-11 — US-02 : Se déconnecter
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Déconnecté.']);
    }

    public function me(Request $request)
    {
        return response()->json($request->user());
    }
}
