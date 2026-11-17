<?php

namespace Database\Seeders;

use App\Models\Categorie;
use Illuminate\Database\Seeder;

// php artisan db:seed --class=CategorieSeeder
class CategorieSeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['Livres & cours', '📚'],
            ['Informatique', '💻'],
            ['Fournitures', '✏️'],
            ['Électronique', '🔌'],
            ['Vêtements', '👕'],
            ['Mobilier', '🪑'],
            ['Sport & loisirs', '⚽'],
            ['Autre', '📦'],
        ];

        foreach ($categories as [$nom, $icone]) {
            Categorie::updateOrCreate(['nom' => $nom], ['icone' => $icone]);
        }
    }
}
