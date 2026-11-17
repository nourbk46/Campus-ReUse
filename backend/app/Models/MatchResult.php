<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

// Une proposition : une annonce qui correspond à une demande (table « matchs »)
// (le nom « Match » est réservé en PHP, d'où MatchResult)
class MatchResult extends Model
{
    protected $table = 'matchs';

    protected $fillable = ['demande_id', 'annonce_id', 'score', 'details'];

    protected $casts = [
        'score'   => 'integer',
        'details' => 'array',
    ];

    public function demande(): BelongsTo
    {
        return $this->belongsTo(Demande::class);
    }

    public function annonce(): BelongsTo
    {
        return $this->belongsTo(Annonce::class);
    }
}
