<?php

use App\Http\Controllers\Admin\AnnonceController as AdminAnnonceController;
use App\Http\Controllers\Admin\CategorieController as AdminCategorieController;
use App\Http\Controllers\Admin\StatsController as AdminStatsController;
use App\Http\Controllers\Admin\UserController as AdminUserController;
use App\Http\Controllers\AnnonceController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CategorieController;
use App\Http\Controllers\ConversationController;
use App\Http\Controllers\ReservationController;
use App\Http\Controllers\DemandeController;
use App\Http\Controllers\FavoriController;
use App\Http\Controllers\PropositionController;
use App\Http\Controllers\PasswordResetController;
use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;

// ---------- Routes publiques ----------
Route::post('/register', [AuthController::class, 'register']);                 // SCRUM-10
Route::post('/login', [AuthController::class, 'login']);                       // SCRUM-11
Route::post('/forgot-password', [PasswordResetController::class, 'forgot']);   // SCRUM-12
Route::post('/reset-password', [PasswordResetController::class, 'reset']);     // SCRUM-12

// Sprint 2 — consultation publique des annonces
Route::get('/categories', [CategorieController::class, 'index']);
Route::get('/annonces', [AnnonceController::class, 'index']);                  // SCRUM-15, 20, 21
Route::get('/annonces/{annonce}', [AnnonceController::class, 'show'])->whereNumber('annonce');

// Lien envoyé dans l'e-mail de confirmation (le nom de route est imposé par Laravel)
Route::get('/email/verify/{id}/{hash}', [AuthController::class, 'verifyEmail'])
    ->middleware('signed')
    ->name('verification.verify');

// ---------- Routes protégées (token Sanctum) ----------
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);                 // SCRUM-11
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/email/resend', [AuthController::class, 'resendVerification']);

    Route::get('/profile', [ProfileController::class, 'show']);                // SCRUM-13
    Route::post('/profile', [ProfileController::class, 'update']);             // SCRUM-44
    Route::delete('/profile', [ProfileController::class, 'destroy']);          // SCRUM-14

    // Sprint 2 — gestion de ses annonces
    Route::get('/dashboard', [AnnonceController::class, 'dashboard']);
    Route::get('/mes-annonces', [AnnonceController::class, 'mesAnnonces']);   // SCRUM-18, 46
    Route::post('/annonces', [AnnonceController::class, 'store'])->middleware('etudiant');             // SCRUM-17
    Route::match(['post', 'put'], '/annonces/{annonce}', [AnnonceController::class, 'update'])->whereNumber('annonce'); // SCRUM-18
    Route::delete('/annonces/{annonce}', [AnnonceController::class, 'destroy'])->whereNumber('annonce');                // SCRUM-46

    // Sprint 3 — demandes et matching
    Route::get('/mes-demandes', [DemandeController::class, 'mesDemandes']);   // SCRUM-23, 47
    Route::post('/demandes', [DemandeController::class, 'store'])->middleware('etudiant');             // SCRUM-22
    Route::get('/demandes/{demande}', [DemandeController::class, 'show'])->whereNumber('demande');
    Route::match(['post', 'put'], '/demandes/{demande}', [DemandeController::class, 'update'])->whereNumber('demande'); // SCRUM-23
    Route::delete('/demandes/{demande}', [DemandeController::class, 'destroy'])->whereNumber('demande');                // SCRUM-47
    Route::get('/propositions', [PropositionController::class, 'index']);     // SCRUM-25

    // Sprint 4 — messagerie
    Route::get('/conversations', [ConversationController::class, 'index']);
    Route::get('/messages/non-lus', [ConversationController::class, 'nonLus']);
    Route::post('/conversations', [ConversationController::class, 'store'])->middleware('etudiant');                              // SCRUM-28
    Route::get('/conversations/{conversation}', [ConversationController::class, 'show'])->whereNumber('conversation');
    Route::post('/conversations/{conversation}/messages', [ConversationController::class, 'envoyer'])->whereNumber('conversation');

    // Sprint 4 — réservations et échange
    Route::post('/annonces/{annonce}/reserver', [ReservationController::class, 'store'])->whereNumber('annonce')->middleware('etudiant'); // SCRUM-30
    Route::get('/reservations/recues', [ReservationController::class, 'recues']);                       // SCRUM-31
    Route::get('/reservations/envoyees', [ReservationController::class, 'envoyees']);
    Route::post('/reservations/{reservation}/accepter', [ReservationController::class, 'accepter'])->whereNumber('reservation');   // SCRUM-31
    Route::post('/reservations/{reservation}/refuser', [ReservationController::class, 'refuser'])->whereNumber('reservation');     // SCRUM-48
    Route::post('/reservations/{reservation}/annuler', [ReservationController::class, 'annuler'])->whereNumber('reservation');
    Route::post('/reservations/{reservation}/confirmer', [ReservationController::class, 'confirmer'])->whereNumber('reservation'); // SCRUM-32

    // Favoris (EF-12)
    Route::get('/favoris', [FavoriController::class, 'index']);
    Route::get('/favoris/ids', [FavoriController::class, 'ids']);
    Route::post('/annonces/{annonce}/favori', [FavoriController::class, 'store'])->whereNumber('annonce')->middleware('etudiant');
    Route::delete('/annonces/{annonce}/favori', [FavoriController::class, 'destroy'])->whereNumber('annonce');
});

// ---------- Routes administrateur (token + rôle admin) ----------
Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
    Route::get('/users', [AdminUserController::class, 'index']);               // SCRUM-38
    Route::get('/users/{user}', [AdminUserController::class, 'show']);         // SCRUM-38
    Route::post('/users/{user}/bloquer', [AdminUserController::class, 'bloquer']);     // SCRUM-49
    Route::post('/users/{user}/debloquer', [AdminUserController::class, 'debloquer']); // SCRUM-50
    Route::delete('/users/{user}', [AdminUserController::class, 'destroy']);           // SCRUM-51

    Route::get('/categories', [AdminCategorieController::class, 'index']);
    Route::post('/categories', [AdminCategorieController::class, 'store']);                  // SCRUM-39
    Route::put('/categories/{categorie}', [AdminCategorieController::class, 'update']);      // SCRUM-52
    Route::delete('/categories/{categorie}', [AdminCategorieController::class, 'destroy']);  // SCRUM-53

    Route::get('/annonces', [AdminAnnonceController::class, 'index']);                       // modération des annonces
    Route::get('/annonces/{annonce}', [AdminAnnonceController::class, 'show'])->whereNumber('annonce');
    Route::delete('/annonces/{annonce}', [AdminAnnonceController::class, 'destroy'])->whereNumber('annonce');

    Route::get('/stats', [AdminStatsController::class, 'index']);
});
