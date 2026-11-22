<?php

namespace App\Services;

use App\Models\Annonce;
use App\Models\MatchResult;
use App\Models\Reservation;
use App\Models\User;
use App\Notifications\CampusNotification;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;


class ReservationService
{
    public function __construct(private MatchingService $matching)
    {
    }

    public function reserver(Annonce $annonce, User $user, ?string $message = null): Reservation
    {
        if ($annonce->user_id === $user->id) {
            $this->erreur('annonce', 'Impossible de réserver ta propre annonce.');
        }
        if ($annonce->statut !== 'disponible') {
            $this->erreur('annonce', "Cet objet n'est plus disponible.");
        }
        $dejaFaite = Reservation::where('annonce_id', $annonce->id)->where('user_id', $user->id)
            ->whereIn('statut', ['en_attente', 'acceptee'])->exists();
        if ($dejaFaite) {
            $this->erreur('annonce', 'Tu as déjà une réservation en cours pour cet objet.');
        }

        $demandeId = MatchResult::where('annonce_id', $annonce->id)
            ->whereHas('demande', fn ($q) => $q->where('user_id', $user->id)->where('statut', 'ouverte'))
            ->orderByDesc('score')->value('demande_id');

        $reservation = Reservation::create([
            'annonce_id' => $annonce->id,
            'user_id'    => $user->id,
            'demande_id' => $demandeId,
            'statut'     => 'en_attente',
            'message'    => $message,
        ]);

        $annonce->user->notify(new CampusNotification(
            'reservation_nouvelle',
            'Nouvelle demande de réservation',
            ["{$user->prenom} souhaite réserver ton annonce « {$annonce->titre} ».", 'Accepte ou refuse la réservation depuis ton espace.'],
            'Voir les réservations', '/reservations?onglet=recues'
        ));

        return $reservation;
    }

    public function accepter(Reservation $r): Reservation
    {
        $this->exigerStatut($r, ['en_attente'], 'Seule une réservation en attente peut être acceptée.');
        if ($r->annonce->statut !== 'disponible') {
            $this->erreur('statut', "L'objet est déjà réservé par quelqu'un d'autre.");
        }

        DB::transaction(function () use ($r) {
            $r->update([
                'statut'      => 'acceptee',
                'acceptee_at' => now(),
                'expire_le'   => now()->addDays(Reservation::DELAI_JOURS),
            ]);
            $r->annonce->update(['statut' => 'reservee']);   // annonce « Réservée »

            // Les autres réservations en attente sur le même objet sont refusées
            Reservation::where('annonce_id', $r->annonce_id)->where('id', '!=', $r->id)
                ->where('statut', 'en_attente')->get()
                ->each(fn ($autre) => $this->refuser($autre, 'L\'objet a été réservé par un autre étudiant.'));
        });

        $this->matching->pourAnnonce($r->annonce->fresh()); // retire l'annonce des propositions

        $r->acheteur->notify(new CampusNotification(
            'reservation_acceptee',
            'Réservation acceptée',
            ["Bonne nouvelle : ta réservation de « {$r->annonce->titre} » a été acceptée.",
             'Organise la remise avec le propriétaire, puis confirmez tous les deux l\'échange sous ' . Reservation::DELAI_JOURS . ' jours.'],
            'Voir ma réservation', '/reservations?onglet=envoyees'
        ));

        return $r->fresh();
    }

    public function refuser(Reservation $r, ?string $raison = null): Reservation
    {
        $this->exigerStatut($r, ['en_attente'], 'Seule une réservation en attente peut être refusée.');
        $r->update(['statut' => 'refusee']);

        $r->acheteur->notify(new CampusNotification(
            'reservation_refusee',
            'Réservation refusée',
            ["Ta réservation de « {$r->annonce->titre} » n'a pas été retenue." . ($raison ? " $raison" : '')],
            'Voir d\'autres annonces', '/annonces'
        ));

        return $r->fresh();
    }

