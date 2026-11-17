<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Annonce extends Model
{
    public const ETATS = ['neuf', 'tres_bon', 'bon', 'use'];
    public const TYPES = ['don', 'echange', 'vente'];
    public const STATUTS = ['disponible', 'reservee', 'cedee'];

    protected $fillable = [
        'user_id', 'categorie_id', 'titre', 'description',
        'etat', 'type', 'prix', 'statut',
    ];

    protected $casts = [
        'prix' => 'float',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function categorie(): BelongsTo
    {
        return $this->belongsTo(Categorie::class);
    }

    public function photos(): HasMany
    {
        return $this->hasMany(AnnoncePhoto::class)->orderBy('ordre');
    }

    public function reservations(): HasMany
    {
        return $this->hasMany(Reservation::class);
    }

    public function conversations(): HasMany
    {
        return $this->hasMany(Conversation::class);
    }
}
