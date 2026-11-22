-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1
-- Généré le : mar. 17 nov. 2026 à 21:43
-- Version du serveur : 10.4.32-MariaDB
-- Version de PHP : 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `campus_reuse_s1`
--

-- --------------------------------------------------------

--
-- Structure de la table `annonces`
--

CREATE TABLE `annonces` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `categorie_id` bigint(20) UNSIGNED NOT NULL,
  `titre` varchar(150) NOT NULL,
  `description` text DEFAULT NULL,
  `etat` enum('neuf','tres_bon','bon','use') NOT NULL,
  `type` enum('don','echange','vente') NOT NULL,
  `prix` decimal(10,2) DEFAULT NULL,
  `statut` enum('disponible','reservee','cedee') NOT NULL DEFAULT 'disponible',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `annonces`
--

INSERT INTO `annonces` (`id`, `user_id`, `categorie_id`, `titre`, `description`, `etat`, `type`, `prix`, `statut`, `created_at`, `updated_at`) VALUES
(1, 5, 1, 'livre', 'livre d\'analyse', 'tres_bon', 'echange', NULL, 'disponible', '2026-11-09 20:58:36', '2026-11-09 20:58:36'),
(4, 3, 2, 'calculatrice', 'casio', 'tres_bon', 'echange', NULL, 'disponible', '2026-11-10 20:21:54', '2026-11-10 20:21:54'),
(28, 15, 2, 'Calculatrice graphique TI-83 Premium CE', 'Écran couleur, câble USB et housse inclus. Parfaite pour les maths et la physique.', 'tres_bon', 'vente', 45.00, 'disponible', '2026-11-09 17:31:00', '2026-11-09 17:31:00'),
(29, 16, 1, 'Livre Analyse L1 — Dunod', 'Quelques annotations au crayon, sinon comme neuf.', 'bon', 'don', NULL, 'disponible', '2026-11-06 16:35:00', '2026-11-06 16:35:00'),
(30, 17, 2, 'Clavier mécanique Logitech', 'Switches brown, rétroéclairage blanc. Fonctionne parfaitement.', 'tres_bon', 'vente', 60.00, 'disponible', '2026-11-02 18:10:00', '2026-11-02 18:10:00'),
(31, 18, 6, 'Chaise de bureau ergonomique', 'Réglable en hauteur. À échanger contre une petite table ou une lampe.', 'bon', 'echange', NULL, 'disponible', '2026-10-30 17:14:00', '2026-10-30 17:14:00'),
(32, 19, 3, 'Lot de classeurs et surligneurs', '4 classeurs A4 et 6 surligneurs, jamais utilisés.', 'neuf', 'don', NULL, 'disponible', '2026-11-10 17:03:00', '2026-11-10 17:03:00'),
(33, 20, 4, 'Écouteurs Bluetooth JBL', 'Autonomie 20 h, boîtier de charge inclus.', 'bon', 'vente', 35.00, 'disponible', '2026-10-27 09:20:00', '2026-10-27 09:20:00'),
(34, 15, 1, 'Cours d\'algorithmique + exercices corrigés', 'Polycopiés de L1 et L2, bien classés.', 'bon', 'don', NULL, 'disponible', '2026-10-22 13:58:00', '2026-10-22 13:58:00'),
(35, 16, 7, 'Raquette de tennis Wilson', 'Cordage refait il y a 3 mois, avec housse.', 'bon', 'vente', 40.00, 'disponible', '2026-10-17 15:37:00', '2026-10-17 15:37:00'),
(36, 17, 5, 'Blouse de laboratoire taille M', 'Portée deux fois pour les TP de chimie.', 'tres_bon', 'vente', 10.00, 'disponible', '2026-11-08 17:51:00', '2026-11-08 17:51:00'),
(37, 18, 4, 'Lampe de bureau LED', 'Trois niveaux de luminosité, port USB.', 'neuf', 'vente', 15.00, 'disponible', '2026-10-12 18:48:00', '2026-11-16 21:03:48'),
(38, 19, 2, 'Souris sans fil', 'Petite souris silencieuse, pile fournie.', 'bon', 'vente', 12.00, 'disponible', '2026-11-05 14:18:00', '2026-11-05 14:18:00'),
(39, 20, 1, 'Dictionnaire Larousse français-anglais', 'Édition 2019, couverture un peu abîmée.', 'use', 'vente', 8.00, 'cedee', '2026-10-02 13:59:00', '2026-11-11 17:53:11'),
(40, 15, 6, 'Petite étagère en bois', 'Idéale pour une chambre d\'étudiant. Contre un tapis ou des livres.', 'bon', 'echange', NULL, 'disponible', '2026-09-27 11:39:00', '2026-09-27 11:39:00'),
(41, 16, 2, 'Disque dur externe 1 To', 'USB 3.0, formaté.', 'tres_bon', 'vente', 50.00, 'cedee', '2026-09-22 18:03:00', '2026-11-11 17:53:11'),
(42, 17, 2, 'Calculatrice scientifique Casio fx-92', 'Autorisée aux examens.', 'bon', 'vente', 15.00, 'disponible', '2026-11-03 18:34:00', '2026-11-03 18:34:00'),
(43, 18, 7, 'Ballon de football', 'Un peu usé mais tient bien l\'air.', 'use', 'don', NULL, 'disponible', '2026-10-24 18:59:00', '2026-10-24 18:59:00'),
(44, 19, 8, 'Plante verte pour la chambre', 'Pothos facile d\'entretien, avec son pot.', 'bon', 'don', NULL, 'disponible', '2026-11-07 12:49:00', '2026-11-07 12:49:00'),
(45, 20, 5, 'Sweat à capuche ISET', 'Taille L, porté une seule fois.', 'neuf', 'vente', 20.00, 'disponible', '2026-11-01 16:23:00', '2026-11-01 16:23:00'),
(46, 2, 8, 'Sac à dos Eastpak', 'Bon état, plusieurs poches. Idéal pour les cours.', 'bon', 'vente', 25.00, 'disponible', '2026-11-04 14:05:00', '2026-11-04 14:05:00'),
(47, 3, 8, 'Sac à dos Eastpak', 'Bon état, plusieurs poches. Idéal pour les cours.', 'bon', 'vente', 25.00, 'disponible', '2026-11-04 17:42:00', '2026-11-04 17:42:00'),
(48, 4, 8, 'Sac à dos Eastpak', 'Bon état, plusieurs poches. Idéal pour les cours.', 'bon', 'vente', 25.00, 'disponible', '2026-11-04 08:31:00', '2026-11-04 08:31:00'),
(49, 5, 8, 'Sac à dos Eastpak', 'Bon état, plusieurs poches. Idéal pour les cours.', 'bon', 'vente', 25.00, 'disponible', '2026-11-04 17:26:00', '2026-11-04 17:26:00'),
(50, 6, 8, 'Sac à dos Eastpak', 'Bon état, plusieurs poches. Idéal pour les cours.', 'bon', 'vente', 25.00, 'disponible', '2026-11-04 11:09:00', '2026-11-04 11:09:00'),
(61, 5, 8, 'cartable', NULL, 'tres_bon', 'vente', 35.00, 'disponible', '2026-11-16 09:08:17', '2026-11-16 09:08:35');

-- --------------------------------------------------------

--
-- Structure de la table `annonce_photos`
--

CREATE TABLE `annonce_photos` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `annonce_id` bigint(20) UNSIGNED NOT NULL,
  `chemin` varchar(191) NOT NULL,
  `ordre` tinyint(3) UNSIGNED NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `annonce_photos`
--

