<?php

namespace App\Http\Controllers;

use App\Models\MatchResult;
use Illuminate\Http\Request;

class PropositionController extends Controller
{
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
