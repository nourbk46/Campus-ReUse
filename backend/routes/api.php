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

Route::post('/register', [AuthController::class, 'register']);                 
Route::post('/login', [AuthController::class, 'login']);                       
Route::post('/forgot-password', [PasswordResetController::class, 'forgot']);   
Route::post('/reset-password', [PasswordResetController::class, 'reset']);    

Route::get('/categories', [CategorieController::class, 'index']);
Route::get('/annonces', [AnnonceController::class, 'index']);                 
Route::get('/annonces/{annonce}', [AnnonceController::class, 'show'])->whereNumber('annonce');

Route::get('/email/verify/{id}/{hash}', [AuthController::class, 'verifyEmail'])
    ->middleware('signed')
    ->name('verification.verify');

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);                
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/email/resend', [AuthController::class, 'resendVerification']);

    Route::get('/profile', [ProfileController::class, 'show']);               
    Route::post('/profile', [ProfileController::class, 'update']);          
    Route::delete('/profile', [ProfileController::class, 'destroy']);         

    Route::get('/dashboard', [AnnonceController::class, 'dashboard']);
    Route::get('/mes-annonces', [AnnonceController::class, 'mesAnnonces']);  
    Route::post('/annonces', [AnnonceController::class, 'store'])->middleware('etudiant');     
    Route::match(['post', 'put'], '/annonces/{annonce}', [AnnonceController::class, 'update'])->whereNumber('annonce'); 
    Route::delete('/annonces/{annonce}', [AnnonceController::class, 'destroy'])->whereNumber('annonce');               

    Route::get('/mes-demandes', [DemandeController::class, 'mesDemandes']);  
    Route::post('/demandes', [DemandeController::class, 'store'])->middleware('etudiant');          
    Route::get('/demandes/{demande}', [DemandeController::class, 'show'])->whereNumber('demande');
    Route::match(['post', 'put'], '/demandes/{demande}', [DemandeController::class, 'update'])->whereNumber('demande');
    Route::delete('/demandes/{demande}', [DemandeController::class, 'destroy'])->whereNumber('demande');             
    Route::get('/propositions', [PropositionController::class, 'index']);   

    Route::get('/conversations', [ConversationController::class, 'index']);
    Route::get('/messages/non-lus', [ConversationController::class, 'nonLus']);
    Route::post('/conversations', [ConversationController::class, 'store'])->middleware('etudiant');                            
    Route::get('/conversations/{conversation}', [ConversationController::class, 'show'])->whereNumber('conversation');
    Route::post('/conversations/{conversation}/messages', [ConversationController::class, 'envoyer'])->whereNumber('conversation');

    Route::post('/annonces/{annonce}/reserver', [ReservationController::class, 'store'])->whereNumber('annonce')->middleware('etudiant');
    Route::get('/reservations/recues', [ReservationController::class, 'recues']);                    
    Route::get('/reservations/envoyees', [ReservationController::class, 'envoyees']);
    Route::post('/reservations/{reservation}/accepter', [ReservationController::class, 'accepter'])->whereNumber('reservation'); 
    Route::post('/reservations/{reservation}/refuser', [ReservationController::class, 'refuser'])->whereNumber('reservation');     
    Route::post('/reservations/{reservation}/annuler', [ReservationController::class, 'annuler'])->whereNumber('reservation');
    Route::post('/reservations/{reservation}/confirmer', [ReservationController::class, 'confirmer'])->whereNumber('reservation');

    Route::get('/favoris', [FavoriController::class, 'index']);
    Route::get('/favoris/ids', [FavoriController::class, 'ids']);
    Route::post('/annonces/{annonce}/favori', [FavoriController::class, 'store'])->whereNumber('annonce')->middleware('etudiant');
    Route::delete('/annonces/{annonce}/favori', [FavoriController::class, 'destroy'])->whereNumber('annonce');
});

Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
    Route::get('/users', [AdminUserController::class, 'index']);            
    Route::get('/users/{user}', [AdminUserController::class, 'show']);         
    Route::post('/users/{user}/bloquer', [AdminUserController::class, 'bloquer']);     
    Route::post('/users/{user}/debloquer', [AdminUserController::class, 'debloquer']);
    Route::delete('/users/{user}', [AdminUserController::class, 'destroy']);          

    Route::get('/categories', [AdminCategorieController::class, 'index']);
    Route::post('/categories', [AdminCategorieController::class, 'store']);                  
    Route::put('/categories/{categorie}', [AdminCategorieController::class, 'update']);      
    Route::delete('/categories/{categorie}', [AdminCategorieController::class, 'destroy']);  

    Route::get('/annonces', [AdminAnnonceController::class, 'index']);                   
    Route::get('/annonces/{annonce}', [AdminAnnonceController::class, 'show'])->whereNumber('annonce');
    Route::delete('/annonces/{annonce}', [AdminAnnonceController::class, 'destroy'])->whereNumber('annonce');

    Route::get('/stats', [AdminStatsController::class, 'index']);
});
