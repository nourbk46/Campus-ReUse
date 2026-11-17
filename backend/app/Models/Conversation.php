<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Conversation extends Model
{
    protected $fillable = ['annonce_id', 'acheteur_id', 'vendeur_id', 'dernier_message_at'];

    protected $casts = ['dernier_message_at' => 'datetime'];

    public function annonce(): BelongsTo
    {
        return $this->belongsTo(Annonce::class);
    }

    public function acheteur(): BelongsTo
    {
        return $this->belongsTo(User::class, 'acheteur_id');
    }

    public function vendeur(): BelongsTo
    {
        return $this->belongsTo(User::class, 'vendeur_id');
    }

    public function messages(): HasMany
    {
        return $this->hasMany(Message::class)->orderBy('created_at')->orderBy('id');
    }

    public function dernierMessage(): HasOne
    {
        return $this->hasOne(Message::class)->latestOfMany();
    }

    public function participe(User $user): bool
    {
        return in_array($user->id, [$this->acheteur_id, $this->vendeur_id], true);
    }

    public function autre(User $user): ?User
    {
        return $user->id === $this->acheteur_id ? $this->vendeur : $this->acheteur;
    }
}
