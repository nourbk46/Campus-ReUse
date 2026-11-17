import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api, { lireErreur } from "../api";
import { prixTexte } from "../annonces";
import "./Annonces.css";
import "./Echanges.css";

// SCRUM-30 / 31 / 48 / 32 : réservations reçues (sur mes annonces) et envoyées (mes réservations)
const STATUTS = {
  en_attente: "En attente",
  acceptee: "Acceptée",
  refusee: "Refusée",
  annulee: "Annulée",
  terminee: "Échange terminé",
};

function joursRestants(date) {
  const j = Math.ceil((new Date(date) - Date.now()) / 86400000);
  return j <= 0 ? "aujourd'hui" : `${j} jour${j > 1 ? "s" : ""}`;
}

function Carte({ r, role, onAction, enCours }) {
  const a = r.annonce;
  const autre = role === "vendeur" ? r.acheteur : a.user;
  const jaiConfirme = role === "vendeur" ? r.confirme_vendeur_at : r.confirme_acheteur_at;
  const autreAConfirme = role === "vendeur" ? r.confirme_acheteur_at : r.confirme_vendeur_at;
  const btn = (action, label, classe = "ann-btn-ghost") => (
    <button className={`ann-btn ${classe}`} disabled={enCours} onClick={() => onAction(r, action)}>{label}</button>
  );

  return (
    <li className={`res-carte res-${r.statut}`}>
      <Link to={`/annonces/${a.id}`} className="res-photo">
        {a.photos?.[0] ? <img src={a.photos[0].url} alt="" /> : <span aria-hidden="true">📦</span>}
      </Link>

      <div className="res-corps">
        <div className="res-ligne">
          <Link to={`/annonces/${a.id}`} className="res-titre">{a.titre}</Link>
          <span className={`res-statut res-statut-${r.statut}`}>{STATUTS[r.statut]}</span>
        </div>
        <p className="muted">
          {prixTexte(a)} · {role === "vendeur" ? "Demandée par" : "Proposée par"} <strong>{autre?.prenom} {autre?.name}</strong>
          {autre?.etablissement ? ` (${autre.etablissement})` : ""} · le {new Date(r.created_at).toLocaleDateString("fr-FR")}
        </p>
        {r.message && <p className="res-message">« {r.message} »</p>}

        {r.statut === "acceptee" && (
          <div className="res-etapes" aria-label="Confirmation de l'échange">
            <span className={r.confirme_vendeur_at ? "ok" : ""}>{r.confirme_vendeur_at ? "✓" : "○"} Propriétaire</span>
            <span className={r.confirme_acheteur_at ? "ok" : ""}>{r.confirme_acheteur_at ? "✓" : "○"} Acheteur</span>
            <span className="res-delai">À confirmer sous {joursRestants(r.expire_le)}, sinon la réservation est annulée</span>
          </div>
        )}
      </div>

      <div className="res-actions">
        {role === "vendeur" && r.statut === "en_attente" && (<>
          {btn("accepter", "Accepter", "ann-btn-primary")}
          {btn("refuser", "Refuser", "ann-btn-danger")}
        </>)}
        {role === "acheteur" && ["en_attente", "acceptee"].includes(r.statut) && btn("annuler", "Annuler", "ann-btn-danger")}
        {r.statut === "acceptee" && (jaiConfirme
          ? <span className="res-attente">{autreAConfirme ? "" : `En attente de ${autre?.prenom}`}</span>
          : btn("confirmer", "Confirmer la remise", "ann-btn-primary"))}
      </div>
    </li>
  );
}

