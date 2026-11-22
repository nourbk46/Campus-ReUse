<?php

namespace Tests\Feature;

use App\Models\Annonce;
use App\Models\Categorie;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Tests\Concerns\FausseImage;
use Tests\TestCase;

class Sprint2Test extends TestCase
{
    use RefreshDatabase, FausseImage;

    private Categorie $livres;
    private Categorie $info;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('public');
        $this->livres = Categorie::create(['nom' => 'Livres & cours']);
        $this->info = Categorie::create(['nom' => 'Informatique']);
    }

    private function etudiant(string $email = 'sami@test.tn'): User
    {
        return User::create([
            'name' => 'Ben Ali', 'prenom' => 'Sami', 'email' => $email,
            'password' => Hash::make('password123'), 'role' => 'etudiant',
        ]);
    }

    private function annonce(User $user, array $extra = []): Annonce
    {
        $a = $user->annonces()->create(array_merge([
            'categorie_id' => $this->livres->id, 'titre' => 'Livre de maths',
            'description' => 'Analyse L1', 'etat' => 'bon', 'type' => 'don',
            'statut' => 'disponible',
        ], $extra));
        $a->photos()->create(['chemin' => 'annonces/x.png', 'ordre' => 1]);
        return $a;
    }

    private function publier(User $user, array $champs, ?array $photos = null)
    {
        return $this->actingAs($user, 'sanctum')->post('/api/annonces', $champs + [
            'photos' => $photos ?? [$this->fausseImage()],
        ], ['Accept' => 'application/json']);
    }

    public function test_liste_affiche_seulement_les_disponibles_plus_recentes_d_abord(): void
    {
        $u = $this->etudiant();
        $ancienne = $this->annonce($u, ['titre' => 'Ancienne']);
        $ancienne->forceFill(['created_at' => now()->subDay()])->save();
        $this->annonce($u, ['titre' => 'Récente']);
        $this->annonce($u, ['titre' => 'Réservée', 'statut' => 'reservee']);

        $titres = collect($this->getJson('/api/annonces')->assertOk()->json('data'))->pluck('titre');

        $this->assertEquals(['Récente', 'Ancienne'], $titres->all());
    }

    public function test_publier_une_annonce_avec_photos(): void
    {
        $u = $this->etudiant();

        $this->publier($u, [
            'titre' => 'Calculatrice', 'categorie_id' => $this->info->id,
            'etat' => 'tres_bon', 'type' => 'vente', 'prix' => 25,
        ], [$this->fausseImage('a.png'), $this->fausseImage('b.png')])
            ->assertCreated()
            ->assertJsonPath('annonce.statut', 'disponible')
            ->assertJsonCount(2, 'annonce.photos');

        Storage::disk('public')->assertExists(Annonce::first()->photos->first()->chemin);
    }

    public function test_publier_refuse_champs_manquants_prix_absent_et_photos_invalides(): void
    {
        $u = $this->etudiant();

        $this->publier($u, [], [])->assertStatus(422)
            ->assertJsonValidationErrors(['titre', 'categorie_id', 'etat', 'type', 'photos']);

        $this->publier($u, ['titre' => 'PC', 'categorie_id' => $this->info->id, 'etat' => 'bon', 'type' => 'vente'])
            ->assertStatus(422)->assertJsonValidationErrors(['prix']);

        $six = array_map(fn ($i) => $this->fausseImage("p$i.png"), range(1, 6));
        $this->publier($u, ['titre' => 'PC', 'categorie_id' => $this->info->id, 'etat' => 'bon', 'type' => 'don'], $six)
            ->assertStatus(422)->assertJsonValidationErrors(['photos']);

        $grosse = $this->fausseImage('grosse.png', 5200);
        $this->publier($u, ['titre' => 'PC', 'categorie_id' => $this->info->id, 'etat' => 'bon', 'type' => 'don'], [$grosse])
            ->assertStatus(422)->assertJsonValidationErrors(['photos.0']);
    }

    public function test_publier_exige_d_etre_connecte(): void
    {
        $this->postJson('/api/annonces', [])->assertStatus(401);
    }

    public function test_le_proprietaire_peut_modifier_son_annonce(): void
    {
        $u = $this->etudiant();
        $a = $this->annonce($u);

        $this->actingAs($u, 'sanctum')->postJson("/api/annonces/{$a->id}", ['titre' => 'Livre de physique'])
            ->assertOk()->assertJsonPath('annonce.titre', 'Livre de physique');
    }

    public function test_un_autre_etudiant_ne_peut_pas_modifier_ni_supprimer(): void
    {
        $a = $this->annonce($this->etudiant());
        $autre = $this->etudiant('autre@test.tn');

        $this->actingAs($autre, 'sanctum')->postJson("/api/annonces/{$a->id}", ['titre' => 'Piraté'])->assertStatus(403);
        $this->actingAs($autre, 'sanctum')->deleteJson("/api/annonces/{$a->id}")->assertStatus(403);
        $this->assertDatabaseHas('annonces', ['id' => $a->id, 'titre' => 'Livre de maths']);
    }

    public function test_modifier_refuse_de_retirer_toutes_les_photos(): void
    {
        $u = $this->etudiant();
        $a = $this->annonce($u);

        $this->actingAs($u, 'sanctum')->postJson("/api/annonces/{$a->id}", [
            'photos_supprimees' => [$a->photos->first()->id],
        ])->assertStatus(422)->assertJsonValidationErrors(['photos']);
    }

    public function test_le_proprietaire_peut_supprimer_son_annonce(): void
    {
        $u = $this->etudiant();
        $a = $this->annonce($u);

        $this->actingAs($u, 'sanctum')->deleteJson("/api/annonces/{$a->id}")->assertOk();
        $this->assertDatabaseMissing('annonces', ['id' => $a->id]);
        $this->assertDatabaseMissing('annonce_photos', ['annonce_id' => $a->id]);
    }

    public function test_mes_annonces_retourne_toutes_mes_annonces(): void
    {
        $u = $this->etudiant();
        $this->annonce($u);
        $this->annonce($u, ['statut' => 'reservee']);
        $this->annonce($this->etudiant('autre@test.tn'));

        $this->actingAs($u, 'sanctum')->getJson('/api/mes-annonces')->assertOk()->assertJsonCount(2);
    }

    public function test_recherche_par_mot_cle_dans_titre_et_description(): void
    {
        $u = $this->etudiant();
        $this->annonce($u, ['titre' => 'Clavier mécanique', 'description' => 'USB']);
        $this->annonce($u, ['titre' => 'Livre', 'description' => 'Livre sur le clavier']);
        $this->annonce($u, ['titre' => 'Chaise', 'description' => 'Bois']);

        $this->getJson('/api/annonces?q=clavier')->assertOk()->assertJsonPath('total', 2);
        $this->getJson('/api/annonces?q=introuvable')->assertOk()->assertJsonPath('total', 0);
    }

    public function test_filtres_categorie_type_etat_prix_et_tri_par_prix(): void
    {
        $u = $this->etudiant();
        $this->annonce($u, ['titre' => 'Don', 'type' => 'don', 'etat' => 'neuf']);
        $this->annonce($u, ['titre' => 'PC 300', 'type' => 'vente', 'prix' => 300, 'categorie_id' => $this->info->id]);
        $this->annonce($u, ['titre' => 'Souris 20', 'type' => 'vente', 'prix' => 20, 'categorie_id' => $this->info->id]);

        $this->getJson("/api/annonces?categorie={$this->info->id}")->assertJsonPath('total', 2);
        $this->getJson('/api/annonces?type=don')->assertJsonPath('total', 1);
        $this->getJson('/api/annonces?etat=neuf')->assertJsonPath('total', 1);
        $this->getJson('/api/annonces?type=vente&prix_max=100')->assertJsonPath('total', 1);

        $titres = collect($this->getJson('/api/annonces?tri=prix_asc')->json('data'))->pluck('titre')->all();
        $this->assertEquals(['Don', 'Souris 20', 'PC 300'], $titres);
    }

    public function test_supprimer_son_compte_supprime_ses_annonces(): void
    {
        $u = $this->etudiant();
        $a = $this->annonce($u);

        $this->actingAs($u, 'sanctum')->deleteJson('/api/profile')->assertOk();
        $this->assertDatabaseMissing('annonces', ['id' => $a->id]);
    }

    public function test_dashboard_renvoie_mes_statistiques(): void
    {
        $u = $this->etudiant();
        $this->annonce($u, ['type' => 'vente', 'prix' => 30]);
        $this->annonce($u, ['statut' => 'reservee']);
        $this->annonce($this->etudiant('autre@test.tn'));

        $this->actingAs($u, 'sanctum')->getJson('/api/dashboard')->assertOk()
            ->assertJsonPath('mes_annonces.total', 2)
            ->assertJsonPath('mes_annonces.disponibles', 1)
            ->assertJsonPath('mes_annonces.reservees', 1)
            ->assertJsonPath('mes_annonces.ventes', 1)
            ->assertJsonPath('plateforme.annonces_disponibles', 2)
            ->assertJsonCount(8, 'activite')
            ->assertJsonStructure(['profil' => ['completion', 'etapes'], 'recentes', 'categories']);
    }
}
