<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Reservation;
use App\Models\User;
use App\Notifications\CampusNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

// Gestion des utilisateurs par l'administrateur
//   SCRUM-38 consulter · SCRUM-49 bloquer · SCRUM-50 débloquer · SCRUM-51 supprimer
class UserController extends Controller
{
    // GET /api/admin/users?search=&role=&bloque=&per_page=&page=
    public function index(Request $request)
    {
        $request->validate([
            'search'   => 'nullable|string|max:100',
            'role'     => 'nullable|in:etudiant,admin',
            'bloque'   => 'nullable|boolean',
            'per_page' => 'nullable|integer|min:1|max:100',
        ]);

        $users = User::query()
            ->withCount(['annonces', 'demandes'])
            ->when($request->search, function ($q, $search) {
                $q->where(function ($w) use ($search) {
                    $w->where('name', 'like', "%$search%")
                      ->orWhere('prenom', 'like', "%$search%")
                      ->orWhere('email', 'like', "%$search%")
                      ->orWhere('etablissement', 'like', "%$search%");
                });
            })
            ->when($request->role, fn ($q, $role) => $q->where('role', $role))
            ->when($request->filled('bloque'), fn ($q) => $q->where('bloque', $request->boolean('bloque')))
            ->orderByDesc('created_at')
            ->paginate($request->integer('per_page', 15));

        return response()->json($users);
    }

    // GET /api/admin/users/{user} — fiche détaillée
    public function show(User $user)
    {
        $user->loadCount(['annonces', 'demandes', 'favoris'])
             ->load(['annonces' => fn ($q) => $q->with('photos', 'categorie')->latest()->limit(6)]);

        return response()->json($user->toArray() + [
            'reservations_count' => $user->reservations()->count(),
            'echanges_termines'  => Reservation::where('statut', 'terminee')
                ->where(fn ($q) => $q->where('user_id', $user->id)->orWhereHas('annonce', fn ($a) => $a->where('user_id', $user->id)))
                ->count(),
        ]);
    }

    // SCRUM-49 : POST /api/admin/users/{user}/bloquer
    public function bloquer(Request $request, User $user)
    {
        $this->protegerAdmins($request, $user, 'bloquer');

        $user->update(['bloque' => true]);
        $user->tokens()->delete(); // déconnecté tout de suite, et ne peut plus se connecter

        $user->notify(new CampusNotification(
            'compte_bloque', 'Compte bloqué',
            ['Ton compte Campus ReUse a été bloqué par un administrateur.', 'Contacte l\'administration de ton établissement si tu penses qu\'il s\'agit d\'une erreur.']
        ));

        return response()->json(['message' => "{$user->prenom} {$user->name} est bloqué(e).", 'user' => $user->fresh()]);
    }

    // SCRUM-50 : POST /api/admin/users/{user}/debloquer
    public function debloquer(User $user)
    {
        $user->update(['bloque' => false]);

        $user->notify(new CampusNotification(
            'compte_debloque', 'Compte débloqué',
            ['Ton compte Campus ReUse a été débloqué. Tu peux de nouveau te connecter.'],
            'Se connecter', '/login'
        ));

        return response()->json(['message' => "{$user->prenom} {$user->name} est débloqué(e).", 'user' => $user->fresh()]);
    }

    // SCRUM-51 : DELETE /api/admin/users/{user}
    // (annonces, demandes, messages, réservations et favoris sont supprimés en cascade)
    public function destroy(Request $request, User $user)
    {
        $this->protegerAdmins($request, $user, 'supprimer');

        if ($user->photo) {
            Storage::disk('public')->delete($user->photo);
        }
        foreach ($user->annonces()->with('photos')->get() as $annonce) {
            Storage::disk('public')->delete($annonce->photos->pluck('chemin')->all());
        }
        $nom = "{$user->prenom} {$user->name}";
        $user->tokens()->delete();
        $user->delete();

        return response()->json(['message' => "Le compte de $nom a été supprimé."]);
    }

    private function protegerAdmins(Request $request, User $user, string $action): void
    {
        abort_if($user->id === $request->user()->id, 422, "Tu ne peux pas $action ton propre compte.");
        abort_if($user->isAdmin(), 422, "Impossible de $action un compte administrateur.");
    }
}
