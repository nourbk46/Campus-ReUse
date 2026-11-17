import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { lireErreur } from "../api";
import AnnonceCard from "../components/AnnonceCard";
import { useFavoris } from "../context/FavorisContext";
import { STATUTS } from "../annonces";
import "./Annonces.css";
import "./Favoris.css";

// Favoris (EF-12) : page « Mes favoris »
export default function MesFavoris() {
  const { ids } = useFavoris();
  const [annonces, setAnnonces] = useState(null);
  const [erreur, setErreur] = useState("");

  useEffect(() => {
    api.get("/favoris").then(({ data }) => setAnnonces(data)).catch((e) => setErreur(lireErreur(e).message));
  }, []);

  // Une annonce retirée avec le cœur disparaît de la page
  const visibles = annonces?.filter((a) => ids.has(a.id)) ?? null;

  return (
    <main className="annonces-page">
      <section className="annonces-header">
        <div>
          <span className="eyebrow">MON ESPACE</span>
          <h1>Mes favoris</h1>
          <p className="muted">{visibles ? `${visibles.length} annonce${visibles.length > 1 ? "s" : ""} mise${visibles.length > 1 ? "s" : ""} de côté` : "Chargement…"}</p>
        </div>
        <Link to="/annonces" className="ann-btn ann-btn-ghost">Explorer les annonces</Link>
      </section>

      {erreur && <p className="alert error">{erreur}</p>}

      {visibles && visibles.length === 0 && (
        <div className="vide">
          <span aria-hidden="true">♡</span>
          <h2>Aucun favori pour l'instant</h2>
          <p className="muted">Clique sur le cœur d'une annonce pour la retrouver ici.</p>
          <Link to="/annonces" className="ann-btn ann-btn-primary">Voir les annonces</Link>
        </div>
      )}

      {visibles && visibles.length > 0 && (
        <div className="annonces-grid">
          {visibles.map((a) => (
            <div key={a.id} className={a.statut !== "disponible" ? "fav-indispo" : ""}>
              <AnnonceCard annonce={a} />
              {a.statut !== "disponible" && <p className="fav-statut">{STATUTS[a.statut]} — plus disponible</p>}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
