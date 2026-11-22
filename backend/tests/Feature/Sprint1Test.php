<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Storage;
use Tests\Concerns\FausseImage;
use Tests\TestCase;

class Sprint1Test extends TestCase
{
    use RefreshDatabase, FausseImage;

    private function etudiant(array $extra = []): User
    {
        return User::create(array_merge([
            'name' => 'Ben Ali', 'prenom' => 'Sami',
            'email' => 'sami@test.tn', 'password' => Hash::make('password123'),
            'role' => 'etudiant', 'filiere' => 'Info', 'niveau' => 'L2', 'etablissement' => 'ISET',
        ], $extra));
    }

    public function test_inscription_reussie_envoie_email_et_crypte_mdp(): void
    {
        Notification::fake();

        $this->postJson('/api/register', [
            'name' => 'Ben Ali', 'prenom' => 'Sami', 'email' => 'sami@test.tn',
            'password' => 'password123', 'password_confirmation' => 'password123',
            'filiere' => 'Info', 'niveau' => 'L2', 'etablissement' => 'ISET',
        ])->assertCreated();

        $user = User::where('email', 'sami@test.tn')->first();
        $this->assertNotEquals('password123', $user->password);
        Notification::assertSentTo($user, VerifyEmail::class);
    }

    public function test_inscription_refuse_email_deja_utilise_et_mdp_court(): void
    {
        $this->etudiant();

        $this->postJson('/api/register', [
            'name' => 'X', 'prenom' => 'Y', 'email' => 'sami@test.tn',
            'password' => 'court', 'password_confirmation' => 'court',
            'filiere' => 'Info', 'niveau' => 'L2', 'etablissement' => 'ISET',
        ])->assertStatus(422)->assertJsonValidationErrors(['email', 'password']);
    }


    public function test_connexion_et_deconnexion(): void
    {
        $this->etudiant();

        $token = $this->postJson('/api/login', ['email' => 'sami@test.tn', 'password' => 'password123'])
            ->assertOk()->assertJsonPath('user.role', 'etudiant')->json('token');

        $this->withToken($token)->postJson('/api/logout')->assertOk();
    }

    public function test_blocage_apres_5_echecs(): void
    {
        $this->etudiant();

        for ($i = 0; $i < 5; $i++) {
            $this->postJson('/api/login', ['email' => 'sami@test.tn', 'password' => 'faux'])->assertStatus(401);
        }
        $this->postJson('/api/login', ['email' => 'sami@test.tn', 'password' => 'password123'])->assertStatus(429);
    }

    public function test_reinitialisation_mot_de_passe(): void
    {
        Notification::fake();
        $user = $this->etudiant();

        $this->postJson('/api/forgot-password', ['email' => 'sami@test.tn'])->assertOk();

        $token = null;
        Notification::assertSentTo($user, ResetPassword::class, function ($n) use (&$token) {
            $token = $n->token;
            return true;
        });

        $this->postJson('/api/reset-password', [
            'token' => $token, 'email' => 'sami@test.tn',
            'password' => 'nouveau123', 'password_confirmation' => 'nouveau123',
        ])->assertOk();

        $this->assertTrue(Hash::check('nouveau123', $user->fresh()->password));
    }

    public function test_lien_invalide_refuse(): void
    {
        $this->etudiant();

        $this->postJson('/api/reset-password', [
            'token' => 'faux-token', 'email' => 'sami@test.tn',
            'password' => 'nouveau123', 'password_confirmation' => 'nouveau123',
        ])->assertStatus(422);
    }

    public function test_consulter_et_modifier_profil_avec_photo(): void
    {
        Storage::fake('public');
        $user = $this->etudiant();

        $this->actingAs($user, 'sanctum')->getJson('/api/profile')
            ->assertOk()->assertJsonPath('email', 'sami@test.tn');

        $this->actingAs($user, 'sanctum')->post('/api/profile', [
            'filiere' => 'Génie logiciel', 'niveau' => 'M1',
            'photo' => $this->fausseImage('moi.png'),
        ], ['Accept' => 'application/json'])->assertOk();

        $user->refresh();
        $this->assertEquals('M1', $user->niveau);
        Storage::disk('public')->assertExists($user->photo);
    }

    public function test_changement_mdp_exige_ancien_mdp(): void
    {
        $user = $this->etudiant();

        $this->actingAs($user, 'sanctum')->postJson('/api/profile', [
            'current_password' => 'mauvais',
            'password' => 'nouveau123', 'password_confirmation' => 'nouveau123',
        ])->assertStatus(422);
    }

    public function test_suppression_compte(): void
    {
        $user = $this->etudiant();

        $this->actingAs($user, 'sanctum')->deleteJson('/api/profile')->assertOk();
        $this->assertDatabaseMissing('users', ['email' => 'sami@test.tn']);
    }
}
