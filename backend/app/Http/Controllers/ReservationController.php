<?php

namespace App\Http\Controllers;

use App\Models\Annonce;
use App\Models\Reservation;
use App\Services\ReservationService;
use Illuminate\Http\Request;

class ReservationController extends Controller
{
    private const AVEC = ['annonce.photos', 'annonce.categorie', 'annonce.user:id,name,prenom,etablissement,photo', 'acheteur:id,name,prenom,etablissement,photo'];

    public function __construct(private ReservationService $service)
    {
    }

    public function store(Request $request, Annonce $annonce)
    {
        $this->service->expirerEnRetard();
        $request->validate(['message' => 'nullable|string|max:500']);

        $r = $this->service->reserver($annonce, $request->user(), $request->input('message'));

        return response()->json([
            'message'     => 'Réservation envoyée. Le propriétaire doit l\'accepter.',
            'reservation' => $r->load(self::AVEC),
        ], 201);
    }

    public function recues(Request $request)
    {
        $this->service->expirerEnRetard();

        return response()->json(
            Reservation::with(self::AVEC)
                ->whereHas('annonce', fn ($q) => $q->where('user_id', $request->user()->id))
                ->orderByRaw(self::ordre(['en_attente', 'acceptee', 'terminee', 'refusee', 'annulee']))
                ->latest()->get()
        );
    }

    public function envoyees(Request $request)
    {
        $this->service->expirerEnRetard();

        return response()->json(
            $request->user()->reservations()->with(self::AVEC)
                ->orderByRaw(self::ordre(['acceptee', 'en_attente', 'terminee', 'refusee', 'annulee']))
                ->latest()->get()
        );
    }

    public function accepter(Request $request, Reservation $reservation)
    {
        $this->service->expirerEnRetard();
        $this->exigerProprietaire($request, $reservation);

        return $this->reponse($this->service->accepter($reservation->fresh()), 'Réservation acceptée. L\'annonce est maintenant « Réservée ».');
    }

    public function refuser(Request $request, Reservation $reservation)
    {
        $this->exigerProprietaire($request, $reservation);

        return $this->reponse($this->service->refuser($reservation), 'Réservation refusée. L\'annonce reste « Disponible ».');
    }

    public function annuler(Request $request, Reservation $reservation)
    {
        abort_unless($reservation->user_id === $request->user()->id, 403, 'Seul l\'étudiant qui a réservé peut annuler.');

        return $this->reponse($this->service->annuler($reservation), 'Réservation annulée.');
    }

    public function confirmer(Request $request, Reservation $reservation)
    {
        $this->service->expirerEnRetard();
        $reservation->refresh();
        $user = $request->user();
        abort_unless(
            in_array($user->id, [$reservation->user_id, $reservation->annonce->user_id], true),
            403, 'Seuls les deux étudiants concernés peuvent confirmer l\'échange.'
        );

        $r = $this->service->confirmer($reservation, $user);

        return $this->reponse($r, $r->statut === 'terminee'
            ? 'Échange terminé ! L\'annonce est maintenant « Cédée ».'
            : 'Confirmation enregistrée. En attente de la confirmation de l\'autre étudiant.');
    }

    private static function ordre(array $statuts): string
    {
        $cas = collect($statuts)->map(fn ($s, $i) => "WHEN '$s' THEN $i")->implode(' ');
        return "CASE statut $cas ELSE 9 END";
    }

    private function exigerProprietaire(Request $request, Reservation $reservation): void
    {
        abort_unless($reservation->annonce->user_id === $request->user()->id, 403, 'Seul le propriétaire de l\'annonce peut répondre à cette réservation.');
    }

    private function reponse(Reservation $r, string $message)
    {
        return response()->json(['message' => $message, 'reservation' => $r->load(self::AVEC)]);
    }
}
