<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class ProfileController extends Controller
{
    // SCRUM-13 — US-04 : Consulter son profil
    public function show(Request $request)
    {
        return response()->json($request->user());
    }

    // SCRUM-44 — US-05 : Modifier son profil (photo, filière, niveau, mot de passe)
    // Envoyé en POST (multipart/form-data) à cause de l'upload de photo.
    public function update(Request $request)
    {
        $user = $request->user();

        $data = $request->validate([
            'filiere'             => 'sometimes|required|string|max:100',
            'niveau'              => 'sometimes|required|string|max:50',
            'notifications_email' => 'sometimes|boolean',
            'photo'               => 'sometimes|image|mimes:jpg,jpeg,png|max:2048',
            'current_password'    => 'required_with:password|string',
            'password'            => 'sometimes|string|min:8|confirmed',
        ], [
            'photo.image'                    => 'Le fichier doit être une image.',
            'photo.max'                      => 'La photo ne doit pas dépasser 2 Mo.',
            'current_password.required_with' => 'Saisissez votre mot de passe actuel.',
        ]);

        if ($request->filled('password')) {
            if (! Hash::check($request->current_password, $user->password)) {
                return response()->json([
                    'message' => 'Mot de passe actuel incorrect.',
                    'errors'  => ['current_password' => ['Mot de passe actuel incorrect.']],
                ], 422);
            }
            $user->password = Hash::make($request->password);
        }

        if ($request->hasFile('photo')) {
            if ($user->photo) {
                Storage::disk('public')->delete($user->photo);
            }
            $user->photo = $request->file('photo')->store('profils', 'public');
        }

        $user->fill(collect($data)->only(['filiere', 'niveau', 'notifications_email'])->all());
        $user->save();

        return response()->json([
            'message' => 'Profil mis à jour.',
            'user'    => $user->fresh(),
        ]);
    }

    // SCRUM-14 — US-06 : Supprimer son compte
    // Les annonces seront supprimées automatiquement grâce au onDelete('cascade') du Sprint 2.
    public function destroy(Request $request)
    {
        $user = $request->user();

        // Un administrateur ne peut pas supprimer son propre compte
        if ($user->isAdmin()) {
            return response()->json(['message' => 'Un administrateur ne peut pas supprimer son compte.'], 403);
        }

        if ($user->photo) {
            Storage::disk('public')->delete($user->photo);
        }

        // Photos des annonces (les lignes en base partent en cascade)
        foreach ($user->annonces()->with('photos')->get() as $annonce) {
            Storage::disk('public')->delete($annonce->photos->pluck('chemin')->all());
        }

        $user->tokens()->delete();
        $user->delete();

        return response()->json(['message' => 'Compte supprimé.']);
    }
}
