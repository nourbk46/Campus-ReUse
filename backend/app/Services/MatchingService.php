<?php

namespace App\Services;

use App\Models\Annonce;
use App\Models\Demande;
use App\Models\MatchResult;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

class MatchingService
{
    public const SEUIL = 50;

    public const RANG_ETAT = ['use' => 0, 'bon' => 1, 'tres_bon' => 2, 'neuf' => 3];

    private const MOTS_VIDES = [
        'les', 'des', 'une', 'pour', 'avec', 'sans', 'dans', 'sur', 'par', 'est', 'qui', 'que',
        'pas', 'plus', 'tres', 'bon', 'etat', 'cherche', 'recherche', 'besoin', 'vend', 'vends',
        'donne', 'objet', 'aux', 'mon', 'mes', 'son', 'ses', 'leur', 'cette', 'tout', 'tous',
    ];


    public function pourDemande(Demande $demande): int
    {
        MatchResult::where('demande_id', $demande->id)->delete();

        if ($demande->statut !== 'ouverte') {
            return 0;
        }

        $demande->loadMissing('user');
        $annonces = $this->annoncesCandidates($demande);

        return $this->enregistrer($annonces->map(fn ($a) => [$demande, $a]));
    }

    public function pourAnnonce(Annonce $annonce): int
    {
        MatchResult::where('annonce_id', $annonce->id)->delete();

        if ($annonce->statut !== 'disponible') {
            return 0;
        }

        $annonce->loadMissing('user');
        $demandes = Demande::with('user')
            ->where('statut', 'ouverte')
            ->where('categorie_id', $annonce->categorie_id)
            ->where('user_id', '!=', $annonce->user_id)
            ->get()
            ->filter(fn ($d) => $this->passeLesFiltres($d, $annonce));

        return $this->enregistrer($demandes->map(fn ($d) => [$d, $annonce]));
    }


    public function passeLesFiltres(Demande $demande, Annonce $annonce): bool
    {
        return $annonce->statut === 'disponible'
            && (int) $annonce->categorie_id === (int) $demande->categorie_id
            && (int) $annonce->user_id !== (int) $demande->user_id
            && $this->prix($annonce) <= (float) $demande->budget_max
            && self::RANG_ETAT[$annonce->etat] >= self::RANG_ETAT[$demande->etat_min];
    }

    /** @return array{score:int, details:array} */
    public function calculerScore(Demande $demande, Annonce $annonce): array
    {
        // Mots-clés (40)
        $motsDemande = $this->mots($demande->titre . ' ' . $demande->description);
        $motsTitre = $this->mots($annonce->titre);
        $motsAnnonce = $motsTitre->merge($this->mots($annonce->description))->unique();

        if ($motsDemande->isEmpty()) {
            $motsCles = 20;
            $trouves = [];
        } else {
            $trouves = $motsDemande->filter(fn ($m) => $this->contient($motsAnnonce, $m))->values()->all();
            $dansTitre = $motsDemande->filter(fn ($m) => $this->contient($motsTitre, $m))->count();
            $ratio = (count($trouves) + 0.5 * $dansTitre) / (1.5 * $motsDemande->count());
            $motsCles = (int) round(40 * min(1, $ratio));
        }

        // Prix (30) : 15 pts si le prix égale le budget, 30 pts si c'est gratuit
        $prix = $this->prix($annonce);
        $budget = (float) $demande->budget_max;
        $pointsPrix = $prix <= 0 ? 30 : (int) round(30 * (0.5 + 0.5 * (1 - min(1, $prix / max($budget, 0.01)))));

        // État (20)
        $pointsEtat = (self::RANG_ETAT[$annonce->etat] + 1) * 5;

        // Même établissement (10)
        $etabDemandeur = $this->normaliser($demande->user?->etablissement ?? '');
        $etabVendeur = $this->normaliser($annonce->user?->etablissement ?? '');
        $pointsEtab = ($etabDemandeur !== '' && $etabDemandeur === $etabVendeur) ? 10 : 0;

        return [
            'score'   => min(100, $motsCles + $pointsPrix + $pointsEtat + $pointsEtab),
            'details' => [
                'mots_cles'     => $motsCles,
                'prix'          => $pointsPrix,
                'etat'          => $pointsEtat,
                'etablissement' => $pointsEtab,
                'mots_trouves'  => $trouves,
            ],
        ];
    }


    private function annoncesCandidates(Demande $demande): Collection
    {
        $etatsAcceptes = array_keys(array_filter(
            self::RANG_ETAT,
            fn ($rang) => $rang >= self::RANG_ETAT[$demande->etat_min]
        ));

        return Annonce::with('user')
            ->where('statut', 'disponible')
            ->where('categorie_id', $demande->categorie_id)
            ->where('user_id', '!=', $demande->user_id)
            ->whereIn('etat', $etatsAcceptes)
            ->whereRaw('COALESCE(prix, 0) <= ?', [$demande->budget_max])
            ->get();
    }

    /** @param Collection<int, array{0:Demande,1:Annonce}> $couples */
    private function enregistrer(Collection $couples): int
    {
        $n = 0;
        foreach ($couples as [$demande, $annonce]) {
            $r = $this->calculerScore($demande, $annonce);
            if ($r['score'] >= self::SEUIL) {
                MatchResult::updateOrCreate(
                    ['demande_id' => $demande->id, 'annonce_id' => $annonce->id],
                    ['score' => $r['score'], 'details' => $r['details']]
                );
                $n++;
            }
        }
        return $n;
    }

    private function prix(Annonce $annonce): float
    {
        return $annonce->type === 'vente' ? (float) $annonce->prix : 0.0;
    }

    private function normaliser(string $texte): string
    {
        return trim(Str::lower(Str::ascii($texte)));
    }

    private function mots(?string $texte): Collection
    {
        return collect(preg_split('/[^a-z0-9]+/', $this->normaliser($texte ?? '')))
            ->filter(fn ($m) => strlen($m) >= 3 && ! in_array($m, self::MOTS_VIDES, true))
            ->map(fn ($m) => strlen($m) > 4 ? rtrim($m, 's') : $m)   // pluriel simple : livres → livre
            ->unique()
            ->values();
    }

    private function contient(Collection $mots, string $mot): bool
    {
        return $mots->contains(fn ($m) => $m === $mot
            || (strlen($mot) >= 4 && str_starts_with($m, $mot))
            || (strlen($m) >= 4 && str_starts_with($mot, $m)));
    }
}
