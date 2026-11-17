<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Annonce;
use App\Models\Categorie;
use App\Models\Conversation;
use App\Models\Demande;
use App\Models\MatchResult;
use App\Models\Message;
use App\Models\Reservation;
use App\Models\User;
use Illuminate\Support\Facades\DB;

// Statistiques de la plateforme (dashboard administrateur)
class StatsController extends Controller
{
    // GET /api/admin/stats
    public function index()
    {
        $etudiants = User::where('role', 'etudiant');
        $il7j = now()->subDays(7);
        $il14j = now()->subDays(14);

        // ---- 8 dernières semaines : inscriptions, annonces, échanges terminés ----
        $debut = now()->startOfWeek()->subWeeks(7);
        $inscrits = User::where('role', 'etudiant')->where('created_at', '>=', $debut)->pluck('created_at');
        $publiees = Annonce::where('created_at', '>=', $debut)->pluck('created_at');
        $termines = Reservation::where('statut', 'terminee')->where('updated_at', '>=', $debut)->pluck('updated_at');

        $semaines = collect(range(0, 7))->map(function ($i) use ($debut, $inscrits, $publiees, $termines) {
            $lundi = $debut->copy()->addWeeks($i);
            $dimanche = $lundi->copy()->endOfWeek();
            $compter = fn ($dates) => $dates->filter(fn ($d) => $d->between($lundi, $dimanche))->count();
            return [
                'semaine'      => $lundi->toDateString(),
                'label'        => $lundi->format('d/m'),
                'inscriptions' => $compter($inscrits),
                'annonces'     => $compter($publiees),
                'echanges'     => $compter($termines),
            ];
        });

        $reservations = Reservation::select('statut', DB::raw('count(*) as n'))->groupBy('statut')->pluck('n', 'statut');

        return response()->json([
            'utilisateurs' => [
                'etudiants'          => (clone $etudiants)->count(),
                'actifs'             => (clone $etudiants)->where('bloque', false)->count(),
                'bloques'            => (clone $etudiants)->where('bloque', true)->count(),
                'nouveaux_7j'        => (clone $etudiants)->where('created_at', '>=', $il7j)->count(),
                'nouveaux_7j_avant'  => (clone $etudiants)->whereBetween('created_at', [$il14j, $il7j])->count(),
                'administrateurs'    => User::where('role', 'admin')->count(),
            ],
            'annonces' => [
                'total'             => Annonce::count(),
                'disponibles'       => Annonce::where('statut', 'disponible')->count(),
                'reservees'         => Annonce::where('statut', 'reservee')->count(),
                'cedees'            => Annonce::where('statut', 'cedee')->count(),
                'dons'              => Annonce::where('type', 'don')->count(),
                'echanges'          => Annonce::where('type', 'echange')->count(),
                'ventes'            => Annonce::where('type', 'vente')->count(),
                'nouvelles_7j'      => Annonce::where('created_at', '>=', $il7j)->count(),
                'nouvelles_7j_avant'=> Annonce::whereBetween('created_at', [$il14j, $il7j])->count(),
                'sans_photo'        => Annonce::where('statut', 'disponible')->doesntHave('photos')->count(),
                'valeur_en_vente'   => (float) Annonce::where('type', 'vente')->where('statut', 'disponible')->sum('prix'),
                'prix_moyen'        => round((float) Annonce::where('type', 'vente')->avg('prix'), 1),
            ],
            'activite' => [
                'demandes_ouvertes'     => Demande::where('statut', 'ouverte')->count(),
                'demandes_total'        => Demande::count(),
                'matchs'                => MatchResult::count(),
                'conversations'         => Conversation::count(),
                'messages'              => Message::count(),
                'messages_7j'           => Message::where('created_at', '>=', $il7j)->count(),
                'favoris'               => DB::table('favoris')->count(),
                'reservations_en_cours' => Reservation::whereIn('statut', ['en_attente', 'acceptee'])->count(),
                'echanges_termines'     => Reservation::where('statut', 'terminee')->count(),
                'en_attente_3j'         => Reservation::where('statut', 'en_attente')->where('created_at', '<', now()->subDays(3))->count(),
                'reservations'          => collect(['en_attente', 'acceptee', 'terminee', 'refusee', 'annulee'])
                                              ->mapWithKeys(fn ($s) => [$s => (int) ($reservations[$s] ?? 0)]),
            ],
            'categories' => Categorie::withCount('annonces')->orderByDesc('annonces_count')->limit(6)->get(['id', 'nom', 'icone']),
            'categories_vides' => Categorie::doesntHave('annonces')->doesntHave('demandes')->count(),
            'etablissements' => User::where('role', 'etudiant')->whereNotNull('etablissement')->where('etablissement', '<>', '')
                ->select('etablissement', DB::raw('count(*) as n'))->groupBy('etablissement')->orderByDesc('n')->limit(5)->get(),
            'derniers_inscrits' => User::where('role', 'etudiant')->latest()->limit(6)
                ->get(['id', 'name', 'prenom', 'email', 'etablissement', 'photo', 'bloque', 'created_at']),
            'dernieres_annonces' => Annonce::with(['user:id,name,prenom', 'categorie:id,nom,icone', 'photos'])
                ->latest()->limit(6)->get(['id', 'user_id', 'categorie_id', 'titre', 'type', 'prix', 'statut', 'created_at']),
            'semaines' => $semaines,
        ]);
    }
}
