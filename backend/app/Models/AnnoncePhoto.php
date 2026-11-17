<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AnnoncePhoto extends Model
{
    protected $table = 'annonce_photos';

    protected $fillable = ['annonce_id', 'chemin', 'ordre'];

    protected $hidden = ['created_at', 'updated_at'];

    protected $appends = ['url'];

    // URL relative : passe par le proxy Vite (/storage → Laravel)
    public function getUrlAttribute(): string
    {
        return '/storage/' . $this->chemin;
    }

    public function annonce(): BelongsTo
    {
        return $this->belongsTo(Annonce::class);
    }
}
