<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call(CategorieSeeder::class);

        User::updateOrCreate(['email' => 'admin@campusreuse.tn'], [
            'name' => 'Admin', 'prenom' => 'Campus',
            'password' => Hash::make('admin1234'),
            'role' => 'admin',
            'email_verified_at' => now(),
        ]);

        User::updateOrCreate(['email' => 'etudiant@campusreuse.tn'], [
            'name' => 'Test', 'prenom' => 'Etudiant',
            'password' => Hash::make('etudiant1234'),
            'role' => 'etudiant',
            'filiere' => 'Informatique', 'niveau' => 'L3',
            'etablissement' => 'ISET',
            'email_verified_at' => now(),
        ]);
    }
}
