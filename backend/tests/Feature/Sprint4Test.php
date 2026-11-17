<?php

namespace Tests\Feature;

use App\Models\Annonce;
use App\Models\Categorie;
use App\Models\Conversation;
use App\Models\Demande;
use App\Models\Reservation;
use App\Models\User;
use App\Notifications\CampusNotification;
use App\Services\MatchingService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

// Lancer : php artisan test --filter=Sprint4Test
class Sprint4Test extends TestCase
{
    use RefreshDatabase;

    private User $vendeur;
    private User $acheteur;
    private Annonce $annonce;

    protected function setUp(): void
    {
        parent::setUp();
        Notification::fake();
        $cat = Categorie::create(['nom' => 'Informatique']);
        $this->vendeur = $this->etudiant('vendeur@test.tn');
        $this->acheteur = $this->etudiant('acheteur@test.tn');
        $this->annonce = $this->vendeur->annonces()->create([
            'categorie_id' => $cat->id, 'titre' => 'Calculatrice graphique', 'etat' => 'bon',
            'type' => 'vente', 'prix' => 20, 'statut' => 'disponible',
        ]);
    }

    private function etudiant(string $email, bool $emails = true): User
    {
        return User::create([
            'name' => 'Test', 'prenom' => ucfirst(strstr($email, '@', true)), 'email' => $email,
            'password' => Hash::make('password123'), 'role' => 'etudiant', 'notifications_email' => $emails,
        ]);
    }

    private function reserver(?User $u = null)
    {
        return $this->actingAs($u ?? $this->acheteur, 'sanctum')->postJson("/api/annonces/{$this->annonce->id}/reserver");
    }

    private function reservationAcceptee(): Reservation
    {
        $id = $this->reserver()->json('reservation.id');
        $this->actingAs($this->vendeur, 'sanctum')->postJson("/api/reservations/$id/accepter")->assertOk();
        return Reservation::find($id);
    }

    // ---------- SCRUM-28 : messagerie ----------
    public function test_envoyer_un_message_cree_une_conversation_liee_a_l_annonce(): void
    {
        $this->actingAs($this->acheteur, 'sanctum')->postJson('/api/conversations', [
            'annonce_id' => $this->annonce->id, 'contenu' => 'Bonjour, toujours disponible ?',
        ])->assertCreated();

        $c = Conversation::first();
        $this->assertEquals($this->annonce->id, $c->annonce_id);
        $this->assertEquals($this->vendeur->id, $c->vendeur_id);
        $this->assertEquals(1, $c->messages()->count());
    }

    public function test_message_vide_refuse(): void
    {
        $this->actingAs($this->acheteur, 'sanctum')->postJson('/api/conversations', [
            'annonce_id' => $this->annonce->id, 'contenu' => '   ',
        ])->assertStatus(422)->assertJsonValidationErrors(['contenu']);
    }

    public function test_impossible_de_s_ecrire_sur_sa_propre_annonce(): void
    {
        $this->actingAs($this->vendeur, 'sanctum')->postJson('/api/conversations', [
            'annonce_id' => $this->annonce->id, 'contenu' => 'Test',
        ])->assertStatus(422);
    }

    public function test_reponse_dans_la_meme_conversation_et_messages_lus(): void
    {
        $cid = $this->actingAs($this->acheteur, 'sanctum')->postJson('/api/conversations', [
            'annonce_id' => $this->annonce->id, 'contenu' => 'Bonjour',
        ])->json('conversation.id');

        // un 2e message de l'acheteur réutilise la même conversation
        $this->actingAs($this->acheteur, 'sanctum')->postJson('/api/conversations', [
            'annonce_id' => $this->annonce->id, 'contenu' => 'Je peux passer demain',
        ])->assertJsonPath('conversation.id', $cid);

        $this->actingAs($this->vendeur, 'sanctum')->getJson('/api/messages/non-lus')->assertJsonPath('non_lus', 2);
        $this->actingAs($this->vendeur, 'sanctum')->getJson("/api/conversations/$cid")->assertOk()->assertJsonCount(2, 'messages');
        $this->actingAs($this->vendeur, 'sanctum')->getJson('/api/messages/non-lus')->assertJsonPath('non_lus', 0);

        $this->actingAs($this->vendeur, 'sanctum')->postJson("/api/conversations/$cid/messages", ['contenu' => 'Oui, à 10h'])->assertCreated();
        $this->assertEquals(3, Conversation::find($cid)->messages()->count());
        $this->actingAs($this->acheteur, 'sanctum')->getJson('/api/conversations')->assertOk()->assertJsonPath('0.non_lus', 1);
    }

