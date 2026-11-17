<?php

namespace App\Policies;

use App\Models\Annonce;
use App\Models\User;

// SCRUM-18 / SCRUM-46 — Seul le propriétaire peut modifier ou supprimer son annonce
class AnnoncePolicy
{
    public function update(User $user, Annonce $annonce): bool
    {
        return $user->id === $annonce->user_id;
    }

    public function delete(User $user, Annonce $annonce): bool
    {
        return $user->id === $annonce->user_id;
    }
}
