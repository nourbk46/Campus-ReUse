<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;


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
