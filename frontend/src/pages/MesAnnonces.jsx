import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { lireErreur } from "../api";
import { STATUTS, TYPES, prixTexte, depuis } from "../annonces";
import "./Annonces.css";

export default function MesAnnonces() {
  const [annonces, setAnnonces] = useState(null);
  const [message, setMessage] = useState({ texte: "", type: "" });
  const [aSupprimer, setASupprimer] = useState(null);
  const [envoi, setEnvoi] = useState(false);

  const charger = () =>
    api.get("/mes-annonces").then(({ data }) => setAnnonces(data))
      .catch((e) => setMessage({ texte: lireErreur(e).message, type: "error" }));

  useEffect(() => { charger(); }, []);

  useEffect(() => {
    if (!aSupprimer) return;
    const onKey = (e) => e.key === "Escape" && setASupprimer(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [aSupprimer]);

  const supprimer = async () => {
    setEnvoi(true);
    try {
      await api.delete(`/annonces/${aSupprimer.id}`);
      setAnnonces(annonces.filter((a) => a.id !== aSupprimer.id));
      setMessage({ texte: `« ${aSupprimer.titre} » a été supprimée.`, type: "success" });
    } catch (e) {
      setMessage({ texte: lireErreur(e).message, type: "error" });
    } finally {
      setEnvoi(false);
      setASupprimer(null);
    }
  };

  return (
    <main className="annonces-page">
      <section className="annonces-header">
        <div>
          <span className="eyebrow">MON ESPACE</span>
          <h1>Mes annonces</h1>
          <p className="muted">{annonces ? `${annonces.length} annonce${annonces.length > 1 ? "s" : ""}` : "Chargement…"}</p>
        </div>
        <Link to="/annonces/nouvelle" className="ann-btn ann-btn-primary">+ Déposer une annonce</Link>
      </section>

      {message.texte && <p className={`alert ${message.type}`} role="status">{message.texte}</p>}

      {annonces && annonces.length === 0 && (
        <div className="vide">
          <span aria-hidden="true">📦</span>
          <h2>Tu n'as encore rien publié</h2>
          <p className="muted">Donne une seconde vie à un objet en quelques clics.</p>
          <Link to="/annonces/nouvelle" className="ann-btn ann-btn-primary">Déposer ma première annonce</Link>
        </div>
      )}

      {annonces && annonces.length > 0 && (
        <ul className="mes-annonces">
          {annonces.map((a) => (
            <li key={a.id} className="mes-annonces-item">
              <Link to={`/annonces/${a.id}`} className="mes-annonces-photo">
                {a.photos?.[0] ? <img src={a.photos[0].url} alt="" /> : <span aria-hidden="true">📦</span>}
              </Link>
              <div className="mes-annonces-infos">
                <Link to={`/annonces/${a.id}`}><h3>{a.titre}</h3></Link>
                <p className="muted">{TYPES[a.type]} · {prixTexte(a)} · {a.categorie?.nom} · {depuis(a.created_at)}</p>
              </div>
              <span className={`statut-badge statut-${a.statut}`}>{STATUTS[a.statut]}</span>
              <div className="mes-annonces-actions">
                <Link to={`/annonces/${a.id}/modifier`} className="ann-btn ann-btn-ghost">Modifier</Link>
                <button className="ann-btn ann-btn-danger" onClick={() => setASupprimer(a)}>Supprimer</button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {aSupprimer && (
        <div className="ann-modal-overlay" onClick={() => setASupprimer(null)}>
          <div className="ann-modal" role="dialog" aria-modal="true" aria-labelledby="titre-suppr" onClick={(e) => e.stopPropagation()}>
            <h2 id="titre-suppr">Supprimer cette annonce ?</h2>
            <p>« {aSupprimer.titre} » et ses photos seront définitivement supprimées.</p>
            <div className="form-actions">
              <button className="ann-btn ann-btn-ghost" onClick={() => setASupprimer(null)} autoFocus>Annuler</button>
              <button className="ann-btn ann-btn-danger-plein" onClick={supprimer} disabled={envoi}>
                {envoi ? "Suppression…" : "Oui, supprimer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
