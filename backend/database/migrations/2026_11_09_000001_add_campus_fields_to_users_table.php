<?php

// SCRUM-10 (US-01) — Ajoute les champs Campus ReUse à la table users créée par Laravel.
// Les champs etablissement / bloque / notifications_email serviront aux sprints 3, 4 et 5.

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('prenom')->nullable()->after('name');
            $table->enum('role', ['etudiant', 'admin'])->default('etudiant')->after('password');
            $table->string('filiere')->nullable()->after('role');
            $table->string('niveau')->nullable()->after('filiere');
            $table->string('etablissement')->nullable()->after('niveau');
            $table->string('photo')->nullable()->after('etablissement');
            $table->boolean('bloque')->default(false)->after('photo');
            $table->boolean('notifications_email')->default(true)->after('bloque');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'prenom', 'role', 'filiere', 'niveau', 'etablissement',
                'photo', 'bloque', 'notifications_email',
            ]);
        });
    }
};
