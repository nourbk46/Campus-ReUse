import { Link } from "react-router-dom";
import { ETATS, TYPES, prixTexte, depuis } from "../annonces";
import FavoriButton from "./FavoriButton";
import "../pages/Favoris.css";

// SCRUM-15 : carte d'une annonce dans la liste
export default function AnnonceCard({ annonce }) {
  const photo = annonce.photos?.[0]?.url;

  return (
    <div className="annonce-card-wrap">
    <Link to={`/annonces/${annonce.id}`} className="annonce-card">
      <div className="annonce-card-photo">
        {photo ? <img src={photo} alt="" loading="lazy" /> : <span aria-hidden="true">📦</span>}
        <span className={`type-badge type-${annonce.type}`}>{TYPES[annonce.type]}</span>
      </div>
      <div className="annonce-card-body">
        <h3>{annonce.titre}</h3>
        <p className="annonce-card-prix">{prixTexte(annonce)}</p>
        <p className="annonce-card-meta">
          {annonce.categorie?.nom} · {ETATS[annonce.etat]}
        </p>
        <p className="annonce-card-meta">
          {annonce.user?.etablissement ? `${annonce.user.etablissement} · ` : ""}
          {depuis(annonce.created_at)}
        </p>
      </div>
    </Link>
    <FavoriButton annonce={annonce} />
    </div>
  );
}
