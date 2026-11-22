<?php

namespace Tests\Feature;

use App\Models\Annonce;
use App\Models\Categorie;
use App\Models\Demande;
use App\Models\User;
use App\Notifications\CampusNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class AdminTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;
    private User $etudiant;
    private Categorie $cat;

    protected function setUp(): void
    {
        parent::setUp();
        Notification::fake();
        $this->admin = $this->compte('admin@test.tn', 'admin');
        $this->etudiant = $this->compte('sami@test.tn');
        $this->cat = Categorie::create(['nom' => 'Informatique', 'icone' => '💻']);
    }

    private function compte(string $email, string $role = 'etudiant'): User
    {
        return User::create(['name' => 'Ben Ali', 'prenom' => 'Sami', 'email' => $email,
            'password' => Hash::make('password123'), 'role' => $role, 'notifications_email' => true]);
    }

    private function annonce(User $u): Annonce
    {
        return $u->annonces()->create(['categorie_id' => $this->cat->id, 'titre' => 'Clavier',
            'etat' => 'bon', 'type' => 'don', 'statut' => 'disponible']);
    }

    private function admin()
    {
        return $this->actingAs($this->admin, 'sanctum');
    }

    public function test_un_etudiant_n_a_pas_acces_a_l_administration(): void
    {
        foreach (['/api/admin/users', '/api/admin/categories', '/api/admin/stats'] as $url) {
            $this->actingAs($this->etudiant, 'sanctum')->getJson($url)->assertStatus(403);
        }
        $this->actingAs($this->etudiant, 'sanctum')->postJson("/api/admin/users/{$this->etudiant->id}/bloquer")->assertStatus(403);
    }

    public function test_consulter_et_rechercher_les_utilisateurs(): void
    {
        $this->compte('yasmine@test.tn');
        $this->annonce($this->etudiant);

        $this->admin()->getJson('/api/admin/users')->assertOk()->assertJsonPath('total', 3);
        $this->admin()->getJson('/api/admin/users?search=yasmine')->assertJsonPath('total', 1);
        $this->admin()->getJson("/api/admin/users/{$this->etudiant->id}")->assertOk()
            ->assertJsonPath('email', 'sami@test.tn')->assertJsonPath('annonces_count', 1);
    }

    public function test_un_compte_bloque_ne_peut_plus_se_connecter(): void
    {
        $token = $this->etudiant->createToken('t')->plainTextToken;

        $this->admin()->postJson("/api/admin/users/{$this->etudiant->id}/bloquer")->assertOk()->assertJsonPath('user.bloque', true);
        $this->assertCount(0, $this->etudiant->tokens()->get());   // déconnecté immédiatement
        Notification::assertSentTo($this->etudiant, CampusNotification::class, fn ($n) => $n->type === 'compte_bloque');

        $this->app['auth']->forgetGuards();
        $this->withToken($token)->getJson('/api/me')->assertStatus(401);
        $this->postJson('/api/login', ['email' => 'sami@test.tn', 'password' => 'password123'])->assertStatus(403);
        $this->admin()->getJson('/api/admin/users?bloque=1')->assertJsonPath('total', 1);
    }

    public function test_les_annonces_d_un_compte_bloque_sont_masquees(): void
    {
        $this->annonce($this->etudiant);
        $this->getJson('/api/annonces')->assertJsonPath('total', 1);

        $this->admin()->postJson("/api/admin/users/{$this->etudiant->id}/bloquer")->assertOk();
        $this->app['auth']->forgetGuards();
        $this->getJson('/api/annonces')->assertJsonPath('total', 0);
    }

    public function test_debloquer_permet_de_se_reconnecter(): void
    {
        $this->etudiant->update(['bloque' => true]);

        $this->admin()->postJson("/api/admin/users/{$this->etudiant->id}/debloquer")->assertOk()->assertJsonPath('user.bloque', false);
        $this->app['auth']->forgetGuards();
        $this->postJson('/api/login', ['email' => 'sami@test.tn', 'password' => 'password123'])->assertOk();
    }

    public function test_impossible_de_bloquer_ou_supprimer_un_admin_ou_soi_meme(): void
    {
        $autreAdmin = $this->compte('admin2@test.tn', 'admin');

        $this->admin()->postJson("/api/admin/users/{$this->admin->id}/bloquer")->assertStatus(422);
        $this->admin()->postJson("/api/admin/users/{$autreAdmin->id}/bloquer")->assertStatus(422);
        $this->admin()->deleteJson("/api/admin/users/{$this->admin->id}")->assertStatus(422);
    }

    public function test_supprimer_un_utilisateur_et_ses_donnees(): void
    {
        $a = $this->annonce($this->etudiant);

        $this->admin()->deleteJson("/api/admin/users/{$this->etudiant->id}")->assertOk();
        $this->assertDatabaseMissing('users', ['id' => $this->etudiant->id]);
        $this->assertDatabaseMissing('annonces', ['id' => $a->id]);
    }

    public function test_ajouter_une_categorie_sans_doublon(): void
    {
        $this->admin()->postJson('/api/admin/categories', ['nom' => 'Mobilier', 'icone' => '🪑'])
            ->assertCreated()->assertJsonPath('categorie.nom', 'Mobilier');

        $this->admin()->postJson('/api/admin/categories', ['nom' => '  mobilier '])
            ->assertStatus(422)->assertJsonValidationErrors(['nom']);
        $this->admin()->postJson('/api/admin/categories', ['nom' => ''])
            ->assertStatus(422)->assertJsonValidationErrors(['nom']);
    }

    public function test_modifier_une_categorie_sans_doublon(): void
    {
        Categorie::create(['nom' => 'Livres']);

        $this->admin()->putJson("/api/admin/categories/{$this->cat->id}", ['nom' => 'Informatique & tech', 'icone' => '🖥️'])
            ->assertOk()->assertJsonPath('categorie.nom', 'Informatique & tech');
        $this->admin()->putJson("/api/admin/categories/{$this->cat->id}", ['nom' => 'Informatique & tech'])->assertOk(); // même nom : OK
        $this->admin()->putJson("/api/admin/categories/{$this->cat->id}", ['nom' => 'livres'])
            ->assertStatus(422)->assertJsonValidationErrors(['nom']);
    }

    public function test_supprimer_une_categorie_vide_mais_pas_une_categorie_avec_annonces(): void
    {
        $vide = Categorie::create(['nom' => 'Divers']);
        $this->annonce($this->etudiant);

        $this->admin()->deleteJson("/api/admin/categories/{$this->cat->id}")->assertStatus(422);
        $this->assertDatabaseHas('categories', ['id' => $this->cat->id]);

        $this->admin()->deleteJson("/api/admin/categories/{$vide->id}")->assertOk();
        $this->assertDatabaseMissing('categories', ['id' => $vide->id]);
    }

    public function test_categorie_utilisee_par_une_demande_non_supprimable(): void
    {
        Demande::create(['user_id' => $this->etudiant->id, 'categorie_id' => $this->cat->id, 'titre' => 'PC',
            'budget_max' => 0, 'etat_min' => 'use', 'statut' => 'ouverte']);

        $this->admin()->deleteJson("/api/admin/categories/{$this->cat->id}")->assertStatus(422);
    }

    public function test_liste_des_categories_avec_compteurs(): void
    {
        $this->annonce($this->etudiant);
        $this->admin()->getJson('/api/admin/categories')->assertOk()->assertJsonPath('0.annonces_count', 1);
    }

    public function test_statistiques_de_la_plateforme(): void
    {
        $this->annonce($this->etudiant);
        $this->admin()->getJson('/api/admin/stats')->assertOk()
            ->assertJsonPath('utilisateurs.etudiants', 1)
            ->assertJsonPath('annonces.disponibles', 1)
            ->assertJsonCount(8, 'semaines');
    }

    public function test_l_admin_ne_peut_pas_publier_ni_echanger(): void
    {
        $annonce = \App\Models\Annonce::create([
            'user_id' => $this->etudiant->id, 'categorie_id' => $this->cat->id, 'titre' => 'Calculatrice',
            'description' => 'Casio', 'type' => 'don', 'etat' => 'bon', 'statut' => 'disponible',
        ]);

        $this->admin()->postJson('/api/annonces', ['titre' => 'X'])->assertStatus(403);
        $this->admin()->postJson('/api/demandes', ['titre' => 'X'])->assertStatus(403);
        $this->admin()->postJson("/api/annonces/{$annonce->id}/reserver")->assertStatus(403);
        $this->admin()->postJson("/api/annonces/{$annonce->id}/favori")->assertStatus(403);
        $this->admin()->postJson('/api/conversations', ['annonce_id' => $annonce->id, 'contenu' => 'Bonjour'])->assertStatus(403);
        $this->assertDatabaseCount('annonces', 1);
    }

    // ---------- Modération des annonces ----------
    public function test_l_admin_liste_filtre_et_consulte_les_annonces(): void
    {
        $a = $this->annonce($this->etudiant);
        $this->etudiant->annonces()->create(['categorie_id' => $this->cat->id, 'titre' => 'Livre de maths',
            'etat' => 'neuf', 'type' => 'vente', 'prix' => 20, 'statut' => 'cedee']);

        $this->getJson('/api/admin/annonces')->assertStatus(401);
        $this->actingAs($this->etudiant, 'sanctum')->getJson('/api/admin/annonces')->assertStatus(403);

        $this->admin()->getJson('/api/admin/annonces')->assertOk()->assertJsonPath('total', 2)
            ->assertJsonStructure(['data' => [['id', 'titre', 'user', 'categorie', 'photos', 'reservations_count']]]);
        $this->admin()->getJson('/api/admin/annonces?statut=cedee')->assertJsonPath('total', 1);
        $this->admin()->getJson('/api/admin/annonces?type=don')->assertJsonPath('total', 1);
        $this->admin()->getJson('/api/admin/annonces?search=maths')->assertJsonPath('total', 1);
        $this->admin()->getJson('/api/admin/annonces?search=sami@test')->assertJsonPath('total', 2);
        $this->admin()->getJson("/api/admin/annonces/{$a->id}")->assertOk()
            ->assertJsonPath('titre', 'Clavier')->assertJsonPath('favoris_count', 0);
    }

    public function test_l_admin_supprime_une_annonce_et_previent_le_vendeur(): void
    {
        $a = $this->annonce($this->etudiant);

        $this->actingAs($this->etudiant, 'sanctum')->deleteJson("/api/admin/annonces/{$a->id}")->assertStatus(403);
        $this->admin()->deleteJson("/api/admin/annonces/{$a->id}", ['motif' => 'Objet interdit'])->assertOk();

        $this->assertDatabaseMissing('annonces', ['id' => $a->id]);
        Notification::assertSentTo($this->etudiant, \App\Notifications\CampusNotification::class,
            fn ($n) => $n->type === 'annonce_retiree' && in_array('Motif : Objet interdit', $n->lignes, true));
    }

    public function test_l_admin_ne_peut_pas_supprimer_son_propre_compte(): void
    {
        $this->admin()->deleteJson('/api/profile')->assertStatus(403);
        $this->assertDatabaseHas('users', ['id' => $this->admin->id]);
    }
}
