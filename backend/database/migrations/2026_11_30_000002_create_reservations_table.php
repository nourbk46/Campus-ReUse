<?php

// SCRUM-30 / 31 / 48 / 32 — Réservations d'objets

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reservations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('annonce_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();          // étudiant qui réserve
            $table->foreignId('demande_id')->nullable()->constrained()->nullOnDelete(); // demande liée (matching)
            // en_attente → acceptee → terminee   |   en_attente → refusee   |   → annulee
            $table->enum('statut', ['en_attente', 'acceptee', 'refusee', 'annulee', 'terminee'])->default('en_attente');
            $table->string('message', 500)->nullable();
            $table->timestamp('acceptee_at')->nullable();
            $table->timestamp('expire_le')->nullable();              // acceptee_at + 7 jours
            $table->timestamp('confirme_vendeur_at')->nullable();
            $table->timestamp('confirme_acheteur_at')->nullable();
            $table->timestamps();

            $table->index(['annonce_id', 'statut']);
            $table->index(['user_id', 'statut']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reservations');
    }
};
