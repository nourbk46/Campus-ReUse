<?php

namespace Database\Seeders;

use App\Models\Annonce;
use App\Models\Categorie;
use App\Models\Conversation;
use App\Models\Demande;
use App\Models\Reservation;
use App\Models\User;
use App\Services\MatchingService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

/**
 * Données de démonstration : php artisan db:seed --class=DemoSeeder
 *
 * - 6 étudiants de démo (mot de passe : demo1234), e-mails en @demo.tn
 * - 18 annonces avec photos, réparties sur 8 semaines et plusieurs statuts
 * - Pour CHAQUE étudiant déjà inscrit (hors démo) : une annonce, 5 favoris, des demandes avec propositions,
 *   des conversations (avec messages non lus) et des réservations (reçue, acceptée, terminée).
 *
 * Relançable : les données de démo précédentes sont supprimées puis recréées.
 */
class DemoSeeder extends Seeder
{
    private const TITRES_REELS = ['Sac à dos Eastpak'];
    private const DEMANDES_REELLES = ['Calculatrice graphique', 'Livres de cours'];

    public function run(): void
    {
        $this->call(CategorieSeeder::class);
        $cat = Categorie::pluck('id', 'nom');

        // ---------- Nettoyage des données de démo précédentes ----------
        User::where('email', 'like', '%@demo.tn')->get()->each->delete(); // cascade : annonces, demandes, messages, réservations
        Annonce::whereIn('titre', self::TITRES_REELS)->get()->each->delete();
        Demande::whereIn('titre', self::DEMANDES_REELLES)->get()->each->delete();

        // ---------- Étudiants de démo ----------
        $u = [];
        foreach ([
            ['ghada', 'Ben Ali', 'Ghada', 'ISET Mahdia', 'Développement des systèmes d\'information', 'L3'],
            ['sami', 'Trabelsi', 'Sami', 'ISET Rades', 'Génie informatique', 'L2'],
            ['yasmine', 'Gharbi', 'Yasmine', 'FST', 'Informatique', 'M1'],
            ['amine', 'Jlassi', 'Amine', 'ENIT', 'Génie civil', 'Ingénieur'],
            ['ines', 'Mansouri', 'Inès', 'ISET Mahdia', 'Technologies de l\'informatique', 'L1'],
            ['karim', 'Haddad', 'Karim', 'ISET Rades', 'Génie électrique', 'L3'],
        ] as [$login, $nom, $prenom, $etab, $filiere, $niveau]) {
            $u[$login] = User::create([
                'name' => $nom, 'prenom' => $prenom, 'email' => "$login@demo.tn",
                'password' => Hash::make('demo1234'), 'role' => 'etudiant',
                'etablissement' => $etab, 'filiere' => $filiere, 'niveau' => $niveau,
                'email_verified_at' => now(), 'notifications_email' => false,
            ]);
        }

        // ---------- Annonces de démo ----------
        // [propriétaire, catégorie, titre, description, état, type, prix, statut, il y a N jours, photo]
        $annonces = [
            ['ghada', 'Informatique', 'Calculatrice graphique TI-83 Premium CE', 'Écran couleur, câble USB et housse inclus. Parfaite pour les maths et la physique.', 'tres_bon', 'vente', 45, 'disponible', 2, 'calculatrice-ti83'],
            ['sami', 'Livres & cours', 'Livre Analyse L1 — Dunod', 'Quelques annotations au crayon, sinon comme neuf.', 'bon', 'don', null, 'disponible', 5, 'livre-analyse'],
            ['yasmine', 'Informatique', 'Clavier mécanique Logitech', 'Switches brown, rétroéclairage blanc. Fonctionne parfaitement.', 'tres_bon', 'vente', 60, 'disponible', 9, 'clavier'],
            ['amine', 'Mobilier', 'Chaise de bureau ergonomique', 'Réglable en hauteur. À échanger contre une petite table ou une lampe.', 'bon', 'echange', null, 'disponible', 12, 'chaise'],
            ['ines', 'Fournitures', 'Lot de classeurs et surligneurs', '4 classeurs A4 et 6 surligneurs, jamais utilisés.', 'neuf', 'don', null, 'disponible', 1, 'classeurs'],
            ['karim', 'Électronique', 'Écouteurs Bluetooth JBL', 'Autonomie 20 h, boîtier de charge inclus.', 'bon', 'vente', 35, 'disponible', 15, 'ecouteurs'],
            ['ghada', 'Livres & cours', 'Cours d\'algorithmique + exercices corrigés', 'Polycopiés de L1 et L2, bien classés.', 'bon', 'don', null, 'disponible', 20, 'cours-algo'],
            ['sami', 'Sport & loisirs', 'Raquette de tennis Wilson', 'Cordage refait il y a 3 mois, avec housse.', 'bon', 'vente', 40, 'disponible', 25, 'raquette'],
            ['yasmine', 'Vêtements', 'Blouse de laboratoire taille M', 'Portée deux fois pour les TP de chimie.', 'tres_bon', 'vente', 10, 'disponible', 3, 'blouse'],
            ['amine', 'Électronique', 'Lampe de bureau LED', 'Trois niveaux de luminosité, port USB.', 'neuf', 'vente', 15, 'disponible', 30, 'lampe'],
            ['ines', 'Informatique', 'Souris sans fil', 'Petite souris silencieuse, pile fournie.', 'bon', 'vente', 12, 'disponible', 6, 'souris'],
            ['karim', 'Livres & cours', 'Dictionnaire Larousse français-anglais', 'Édition 2019, couverture un peu abîmée.', 'use', 'vente', 8, 'disponible', 40, 'dictionnaire'],
            ['ghada', 'Mobilier', 'Petite étagère en bois', 'Idéale pour une chambre d\'étudiant. Contre un tapis ou des livres.', 'bon', 'echange', null, 'disponible', 45, 'etagere'],
            ['sami', 'Informatique', 'Disque dur externe 1 To', 'USB 3.0, formaté.', 'tres_bon', 'vente', 50, 'disponible', 50, 'disque-dur'],
            ['yasmine', 'Informatique', 'Calculatrice scientifique Casio fx-92', 'Autorisée aux examens.', 'bon', 'vente', 15, 'disponible', 8, 'casio'],
            ['amine', 'Sport & loisirs', 'Ballon de football', 'Un peu usé mais tient bien l\'air.', 'use', 'don', null, 'disponible', 18, 'ballon'],
            ['ines', 'Autre', 'Plante verte pour la chambre', 'Pothos facile d\'entretien, avec son pot.', 'bon', 'don', null, 'disponible', 4, 'plante'],
            ['karim', 'Vêtements', 'Sweat à capuche ISET', 'Taille L, porté une seule fois.', 'neuf', 'vente', 20, 'disponible', 10, 'sweat'],
        ];
        $a = [];
        foreach ($annonces as [$login, $categorie, $titre, $desc, $etat, $type, $prix, $statut, $jours, $photo]) {
            $a[$photo] = $this->annonce($u[$login], $cat[$categorie], $titre, $desc, $etat, $type, $prix, $statut, $jours, $photo);
        }

        // Une annonce cédée et sa réservation terminée entre étudiants de démo (historique)
        $this->reservation($a['disque-dur'], $u['karim'], 'terminee', 40);
        $a['disque-dur']->update(['statut' => 'cedee']);

        // Favoris entre étudiants de démo
        $u['sami']->favoris()->attach([$a['blouse']->id, $a['lampe']->id]);
        $u['yasmine']->favoris()->attach([$a['chaise']->id, $a['calculatrice-ti83']->id]);
        $u['karim']->favoris()->attach([$a['cours-algo']->id]);

        // Conversation entre deux étudiants de démo
        $this->conversation($a['raquette'], $u['amine'], [
            [$u['amine'], 'Salut ! La raquette est toujours dispo ?', 30, true],
            [$u['sami'], 'Oui, tu peux passer à l\'ISET mardi.', 29, true],
        ]);

        // ---------- Données liées aux étudiants déjà inscrits ----------
        $reels = User::where('role', 'etudiant')->where('email', 'not like', '%@demo.tn')->get();
        foreach ($reels as $i => $moi) {
            // Mon annonce + une réservation reçue en attente + une conversation avec un message non lu
            $sac = $this->annonce($moi, $cat['Autre'], 'Sac à dos Eastpak', 'Bon état, plusieurs poches. Idéal pour les cours.', 'bon', 'vente', 25, 'disponible', 7, 'sac-a-dos');
            $this->reservation($sac, $u['sami'], 'en_attente', 1, 'Je peux passer le récupérer jeudi ?');
            $this->conversation($sac, $u['sami'], [
                [$u['sami'], 'Bonjour ! Le sac est toujours disponible ?', 50, true],
                [$moi, 'Oui, il est en très bon état.', 48, true],
                [$u['sami'], 'Super, je viens de le réserver 🙂', 1, false],
            ]);

            // Je contacte Ghada pour sa calculatrice (sa réponse n'est pas encore lue)
            $this->conversation($a['calculatrice-ti83'], $moi, [
                [$moi, 'Bonjour, la calculatrice fonctionne bien ? Le câble est fourni ?', 26, true],
                [$u['ghada'], 'Oui parfaitement, avec le câble USB et la housse !', 3, false],
            ]);

            // Mes demandes → propositions calculées par le matching
            foreach ([
                ['Calculatrice graphique', 'Calculatrice graphique ou scientifique pour le cours de maths', 'Informatique', 50, 'bon'],
                ['Livres de cours', 'Livres ou polycopiés pour réviser', 'Livres & cours', 0, 'use'],
            ] as [$titre, $desc, $categorie, $budget, $etatMin]) {
                $d = Demande::create([
                    'user_id' => $moi->id, 'categorie_id' => $cat[$categorie], 'titre' => $titre,
                    'description' => $desc, 'budget_max' => $budget, 'etat_min' => $etatMin, 'statut' => 'ouverte',
                ]);
                $d->forceFill(['created_at' => now()->subDays(3), 'updated_at' => now()->subDays(3)])->save();
                app(MatchingService::class)->pourDemande($d);
            }

            // Mes favoris (EF-12)
            foreach (['ecouteurs', 'chaise', 'clavier', 'plante', 'raquette'] as $j => $cle) {
                $moi->favoris()->attach($a[$cle]->id, ['created_at' => now()->subDays($j + 1), 'updated_at' => now()->subDays($j + 1)]);
            }

            // Pour le premier étudiant : une réservation acceptée (à confirmer) et un échange terminé
            if ($i === 0) {
                $r = $this->reservation($a['lampe'], $moi, 'acceptee', 2);
                $r->update(['confirme_vendeur_at' => now()->subDay()]);   // Amine a déjà confirmé la remise
                $a['lampe']->update(['statut' => 'reservee']);

                $this->reservation($a['dictionnaire'], $moi, 'terminee', 20);
                $a['dictionnaire']->update(['statut' => 'cedee']);
                $this->conversation($a['lampe'], $moi, [
                    [$moi, 'Je passe récupérer la lampe demain à 10h ?', 30, true],
                    [$u['amine'], 'Parfait, devant la bibliothèque. J\'ai confirmé la remise de mon côté.', 20, true],
                ]);
            }
        }

        // Les demandes déjà existantes profitent aussi des nouvelles annonces
        Demande::where('statut', 'ouverte')->get()->each(fn ($d) => app(MatchingService::class)->pourDemande($d));

        $this->command?->info(count($annonces) . ' annonces de démo, 6 étudiants (mot de passe : demo1234), données liées à ' . $reels->count() . ' étudiant(s) inscrit(s).');
    }

