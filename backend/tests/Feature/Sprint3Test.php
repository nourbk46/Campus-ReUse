<?php

namespace Tests\Feature;

use App\Models\Annonce;
use App\Models\Categorie;
use App\Models\Demande;
use App\Models\MatchResult;
use App\Models\User;
use App\Services\MatchingService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Tests\Concerns\FausseImage;
use Tests\TestCase;

class Sprint3Test extends TestCase
{
    use RefreshDatabase, FausseImage;

    private Categorie $info;
    private Categorie $livres;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('public');
        $this->info = Categorie::create(['nom' => 'Informatique']);
        $this->livres = Categorie::create(['nom' => 'Livres & cours']);
    }

    private function etudiant(string $email, string $etab = 'ISET Rades'): User
    {
        return User::create([
            'name' => 'Test', 'prenom' => ucfirst(strstr($email, '@', true)), 'email' => $email,
            'password' => Hash::make('password123'), 'role' => 'etudiant', 'etablissement' => $etab,
        ]);
    }

    private function annonce(User $u, array $extra = []): Annonce
    {
        $a = $u->annonces()->create(array_merge([
            'categorie_id' => $this->info->id, 'titre' => 'Calculatrice graphique TI-83',
            'description' => 'Calculatrice en très bon état', 'etat' => 'tres_bon',
            'type' => 'vente', 'prix' => 30, 'statut' => 'disponible',
        ], $extra));
        app(MatchingService::class)->pourAnnonce($a);
        return $a;
    }

    private function demande(User $u, array $extra = [])
    {
        return $this->actingAs($u, 'sanctum')->postJson('/api/demandes', array_merge([
            'titre' => 'Calculatrice graphique', 'description' => 'Pour le cours de maths',
            'categorie_id' => $this->info->id, 'budget_max' => 50, 'etat_min' => 'bon',
        ], $extra));
    }

    public function test_publier_une_demande_statut_ouverte(): void
    {
        $this->demande($this->etudiant('ali@test.tn'))
            ->assertCreated()
            ->assertJsonPath('demande.statut', 'ouverte')
            ->assertJsonPath('demande.titre', 'Calculatrice graphique');
    }

    public function test_publier_une_demande_valide_les_champs(): void
    {
        $this->actingAs($this->etudiant('ali@test.tn'), 'sanctum')->postJson('/api/demandes', [])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['titre', 'categorie_id', 'budget_max', 'etat_min']);

        $this->demande($this->etudiant('sami@test.tn'), ['budget_max' => -5, 'etat_min' => 'cassé'])
            ->assertStatus(422)->assertJsonValidationErrors(['budget_max', 'etat_min']);
    }

    public function test_publier_une_demande_exige_d_etre_connecte(): void
    {
        $this->postJson('/api/demandes', [])->assertStatus(401);
    }

    public function test_l_auteur_peut_modifier_et_supprimer_sa_demande(): void
    {
        $u = $this->etudiant('ali@test.tn');
        $id = $this->demande($u)->json('demande.id');

        $this->actingAs($u, 'sanctum')->putJson("/api/demandes/$id", ['budget_max' => 80, 'statut' => 'cloturee'])
            ->assertOk()->assertJsonPath('demande.statut', 'cloturee');
        $this->assertEquals(80, Demande::find($id)->budget_max);

        $this->actingAs($u, 'sanctum')->deleteJson("/api/demandes/$id")->assertOk();
        $this->assertDatabaseMissing('demandes', ['id' => $id]);
    }

    public function test_un_autre_etudiant_ne_peut_ni_voir_ni_modifier_ni_supprimer(): void
    {
        $id = $this->demande($this->etudiant('ali@test.tn'))->json('demande.id');
        $autre = $this->etudiant('sami@test.tn');

        $this->actingAs($autre, 'sanctum')->getJson("/api/demandes/$id")->assertStatus(403);
        $this->actingAs($autre, 'sanctum')->putJson("/api/demandes/$id", ['titre' => 'Piraté'])->assertStatus(403);
        $this->actingAs($autre, 'sanctum')->deleteJson("/api/demandes/$id")->assertStatus(403);
        $this->assertDatabaseHas('demandes', ['id' => $id, 'titre' => 'Calculatrice graphique']);
    }

    public function test_mes_demandes_avec_nombre_de_propositions(): void
    {
        $vendeur = $this->etudiant('vendeur@test.tn');
        $this->annonce($vendeur);
        $u = $this->etudiant('ali@test.tn');
        $this->demande($u);
        $this->demande($u, ['titre' => 'Livre de physique', 'categorie_id' => $this->livres->id]);

        $res = $this->actingAs($u, 'sanctum')->getJson('/api/mes-demandes')->assertOk()->assertJsonCount(2);
        $calc = collect($res->json())->firstWhere('titre', 'Calculatrice graphique');
        $this->assertEquals(1, $calc['propositions_count']);
    }

    public function test_matching_a_la_publication_d_une_demande(): void
    {
        $vendeur = $this->etudiant('vendeur@test.tn');
        $a = $this->annonce($vendeur);
        $u = $this->etudiant('ali@test.tn');

        $this->demande($u)->assertCreated()->assertJsonPath('propositions', 1);

        $m = MatchResult::first();
        $this->assertEquals($a->id, $m->annonce_id);
        $this->assertGreaterThanOrEqual(50, $m->score);
        $this->assertLessThanOrEqual(100, $m->score);
        $this->assertEquals(10, $m->details['etablissement']); // même établissement
        $this->assertContains('calculatrice', $m->details['mots_trouves']);
    }

    public function test_matching_a_la_publication_d_une_annonce(): void
    {
        $u = $this->etudiant('ali@test.tn');
        $this->demande($u)->assertJsonPath('propositions', 0);

        $vendeur = $this->etudiant('vendeur@test.tn');
        $this->actingAs($vendeur, 'sanctum')->post('/api/annonces', [
            'titre' => 'Calculatrice graphique Casio', 'categorie_id' => $this->info->id,
            'etat' => 'neuf', 'type' => 'vente', 'prix' => 40, 'photos' => [$this->fausseImage()],
        ], ['Accept' => 'application/json'])->assertCreated();

        $this->assertEquals(1, MatchResult::count());
    }

    public function test_filtres_du_matching(): void
    {
        $v = $this->etudiant('vendeur@test.tn');
        $bonne = $this->annonce($v);                                                  
        $this->annonce($v, ['categorie_id' => $this->livres->id]);                   
        $this->annonce($v, ['prix' => 90]);                                            
        $this->annonce($v, ['etat' => 'use']);                                        
        $this->annonce($v, ['statut' => 'reservee']);                                

        $u = $this->etudiant('ali@test.tn');
        $this->annonce($u);                                                         
        $this->demande($u);

        $this->assertEquals([$bonne->id], MatchResult::pluck('annonce_id')->all());
    }

    public function test_un_don_correspond_a_un_budget_de_zero(): void
    {
        $this->annonce($this->etudiant('vendeur@test.tn'), ['type' => 'don', 'prix' => null]);
        $this->demande($this->etudiant('ali@test.tn'), ['budget_max' => 0])->assertJsonPath('propositions', 1);
        $this->assertEquals(30, MatchResult::first()->details['prix']); // gratuit = 30/30
    }

    public function test_seuil_minimum_de_50(): void
    {
        $this->annonce($this->etudiant('vendeur@test.tn', 'FST'), [
            'titre' => 'Souris sans fil', 'description' => 'Logitech', 'etat' => 'use', 'prix' => 50,
        ]);
        $this->demande($this->etudiant('ali@test.tn'), ['etat_min' => 'use'])->assertJsonPath('propositions', 0);
        $this->assertEquals(0, MatchResult::count());
    }

    public function test_une_demande_cloturee_n_a_plus_de_propositions(): void
    {
        $this->annonce($this->etudiant('vendeur@test.tn'));
        $u = $this->etudiant('ali@test.tn');
        $id = $this->demande($u)->json('demande.id');
        $this->assertEquals(1, MatchResult::count());

        $this->actingAs($u, 'sanctum')->putJson("/api/demandes/$id", ['statut' => 'cloturee'])->assertOk();
        $this->assertEquals(0, MatchResult::count());
    }

    public function test_calcul_en_moins_de_5_secondes(): void
    {
        $v = $this->etudiant('vendeur@test.tn');
        for ($i = 0; $i < 300; $i++) {
            $v->annonces()->create([
                'categorie_id' => $this->info->id, 'titre' => "Calculatrice modèle $i",
                'etat' => 'bon', 'type' => 'vente', 'prix' => $i % 60, 'statut' => 'disponible',
            ]);
        }

        $debut = microtime(true);
        $this->demande($this->etudiant('ali@test.tn'))->assertCreated();
        $this->assertLessThan(5, microtime(true) - $debut);
        $this->assertGreaterThan(0, MatchResult::count());
    }

    public function test_propositions_triees_par_score_et_seulement_disponibles(): void
    {
        $proche = $this->etudiant('proche@test.tn', 'ISET Rades');
        $loin = $this->etudiant('loin@test.tn', 'FST');
        $moinsBonne = $this->annonce($loin, ['etat' => 'bon', 'prix' => 30]);     // 20 + 21 + 10 + 0 = 51
        $meilleure = $this->annonce($proche, ['etat' => 'neuf', 'prix' => 10]);
        $u = $this->etudiant('ali@test.tn');
        $this->demande($u);

        $ids = collect($this->actingAs($u, 'sanctum')->getJson('/api/propositions')->assertOk()->json())->pluck('annonce_id')->all();
        $this->assertEquals([$meilleure->id, $moinsBonne->id], $ids);

        $meilleure->update(['statut' => 'reservee']);
        $this->actingAs($u, 'sanctum')->getJson('/api/propositions')->assertJsonCount(1);
    }

    public function test_je_ne_vois_que_mes_propositions(): void
    {
        $this->annonce($this->etudiant('vendeur@test.tn'));
        $this->demande($this->etudiant('ali@test.tn'));

        $this->actingAs($this->etudiant('sami@test.tn'), 'sanctum')->getJson('/api/propositions')->assertOk()->assertJsonCount(0);
    }
}
