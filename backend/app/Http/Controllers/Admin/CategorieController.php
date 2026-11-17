<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Categorie;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

// Gestion des catégories par l'administrateur
//   SCRUM-39 ajouter · SCRUM-52 modifier · SCRUM-53 supprimer
class CategorieController extends Controller
{
    // GET /api/admin/categories — avec le nombre d'annonces et de demandes
    public function index()
    {
        return response()->json(
            Categorie::withCount(['annonces', 'demandes'])->orderBy('nom')->get()
        );
    }

    // SCRUM-39 : POST /api/admin/categories
    public function store(Request $request)
    {
        $categorie = Categorie::create($this->valider($request));

        return response()->json(['message' => "Catégorie « {$categorie->nom} » ajoutée.", 'categorie' => $categorie], 201);
    }

    // SCRUM-52 : PUT /api/admin/categories/{categorie}
    public function update(Request $request, Categorie $categorie)
    {
        $categorie->update($this->valider($request, $categorie));

        return response()->json(['message' => 'Catégorie modifiée.', 'categorie' => $categorie->fresh()]);
    }

    // SCRUM-53 : DELETE /api/admin/categories/{categorie}
    public function destroy(Categorie $categorie)
    {
        $annonces = $categorie->annonces()->count();
        $demandes = $categorie->demandes()->count();

        if ($annonces || $demandes) {
            return response()->json([
                'message' => "Impossible de supprimer « {$categorie->nom} » : elle contient $annonces annonce(s) et $demandes demande(s).",
            ], 422);
        }

        $categorie->delete();

        return response()->json(['message' => "Catégorie « {$categorie->nom} » supprimée."]);
    }

    // Pas de doublon (sans tenir compte des majuscules ni des espaces)
    private function valider(Request $request, ?Categorie $categorie = null): array
    {
        $request->merge(['nom' => trim(preg_replace('/\s+/', ' ', (string) $request->input('nom')))]);

        return $request->validate([
            'nom'   => ['required', 'string', 'min:2', 'max:100',
                        Rule::unique('categories', 'nom')->ignore($categorie?->id)],
            'icone' => 'nullable|string|max:10',
        ], [
            'nom.required' => 'Le nom de la catégorie est obligatoire.',
            'nom.unique'   => 'Cette catégorie existe déjà.',
            'nom.min'      => 'Le nom doit contenir au moins 2 caractères.',
        ]);
    }
}
