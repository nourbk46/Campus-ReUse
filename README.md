# Campus ReUse ♻

Plateforme d'échange d'objets entre étudiants (dons, échanges, ventes) — projet Scrum (Jira SCRUM).

**Stack :** React 19 + Vite (frontend) · Laravel 12 + Sanctum (API) · MySQL / XAMPP

## Fonctionnalités

| Sprint | Contenu |
|---|---|
| 1 | Inscription, confirmation d'e-mail, connexion, mot de passe oublié, profil |
| 2 | Annonces (photos, recherche, filtres, tri), mes annonces, dashboard étudiant |
| 3 | Demandes et matching automatique (score sur 100), propositions |
| 4 | Messagerie, réservations, confirmation d'échange, notifications e-mail, favoris |
| 5 | Administration : dashboard, utilisateurs (bloquer / supprimer), catégories, modération des annonces |

## Installation

Prérequis : PHP 8.2+ (extensions pdo_mysql, zip, fileinfo), Composer, Node 20+, MySQL (XAMPP).

```bash
# Backend
cd backend
composer install
cp .env.example .env          # puis renseigner la base de données et l'envoi d'e-mails
php artisan key:generate
php artisan migrate --seed    # tables + catégories + compte admin
php artisan storage:link
php artisan serve             # http://127.0.0.1:8000

# Frontend
cd frontend
npm install
npm run dev                   # http://localhost:5173
```

Sous Windows : `installer.bat` puis `dbg.bat` font la même chose.
Données de démonstration : `php artisan db:seed --class=DemoSeeder` (ou `donnees-demo.bat`).

## Tests

- **PHPUnit** : `cd backend && php artisan test` (base `campus_reuse_test`) — ou `tests.bat`
- **Postman / Newman** : `postman/Campus-ReUse-Tests.postman_collection.json` — ou `tester-postman.bat`
