import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { lireErreur } from "../api";
import { ETATS_MIN, STATUTS_DEMANDE, budgetTexte, depuis } from "../annonces";
import "./Annonces.css";
import "./Demandes.css";

export default function MesDemandes() {
  const [demandes, setDemandes] = useState(null);
  const [message, setMessage] = useState({ texte: "", type: "" });
  const [aSupprimer, setASupprimer] = useState(null);
  const [envoi, setEnvoi] = useState(false);

  useEffect(() => {
    api.get("/mes-demandes").then(({ data }) => setDemandes(data))
      .catch((e) => setMessage({ texte: lireErreur(e).message, type: "error" }));
  }, []);

  useEffect(() => {
    if (!aSupprimer) return;
    const onKey = (e) => e.key === "Escape" && setASupprimer(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [aSupprimer]);

  const changerStatut = async (d) => {
    const statut = d.statut === "ouverte" ? "cloturee" : "ouverte";
    try {
      const { data } = await api.put(`/demandes/${d.id}`, { statut });
      setDemandes(demandes.map((x) => (x.id === d.id
        ? { ...x, statut, propositions_count: statut === "ouverte" ? data.propositions : 0 } : x)));
      setMessage({ texte: statut === "ouverte" ? "Demande rouverte." : "Demande clôturée.", type: "success" });
    } catch (e) {
      setMessage({ texte: lireErreur(e).message, type: "error" });
    }
  };

  const supprimer = async () => {
    setEnvoi(true);
    try {
      await api.delete(`/demandes/${aSupprimer.id}`);
      setDemandes(demandes.filter((d) => d.id !== aSupprimer.id));
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
          <h1>Mes demandes</h1>
          <p className="muted">Dis ce que tu cherches : on te prévient dès qu'une annonce correspond.</p>
        </div>
        <Link to="/demandes/nouvelle" className="ann-btn ann-btn-primary">+ Nouvelle demande</Link>
      </section>

      {message.texte && <p className={`alert ${message.type}`} role="status">{message.texte}</p>}

      {!demandes && !message.texte && <p className="muted center">Chargement…</p>}

      {demandes && demandes.length === 0 && (
        <div className="vide">
          <span aria-hidden="true">🔎</span>
          <h2>Aucune demande pour l'instant</h2>
          <p className="muted">Tu cherches une calculatrice, un livre, une chaise ? Publie une demande.</p>
          <Link to="/demandes/nouvelle" className="ann-btn ann-btn-primary">Publier ma première demande</Link>
        </div>
      )}

      {demandes && demandes.length > 0 && (
        <ul className="dem-liste">
          {demandes.map((d) => (
            <li key={d.id} className={`dem-item ${d.statut === "cloturee" ? "dem-cloturee" : ""}`}>
              <div className="dem-infos">
                <div className="dem-titre">
                  <h3>{d.titre}</h3>
                  <span className={`statut-badge dem-statut-${d.statut}`}>{STATUTS_DEMANDE[d.statut]}</span>
                </div>
                <p className="muted">
                  {d.categorie?.icone} {d.categorie?.nom} · {budgetTexte(d.budget_max)} · {ETATS_MIN[d.etat_min]} · {depuis(d.created_at)}
                </p>
              </div>

              <div className="dem-match">
                {d.statut === "ouverte" ? (
                  d.propositions_count > 0 ? (
                    <Link to={`/propositions?demande=${d.id}`} className="dem-match-lien">
                      <strong>{d.propositions_count}</strong> proposition{d.propositions_count > 1 ? "s" : ""}
                      {d.meilleur_score && <small>meilleur score {d.meilleur_score}/100</small>}
                    </Link>
                  ) : (
                    <span className="dem-match-vide">Aucune proposition<small>pour le moment</small></span>
                  )
                ) : (
                  <span className="dem-match-vide">Clôturée<small>plus de propositions</small></span>
                )}
              </div>

              <div className="mes-annonces-actions">
                <button className="ann-btn ann-btn-ghost" onClick={() => changerStatut(d)}>
                  {d.statut === "ouverte" ? "Clôturer" : "Rouvrir"}
                </button>
                <Link to={`/demandes/${d.id}/modifier`} className="ann-btn ann-btn-ghost">Modifier</Link>
                <button className="ann-btn ann-btn-danger" onClick={() => setASupprimer(d)}>Supprimer</button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {aSupprimer && (
        <div className="ann-modal-overlay" onClick={() => setASupprimer(null)}>
          <div className="ann-modal" role="dialog" aria-modal="true" aria-labelledby="titre-suppr" onClick={(e) => e.stopPropagation()}>
            <h2 id="titre-suppr">Supprimer cette demande ?</h2>
            <p>« {aSupprimer.titre} » et ses propositions seront définitivement supprimées.</p>
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
