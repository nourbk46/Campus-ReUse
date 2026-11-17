<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Annonce;
use App\Notifications\CampusNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

// Modération des annonces par l'administrateur (Sprint 5)
class AnnonceController extends Controller
{
    // GET /api/admin/annonces?search=&statut=&type=&categorie=&page=
    public function index(Request $request)
    {
        $q = Annonce::query()
            ->with(['user:id,name,prenom,email,bloque', 'categorie:id,nom,icone', 'photos'])
            ->withCount(['reservations', 'conversations']);

        if ($s = trim((string) $request->query('search'))) {
            $q->where(function ($w) use ($s) {
                $w->where('titre', 'like', "%{$s}%")
                  ->orWhere('description', 'like', "%{$s}%")
                  ->orWhereHas('user', fn ($u) => $u->where('name', 'like', "%{$s}%")
                      ->orWhere('prenom', 'like', "%{$s}%")
                      ->orWhere('email', 'like', "%{$s}%"));
            });
        }
        if (in_array($request->query('statut'), ['disponible', 'reservee', 'cedee'], true)) {
            $q->where('statut', $request->query('statut'));
        }
        if (in_array($request->query('type'), ['don', 'echange', 'vente'], true)) {
            $q->where('type', $request->query('type'));
        }
        if ($request->filled('categorie')) {
            $q->where('categorie_id', (int) $request->query('categorie'));
        }

        $tri = $request->query('tri') === 'ancien' ? 'asc' : 'desc';

        return response()->json($q->orderBy('created_at', $tri)->orderBy('id', $tri)->paginate(15)->withQueryString());
    }

    // GET /api/admin/annonces/{annonce} : fiche complète
    public function show(Annonce $annonce)
    {
        $annonce->load(['user:id,name,prenom,email,etablissement,photo,bloque', 'categorie:id,nom,icone', 'photos'])
            ->loadCount(['reservations', 'conversations']);
        $annonce->favoris_count = DB::table('favoris')->where('annonce_id', $annonce->id)->count();

        return response()->json($annonce);
    }

    // DELETE /api/admin/annonces/{annonce} : suppression pour modération (le vendeur est prévenu)
    public function destroy(Request $request, Annonce $annonce)
    {
        $data = $request->validate(['motif' => ['nullable', 'string', 'max:500']]);

        $vendeur = $annonce->user;
        $titre = $annonce->titre;

        foreach ($annonce->photos as $photo) {
            Storage::disk('public')->delete($photo->chemin);
        }
        $annonce->delete(); // photos, réservations, conversations : suppression en cascade

        $lignes = ["Ton annonce « {$titre} » a été retirée par un administrateur car elle ne respecte pas les règles de Campus ReUse."];
        if (! empty($data['motif'])) {
            $lignes[] = 'Motif : ' . $data['motif'];
        }
        $vendeur?->notify(new CampusNotification('annonce_retiree', 'Annonce retirée', $lignes, 'Voir mes annonces', '/mes-annonces'));

        return response()->json(['message' => "L'annonce « {$titre} » a été supprimée."]);
    }
}
