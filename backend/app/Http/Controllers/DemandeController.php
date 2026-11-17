<?php

namespace App\Http\Controllers;

use App\Models\Annonce;
use App\Models\Demande;
use App\Services\MatchingService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;

class DemandeController extends Controller
{
    public function __construct(private MatchingService $matching)
    {
    }

    // SCRUM-23 / SCRUM-47 : page « Mes demandes »
    // GET /api/mes-demandes
    public function mesDemandes(Request $request)
    {
        $demandes = $request->user()->demandes()
            ->with('categorie')
            ->withCount(['matchs as propositions_count' => fn ($q) =>
                $q->whereHas('annonce', fn ($a) => $a->where('statut', 'disponible'))])
            ->withMax(['matchs as meilleur_score' => fn ($q) =>
                $q->whereHas('annonce', fn ($a) => $a->where('statut', 'disponible'))], 'score')
            ->latest()
            ->get();

        return response()->json($demandes);
    }

    // GET /api/demandes/{demande} (auteur seulement)
    public function show(Demande $demande)
    {
        Gate::authorize('view', $demande);

        return response()->json($demande->load('categorie'));
    }

    // SCRUM-22 : publier une demande
    // POST /api/demandes
    public function store(Request $request)
    {
        $data = $this->valider($request, creation: true);

        $demande = $request->user()->demandes()->create($data + ['statut' => 'ouverte']);

        // SCRUM-24 : matching déclenché à la publication
        $propositions = $this->matching->pourDemande($demande);

        return response()->json([
            'message'      => 'Demande publiée.',
            'demande'      => $demande->load('categorie'),
            'propositions' => $propositions,
        ], 201);
    }

    // SCRUM-23 : modifier sa demande
    // PUT ou POST /api/demandes/{demande}
    public function update(Request $request, Demande $demande)
    {
        Gate::authorize('update', $demande); // 403 si ce n'est pas l'auteur

        $data = $this->valider($request, creation: false);
        $demande->update($data);

        $propositions = $this->matching->pourDemande($demande->fresh());

        return response()->json([
            'message'      => 'Demande modifiée.',
            'demande'      => $demande->fresh()->load('categorie'),
            'propositions' => $propositions,
        ]);
    }

    // SCRUM-47 : supprimer sa demande (ses propositions partent en cascade)
    // DELETE /api/demandes/{demande}
    public function destroy(Demande $demande)
    {
        Gate::authorize('delete', $demande);

        $demande->delete();

        return response()->json(['message' => 'Demande supprimée.']);
    }

    private function valider(Request $request, bool $creation): array
    {
        $req = $creation ? 'required' : 'sometimes|required';

        return $request->validate([
            'titre'        => "$req|string|max:150",
            'description'  => 'nullable|string|max:2000',
            'categorie_id' => "$req|integer|exists:categories,id",
            'budget_max'   => "$req|numeric|min:0|max:100000",
            'etat_min'     => [$creation ? 'required' : 'sometimes', Rule::in(Annonce::ETATS)],
            'statut'       => ['sometimes', Rule::in(Demande::STATUTS)],
        ], [
            'titre.required'        => 'Le titre est obligatoire.',
            'categorie_id.required' => 'Choisissez une catégorie.',
            'budget_max.required'   => 'Indiquez votre budget maximum (0 pour un don ou un échange).',
            'budget_max.min'        => 'Le budget ne peut pas être négatif.',
            'etat_min.required'     => "Indiquez l'état minimum accepté.",
        ]);
    }
}