INSERT INTO `annonce_photos` (`id`, `annonce_id`, `chemin`, `ordre`, `created_at`, `updated_at`) VALUES
(1, 1, 'annonces/SpxRav7JfboWcW32gcnktSEq0Kc3VyWTCDPkNteU.jpg', 1, '2026-11-09 20:58:36', '2026-11-09 20:58:36'),
(4, 4, 'annonces/Z1uO1LCyD3ZwQb5bkB3sVWSvnLDaNLMZJmmmZP3V.jpg', 1, '2026-11-10 20:21:54', '2026-11-10 20:21:54'),
(28, 28, 'annonces/demo-calculatrice-ti83.jpg', 1, '2026-11-11 17:53:10', '2026-11-11 17:53:10'),
(29, 29, 'annonces/demo-livre-analyse.jpg', 1, '2026-11-11 17:53:10', '2026-11-11 17:53:10'),
(30, 30, 'annonces/demo-clavier.jpg', 1, '2026-11-11 17:53:10', '2026-11-11 17:53:10'),
(31, 31, 'annonces/demo-chaise.jpg', 1, '2026-11-11 17:53:10', '2026-11-11 17:53:10'),
(32, 32, 'annonces/demo-classeurs.jpg', 1, '2026-11-11 17:53:10', '2026-11-11 17:53:10'),
(33, 33, 'annonces/demo-ecouteurs.jpg', 1, '2026-11-11 17:53:10', '2026-11-11 17:53:10'),
(34, 34, 'annonces/demo-cours-algo.jpg', 1, '2026-11-11 17:53:10', '2026-11-11 17:53:10'),
(35, 35, 'annonces/demo-raquette.jpg', 1, '2026-11-11 17:53:10', '2026-11-11 17:53:10'),
(36, 36, 'annonces/demo-blouse.jpg', 1, '2026-11-11 17:53:10', '2026-11-11 17:53:10'),
(37, 37, 'annonces/demo-lampe.jpg', 1, '2026-11-11 17:53:10', '2026-11-11 17:53:10'),
(38, 38, 'annonces/demo-souris.jpg', 1, '2026-11-11 17:53:11', '2026-11-11 17:53:11'),
(39, 39, 'annonces/demo-dictionnaire.jpg', 1, '2026-11-11 17:53:11', '2026-11-11 17:53:11'),
(40, 40, 'annonces/demo-etagere.jpg', 1, '2026-11-11 17:53:11', '2026-11-11 17:53:11'),
(41, 41, 'annonces/demo-disque-dur.jpg', 1, '2026-11-11 17:53:11', '2026-11-11 17:53:11'),
(42, 42, 'annonces/demo-casio.jpg', 1, '2026-11-11 17:53:11', '2026-11-11 17:53:11'),
(43, 43, 'annonces/demo-ballon.jpg', 1, '2026-11-11 17:53:11', '2026-11-11 17:53:11'),
(44, 44, 'annonces/demo-plante.jpg', 1, '2026-11-11 17:53:11', '2026-11-11 17:53:11'),
(45, 45, 'annonces/demo-sweat.jpg', 1, '2026-11-11 17:53:11', '2026-11-11 17:53:11'),
(46, 46, 'annonces/demo-sac-a-dos.jpg', 1, '2026-11-11 17:53:11', '2026-11-11 17:53:11'),
(47, 47, 'annonces/demo-sac-a-dos.jpg', 1, '2026-11-11 17:53:11', '2026-11-11 17:53:11'),
(48, 48, 'annonces/demo-sac-a-dos.jpg', 1, '2026-11-11 17:53:11', '2026-11-11 17:53:11'),
(49, 49, 'annonces/demo-sac-a-dos.jpg', 1, '2026-11-11 17:53:11', '2026-11-11 17:53:11'),
(50, 50, 'annonces/demo-sac-a-dos.jpg', 1, '2026-11-11 17:53:11', '2026-11-11 17:53:11'),
(61, 61, 'annonces/OKGfpcnDpQg40HEo31qn1SQqRkiVrndVw0WjEthG.png', 1, '2026-11-16 09:08:17', '2026-11-16 09:08:17');

-- --------------------------------------------------------

--
-- Structure de la table `cache`
--