    // ---------- Outils ----------

    private function annonce(User $user, int $categorieId, string $titre, string $desc, string $etat, string $type, ?float $prix, string $statut, int $jours, string $photo): Annonce
    {
        $annonce = $user->annonces()->create([
            'categorie_id' => $categorieId, 'titre' => $titre, 'description' => $desc,
            'etat' => $etat, 'type' => $type, 'prix' => $type === 'vente' ? $prix : null, 'statut' => $statut,
        ]);
        $quand = now()->subDays($jours)->setTime(rand(9, 20), rand(0, 59));
        $annonce->forceFill(['created_at' => $quand, 'updated_at' => $quand])->save();

        $chemin = "annonces/demo-$photo.jpg";
        if (! Storage::disk('public')->exists($chemin)) {
            Storage::disk('public')->put($chemin, file_get_contents(__DIR__ . "/demo-photos/demo-$photo.jpg"));
        }
        $annonce->photos()->create(['chemin' => $chemin, 'ordre' => 1]);

        return $annonce;
    }

    private function reservation(Annonce $annonce, User $acheteur, string $statut, int $jours, ?string $message = null): Reservation
    {
        $quand = now()->subDays($jours);
        $r = Reservation::create([
            'annonce_id' => $annonce->id, 'user_id' => $acheteur->id, 'statut' => $statut, 'message' => $message,
            'acceptee_at' => in_array($statut, ['acceptee', 'terminee']) ? $quand : null,
            'expire_le' => in_array($statut, ['acceptee', 'terminee']) ? $quand->copy()->addDays(Reservation::DELAI_JOURS) : null,
            'confirme_vendeur_at' => $statut === 'terminee' ? $quand->copy()->addDay() : null,
            'confirme_acheteur_at' => $statut === 'terminee' ? $quand->copy()->addDay() : null,
        ]);
        $r->forceFill(['created_at' => $quand, 'updated_at' => $quand])->save();

        return $r;
    }

    /** @param array<int, array{0:User,1:string,2:int,3:bool}> $messages [auteur, texte, il y a N heures, lu] */
    private function conversation(Annonce $annonce, User $acheteur, array $messages): Conversation
    {
        $c = Conversation::firstOrCreate(
            ['annonce_id' => $annonce->id, 'acheteur_id' => $acheteur->id],
            ['vendeur_id' => $annonce->user_id]
        );
        foreach ($messages as [$auteur, $texte, $heures, $lu]) {
            $quand = now()->subHours($heures);
            $m = $c->messages()->create(['user_id' => $auteur->id, 'contenu' => $texte, 'lu_at' => $lu ? $quand : null]);
            $m->forceFill(['created_at' => $quand, 'updated_at' => $quand])->save();
            $c->update(['dernier_message_at' => $quand]);
        }

        return $c;
    }
}
