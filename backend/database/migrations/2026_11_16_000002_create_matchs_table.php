<?php

// SCRUM-24 — Résultats du matching (une ligne par couple demande / annonce avec score ≥ 50)

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('matchs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('demande_id')->constrained()->cascadeOnDelete();
            $table->foreignId('annonce_id')->constrained()->cascadeOnDelete();
            $table->unsignedTinyInteger('score');          // sur 100
            $table->json('details')->nullable();           // détail du score par critère
            $table->timestamps();

            $table->unique(['demande_id', 'annonce_id']);
            $table->index(['demande_id', 'score']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('matchs');
    }
};
