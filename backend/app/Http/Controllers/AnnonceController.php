<?php

namespace App\Http\Controllers;

use App\Models\Annonce;
use App\Services\MatchingService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class AnnonceController extends Controller
{
    private const AUTEUR = 'user:id,name,prenom,etablissement,photo';

    public function index(Request $request)
    {
        $request->validate([
            'q'         => 'nullable|string|max:100',
            'categorie' => 'nullable|integer|exists:categories,id',
            'type'      => ['nullable', Rule::in(Annonce::TYPES)],
            'etat'      => ['nullable', Rule::in(Annonce::ETATS)],
            'prix_min'  => 'nullable|numeric|min:0',
            'prix_max'  => 'nullable|numeric|min:0',
            'tri'       => 'nullable|in:recent,ancien,prix_asc,prix_desc',
            'per_page'  => 'nullable|integer|min:1|max:50',
        ]);

        $query = Annonce::with(['photos', 'categorie', self::AUTEUR])
            ->where('statut', 'disponible') // seules les annonces « Disponible »
            ->whereHas('user', fn ($u) => $u->where('bloque', false)); // pas celles des comptes bloqués

        if ($request->filled('q')) {
            $mot = '%' . $request->q . '%';
            $query->where(fn ($w) => $w->where('titre', 'like', $mot)->orWhere('description', 'like', $mot));
        }

        $query->when($request->categorie, fn ($q, $v) => $q->where('categorie_id', $v))
              ->when($request->type, fn ($q, $v) => $q->where('type', $v))
              ->when($request->etat, fn ($q, $v) => $q->where('etat', $v))
              ->when($request->filled('prix_min'), fn ($q) => $q->whereRaw('COALESCE(prix, 0) >= ?', [$request->prix_min]))
              ->when($request->filled('prix_max'), fn ($q) => $q->whereRaw('COALESCE(prix, 0) <= ?', [$request->prix_max]));

        match ($request->input('tri', 'recent')) {
            'ancien'    => $query->orderBy('created_at')->orderBy('id'),
            'prix_asc'  => $query->orderByRaw('COALESCE(prix, 0) asc')->latest(),
            'prix_desc' => $query->orderByRaw('COALESCE(prix, 0) desc')->latest(),
            default     => $query->latest()->orderByDesc('id'),
        };

        return response()->json($query->paginate($request->integer('per_page', 12))->withQueryString());
    }

    public function show(Annonce $annonce)
    {
        return response()->json($annonce->load(['photos', 'categorie', self::AUTEUR]));
    }

    public function store(Request $request)
    {
        $data = $this->valider($request, creation: true);

        $annonce = DB::transaction(function () use ($request, $data) {
            $annonce = $request->user()->annonces()->create($data + ['statut' => 'disponible']);
            $this->enregistrerPhotos($annonce, $request->file('photos', []));
            return $annonce;
        });

        app(MatchingService::class)->pourAnnonce($annonce); // SCRUM-24

        return response()->json([
            'message' => 'Annonce publiée.',
            'annonce' => $annonce->load(['photos', 'categorie']),
        ], 201);
    }

    public function update(Request $request, Annonce $annonce)
    {
        Gate::authorize('update', $annonce); // 403 si ce n'est pas le propriétaire

        $data = $this->valider($request, creation: false);

        $request->validate([
            'statut'               => ['sometimes', Rule::in(['disponible', 'reservee'])],
            'photos_supprimees'    => 'sometimes|array',
            'photos_supprimees.*'  => 'integer',
        ]);

        $aSupprimer = $annonce->photos()->whereIn('id', $request->input('photos_supprimees', []))->get();
        $nouvelles = $request->file('photos', []);
        $total = $annonce->photos()->count() - $aSupprimer->count() + count($nouvelles);

        if ($total < 1 || $total > 5) {
            throw ValidationException::withMessages([
                'photos' => 'Une annonce doit avoir entre 1 et 5 photos (actuellement ' . $total . ').',
            ]);
        }

        DB::transaction(function () use ($request, $annonce, $data, $aSupprimer, $nouvelles) {
            if ($request->has('statut')) {
                $data['statut'] = $request->statut;
            }
            $annonce->update($data);

            foreach ($aSupprimer as $photo) {
                Storage::disk('public')->delete($photo->chemin);
                $photo->delete();
            }
            $this->enregistrerPhotos($annonce, $nouvelles);
        });

        app(MatchingService::class)->pourAnnonce($annonce->fresh()); // SCRUM-24

        return response()->json([
            'message' => 'Annonce modifiée.',
            'annonce' => $annonce->fresh()->load(['photos', 'categorie']),
        ]);
    }

    public function destroy(Annonce $annonce)
    {
        Gate::authorize('delete', $annonce);

        foreach ($annonce->photos as $photo) {
            Storage::disk('public')->delete($photo->chemin);
        }
        $annonce->delete(); 

        return response()->json(['message' => 'Annonce supprimée.']);
    }

    public function mesAnnonces(Request $request)
    {
        return response()->json(
            $request->user()->annonces()->with(['photos', 'categorie'])->latest()->get()
        );
    }

    public function dashboard(Request $request)
    {
        $user = $request->user();
        $mes = $user->annonces()->with(['photos', 'categorie'])->latest()->get();
        $parStatut = $mes->countBy('statut');
        $parType = $mes->countBy('type');

        $debut = now()->startOfWeek()->subWeeks(7);
        $activite = collect(range(0, 7))->map(function ($i) use ($debut, $mes) {
            $lundi = $debut->copy()->addWeeks($i);
            $dimanche = $lundi->copy()->endOfWeek();
            return [
                'semaine' => $lundi->toDateString(),
                'label'   => $lundi->format('d/m'),
                'total'   => $mes->filter(fn ($a) => $a->created_at->between($lundi, $dimanche))->count(),
            ];
        })->values();

        $categories = $mes->groupBy('categorie_id')->map(fn ($g) => [
            'nom'   => $g->first()->categorie?->nom,
            'icone' => $g->first()->categorie?->icone,
            'total' => $g->count(),
        ])->sortByDesc('total')->values();

        $champs = [
            'photo'         => ['Photo de profil', (bool) $user->photo],
            'filiere'       => ['Filière', (bool) $user->filiere],
            'niveau'        => ['Niveau', (bool) $user->niveau],
            'etablissement' => ['Établissement', (bool) $user->etablissement],
            'email'         => ['E-mail confirmé', (bool) $user->email_verified_at],
            'annonce'       => ['Première annonce', $mes->isNotEmpty()],
        ];
        $faits = collect($champs)->filter(fn ($c) => $c[1])->count();

        return response()->json([
            'stats' => [
                'annonces' => $mes->count(),
                'messages' => \App\Models\Message::whereNull('lu_at')->where('user_id', '!=', $user->id)
                    ->whereHas('conversation', fn ($q) => $q->where('acheteur_id', $user->id)->orWhere('vendeur_id', $user->id))->count(),
                'favoris'  => $user->favoris()->count(),
            ],
            'mes_annonces' => [
                'total'            => $mes->count(),
                'disponibles'      => $parStatut->get('disponible', 0),
                'reservees'        => $parStatut->get('reservee', 0),
                'cedees'           => $parStatut->get('cedee', 0),
                'cette_semaine'    => $mes->where('created_at', '>=', now()->startOfWeek())->count(),
                'dons'             => $parType->get('don', 0),
                'echanges'         => $parType->get('echange', 0),
                'ventes'           => $parType->get('vente', 0),
                'valeur_en_vente'  => round($mes->where('type', 'vente')->where('statut', 'disponible')->sum('prix'), 2),
            ],
            'activite'   => $activite,
            'categories' => $categories,
            'recentes'   => $mes->take(4)->map(fn ($a) => [
                'id'         => $a->id,
                'titre'      => $a->titre,
                'type'       => $a->type,
                'prix'       => $a->prix,
                'statut'     => $a->statut,
                'categorie'  => $a->categorie?->nom,
                'photo'      => $a->photos->first()?->url,
                'created_at' => $a->created_at,
            ])->values(),
            'plateforme' => [
                'annonces_disponibles' => Annonce::where('statut', 'disponible')->count(),
                'nouvelles_semaine'    => Annonce::where('created_at', '>=', now()->startOfWeek())->count(),
                'etudiants'            => \App\Models\User::where('role', 'etudiant')->count(),
                'objets_cedes'         => Annonce::where('statut', 'cedee')->count(),
            ],
            'matching' => [
                'demandes_ouvertes' => $user->demandes()->where('statut', 'ouverte')->count(),
                'propositions'      => \App\Models\MatchResult::whereHas('demande', fn ($q) => $q->where('user_id', $user->id)->where('statut', 'ouverte'))
                    ->whereHas('annonce', fn ($q) => $q->where('statut', 'disponible'))->count(),
            ],
            'echanges' => [
                'reservations_a_traiter' => \App\Models\Reservation::where('statut', 'en_attente')
                    ->whereHas('annonce', fn ($q) => $q->where('user_id', $user->id))->count(),
                'echanges_a_confirmer'   => \App\Models\Reservation::where('statut', 'acceptee')
                    ->where(fn ($q) => $q->where('user_id', $user->id)->whereNull('confirme_acheteur_at')
                        ->orWhere(fn ($w) => $w->whereHas('annonce', fn ($a) => $a->where('user_id', $user->id))->whereNull('confirme_vendeur_at')))->count(),
                'echanges_termines'      => \App\Models\Reservation::where('statut', 'terminee')
                    ->where(fn ($q) => $q->where('user_id', $user->id)->orWhereHas('annonce', fn ($a) => $a->where('user_id', $user->id)))->count(),
            ],
            'profil' => [
                'completion' => (int) round($faits / count($champs) * 100),
                'etapes'     => collect($champs)->map(fn ($c, $k) => ['cle' => $k, 'label' => $c[0], 'fait' => $c[1]])->values(),
            ],
        ]);
    }


    private function valider(Request $request, bool $creation): array
    {
        $req = $creation ? 'required' : 'sometimes|required';

        $data = $request->validate([
            'titre'        => "$req|string|max:150",
            'description'  => 'nullable|string|max:2000',
            'categorie_id' => "$req|integer|exists:categories,id",
            'etat'         => [$creation ? 'required' : 'sometimes', Rule::in(Annonce::ETATS)],
            'type'         => [$creation ? 'required' : 'sometimes', Rule::in(Annonce::TYPES)],
            'prix'         => 'nullable|numeric|min:0|max:100000',
            'photos'       => $creation ? 'required|array|min:1|max:5' : 'sometimes|array|max:5',
            'photos.*'     => 'image|mimes:jpg,jpeg,png|max:5120',
        ], [
            'titre.required'        => 'Le titre est obligatoire.',
            'categorie_id.required' => 'Choisissez une catégorie.',
            'etat.required'         => "Indiquez l'état de l'objet.",
            'type.required'         => "Choisissez le type d'annonce.",
            'photos.required'       => 'Ajoutez au moins une photo.',
            'photos.min'            => 'Ajoutez au moins une photo.',
            'photos.max'            => '5 photos maximum.',
            'photos.*.image'        => 'Chaque fichier doit être une image.',
            'photos.*.mimes'        => 'Formats acceptés : JPG ou PNG.',
            'photos.*.max'          => 'Chaque photo doit faire 5 Mo maximum.',
        ]);

        $type = $data['type'] ?? $request->route('annonce')?->type;
        if ($type === 'vente') {
            $prix = array_key_exists('prix', $data) ? $data['prix'] : $request->route('annonce')?->prix;
            if ($prix === null || $prix === '') {
                throw ValidationException::withMessages(['prix' => 'Le prix est obligatoire pour une vente.']);
            }
        } elseif ($type !== null) {
            $data['prix'] = null;
        }

        unset($data['photos']);
        return $data;
    }

    private function enregistrerPhotos(Annonce $annonce, array $fichiers): void
    {
        $ordre = (int) $annonce->photos()->max('ordre');
        foreach ($fichiers as $fichier) {
            $annonce->photos()->create([
                'chemin' => $fichier->store('annonces', 'public'),
                'ordre'  => ++$ordre,
            ]);
        }
    }
}
