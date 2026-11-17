<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// SCRUM-32 : annule chaque jour les réservations non confirmées sous 7 jours
Schedule::command('reservations:expirer')->daily();
