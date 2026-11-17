<?php

namespace App\Http\Controllers;

use App\Models\MatchResult;
use Illuminate\Http\Request;

// SCRUM-25 : « Mes propositions » — annonces qui correspondent à mes demandes, triées par score
class PropositionController extends Controller
{
    // GET /api/propositions?demande={id}
    public function index(Request $request)
    {
        $request->validate(['demande' => 'nullable|integer']);

        $propositions = MatchResult::query()
            ->whereHas('demande', fn ($q) => $q->where('user_id', $request->user()->id)->where('statut', 'ouverte'))
            ->whereHas('annonce', fn ($q) => $q->where('statut', 'disponible'))
            ->when($request->demande, fn ($q, $id) => $q->where('demande_id', $id))
            ->with([
                'demande:id,titre,budget_max,etat_min,categorie_id',
                'annonce.photos',
                'annonce.categorie',
                'annonce.user:id,name,prenom,etablissement,photo',
            ])
            ->orderByDesc('score')
            ->orderByDesc('updated_at')
            ->get();

        return response()->json($propositions);
    }
}