    public function test_un_tiers_ne_peut_pas_lire_ni_ecrire(): void
    {
        $cid = $this->actingAs($this->acheteur, 'sanctum')->postJson('/api/conversations', [
            'annonce_id' => $this->annonce->id, 'contenu' => 'Bonjour',
        ])->json('conversation.id');
        $tiers = $this->etudiant('tiers@test.tn');

        $this->actingAs($tiers, 'sanctum')->getJson("/api/conversations/$cid")->assertStatus(403);
        $this->actingAs($tiers, 'sanctum')->postJson("/api/conversations/$cid/messages", ['contenu' => 'Hello'])->assertStatus(403);
    }

    // ---------- SCRUM-30 : réserver ----------
    public function test_reserver_un_objet_en_attente(): void
    {
        $this->reserver()->assertCreated()->assertJsonPath('reservation.statut', 'en_attente');
        $this->assertEquals('disponible', $this->annonce->fresh()->statut); // pas encore réservée
    }

    public function test_impossible_de_reserver_sa_propre_annonce(): void
    {
        $this->reserver($this->vendeur)->assertStatus(422)->assertJsonValidationErrors(['annonce']);
    }

    public function test_pas_de_double_reservation_ni_d_objet_indisponible(): void
    {
        $this->reserver()->assertCreated();
        $this->reserver()->assertStatus(422);

        $this->annonce->update(['statut' => 'cedee']);
        $this->reserver($this->etudiant('autre@test.tn'))->assertStatus(422);
    }

    // ---------- SCRUM-31 / SCRUM-48 : accepter / refuser ----------
    public function test_accepter_passe_l_annonce_en_reservee_et_refuse_les_autres(): void
    {
        $autre = $this->etudiant('autre@test.tn');
        $id1 = $this->reserver()->json('reservation.id');
        $id2 = $this->reserver($autre)->json('reservation.id');

        $this->actingAs($this->vendeur, 'sanctum')->getJson('/api/reservations/recues')->assertOk()->assertJsonCount(2);
        $this->actingAs($this->vendeur, 'sanctum')->postJson("/api/reservations/$id1/accepter")
            ->assertOk()->assertJsonPath('reservation.statut', 'acceptee');

        $this->assertEquals('reservee', $this->annonce->fresh()->statut);
        $this->assertEquals('refusee', Reservation::find($id2)->statut);
        $this->assertNotNull(Reservation::find($id1)->expire_le);
    }

    public function test_refuser_laisse_l_annonce_disponible(): void
    {
        $id = $this->reserver()->json('reservation.id');

        $this->actingAs($this->vendeur, 'sanctum')->postJson("/api/reservations/$id/refuser")
            ->assertOk()->assertJsonPath('reservation.statut', 'refusee');
        $this->assertEquals('disponible', $this->annonce->fresh()->statut);
    }

    public function test_seul_le_proprietaire_accepte_ou_refuse(): void
    {
        $id = $this->reserver()->json('reservation.id');

        $this->actingAs($this->acheteur, 'sanctum')->postJson("/api/reservations/$id/accepter")->assertStatus(403);
        $this->actingAs($this->acheteur, 'sanctum')->postJson("/api/reservations/$id/refuser")->assertStatus(403);
    }

    public function test_annuler_une_reservation_acceptee_rend_l_annonce_disponible(): void
    {
        $r = $this->reservationAcceptee();

        $this->actingAs($this->vendeur, 'sanctum')->postJson("/api/reservations/{$r->id}/annuler")->assertStatus(403);
        $this->actingAs($this->acheteur, 'sanctum')->postJson("/api/reservations/{$r->id}/annuler")
            ->assertOk()->assertJsonPath('reservation.statut', 'annulee');
        $this->assertEquals('disponible', $this->annonce->fresh()->statut);
    }

