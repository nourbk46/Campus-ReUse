<?php

namespace App\Http\Controllers;

use App\Models\Annonce;
use Illuminate\Http\Request;

// Favoris (EF-12) : ajouter / retirer une annonce, page « Mes favoris »
class FavoriController extends Controller
{
    // GET /api/favoris — mes annonces favorites, la plus récemment ajoutée d'abord
    public function index(Request $request)
    {
        return response()->json(
            $request->user()->favoris()
                ->with(['photos', 'categorie', 'user:id,name,prenom,etablissement,photo'])
                ->orderByPivot('created_at', 'desc')
                ->get()
        );
    }

    // GET /api/favoris/ids — pour afficher les cœurs ♥ sur les listes
    public function ids(Request $request)
    {
        return response()->json($request->user()->favoris()->pluck('annonces.id'));
    }

    // POST /api/annonces/{annonce}/favori
    public function store(Request $request, Annonce $annonce)
    {
        abort_if($annonce->user_id === $request->user()->id, 422, 'Tu ne peux pas ajouter ta propre annonce aux favoris.');

        $request->user()->favoris()->syncWithoutDetaching([$annonce->id]);

        return response()->json(['message' => 'Ajoutée aux favoris.', 'favori' => true], 201);
    }

    // DELETE /api/annonces/{annonce}/favori
    public function destroy(Request $request, Annonce $annonce)
    {
        $request->user()->favoris()->detach($annonce->id);

        return response()->json(['message' => 'Retirée des favoris.', 'favori' => false]);
    }
}
