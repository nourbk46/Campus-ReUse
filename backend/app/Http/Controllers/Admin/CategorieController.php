<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Categorie;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class CategorieController extends Controller
{
    public function index()
    {
        return response()->json(
            Categorie::withCount(['annonces', 'demandes'])->orderBy('nom')->get()
        );
    }

    public function store(Request $request)
    {
        $categorie = Categorie::create($this->valider($request));

        return response()->json(['message' => "Catégorie « {$categorie->nom} » ajoutée.", 'categorie' => $categorie], 201);
    }

    public function update(Request $request, Categorie $categorie)
    {
        $categorie->update($this->valider($request, $categorie));

        return response()->json(['message' => 'Catégorie modifiée.', 'categorie' => $categorie->fresh()]);
    }

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