    public function annuler(Reservation $r): Reservation
    {
        $this->exigerStatut($r, ['en_attente', 'acceptee'], 'Cette réservation ne peut plus être annulée.');
        $etaitAcceptee = $r->statut === 'acceptee';
        $r->update(['statut' => 'annulee']);

        if ($etaitAcceptee) {
            $this->remettreDisponible($r);
        }

        $r->annonce->user->notify(new CampusNotification(
            'reservation_annulee',
            'Réservation annulée',
            ["{$r->acheteur->prenom} a annulé sa réservation de « {$r->annonce->titre} »."
             . ($etaitAcceptee ? ' Ton annonce est de nouveau disponible.' : '')],
            'Voir mes annonces', '/mes-annonces'
        ));

        return $r->fresh();
    }

    public function confirmer(Reservation $r, User $user): Reservation
    {
        $this->exigerStatut($r, ['acceptee'], 'Seule une réservation acceptée peut être confirmée.');

        $estVendeur = $user->id === $r->annonce->user_id;
        $champ = $estVendeur ? 'confirme_vendeur_at' : 'confirme_acheteur_at';
        if ($r->$champ) {
            $this->erreur('statut', 'Tu as déjà confirmé cet échange.');
        }
        $r->update([$champ => now()]);
        $r->refresh();

        if ($r->confirme_vendeur_at && $r->confirme_acheteur_at) {
            DB::transaction(function () use ($r) {
                $r->update(['statut' => 'terminee']);
                $r->annonce->update(['statut' => 'cedee']);          
                if ($r->demande && $r->demande->statut === 'ouverte') {
                    $r->demande->update(['statut' => 'cloturee']);  
                }
            });
            $this->matching->pourAnnonce($r->annonce->fresh());
            if ($r->demande) {
                $this->matching->pourDemande($r->demande->fresh());
            }

            foreach ([$r->acheteur, $r->annonce->user] as $u) {
                $u->notify(new CampusNotification(
                    'echange_termine', 'Échange terminé',
                    ["L'échange de « {$r->annonce->titre} » est confirmé par les deux étudiants. Merci d'avoir partagé !"],
                    'Mon tableau de bord', '/'
                ));
            }
        } else {
            $autre = $estVendeur ? $r->acheteur : $r->annonce->user;
            $autre->notify(new CampusNotification(
                'echange_a_confirmer', 'Confirme l\'échange',
                ["{$user->prenom} a confirmé la remise de « {$r->annonce->titre} ».",
                 'Confirme à ton tour pour clôturer l\'échange.'],
                'Confirmer l\'échange', '/reservations'
            ));
        }

        return $r->fresh();
    }

    public function expirerEnRetard(): int
    {
        $enRetard = Reservation::with(['annonce.user', 'acheteur'])
            ->where('statut', 'acceptee')
            ->where('expire_le', '<', now())
            ->get();

        foreach ($enRetard as $r) {
            $r->update(['statut' => 'annulee']);
            $this->remettreDisponible($r);
            foreach ([$r->acheteur, $r->annonce->user] as $u) {
                $u->notify(new CampusNotification(
                    'reservation_expiree', 'Réservation expirée',
                    ["La réservation de « {$r->annonce->titre} » a été annulée : l'échange n'a pas été confirmé sous "
                     . Reservation::DELAI_JOURS . ' jours.'],
                    'Voir les annonces', '/annonces'
                ));
            }
        }

        return $enRetard->count();
    }

    private function remettreDisponible(Reservation $r): void
    {
        if ($r->annonce->statut === 'reservee') {
            $r->annonce->update(['statut' => 'disponible']);
            $this->matching->pourAnnonce($r->annonce->fresh());
        }
    }

    private function exigerStatut(Reservation $r, array $statuts, string $message): void
    {
        if (! in_array($r->statut, $statuts, true)) {
            $this->erreur('statut', $message);
        }
    }

    private function erreur(string $champ, string $message): never
    {
        throw ValidationException::withMessages([$champ => $message]);
    }
}