CREATE TABLE `cache` (
  `key` varchar(191) NOT NULL,
  `value` mediumtext NOT NULL,
  `expiration` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `cache_locks`
--

CREATE TABLE `cache_locks` (
  `key` varchar(191) NOT NULL,
  `owner` varchar(191) NOT NULL,
  `expiration` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `categories`
--

CREATE TABLE `categories` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `nom` varchar(100) NOT NULL,
  `icone` varchar(10) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `categories`
--

INSERT INTO `categories` (`id`, `nom`, `icone`, `created_at`, `updated_at`) VALUES
(1, 'Livres & cours', '📚', '2026-11-09 20:56:33', '2026-11-09 20:56:33'),
(2, 'Informatique', '💻', '2026-11-09 20:56:33', '2026-11-09 20:56:33'),
(3, 'Fournitures', '✏️', '2026-11-09 20:56:33', '2026-11-09 20:56:33'),
(4, 'Électronique', '🔌', '2026-11-09 20:56:33', '2026-11-09 20:56:33'),
(5, 'Vêtements', '👕', '2026-11-09 20:56:33', '2026-11-09 20:56:33'),
(6, 'Mobilier', '🪑', '2026-11-09 20:56:33', '2026-11-09 20:56:33'),
(7, 'Sport & loisirs', '⚽', '2026-11-09 20:56:33', '2026-11-09 20:56:33'),
(8, 'Autre', '📦', '2026-11-09 20:56:33', '2026-11-09 20:56:33');

-- --------------------------------------------------------

--
-- Structure de la table `conversations`
--

CREATE TABLE `conversations` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `annonce_id` bigint(20) UNSIGNED NOT NULL,
  `acheteur_id` bigint(20) UNSIGNED NOT NULL,
  `vendeur_id` bigint(20) UNSIGNED NOT NULL,
  `dernier_message_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `conversations`
--

INSERT INTO `conversations` (`id`, `annonce_id`, `acheteur_id`, `vendeur_id`, `dernier_message_at`, `created_at`, `updated_at`) VALUES
(13, 35, 18, 16, '2026-11-10 12:53:11', '2026-11-11 17:53:11', '2026-11-11 17:53:11'),
(14, 46, 16, 2, '2026-11-11 16:53:11', '2026-11-11 17:53:11', '2026-11-11 17:53:11'),
(15, 28, 2, 15, '2026-11-11 14:53:11', '2026-11-11 17:53:11', '2026-11-11 17:53:11'),
(16, 37, 2, 18, '2026-11-10 21:53:11', '2026-11-11 17:53:11', '2026-11-11 17:53:11'),
(17, 47, 16, 3, '2026-11-11 16:53:11', '2026-11-11 17:53:11', '2026-11-11 17:53:11'),
(18, 28, 3, 15, '2026-11-11 14:53:11', '2026-11-11 17:53:11', '2026-11-11 17:53:11'),
(19, 48, 16, 4, '2026-11-11 16:53:11', '2026-11-11 17:53:11', '2026-11-11 17:53:11'),
(20, 28, 4, 15, '2026-11-11 14:53:11', '2026-11-11 17:53:11', '2026-11-11 17:53:11'),
(21, 49, 16, 5, '2026-11-11 16:53:11', '2026-11-11 17:53:11', '2026-11-11 17:53:11'),
(22, 28, 5, 15, '2026-11-11 14:53:11', '2026-11-11 17:53:11', '2026-11-11 17:53:11'),
(23, 50, 16, 6, '2026-11-11 16:53:11', '2026-11-11 17:53:11', '2026-11-11 17:53:11'),
(24, 28, 6, 15, '2026-11-11 14:53:11', '2026-11-11 17:53:11', '2026-11-11 17:53:11'),
(26, 32, 5, 19, '2026-11-16 06:58:47', '2026-11-16 06:58:47', '2026-11-16 06:58:47'),
(28, 38, 5, 19, '2026-11-16 09:09:28', '2026-11-16 09:09:28', '2026-11-16 09:09:28');

-- --------------------------------------------------------

--
-- Structure de la table `demandes`
--

CREATE TABLE `demandes` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `categorie_id` bigint(20) UNSIGNED NOT NULL,
  `titre` varchar(150) NOT NULL,
  `description` text DEFAULT NULL,
  `budget_max` decimal(10,2) NOT NULL DEFAULT 0.00,
  `etat_min` enum('use','bon','tres_bon','neuf') NOT NULL DEFAULT 'use',
  `statut` enum('ouverte','cloturee') NOT NULL DEFAULT 'ouverte',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `demandes`
--

INSERT INTO `demandes` (`id`, `user_id`, `categorie_id`, `titre`, `description`, `budget_max`, `etat_min`, `statut`, `created_at`, `updated_at`) VALUES
(1, 5, 2, 'calculatrice', 'casio', 0.00, 'tres_bon', 'ouverte', '2026-11-10 20:20:30', '2026-11-16 09:06:31'),
(2, 3, 3, 'livre', NULL, 0.00, 'bon', 'ouverte', '2026-11-10 20:22:12', '2026-11-10 20:22:28'),
(13, 2, 2, 'Calculatrice graphique', 'Calculatrice graphique ou scientifique pour le cours de maths', 50.00, 'bon', 'ouverte', '2026-11-08 17:53:11', '2026-11-08 17:53:11'),
(14, 2, 1, 'Livres de cours', 'Livres ou polycopiés pour réviser', 0.00, 'use', 'ouverte', '2026-11-08 17:53:11', '2026-11-08 17:53:11'),
(15, 3, 2, 'Calculatrice graphique', 'Calculatrice graphique ou scientifique pour le cours de maths', 50.00, 'bon', 'ouverte', '2026-11-08 17:53:11', '2026-11-08 17:53:11'),
(16, 3, 1, 'Livres de cours', 'Livres ou polycopiés pour réviser', 0.00, 'use', 'ouverte', '2026-11-08 17:53:11', '2026-11-08 17:53:11'),
(17, 4, 2, 'Calculatrice graphique', 'Calculatrice graphique ou scientifique pour le cours de maths', 50.00, 'bon', 'ouverte', '2026-11-08 17:53:11', '2026-11-08 17:53:11'),
(18, 4, 1, 'Livres de cours', 'Livres ou polycopiés pour réviser', 0.00, 'use', 'ouverte', '2026-11-08 17:53:11', '2026-11-08 17:53:11'),
(19, 5, 2, 'Calculatrice graphique', 'Calculatrice graphique ou scientifique pour le cours de maths', 50.00, 'bon', 'ouverte', '2026-11-08 17:53:11', '2026-11-08 17:53:11'),
(21, 6, 2, 'Calculatrice graphique', 'Calculatrice graphique ou scientifique pour le cours de maths', 50.00, 'bon', 'ouverte', '2026-11-08 17:53:11', '2026-11-08 17:53:11'),
(22, 6, 1, 'Livres de cours', 'Livres ou polycopiés pour réviser', 0.00, 'use', 'ouverte', '2026-11-08 17:53:11', '2026-11-08 17:53:11');

-- --------------------------------------------------------

--
-- Structure de la table `failed_jobs`
--

CREATE TABLE `failed_jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `uuid` varchar(191) NOT NULL,
  `connection` text NOT NULL,
  `queue` text NOT NULL,
  `payload` longtext NOT NULL,
  `exception` longtext NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `favoris`
--

CREATE TABLE `favoris` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `annonce_id` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `favoris`
--

INSERT INTO `favoris` (`id`, `user_id`, `annonce_id`, `created_at`, `updated_at`) VALUES
(1, 16, 36, '2026-11-11 17:53:11', '2026-11-11 17:53:11'),
(2, 16, 37, '2026-11-11 17:53:11', '2026-11-11 17:53:11'),
(3, 17, 31, '2026-11-11 17:53:11', '2026-11-11 17:53:11'),
(4, 17, 28, '2026-11-11 17:53:11', '2026-11-11 17:53:11'),
(5, 20, 34, '2026-11-11 17:53:11', '2026-11-11 17:53:11'),
(6, 2, 33, '2026-11-10 17:53:11', '2026-11-10 17:53:11'),
(7, 2, 31, '2026-11-09 17:53:11', '2026-11-09 17:53:11'),
(8, 2, 30, '2026-11-08 17:53:11', '2026-11-08 17:53:11'),
(9, 2, 44, '2026-11-07 17:53:11', '2026-11-07 17:53:11'),
(10, 2, 35, '2026-11-06 17:53:11', '2026-11-06 17:53:11'),
(11, 3, 33, '2026-11-10 17:53:11', '2026-11-10 17:53:11'),
(12, 3, 31, '2026-11-09 17:53:11', '2026-11-09 17:53:11'),
(13, 3, 30, '2026-11-08 17:53:11', '2026-11-08 17:53:11'),
(14, 3, 44, '2026-11-07 17:53:11', '2026-11-07 17:53:11'),
(15, 3, 35, '2026-11-06 17:53:11', '2026-11-06 17:53:11'),
(16, 4, 33, '2026-11-10 17:53:11', '2026-11-10 17:53:11'),
(17, 4, 31, '2026-11-09 17:53:11', '2026-11-09 17:53:11'),
(18, 4, 30, '2026-11-08 17:53:11', '2026-11-08 17:53:11'),
(19, 4, 44, '2026-11-07 17:53:11', '2026-11-07 17:53:11'),
(20, 4, 35, '2026-11-06 17:53:11', '2026-11-06 17:53:11'),
(21, 5, 33, '2026-11-10 17:53:11', '2026-11-10 17:53:11'),
(22, 5, 31, '2026-11-09 17:53:11', '2026-11-09 17:53:11'),
(24, 5, 44, '2026-11-07 17:53:11', '2026-11-07 17:53:11'),
(25, 5, 35, '2026-11-06 17:53:11', '2026-11-06 17:53:11'),
(26, 6, 33, '2026-11-10 17:53:11', '2026-11-10 17:53:11'),
(27, 6, 31, '2026-11-09 17:53:11', '2026-11-09 17:53:11'),
(28, 6, 30, '2026-11-08 17:53:11', '2026-11-08 17:53:11'),
(29, 6, 44, '2026-11-07 17:53:11', '2026-11-07 17:53:11'),
(30, 6, 35, '2026-11-06 17:53:11', '2026-11-06 17:53:11'),
(31, 5, 4, '2026-11-11 17:56:34', '2026-11-11 17:56:34'),
(32, 5, 29, '2026-11-11 17:56:38', '2026-11-11 17:56:38'),
(33, 5, 38, '2026-11-11 17:56:38', '2026-11-11 17:56:38');

-- --------------------------------------------------------

--
-- Structure de la table `jobs`
--

CREATE TABLE `jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `queue` varchar(191) NOT NULL,
  `payload` longtext NOT NULL,
  `attempts` tinyint(3) UNSIGNED NOT NULL,
  `reserved_at` int(10) UNSIGNED DEFAULT NULL,
  `available_at` int(10) UNSIGNED NOT NULL,
  `created_at` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `job_batches`
--

CREATE TABLE `job_batches` (
  `id` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `total_jobs` int(11) NOT NULL,
  `pending_jobs` int(11) NOT NULL,
  `failed_jobs` int(11) NOT NULL,
  `failed_job_ids` longtext NOT NULL,
  `options` mediumtext DEFAULT NULL,
  `cancelled_at` int(11) DEFAULT NULL,
  `created_at` int(11) NOT NULL,
  `finished_at` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `matchs`
--

CREATE TABLE `matchs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `demande_id` bigint(20) UNSIGNED NOT NULL,
  `annonce_id` bigint(20) UNSIGNED NOT NULL,
  `score` tinyint(3) UNSIGNED NOT NULL,
  `details` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`details`)),
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `matchs`
--

