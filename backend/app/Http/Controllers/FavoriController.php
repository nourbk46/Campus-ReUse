<?php

namespace App\Http\Controllers;

use App\Models\Annonce;
use Illuminate\Http\Request;

class FavoriController extends Controller
{

    public function index(Request $request)
    {
        return response()->json(
            $request->user()->favoris()
                ->with(['photos', 'categorie', 'user:id,name,prenom,etablissement,photo'])
                ->orderByPivot('created_at', 'desc')
                ->get()
        );
    }

    public function ids(Request $request)
    {
        return response()->json($request->user()->favoris()->pluck('annonces.id'));
    }

    public function store(Request $request, Annonce $annonce)
    {
        abort_if($annonce->user_id === $request->user()->id, 422, 'Tu ne peux pas ajouter ta propre annonce aux favoris.');

        $request->user()->favoris()->syncWithoutDetaching([$annonce->id]);

        return response()->json(['message' => 'Ajoutée aux favoris.', 'favori' => true], 201);
    }

    public function destroy(Request $request, Annonce $annonce)
    {
        $request->user()->favoris()->detach($annonce->id);

        return response()->json(['message' => 'Retirée des favoris.', 'favori' => false]);
    }
}
