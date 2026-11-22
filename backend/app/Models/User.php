<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable implements MustVerifyEmail
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name', 'prenom', 'email', 'password', 'role',
        'filiere', 'niveau', 'etablissement', 'photo',
        'bloque', 'notifications_email',
    ];

    protected $hidden = ['password', 'remember_token'];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'bloque' => 'boolean',
        'notifications_email' => 'boolean',
    ];

    protected $appends = ['photo_url'];

    public function getPhotoUrlAttribute(): ?string
    {
        return $this->photo ? '/storage/' . $this->photo : null;
    }

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function annonces()
    {
        return $this->hasMany(Annonce::class);
    }

    public function demandes()
    {
        return $this->hasMany(Demande::class);
    }

    public function reservations()
    {
        return $this->hasMany(Reservation::class);
    }

    public function veutEmails(): bool
    {
        return (bool) $this->notifications_email;
    }

    public function favoris()
    {
        return $this->belongsToMany(Annonce::class, 'favoris')->withTimestamps();
    }
}
