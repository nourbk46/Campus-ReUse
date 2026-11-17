<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Demande extends Model
{
    public const STATUTS = ['ouverte', 'cloturee'];

    protected $fillable = [
        'user_id', 'categorie_id', 'titre', 'description',
        'budget_max', 'etat_min', 'statut',
    ];

    protected $casts = [
        'budget_max' => 'float',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function categorie(): BelongsTo
    {
        return $this->belongsTo(Categorie::class);
    }

    public function matchs(): HasMany
    {
        return $this->hasMany(MatchResult::class);
    }
}
