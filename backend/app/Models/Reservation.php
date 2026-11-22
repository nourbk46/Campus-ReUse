<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Reservation extends Model
{
    public const DELAI_JOURS = 7; 

    protected $fillable = [
        'annonce_id', 'user_id', 'demande_id', 'statut', 'message',
        'acceptee_at', 'expire_le', 'confirme_vendeur_at', 'confirme_acheteur_at',
    ];

    protected $casts = [
        'acceptee_at'          => 'datetime',
        'expire_le'            => 'datetime',
        'confirme_vendeur_at'  => 'datetime',
        'confirme_acheteur_at' => 'datetime',
    ];

    public function annonce(): BelongsTo
    {
        return $this->belongsTo(Annonce::class);
    }

    // l'étudiant qui réserve
    public function acheteur(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function demande(): BelongsTo
    {
        return $this->belongsTo(Demande::class);
    }
}