    // ---------- SCRUM-32 : confirmer l'échange ----------
    public function test_confirmation_par_les_deux_etudiants_cede_l_annonce_et_cloture_la_demande(): void
    {
        $demande = $this->acheteur->demandes()->create([
            'categorie_id' => $this->annonce->categorie_id, 'titre' => 'Calculatrice graphique',
            'budget_max' => 50, 'etat_min' => 'bon', 'statut' => 'ouverte',
        ]);
        app(MatchingService::class)->pourDemande($demande);

        $r = $this->reservationAcceptee();
        $this->assertEquals($demande->id, $r->demande_id); // demande liée grâce au matching

        $this->actingAs($this->acheteur, 'sanctum')->postJson("/api/reservations/{$r->id}/confirmer")
            ->assertOk()->assertJsonPath('reservation.statut', 'acceptee');
        $this->actingAs($this->acheteur, 'sanctum')->postJson("/api/reservations/{$r->id}/confirmer")->assertStatus(422); // déjà confirmé

        $this->actingAs($this->vendeur, 'sanctum')->postJson("/api/reservations/{$r->id}/confirmer")
            ->assertOk()->assertJsonPath('reservation.statut', 'terminee');

        $this->assertEquals('cedee', $this->annonce->fresh()->statut);
        $this->assertEquals('cloturee', Demande::find($demande->id)->statut);
    }

    public function test_confirmer_exige_une_reservation_acceptee_et_un_participant(): void
    {
        $id = $this->reserver()->json('reservation.id');
        $this->actingAs($this->acheteur, 'sanctum')->postJson("/api/reservations/$id/confirmer")->assertStatus(422);

        $this->actingAs($this->vendeur, 'sanctum')->postJson("/api/reservations/$id/accepter")->assertOk();
        $this->actingAs($this->etudiant('tiers@test.tn'), 'sanctum')->postJson("/api/reservations/$id/confirmer")->assertStatus(403);
    }

    public function test_reservation_annulee_sans_confirmation_sous_7_jours(): void
    {
        $r = $this->reservationAcceptee();
        $this->travel(8)->days();

        $this->artisan('reservations:expirer')->assertSuccessful();

        $this->assertEquals('annulee', $r->fresh()->statut);
        $this->assertEquals('disponible', $this->annonce->fresh()->statut);
    }

    public function test_expiration_aussi_verifiee_a_la_consultation(): void
    {
        $r = $this->reservationAcceptee();
        $this->travel(8)->days();

        $this->actingAs($this->acheteur, 'sanctum')->getJson('/api/reservations/envoyees')
            ->assertOk()->assertJsonPath('0.statut', 'annulee');
    }

    // ---------- SCRUM-34 : notifications par e-mail ----------
    public function test_notifications_envoyees_par_email(): void
    {
        $this->actingAs($this->acheteur, 'sanctum')->postJson('/api/conversations', [
            'annonce_id' => $this->annonce->id, 'contenu' => 'Bonjour',
        ]);
        $this->reservationAcceptee();

        Notification::assertSentTo($this->vendeur, CampusNotification::class, fn ($n, $channels) =>
            $n->type === 'message_nouveau' && $channels === ['mail']);
        Notification::assertSentTo($this->vendeur, CampusNotification::class, fn ($n) => $n->type === 'reservation_nouvelle');
        Notification::assertSentTo($this->acheteur, CampusNotification::class, fn ($n) => $n->type === 'reservation_acceptee');
    }

    public function test_aucun_email_si_desactive_dans_le_profil(): void
    {
        // l'option se désactive depuis le profil
        $this->actingAs($this->vendeur, 'sanctum')->postJson('/api/profile', ['notifications_email' => false])->assertOk();
        $this->assertFalse($this->vendeur->fresh()->notifications_email);

        $this->reserver();
        Notification::assertNotSentTo($this->vendeur->fresh(), CampusNotification::class);
    }

    public function test_le_mail_contient_le_lien_vers_le_site(): void
    {
        $mail = (new CampusNotification('t', 'Sujet', ['Ligne'], 'Voir', '/reservations'))->toMail($this->acheteur);
        $this->assertStringContainsString('Sujet', $mail->subject);
        $this->assertStringEndsWith('/reservations', $mail->actionUrl);
    }
}