INSERT INTO `matchs` (`id`, `demande_id`, `annonce_id`, `score`, `details`, `created_at`, `updated_at`) VALUES
(89, 2, 32, 60, '{\"mots_cles\":0,\"prix\":30,\"etat\":20,\"etablissement\":10,\"mots_trouves\":[]}', '2026-11-11 17:53:11', '2026-11-11 17:53:11'),
(90, 13, 4, 53, '{\"mots_cles\":8,\"prix\":30,\"etat\":15,\"etablissement\":0,\"mots_trouves\":[\"calculatrice\"]}', '2026-11-11 17:53:11', '2026-11-11 17:53:11'),
(91, 13, 28, 53, '{\"mots_cles\":21,\"prix\":17,\"etat\":15,\"etablissement\":0,\"mots_trouves\":[\"calculatrice\",\"graphique\",\"math\"]}', '2026-11-11 17:53:11', '2026-11-11 17:53:11'),
(92, 13, 42, 52, '{\"mots_cles\":16,\"prix\":26,\"etat\":10,\"etablissement\":0,\"mots_trouves\":[\"calculatrice\",\"scientifique\"]}', '2026-11-11 17:53:11', '2026-11-11 17:53:11'),
(93, 14, 1, 55, '{\"mots_cles\":10,\"prix\":30,\"etat\":15,\"etablissement\":0,\"mots_trouves\":[\"livre\"]}', '2026-11-11 17:53:11', '2026-11-11 17:53:11'),
(94, 14, 29, 50, '{\"mots_cles\":10,\"prix\":30,\"etat\":10,\"etablissement\":0,\"mots_trouves\":[\"livre\"]}', '2026-11-11 17:53:11', '2026-11-11 17:53:11'),
(95, 14, 34, 57, '{\"mots_cles\":17,\"prix\":30,\"etat\":10,\"etablissement\":0,\"mots_trouves\":[\"cour\",\"polycopie\"]}', '2026-11-11 17:53:11', '2026-11-11 17:53:11'),
(96, 15, 28, 63, '{\"mots_cles\":21,\"prix\":17,\"etat\":15,\"etablissement\":10,\"mots_trouves\":[\"calculatrice\",\"graphique\",\"math\"]}', '2026-11-11 17:53:11', '2026-11-11 17:53:11'),
(97, 15, 42, 52, '{\"mots_cles\":16,\"prix\":26,\"etat\":10,\"etablissement\":0,\"mots_trouves\":[\"calculatrice\",\"scientifique\"]}', '2026-11-11 17:53:11', '2026-11-11 17:53:11'),
(98, 16, 1, 65, '{\"mots_cles\":10,\"prix\":30,\"etat\":15,\"etablissement\":10,\"mots_trouves\":[\"livre\"]}', '2026-11-11 17:53:11', '2026-11-11 17:53:11'),
(99, 16, 29, 50, '{\"mots_cles\":10,\"prix\":30,\"etat\":10,\"etablissement\":0,\"mots_trouves\":[\"livre\"]}', '2026-11-11 17:53:11', '2026-11-11 17:53:11'),
(100, 16, 34, 67, '{\"mots_cles\":17,\"prix\":30,\"etat\":10,\"etablissement\":10,\"mots_trouves\":[\"cour\",\"polycopie\"]}', '2026-11-11 17:53:11', '2026-11-11 17:53:11'),
(101, 17, 4, 63, '{\"mots_cles\":8,\"prix\":30,\"etat\":15,\"etablissement\":10,\"mots_trouves\":[\"calculatrice\"]}', '2026-11-11 17:53:11', '2026-11-11 17:53:11'),
(102, 17, 28, 63, '{\"mots_cles\":21,\"prix\":17,\"etat\":15,\"etablissement\":10,\"mots_trouves\":[\"calculatrice\",\"graphique\",\"math\"]}', '2026-11-11 17:53:11', '2026-11-11 17:53:11'),
(103, 17, 42, 52, '{\"mots_cles\":16,\"prix\":26,\"etat\":10,\"etablissement\":0,\"mots_trouves\":[\"calculatrice\",\"scientifique\"]}', '2026-11-11 17:53:11', '2026-11-11 17:53:11'),
(104, 18, 1, 65, '{\"mots_cles\":10,\"prix\":30,\"etat\":15,\"etablissement\":10,\"mots_trouves\":[\"livre\"]}', '2026-11-11 17:53:11', '2026-11-11 17:53:11'),
(105, 18, 29, 50, '{\"mots_cles\":10,\"prix\":30,\"etat\":10,\"etablissement\":0,\"mots_trouves\":[\"livre\"]}', '2026-11-11 17:53:11', '2026-11-11 17:53:11'),
(106, 18, 34, 67, '{\"mots_cles\":17,\"prix\":30,\"etat\":10,\"etablissement\":10,\"mots_trouves\":[\"cour\",\"polycopie\"]}', '2026-11-11 17:53:11', '2026-11-11 17:53:11'),
(107, 19, 4, 63, '{\"mots_cles\":8,\"prix\":30,\"etat\":15,\"etablissement\":10,\"mots_trouves\":[\"calculatrice\"]}', '2026-11-11 17:53:11', '2026-11-11 17:53:11'),
(108, 19, 28, 63, '{\"mots_cles\":21,\"prix\":17,\"etat\":15,\"etablissement\":10,\"mots_trouves\":[\"calculatrice\",\"graphique\",\"math\"]}', '2026-11-11 17:53:11', '2026-11-11 17:53:11'),
(109, 19, 42, 52, '{\"mots_cles\":16,\"prix\":26,\"etat\":10,\"etablissement\":0,\"mots_trouves\":[\"calculatrice\",\"scientifique\"]}', '2026-11-11 17:53:11', '2026-11-11 17:53:11'),
(112, 21, 4, 53, '{\"mots_cles\":8,\"prix\":30,\"etat\":15,\"etablissement\":0,\"mots_trouves\":[\"calculatrice\"]}', '2026-11-11 17:53:11', '2026-11-11 17:53:11'),
(113, 21, 28, 53, '{\"mots_cles\":21,\"prix\":17,\"etat\":15,\"etablissement\":0,\"mots_trouves\":[\"calculatrice\",\"graphique\",\"math\"]}', '2026-11-11 17:53:11', '2026-11-11 17:53:11'),
(114, 21, 42, 52, '{\"mots_cles\":16,\"prix\":26,\"etat\":10,\"etablissement\":0,\"mots_trouves\":[\"calculatrice\",\"scientifique\"]}', '2026-11-11 17:53:11', '2026-11-11 17:53:11'),
(115, 22, 1, 55, '{\"mots_cles\":10,\"prix\":30,\"etat\":15,\"etablissement\":0,\"mots_trouves\":[\"livre\"]}', '2026-11-11 17:53:11', '2026-11-11 17:53:11'),
(116, 22, 29, 50, '{\"mots_cles\":10,\"prix\":30,\"etat\":10,\"etablissement\":0,\"mots_trouves\":[\"livre\"]}', '2026-11-11 17:53:11', '2026-11-11 17:53:11'),
(117, 22, 34, 57, '{\"mots_cles\":17,\"prix\":30,\"etat\":10,\"etablissement\":0,\"mots_trouves\":[\"cour\",\"polycopie\"]}', '2026-11-11 17:53:11', '2026-11-11 17:53:11'),
(123, 1, 4, 88, '{\"mots_cles\":33,\"prix\":30,\"etat\":15,\"etablissement\":10,\"mots_trouves\":[\"calculatrice\",\"casio\"]}', '2026-11-16 09:06:31', '2026-11-16 09:06:31');

