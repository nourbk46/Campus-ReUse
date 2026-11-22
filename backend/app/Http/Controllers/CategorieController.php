<?php

namespace App\Http\Controllers;

use App\Models\Categorie;

class CategorieController extends Controller
{
    public function index()
    {
        return response()->json(Categorie::orderBy('nom')->get(['id', 'nom', 'icone']));
    }
}
