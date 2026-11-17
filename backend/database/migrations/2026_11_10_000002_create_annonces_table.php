<?php

// SCRUM-15 / SCRUM-17 — Table des annonces

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('annonces', function (Blueprint $table) {
            $table->id();
            // cascade : supprimer un compte supprime ses annonces (SCRUM-14)
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('categorie_id')->constrained('categories')->restrictOnDelete();
            $table->string('titre', 150);
            $table->text('description')->nullable();
            $table->enum('etat', ['neuf', 'tres_bon', 'bon', 'use']);
            $table->enum('type', ['don', 'echange', 'vente']);
            $table->decimal('prix', 10, 2)->nullable();
            $table->enum('statut', ['disponible', 'reservee', 'cedee'])->default('disponible');
            $table->timestamps();

            $table->index(['statut', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('annonces');
    }
};
