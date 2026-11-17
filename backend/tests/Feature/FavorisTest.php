<?php

namespace Tests\Feature;

use App\Models\Annonce;
use App\Models\Categorie;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

// Lancer : php artisan test --filter=FavorisTest
class FavorisTest extends TestCase
{
    use RefreshDatabase;

    private User $moi;
    private Annonce $annonce;

    protected function setUp(): void
    {
        parent::setUp();
        $cat = Categorie::create(['nom' => 'Informatique']);
        $this->moi = $this->etudiant('moi@test.tn');
        $this->annonce = $this->etudiant('vendeur@test.tn')->annonces()->create([
            'categorie_id' => $cat->id, 'titre' => 'Clavier', 'etat' => 'bon', 'type' => 'don', 'statut' => 'disponible',
        ]);
    }

    private function etudiant(string $email): User
    {
        return User::create(['name' => 'T', 'prenom' => 'T', 'email' => $email, 'password' => Hash::make('password123'), 'role' => 'etudiant']);
    }

    public function test_ajouter_lister_et_retirer_un_favori(): void
    {
        $id = $this->annonce->id;
        $this->actingAs($this->moi, 'sanctum')->postJson("/api/annonces/$id/favori")->assertCreated();
        $this->actingAs($this->moi, 'sanctum')->postJson("/api/annonces/$id/favori")->assertCreated(); // pas de doublon

        $this->actingAs($this->moi, 'sanctum')->getJson('/api/favoris')->assertOk()->assertJsonCount(1)->assertJsonPath('0.titre', 'Clavier');
        $this->actingAs($this->moi, 'sanctum')->getJson('/api/favoris/ids')->assertExactJson([$id]);
        $this->actingAs($this->moi, 'sanctum')->getJson('/api/dashboard')->assertJsonPath('stats.favoris', 1);

        $this->actingAs($this->moi, 'sanctum')->deleteJson("/api/annonces/$id/favori")->assertOk();
        $this->actingAs($this->moi, 'sanctum')->getJson('/api/favoris')->assertJsonCount(0);
    }

    public function test_pas_sa_propre_annonce_et_connexion_requise(): void
    {
        $this->actingAs($this->annonce->user, 'sanctum')->postJson("/api/annonces/{$this->annonce->id}/favori")->assertStatus(422);
        $this->app['auth']->forgetGuards(); // requête suivante sans utilisateur connecté
        $this->getJson('/api/favoris')->assertStatus(401);
    }

    public function test_supprimer_l_annonce_retire_le_favori(): void
    {
        $this->moi->favoris()->attach($this->annonce->id);
        $this->annonce->delete();
        $this->assertEquals(0, $this->moi->favoris()->count());
    }
}
