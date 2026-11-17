<?php

namespace App\Console\Commands;

use App\Services\ReservationService;
use Illuminate\Console\Command;

// SCRUM-32 : php artisan reservations:expirer (lancée chaque jour par le planificateur)
class ExpirerReservations extends Command
{
    protected $signature = 'reservations:expirer';

    protected $description = 'Annule les réservations acceptées sans confirmation de l\'échange depuis 7 jours';

    public function handle(ReservationService $service): int
    {
        $n = $service->expirerEnRetard();
        $this->info("$n réservation(s) expirée(s).");

        return self::SUCCESS;
    }
}
