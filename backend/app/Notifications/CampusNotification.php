<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * SCRUM-34 — Notification par e-mail (nouveau message, réservation, échange…).
 * Envoyée seulement si l'étudiant a activé « notifications_email » dans son profil.
 */
class CampusNotification extends Notification
{
    use Queueable;

    /** @param string[] $lignes */
    public function __construct(
        public string $type,
        public string $sujet,
        public array $lignes,
        public ?string $boutonTexte = null,
        public ?string $lien = null,          // chemin côté React, ex. /messages/3
    ) {
    }

    public function via(object $notifiable): array
    {
        return method_exists($notifiable, 'veutEmails') && $notifiable->veutEmails() ? ['mail'] : [];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $mail = (new MailMessage)
            ->subject('Campus ReUse — ' . $this->sujet)
            ->greeting('Bonjour ' . ($notifiable->prenom ?? '') . ',');

        foreach ($this->lignes as $ligne) {
            $mail->line($ligne);
        }

        if ($this->boutonTexte && $this->lien) {
            $mail->action($this->boutonTexte, rtrim(env('FRONTEND_URL', 'http://localhost:5173'), '/') . $this->lien);
        }

        return $mail
            ->line('Tu peux désactiver ces e-mails dans ton profil.')
            ->salutation('L\'équipe Campus ReUse');
    }
}