-- --------------------------------------------------------

--
-- Structure de la table `messages`
--

CREATE TABLE `messages` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `conversation_id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `contenu` text NOT NULL,
  `lu_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `messages`
--

INSERT INTO `messages` (`id`, `conversation_id`, `user_id`, `contenu`, `lu_at`, `created_at`, `updated_at`) VALUES
(30, 13, 18, 'Salut ! La raquette est toujours dispo ?', '2026-11-10 11:53:11', '2026-11-10 11:53:11', '2026-11-10 11:53:11'),
(31, 13, 16, 'Oui, tu peux passer à l\'ISET mardi.', '2026-11-10 12:53:11', '2026-11-10 12:53:11', '2026-11-10 12:53:11'),
(32, 14, 16, 'Bonjour ! Le sac est toujours disponible ?', '2026-11-09 15:53:11', '2026-11-09 15:53:11', '2026-11-09 15:53:11'),
(33, 14, 2, 'Oui, il est en très bon état.', '2026-11-09 17:53:11', '2026-11-09 17:53:11', '2026-11-09 17:53:11'),
(34, 14, 16, 'Super, je viens de le réserver 🙂', NULL, '2026-11-11 16:53:11', '2026-11-11 16:53:11'),
(35, 15, 2, 'Bonjour, la calculatrice fonctionne bien ? Le câble est fourni ?', '2026-11-10 15:53:11', '2026-11-10 15:53:11', '2026-11-10 15:53:11'),
(36, 15, 15, 'Oui parfaitement, avec le câble USB et la housse !', NULL, '2026-11-11 14:53:11', '2026-11-11 14:53:11'),
(37, 16, 2, 'Je passe récupérer la lampe demain à 10h ?', '2026-11-10 11:53:11', '2026-11-10 11:53:11', '2026-11-10 11:53:11'),
(38, 16, 18, 'Parfait, devant la bibliothèque. J\'ai confirmé la remise de mon côté.', '2026-11-10 21:53:11', '2026-11-10 21:53:11', '2026-11-10 21:53:11'),
(39, 17, 16, 'Bonjour ! Le sac est toujours disponible ?', '2026-11-09 15:53:11', '2026-11-09 15:53:11', '2026-11-09 15:53:11'),
(40, 17, 3, 'Oui, il est en très bon état.', '2026-11-09 17:53:11', '2026-11-09 17:53:11', '2026-11-09 17:53:11'),
(41, 17, 16, 'Super, je viens de le réserver 🙂', NULL, '2026-11-11 16:53:11', '2026-11-11 16:53:11'),
(42, 18, 3, 'Bonjour, la calculatrice fonctionne bien ? Le câble est fourni ?', '2026-11-10 15:53:11', '2026-11-10 15:53:11', '2026-11-10 15:53:11'),
(43, 18, 15, 'Oui parfaitement, avec le câble USB et la housse !', NULL, '2026-11-11 14:53:11', '2026-11-11 14:53:11'),
(44, 19, 16, 'Bonjour ! Le sac est toujours disponible ?', '2026-11-09 15:53:11', '2026-11-09 15:53:11', '2026-11-09 15:53:11'),
(45, 19, 4, 'Oui, il est en très bon état.', '2026-11-09 17:53:11', '2026-11-09 17:53:11', '2026-11-09 17:53:11'),
(46, 19, 16, 'Super, je viens de le réserver 🙂', NULL, '2026-11-11 16:53:11', '2026-11-11 16:53:11'),
(47, 20, 4, 'Bonjour, la calculatrice fonctionne bien ? Le câble est fourni ?', '2026-11-10 15:53:11', '2026-11-10 15:53:11', '2026-11-10 15:53:11'),
(48, 20, 15, 'Oui parfaitement, avec le câble USB et la housse !', NULL, '2026-11-11 14:53:11', '2026-11-11 14:53:11'),
(49, 21, 16, 'Bonjour ! Le sac est toujours disponible ?', '2026-11-09 15:53:11', '2026-11-09 15:53:11', '2026-11-09 15:53:11'),
(50, 21, 5, 'Oui, il est en très bon état.', '2026-11-09 17:53:11', '2026-11-09 17:53:11', '2026-11-09 17:53:11'),
(51, 21, 16, 'Super, je viens de le réserver 🙂', NULL, '2026-11-11 16:53:11', '2026-11-11 16:53:11'),
(52, 22, 5, 'Bonjour, la calculatrice fonctionne bien ? Le câble est fourni ?', '2026-11-10 15:53:11', '2026-11-10 15:53:11', '2026-11-10 15:53:11'),
(53, 22, 15, 'Oui parfaitement, avec le câble USB et la housse !', '2026-11-11 18:45:14', '2026-11-11 14:53:11', '2026-11-11 18:45:14'),
(54, 23, 16, 'Bonjour ! Le sac est toujours disponible ?', '2026-11-09 15:53:11', '2026-11-09 15:53:11', '2026-11-09 15:53:11'),
(55, 23, 6, 'Oui, il est en très bon état.', '2026-11-09 17:53:11', '2026-11-09 17:53:11', '2026-11-09 17:53:11'),
(56, 23, 16, 'Super, je viens de le réserver 🙂', NULL, '2026-11-11 16:53:11', '2026-11-11 16:53:11'),
(57, 24, 6, 'Bonjour, la calculatrice fonctionne bien ? Le câble est fourni ?', '2026-11-10 15:53:11', '2026-11-10 15:53:11', '2026-11-10 15:53:11'),
(58, 24, 15, 'Oui parfaitement, avec le câble USB et la housse !', NULL, '2026-11-11 14:53:11', '2026-11-11 14:53:11'),
(61, 26, 5, 'Bonjour, ton annonce « Lot de classeurs et surligneurs » est-elle toujours disponible ?', NULL, '2026-11-16 06:58:47', '2026-11-16 06:58:47'),
(64, 28, 5, 'Bonjour, ton annonce « Souris sans fil » est-elle toujours disponible ?', NULL, '2026-11-16 09:09:28', '2026-11-16 09:09:28');

-- --------------------------------------------------------

--
-- Structure de la table `migrations`
--