export default function Reservations() {
  const [params, setParams] = useSearchParams();
  const onglet = params.get("onglet") === "envoyees" ? "envoyees" : "recues";
  const [listes, setListes] = useState({ recues: null, envoyees: null });
  const [message, setMessage] = useState({ texte: "", type: "" });
  const [enCours, setEnCours] = useState(false);
  const [aConfirmer, setAConfirmer] = useState(null);

  const charger = () => Promise.all([api.get("/reservations/recues"), api.get("/reservations/envoyees")])
    .then(([r, e]) => setListes({ recues: r.data, envoyees: e.data }))
    .catch((err) => setMessage({ texte: lireErreur(err).message, type: "error" }));

  useEffect(() => { charger(); }, []);

  const executer = async (r, action) => {
    setEnCours(true);
    setAConfirmer(null);
    try {
      const { data } = await api.post(`/reservations/${r.id}/${action}`);
      setMessage({ texte: data.message, type: "success" });
      await charger();
    } catch (err) {
      setMessage({ texte: lireErreur(err).message, type: "error" });
    } finally {
      setEnCours(false);
    }
  };

  // Les actions importantes demandent une confirmation
  const onAction = (r, action) => (["accepter", "confirmer", "annuler"].includes(action) ? setAConfirmer({ r, action }) : executer(r, action));

  const liste = listes[onglet];
  const nbAttente = listes.recues?.filter((r) => r.statut === "en_attente").length || 0;
  const textesConfirmation = {
    accepter: ["Accepter cette réservation ?", "L'annonce passera en « Réservée » et les autres demandes en attente seront refusées."],
    confirmer: ["Confirmer la remise de l'objet ?", "Quand vous aurez confirmé tous les deux, l'annonce passera en « Cédée »."],
    annuler: ["Annuler ta réservation ?", "Le propriétaire sera prévenu."],
  };

  return (
    <main className="annonces-page">
      <section className="annonces-header">
        <div>
          <span className="eyebrow">ÉCHANGES</span>
          <h1>Réservations</h1>
          <p className="muted">Réserve un objet, puis confirmez la remise tous les deux pour terminer l'échange.</p>
        </div>
      </section>

      <div className="res-onglets" role="tablist">
        <button role="tab" aria-selected={onglet === "recues"} className={onglet === "recues" ? "actif" : ""} onClick={() => setParams({})}>
          Reçues {nbAttente > 0 && <span className="msg-badge">{nbAttente}</span>}
        </button>
        <button role="tab" aria-selected={onglet === "envoyees"} className={onglet === "envoyees" ? "actif" : ""} onClick={() => setParams({ onglet: "envoyees" })}>
          Mes réservations
        </button>
      </div>

      {message.texte && <p className={`alert ${message.type}`} role="status">{message.texte}</p>}
      {!liste && <p className="muted center">Chargement…</p>}

      {liste?.length === 0 && (
        <div className="vide">
          <span aria-hidden="true">{onglet === "recues" ? "📥" : "🛒"}</span>
          <h2>{onglet === "recues" ? "Aucune réservation reçue" : "Aucune réservation"}</h2>
          <p className="muted">{onglet === "recues"
            ? "Quand un étudiant réservera une de tes annonces, tu pourras l'accepter ou la refuser ici."
            : "Ouvre une annonce disponible et clique « Réserver »."}</p>
          <Link to={onglet === "recues" ? "/mes-annonces" : "/annonces"} className="ann-btn ann-btn-ghost">
            {onglet === "recues" ? "Mes annonces" : "Voir les annonces"}
          </Link>
        </div>
      )}

      {liste?.length > 0 && (
        <ul className="res-liste">
          {liste.map((r) => <Carte key={r.id} r={r} role={onglet === "recues" ? "vendeur" : "acheteur"} onAction={onAction} enCours={enCours} />)}
        </ul>
      )}

      {aConfirmer && (
        <div className="ann-modal-overlay" onClick={() => setAConfirmer(null)}>
          <div className="ann-modal" role="dialog" aria-modal="true" aria-labelledby="titre-conf" onClick={(e) => e.stopPropagation()}>
            <h2 id="titre-conf">{textesConfirmation[aConfirmer.action][0]}</h2>
            <p>« {aConfirmer.r.annonce.titre} » — {textesConfirmation[aConfirmer.action][1]}</p>
            <div className="form-actions">
              <button className="ann-btn ann-btn-ghost" onClick={() => setAConfirmer(null)} autoFocus>Retour</button>
              <button className={`ann-btn ${aConfirmer.action === "annuler" ? "ann-btn-danger-plein" : "ann-btn-primary"}`}
                      onClick={() => executer(aConfirmer.r, aConfirmer.action)} disabled={enCours}>Confirmer</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
