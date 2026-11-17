import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api, { lireErreur } from "../api";
import { ETATS, TYPES, prixTexte, budgetTexte } from "../annonces";
import "./Annonces.css";
import "./Demandes.css";

// SCRUM-25 : « Mes propositions », triées par score
const CRITERES = [
  { cle: "mots_cles", label: "Mots-clés", max: 40 },
  { cle: "prix", label: "Prix", max: 30 },
  { cle: "etat", label: "État", max: 20 },
  { cle: "etablissement", label: "Établissement", max: 10 },
];

function niveau(score) {
  if (score >= 80) return { label: "Excellente correspondance", classe: "fort" };
  if (score >= 65) return { label: "Bonne correspondance", classe: "moyen" };
  return { label: "Correspondance partielle", classe: "faible" };
}

export default function Propositions() {
  const [params, setParams] = useSearchParams();
  const filtre = params.get("demande") || "";
  const [demandes, setDemandes] = useState([]);
  const [propositions, setPropositions] = useState(null);
  const [erreur, setErreur] = useState("");

  useEffect(() => {
    api.get("/mes-demandes").then(({ data }) => setDemandes(data.filter((d) => d.statut === "ouverte"))).catch(() => {});
  }, []);

  useEffect(() => {
    setPropositions(null);
    api.get("/propositions", { params: filtre ? { demande: filtre } : {} })
      .then(({ data }) => setPropositions(data))
      .catch((e) => setErreur(lireErreur(e).message));
  }, [filtre]);

  return (
    <main className="annonces-page">
      <section className="annonces-header">
        <div>
          <span className="eyebrow">MATCHING</span>
          <h1>Mes propositions</h1>
          <p className="muted">Les annonces qui correspondent à tes demandes ouvertes, de la plus pertinente à la moins pertinente.</p>
        </div>
        <Link to="/mes-demandes" className="ann-btn ann-btn-ghost">Gérer mes demandes</Link>
      </section>

      {demandes.length > 0 && (
        <div className="prop-filtre">
          <label htmlFor="f-demande">Demande</label>
          <select id="f-demande" value={filtre} onChange={(e) => setParams(e.target.value ? { demande: e.target.value } : {})}>
            <option value="">Toutes mes demandes ({demandes.length})</option>
            {demandes.map((d) => <option key={d.id} value={d.id}>{d.titre} — {d.propositions_count} proposition{d.propositions_count > 1 ? "s" : ""}</option>)}
          </select>
          <p className="muted" aria-live="polite">
            {propositions ? `${propositions.length} proposition${propositions.length > 1 ? "s" : ""}` : "Chargement…"}
          </p>
        </div>
      )}

      {erreur && <p className="alert error">{erreur}</p>}

      {!propositions && !erreur && (
        <div className="prop-liste">{[0, 1, 2].map((i) => <div key={i} className="prop-carte squelette" style={{ minHeight: 170 }} />)}</div>
      )}

      {propositions && propositions.length === 0 && (
        <div className="vide">
          <span aria-hidden="true">🧭</span>
          <h2>Aucune proposition pour le moment</h2>
          <p className="muted">
            {demandes.length
              ? "Dès qu'une annonce correspond à tes critères (score ≥ 50/100), elle apparaîtra ici."
              : "Publie une demande pour recevoir des propositions automatiques."}
          </p>
          <Link to="/demandes/nouvelle" className="ann-btn ann-btn-primary">+ Nouvelle demande</Link>
        </div>
      )}

      {propositions && propositions.length > 0 && (
        <ul className="prop-liste">
          {propositions.map((p) => {
            const a = p.annonce;
            const n = niveau(p.score);
            return (
              <li key={p.id} className="prop-carte">
                <Link to={`/annonces/${a.id}`} className="prop-photo">
                  {a.photos?.[0] ? <img src={a.photos[0].url} alt="" /> : <span aria-hidden="true">📦</span>}
                </Link>

                <div className="prop-corps">
                  <p className="prop-pour">Pour ta demande « <strong>{p.demande?.titre}</strong> » · {budgetTexte(p.demande?.budget_max)}</p>
                  <Link to={`/annonces/${a.id}`} className="prop-titre"><h3>{a.titre}</h3></Link>
                  <p className="prop-meta">
                    <span className="prop-prix">{prixTexte(a)}</span>
                    <span className={`type-badge type-${a.type}`}>{TYPES[a.type]}</span>
                    <span>{ETATS[a.etat]}</span>
                    <span>{a.user?.prenom} · {a.user?.etablissement || "Étudiant"}</span>
                  </p>

                  <dl className="prop-criteres" aria-label="Détail du score">
                    {CRITERES.map((c) => {
                      const v = p.details?.[c.cle] ?? 0;
                      return (
                        <div key={c.cle}>
                          <dt>{c.label}</dt>
                          <dd>
                            <span className="prop-jauge"><span style={{ width: `${(v / c.max) * 100}%` }} /></span>
                            <span className="prop-pts">{v}/{c.max}</span>
                          </dd>
                        </div>
                      );
                    })}
                  </dl>
                  {p.details?.mots_trouves?.length > 0 && (
                    <p className="prop-mots">Mots en commun : {p.details.mots_trouves.map((m) => <span key={m}>{m}</span>)}</p>
                  )}
                </div>

                <div className={`prop-score prop-score-${n.classe}`}>
                  <strong>{p.score}</strong>
                  <span>/100</span>
                  <small>{n.label}</small>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
