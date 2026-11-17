<?php

// SCRUM-22 — Table des demandes (objet recherché par un étudiant)

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('demandes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('categorie_id')->constrained('categories')->restrictOnDelete();
            $table->string('titre', 150);
            $table->text('description')->nullable();
            $table->decimal('budget_max', 10, 2)->default(0);   // 0 = je cherche un don ou un échange
            $table->enum('etat_min', ['use', 'bon', 'tres_bon', 'neuf'])->default('use');
            $table->enum('statut', ['ouverte', 'cloturee'])->default('ouverte');
            $table->timestamps();

            $table->index(['statut', 'categorie_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('demandes');
    }
};
