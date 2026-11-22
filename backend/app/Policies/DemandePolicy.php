<?php

namespace App\Policies;

use App\Models\Demande;
use App\Models\User;

class DemandePolicy
{
    public function view(User $user, Demande $demande): bool
    {
        return $user->id === $demande->user_id;
    }

    public function update(User $user, Demande $demande): bool
    {
        return $user->id === $demande->user_id;
    }

    public function delete(User $user, Demande $demande): bool
    {
        return $user->id === $demande->user_id;
    }
}