CREATE TABLE `migrations` (
  `id` int(10) UNSIGNED NOT NULL,
  `migration` varchar(191) NOT NULL,
  `batch` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(1, '0001_01_01_000000_create_users_table', 1),
(2, '0001_01_01_000001_create_cache_table', 1),
(3, '0001_01_01_000002_create_jobs_table', 1),
(4, '2026_11_09_000000_create_personal_access_tokens_table', 1),
(5, '2026_11_09_000001_add_campus_fields_to_users_table', 1),
(6, '2026_11_10_000001_create_categories_table', 2),
(7, '2026_11_10_000002_create_annonces_table', 2),
(8, '2026_11_10_000003_create_annonce_photos_table', 2),
(9, '2026_11_16_000001_create_demandes_table', 3),
(10, '2026_11_16_000002_create_matchs_table', 3),
(11, '2026_11_30_000001_create_conversations_table', 4),
(12, '2026_11_30_000002_create_reservations_table', 4),
(13, '2026_11_20_000001_create_favoris_table', 5);

-- --------------------------------------------------------

--
-- Structure de la table `password_reset_tokens`
--

CREATE TABLE `password_reset_tokens` (
  `email` varchar(191) NOT NULL,
  `token` varchar(191) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `password_reset_tokens`
--

INSERT INTO `password_reset_tokens` (`email`, `token`, `created_at`) VALUES
('nourbk46@gmail.com', '$2y$12$O92.n7ev/KmPVWWBGee3ce4aUZ4gM1vgp25xoA9eCVzhCMcoQJe4e', '2026-11-17 19:37:05'),
('postman1794342519467@test.tn', '$2y$12$VzgFzXGifRXaQaCAZnqxjuRdi.1Wr/Vdz5YqxDc5sMOIhOVUJif0u', '2026-11-10 19:28:46'),
('postman1794342616203@test.tn', '$2y$12$NMQ.EOM1jujY7q4TFqFI2eOB0ZMfo82sw3GRtbgZR3NU0k.BFFPr2', '2026-11-10 19:30:22'),
('postman1794344783335@test.tn', '$2y$12$vJONsgUqDRErWybjIqSzduFZ5rutdaFCJdCXaIb7xq6P6b.xFqBf6', '2026-11-10 20:06:31'),
('postman1794424417569@test.tn', '$2y$12$t/BBCtHrUOa0OEp//lyyFetEcV58/rzJNtvLlbXUjdwML5QjIjAya', '2026-11-11 18:13:45'),
('postman1794816635463@test.tn', '$2y$12$.th9QNROAP/YgXjcMxeDS.rfU8jbdQ8gLYAdNlGt3ovBDO46ooFzO', '2026-11-16 07:10:43'),
('postman1794866593461@test.tn', '$2y$12$hP6/PfGWMyhTrTfrtP7PqeDTFnQJ/HMGA5sGkn1S5cMROpj9bFKPu', '2026-11-16 21:03:23'),
('postman1794866681456@test.tn', '$2y$12$d3oyu1HjuFza0Q.TgpbRN.PXchlaRm8xCACRxxb04hp.kajbtWC0K', '2026-11-16 21:04:50'),
('postman1794867350678@test.tn', '$2y$12$ppeZFmuSJdn1B4W/AoUBouPLQM7gO.w6x.oRN7Y27AK1ecOWY/tDK', '2026-11-16 21:15:59'),
('postman1794867432431@test.tn', '$2y$12$9aFR.7cT1HmJRN5LU2WJi.d3BrknyQPBIkYseCsX..DyU4IlkVcRG', '2026-11-16 21:17:21');

-- --------------------------------------------------------

--
-- Structure de la table `personal_access_tokens`
--

CREATE TABLE `personal_access_tokens` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tokenable_type` varchar(191) NOT NULL,
  `tokenable_id` bigint(20) UNSIGNED NOT NULL,
  `name` text NOT NULL,
  `token` varchar(64) NOT NULL,
  `abilities` text DEFAULT NULL,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `personal_access_tokens`
--

INSERT INTO `personal_access_tokens` (`id`, `tokenable_type`, `tokenable_id`, `name`, `token`, `abilities`, `last_used_at`, `expires_at`, `created_at`, `updated_at`) VALUES
(1, 'App\\Models\\User', 2, 'campus-reuse', '7b35840831b2d85333bb25486851b83a6f91a5b8dc421517605759e4dc0f7e7f', '[\"*\"]', '2026-11-16 20:54:30', NULL, '2026-11-09 08:23:18', '2026-11-16 20:54:30'),
(5, 'App\\Models\\User', 1, 'campus-reuse', '534552ce679630b40f5a9b7f87fd0b730f43a70bd82f3b7ab21e3e8d03e1b9d7', '[\"*\"]', '2026-11-09 08:37:23', NULL, '2026-11-09 08:37:21', '2026-11-09 08:37:23'),
(6, 'App\\Models\\User', 2, 'campus-reuse', 'fa8b35ced3875cbc95a98debe192e23b952937ea324d58533cf4fde7ba919d6a', '[\"*\"]', '2026-11-09 08:37:23', NULL, '2026-11-09 08:37:22', '2026-11-09 08:37:23'),
(22, 'App\\Models\\User', 1, 'campus-reuse', '9d370402a68750380c273583efbc25d1d7215c73fdcc2ba24fa3f106e6329716', '[\"*\"]', '2026-11-10 19:28:47', NULL, '2026-11-10 19:28:40', '2026-11-10 19:28:47'),
(23, 'App\\Models\\User', 6, 'campus-reuse', '4f7cc85fdc8f0c2d5c1789dc657483ea17b98285d4e3d9afc6d8de4982ec28d7', '[\"*\"]', '2026-11-10 19:28:50', NULL, '2026-11-10 19:28:43', '2026-11-10 19:28:50'),
(24, 'App\\Models\\User', 1, 'campus-reuse', '10badef34858627f6d97cb1b7847d4c46931a70aaa0117853b21bc6777c6f48d', '[\"*\"]', '2026-11-10 19:30:32', NULL, '2026-11-10 19:30:16', '2026-11-10 19:30:32'),
(29, 'App\\Models\\User', 1, 'campus-reuse', 'e24d4a4bb9c408c9846c90511e763642a6cabd5ed7deb0b1519a23972faa098c', '[\"*\"]', '2026-11-10 20:06:44', NULL, '2026-11-10 20:06:24', '2026-11-10 20:06:44'),
(40, 'App\\Models\\User', 1, 'campus-reuse', '72e707285f2571eee242939043c9503af66c4908835443a56808e9cf614d9220', '[\"*\"]', '2026-11-11 18:14:21', NULL, '2026-11-11 18:13:38', '2026-11-11 18:14:21'),
(50, 'App\\Models\\User', 1, 'campus-reuse', '42c43c23a07bdf671dbe4462a9a9845e3b36fbbf81b6b8d4dd181e405bb5e688', '[\"*\"]', '2026-11-16 07:11:21', NULL, '2026-11-16 07:10:36', '2026-11-16 07:11:21'),
(56, 'App\\Models\\User', 1, 'campus-reuse', '8f4ead73043b19e28b93f4273bbd0104ff7a5abb025a0ce3b92aa0eefedb5168', '[\"*\"]', '2026-11-16 21:04:11', NULL, '2026-11-16 21:03:14', '2026-11-16 21:04:11'),
(61, 'App\\Models\\User', 1, 'campus-reuse', 'd0f7bc014a3565d3ecfd2b49aaec38389067e13744d7cba5a869f0a4f03cf4f5', '[\"*\"]', '2026-11-16 21:05:39', NULL, '2026-11-16 21:04:42', '2026-11-16 21:05:39'),
(66, 'App\\Models\\User', 1, 'campus-reuse', '5926547f00f417527be4b82cd1f915adadcc12a9756957f7a2b7c26d50269c50', '[\"*\"]', '2026-11-16 21:16:46', NULL, '2026-11-16 21:15:51', '2026-11-16 21:16:46'),
(71, 'App\\Models\\User', 1, 'campus-reuse', 'ad949a14fa1555780b2b717519cb37c399bcad98a5f92ad7bfc4a25175a66fa9', '[\"*\"]', '2026-11-16 21:18:09', NULL, '2026-11-16 21:17:13', '2026-11-16 21:18:09'),
(79, 'App\\Models\\User', 19, 'campus-reuse', '36cda47e91ba0a4a104a032b5fa1db3414715e6df315d598e33da9e81e3a126a', '[\"*\"]', '2026-11-17 19:43:26', NULL, '2026-11-17 18:44:16', '2026-11-17 19:43:26'),
(81, 'App\\Models\\User', 1, 'campus-reuse', 'b1ea111059e91199a0b07f1480159012d0aafdca23db7221ad22cf7ad3da4b07', '[\"*\"]', '2026-11-17 19:38:24', NULL, '2026-11-17 19:38:14', '2026-11-17 19:38:24');

-- --------------------------------------------------------

--
-- Structure de la table `reservations`
--

CREATE TABLE `reservations` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `annonce_id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `demande_id` bigint(20) UNSIGNED DEFAULT NULL,
  `statut` enum('en_attente','acceptee','refusee','annulee','terminee') NOT NULL DEFAULT 'en_attente',
  `message` varchar(500) DEFAULT NULL,
  `acceptee_at` timestamp NULL DEFAULT NULL,
  `expire_le` timestamp NULL DEFAULT NULL,
  `confirme_vendeur_at` timestamp NULL DEFAULT NULL,
  `confirme_acheteur_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `reservations`
--

INSERT INTO `reservations` (`id`, `annonce_id`, `user_id`, `demande_id`, `statut`, `message`, `acceptee_at`, `expire_le`, `confirme_vendeur_at`, `confirme_acheteur_at`, `created_at`, `updated_at`) VALUES
(9, 41, 20, NULL, 'terminee', NULL, '2026-10-02 17:53:11', '2026-10-09 17:53:11', '2026-10-03 17:53:11', '2026-10-03 17:53:11', '2026-10-02 17:53:11', '2026-10-02 17:53:11'),
(10, 46, 16, NULL, 'en_attente', 'Je peux passer le récupérer jeudi ?', NULL, NULL, NULL, NULL, '2026-11-10 17:53:11', '2026-11-10 17:53:11'),
(11, 37, 2, NULL, 'annulee', NULL, '2026-11-09 17:53:11', '2026-11-16 17:53:11', '2026-11-10 17:53:11', NULL, '2026-11-09 17:53:11', '2026-11-16 21:03:48'),
(12, 39, 2, NULL, 'terminee', NULL, '2026-10-22 17:53:11', '2026-10-29 17:53:11', '2026-10-23 17:53:11', '2026-10-23 17:53:11', '2026-10-22 17:53:11', '2026-10-22 17:53:11'),
(13, 47, 16, NULL, 'en_attente', 'Je peux passer le récupérer jeudi ?', NULL, NULL, NULL, NULL, '2026-11-10 17:53:11', '2026-11-10 17:53:11'),
(14, 48, 16, NULL, 'en_attente', 'Je peux passer le récupérer jeudi ?', NULL, NULL, NULL, NULL, '2026-11-10 17:53:11', '2026-11-10 17:53:11'),
(15, 49, 16, NULL, 'en_attente', 'Je peux passer le récupérer jeudi ?', NULL, NULL, NULL, NULL, '2026-11-10 17:53:11', '2026-11-10 17:53:11'),
(16, 50, 16, NULL, 'en_attente', 'Je peux passer le récupérer jeudi ?', NULL, NULL, NULL, NULL, '2026-11-10 17:53:11', '2026-11-10 17:53:11'),
(19, 32, 5, NULL, 'en_attente', NULL, NULL, NULL, NULL, NULL, '2026-11-16 06:58:41', '2026-11-16 06:58:41'),
(22, 38, 5, NULL, 'en_attente', NULL, NULL, NULL, NULL, NULL, '2026-11-16 09:09:24', '2026-11-16 09:09:24');

-- --------------------------------------------------------

--
-- Structure de la table `sessions`
--

CREATE TABLE `sessions` (
  `id` varchar(191) NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `payload` longtext NOT NULL,
  `last_activity` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `users`
--

CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(191) NOT NULL,
  `prenom` varchar(191) DEFAULT NULL,
  `email` varchar(191) NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(191) NOT NULL,
  `role` enum('etudiant','admin') NOT NULL DEFAULT 'etudiant',
  `filiere` varchar(191) DEFAULT NULL,
  `niveau` varchar(191) DEFAULT NULL,
  `etablissement` varchar(191) DEFAULT NULL,
  `photo` varchar(191) DEFAULT NULL,
  `bloque` tinyint(1) NOT NULL DEFAULT 0,
  `notifications_email` tinyint(1) NOT NULL DEFAULT 1,
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `users`
--

INSERT INTO `users` (`id`, `name`, `prenom`, `email`, `email_verified_at`, `password`, `role`, `filiere`, `niveau`, `etablissement`, `photo`, `bloque`, `notifications_email`, `remember_token`, `created_at`, `updated_at`) VALUES
(1, 'Admin', 'Campus', 'admin@campusreuse.tn', '2026-11-09 08:20:50', '$2y$12$DZdqlpKofKe4GoxjYJh.He18mYZ2Oehl9nC4kuYR/3U/xsJJlRjqy', 'admin', NULL, NULL, NULL, NULL, 0, 1, NULL, '2026-11-09 08:20:50', '2026-11-09 08:20:50'),
(2, 'Test', 'Etudiant', 'etudiant@campusreuse.tn', '2026-11-09 08:20:51', '$2y$12$Y3q73q5xKzaQn4cyVGn6MOgiJBfhlGKHWFjl7PE/ej7bCYjNZI6Ry', 'etudiant', 'Informatique', 'L3', 'ISET', NULL, 0, 1, NULL, '2026-11-09 08:20:51', '2026-11-09 08:20:51'),
(3, 'nour Bouchnak', 'Nour', 'Nour@campusreuse.tn', NULL, '$2y$12$F2amGwmAzzcEmChyiflAzuw7EgQfj9UxHXkpNmuwa0usgIulKs8Mu', 'etudiant', 'dsi', 'L3', 'Iset Mahdia', NULL, 0, 1, NULL, '2026-11-09 08:33:41', '2026-11-09 08:33:41'),
(4, 'ridene', 'ghada', 'ghada@campusreuse.tn', NULL, '$2y$12$e6Ni/xef3pID4k16MGf4ged5mGi78fIctEo9UaLZDdB50/LVIGxye', 'etudiant', 'dsi', 'L3', 'Iset Mahdia', NULL, 0, 1, NULL, '2026-11-09 08:44:52', '2026-11-09 08:44:52'),
(5, 'bouchnak', 'nourr', 'nourbk46@gmail.com', NULL, '$2y$12$fBITkxlmI93ybBuOJCEUruUqMqr7WOltQUbmIFz5ChiLK6wnMqXs.', 'etudiant', 'dsi', 'L3', 'Iset Mahdia', NULL, 0, 1, NULL, '2026-11-09 08:46:24', '2026-11-09 08:46:24'),
(6, 'Postman', 'Test', 'postman1794342519467@test.tn', NULL, '$2y$12$0PxK9XxK33vIAlnISCIh2ODw4FsS1TNFN0nRu.n9fB5H9rDbMVumS', 'etudiant', 'Génie logiciel', 'M1', 'ISET Postman', NULL, 0, 1, NULL, '2026-11-10 19:28:41', '2026-11-10 19:28:45'),
(15, 'Ben Ali', 'Ghada', 'ghada@demo.tn', '2026-11-11 17:53:09', '$2y$12$ynH4OTDfNbdiHT1lfPR1jOSb4Rvl1M1ckQPFlwHb.z/uQheEa15ci', 'etudiant', 'Développement des systèmes d\'information', 'L3', 'ISET Mahdia', NULL, 0, 0, NULL, '2026-11-11 17:53:09', '2026-11-11 17:53:09'),
(16, 'Trabelsi', 'Sami', 'sami@demo.tn', '2026-11-11 17:53:10', '$2y$12$.N7KEZ.MP53rmlq59oYc6eCJ.Eu3w/r5HDVijgBxmRMvH65yzqviu', 'etudiant', 'Génie informatique', 'L2', 'ISET Rades', NULL, 0, 0, NULL, '2026-11-11 17:53:10', '2026-11-17 07:07:19'),
(17, 'Gharbi', 'Yasmine', 'yasmine@demo.tn', '2026-11-11 17:53:10', '$2y$12$fxOlcSejKTAeyT.NVRila.lkEi15pwRdhZfdXzTk6nJHztQlNSYDi', 'etudiant', 'Informatique', 'M1', 'FST', NULL, 0, 0, NULL, '2026-11-11 17:53:10', '2026-11-11 17:53:10'),
(18, 'Jlassi', 'Amine', 'amine@demo.tn', '2026-11-11 17:53:10', '$2y$12$S.Z2Lwcgei9DexF1rmgUwuxL1YGQJ/dkPunBmYk2KyczO8uDyJkHa', 'etudiant', 'Génie civil', 'Ingénieur', 'ENIT', NULL, 0, 0, NULL, '2026-11-11 17:53:10', '2026-11-11 17:53:10'),
(19, 'Mansouri', 'Inès', 'ines@demo.tn', '2026-11-11 17:53:10', '$2y$12$CXJ5wo/iRPXmvfDNUCEc3.0YIWW/haHlQWK2VXJg4lcsak0kSH/3S', 'etudiant', 'Technologies de l\'informatique', 'L1', 'ISET Mahdia', NULL, 0, 0, NULL, '2026-11-11 17:53:10', '2026-11-11 17:53:10'),
(20, 'Haddad', 'Karim', 'karim@demo.tn', '2026-11-11 17:53:10', '$2y$12$CqHjDbF/OiMXP1mA6gKFM.g5jlCwvj5/.HDb187y3TTIzT6/8k8TC', 'etudiant', 'Génie électrique', 'L3', 'ISET Rades', NULL, 0, 0, NULL, '2026-11-11 17:53:10', '2026-11-11 17:53:10');

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `annonces`
--
ALTER TABLE `annonces`
  ADD PRIMARY KEY (`id`),
  ADD KEY `annonces_user_id_foreign` (`user_id`),
  ADD KEY `annonces_categorie_id_foreign` (`categorie_id`),
  ADD KEY `annonces_statut_created_at_index` (`statut`,`created_at`);

--
-- Index pour la table `annonce_photos`
--
ALTER TABLE `annonce_photos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `annonce_photos_annonce_id_foreign` (`annonce_id`);

--
-- Index pour la table `cache`
--
ALTER TABLE `cache`
  ADD PRIMARY KEY (`key`),
  ADD KEY `cache_expiration_index` (`expiration`);

--
-- Index pour la table `cache_locks`
--
ALTER TABLE `cache_locks`
  ADD PRIMARY KEY (`key`),
  ADD KEY `cache_locks_expiration_index` (`expiration`);

--
-- Index pour la table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `categories_nom_unique` (`nom`);

--
-- Index pour la table `conversations`
--
ALTER TABLE `conversations`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `conversations_annonce_id_acheteur_id_unique` (`annonce_id`,`acheteur_id`),
  ADD KEY `conversations_acheteur_id_foreign` (`acheteur_id`),
  ADD KEY `conversations_vendeur_id_foreign` (`vendeur_id`);

--
-- Index pour la table `demandes`
--
ALTER TABLE `demandes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `demandes_user_id_foreign` (`user_id`),
  ADD KEY `demandes_categorie_id_foreign` (`categorie_id`),
  ADD KEY `demandes_statut_categorie_id_index` (`statut`,`categorie_id`);

--
-- Index pour la table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`);

--
-- Index pour la table `favoris`
--
ALTER TABLE `favoris`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `favoris_user_id_annonce_id_unique` (`user_id`,`annonce_id`),
  ADD KEY `favoris_annonce_id_foreign` (`annonce_id`);

--
-- Index pour la table `jobs`
--
ALTER TABLE `jobs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `jobs_queue_index` (`queue`);

--
-- Index pour la table `job_batches`
--
ALTER TABLE `job_batches`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `matchs`
--
ALTER TABLE `matchs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `matchs_demande_id_annonce_id_unique` (`demande_id`,`annonce_id`),
  ADD KEY `matchs_annonce_id_foreign` (`annonce_id`),
  ADD KEY `matchs_demande_id_score_index` (`demande_id`,`score`);

--
-- Index pour la table `messages`
--
ALTER TABLE `messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `messages_user_id_foreign` (`user_id`),
  ADD KEY `messages_conversation_id_created_at_index` (`conversation_id`,`created_at`);

--
-- Index pour la table `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD PRIMARY KEY (`email`);

--
-- Index pour la table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  ADD KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`),
  ADD KEY `personal_access_tokens_expires_at_index` (`expires_at`);

--
-- Index pour la table `reservations`
--
ALTER TABLE `reservations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `reservations_demande_id_foreign` (`demande_id`),
  ADD KEY `reservations_annonce_id_statut_index` (`annonce_id`,`statut`),
  ADD KEY `reservations_user_id_statut_index` (`user_id`,`statut`);

--
-- Index pour la table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sessions_user_id_index` (`user_id`),
  ADD KEY `sessions_last_activity_index` (`last_activity`);

--
-- Index pour la table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_unique` (`email`);

--
-- AUTO_INCREMENT pour les tables déchargées
--

--
-- AUTO_INCREMENT pour la table `annonces`
--
ALTER TABLE `annonces`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=82;

--
-- AUTO_INCREMENT pour la table `annonce_photos`
--
ALTER TABLE `annonce_photos`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=82;

--
-- AUTO_INCREMENT pour la table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT pour la table `conversations`
--
ALTER TABLE `conversations`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=33;

--
-- AUTO_INCREMENT pour la table `demandes`
--
ALTER TABLE `demandes`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=29;

--
-- AUTO_INCREMENT pour la table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `favoris`
--
ALTER TABLE `favoris`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=40;

--
-- AUTO_INCREMENT pour la table `jobs`
--
ALTER TABLE `jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `matchs`
--
ALTER TABLE `matchs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=132;

--
-- AUTO_INCREMENT pour la table `messages`
--
ALTER TABLE `messages`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=73;

--
-- AUTO_INCREMENT pour la table `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT pour la table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=82;

--
-- AUTO_INCREMENT pour la table `reservations`
--
ALTER TABLE `reservations`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

--
-- AUTO_INCREMENT pour la table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `annonces`
--
ALTER TABLE `annonces`
  ADD CONSTRAINT `annonces_categorie_id_foreign` FOREIGN KEY (`categorie_id`) REFERENCES `categories` (`id`),
  ADD CONSTRAINT `annonces_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `annonce_photos`
--
ALTER TABLE `annonce_photos`
  ADD CONSTRAINT `annonce_photos_annonce_id_foreign` FOREIGN KEY (`annonce_id`) REFERENCES `annonces` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `conversations`
--
ALTER TABLE `conversations`
  ADD CONSTRAINT `conversations_acheteur_id_foreign` FOREIGN KEY (`acheteur_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `conversations_annonce_id_foreign` FOREIGN KEY (`annonce_id`) REFERENCES `annonces` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `conversations_vendeur_id_foreign` FOREIGN KEY (`vendeur_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `demandes`
--
ALTER TABLE `demandes`
  ADD CONSTRAINT `demandes_categorie_id_foreign` FOREIGN KEY (`categorie_id`) REFERENCES `categories` (`id`),
  ADD CONSTRAINT `demandes_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `favoris`
--
ALTER TABLE `favoris`
  ADD CONSTRAINT `favoris_annonce_id_foreign` FOREIGN KEY (`annonce_id`) REFERENCES `annonces` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `favoris_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `matchs`
--
ALTER TABLE `matchs`
  ADD CONSTRAINT `matchs_annonce_id_foreign` FOREIGN KEY (`annonce_id`) REFERENCES `annonces` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `matchs_demande_id_foreign` FOREIGN KEY (`demande_id`) REFERENCES `demandes` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `messages`
--
ALTER TABLE `messages`
  ADD CONSTRAINT `messages_conversation_id_foreign` FOREIGN KEY (`conversation_id`) REFERENCES `conversations` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `messages_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `reservations`
--
ALTER TABLE `reservations`
  ADD CONSTRAINT `reservations_annonce_id_foreign` FOREIGN KEY (`annonce_id`) REFERENCES `annonces` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `reservations_demande_id_foreign` FOREIGN KEY (`demande_id`) REFERENCES `demandes` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `reservations_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
