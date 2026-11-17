import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { lireErreur } from "../../api";
import { useAuth } from "../../context/AuthContext";

// Dashboard administrateur (Sprint 5) : toute l'activité de la plateforme
const SERIES = [
  { cle: "inscriptions", label: "Inscriptions", couleur: "#2563eb" },
  { cle: "annonces", label: "Annonces publiées", couleur: "#0d9488" },
  { cle: "echanges", label: "Échanges terminés", couleur: "#7c3aed" },
];
const STATUTS = [
  { cle: "disponibles", label: "Disponibles", couleur: "#2563eb" },
  { cle: "reservees", label: "Réservées", couleur: "#d97706" },
  { cle: "cedees", label: "Cédées", couleur: "#0d9488" },
];
const RESA = [
  { cle: "en_attente", label: "En attente" },
  { cle: "acceptee", label: "Acceptées" },
  { cle: "terminee", label: "Terminées" },
  { cle: "refusee", label: "Refusées" },
  { cle: "annulee", label: "Annulées" },
];
const LIB_STATUT = { disponible: "Disponible", reservee: "Réservée", cedee: "Cédée" };
const LIB_TYPE = { don: "Don", echange: "Échange", vente: "Vente" };

const nb = (n) => Number(n || 0).toLocaleString("fr-FR");
const dateCourte = (d) => new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });

function Icone({ d }) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8"
         strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={d} /></svg>
  );
}
const ICONES = {
  users: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8m13 10v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8",
  annonce: "M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L2 12V2h10l8.6 8.6a2 2 0 0 1 0 2.8zM7 7h.01",
  echange: "M17 1l4 4-4 4M3 11V9a4 4 0 0 1 4-4h14M7 23l-4-4 4-4M21 13v2a4 4 0 0 1-4 4H3",
  message: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z",
  alerte: "M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0zM12 9v4m0 4h.01",
};

// Écart avec la semaine précédente
function Ecart({ maintenant, avant }) {
  const d = maintenant - avant;
  if (d === 0) return <span className="dsh-ecart neutre">= semaine passée</span>;
  return <span className={`dsh-ecart ${d > 0 ? "hausse" : "baisse"}`}>{d > 0 ? "▲" : "▼"} {Math.abs(d)} vs semaine passée</span>;
}

function Kpi({ icone, titre, valeur, detail, to, children }) {
  const contenu = (
    <>
      <div className="dsh-kpi-haut"><span className="dsh-kpi-icone"><Icone d={ICONES[icone]} /></span><span>{titre}</span></div>
      <strong>{valeur}</strong>
      {children}
      <small>{detail}</small>
    </>
  );
  return to ? <Link to={to} className="dsh-kpi">{contenu}</Link> : <div className="dsh-kpi">{contenu}</div>;
}

// Courbes des 8 dernières semaines, avec repère au survol
function Courbes({ semaines }) {
  const [survol, setSurvol] = useState(null);
  const L = 640, H = 220, g = 34, d = 22, h = 12, b = 26;
  const max = Math.max(4, ...semaines.flatMap((s) => SERIES.map((se) => s[se.cle])));
  const pas = Math.ceil(max / 4);
  const haut = pas * 4;
  const x = (i) => g + (i * (L - g - d)) / (semaines.length - 1);
  const y = (v) => h + (H - h - b) * (1 - v / haut);
  const s = survol != null ? semaines[survol] : null;

  return (
    <div className="dsh-courbes">
      <ul className="adm-legende">
        {SERIES.map((se) => <li key={se.cle}><span style={{ background: se.couleur }} />{se.label}</li>)}
      </ul>
      <div className="dsh-svg-zone">
        <svg viewBox={`0 0 ${L} ${H}`} role="img" onMouseLeave={() => setSurvol(null)}
             aria-label={semaines.map((w) => `Semaine du ${w.label} : ${w.inscriptions} inscriptions, ${w.annonces} annonces, ${w.echanges} échanges`).join(". ")}>
          {[0, 1, 2, 3, 4].map((k) => (
            <g key={k}>
              <line x1={g} x2={L - d} y1={y(k * pas)} y2={y(k * pas)} className="dsh-grille" />
              <text x={g - 8} y={y(k * pas) + 4} textAnchor="end" className="dsh-axe">{k * pas}</text>
            </g>
          ))}
          {semaines.map((w, i) => (
            <text key={w.semaine} x={x(i)} y={H - 6} textAnchor="middle" className="dsh-axe">{w.label}</text>
          ))}
          {s && <line x1={x(survol)} x2={x(survol)} y1={h} y2={H - b} className="dsh-repere" />}
          {SERIES.map((se) => (
            <g key={se.cle}>
              <path d={`M ${x(0)} ${y(0)} ` + semaines.map((w, i) => `L ${x(i)} ${y(w[se.cle])}`).join(" ") + ` L ${x(semaines.length - 1)} ${y(0)} Z`}
                    fill={se.couleur} opacity={se.cle === "inscriptions" ? 0.08 : 0} />
              <polyline points={semaines.map((w, i) => `${x(i)},${y(w[se.cle])}`).join(" ")}
                        fill="none" stroke={se.couleur} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
              {semaines.map((w, i) => (
                <circle key={i} cx={x(i)} cy={y(w[se.cle])} r={survol === i ? 5 : 3.5} fill={se.couleur} stroke="#fff" strokeWidth="2" />
              ))}
            </g>
          ))}
          {semaines.map((w, i) => (
            <rect key={w.semaine} x={x(i) - (L - g - d) / 14} y={0} width={(L - g - d) / 7} height={H}
                  fill="transparent" onMouseEnter={() => setSurvol(i)} />
          ))}
        </svg>
        {s && (
          <div className="dsh-tip" style={{ left: `${(x(survol) / L) * 100}%` }}>
            <b>Semaine du {s.label}</b>
            {SERIES.map((se) => (
              <span key={se.cle}><i style={{ background: se.couleur }} />{se.label}<b>{s[se.cle]}</b></span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Anneau : répartition des annonces par statut
function Anneau({ annonces }) {
  const total = annonces.total;
  const r = 52, c = 2 * Math.PI * r;
  let cumul = 0;
  return (
    <div className="dsh-anneau">
      <svg viewBox="0 0 140 140" role="img" aria-label={STATUTS.map((st) => `${st.label} : ${annonces[st.cle]}`).join(", ")}>
        <circle cx="70" cy="70" r={r} fill="none" stroke="#f1f5f9" strokeWidth="16" />
        {total > 0 && STATUTS.filter((st) => annonces[st.cle]).map((st) => {
          const part = (annonces[st.cle] / total) * c;
          const el = (
            <circle key={st.cle} cx="70" cy="70" r={r} fill="none" stroke={st.couleur} strokeWidth="16"
                    strokeDasharray={`${Math.max(part - 2, 0)} ${c}`} strokeDashoffset={-cumul}
                    transform="rotate(-90 70 70)" />
          );
          cumul += part;
          return el;
        })}
        <text x="70" y="68" textAnchor="middle" className="dsh-anneau-n">{nb(total)}</text>
        <text x="70" y="86" textAnchor="middle" className="dsh-anneau-l">annonces</text>
      </svg>
      <ul className="dsh-legende-v">
        {STATUTS.map((st) => (
          <li key={st.cle}>
            <span className="adm-pastille" style={{ background: st.couleur }} />{st.label}
            <strong>{nb(annonces[st.cle])}</strong>
            <small>{total ? Math.round((annonces[st.cle] / total) * 100) : 0} %</small>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Barres({ lignes, couleur = "#2563eb" }) {
  const max = Math.max(1, ...lignes.map((l) => l.n));
  return (
    <ul className="dsh-barres">
      {lignes.map((l) => (
        <li key={l.label}>
          <span className="dsh-barres-label">{l.label}</span>
          <span className="dsh-barres-piste"><span style={{ width: `${(l.n / max) * 100}%`, background: couleur }} /></span>
          <strong>{nb(l.n)}</strong>
        </li>
      ))}
    </ul>
  );
}

export default function AdminHome() {
  const { user } = useAuth();
  const [s, setS] = useState(null);
  const [erreur, setErreur] = useState("");

  useEffect(() => {
    api.get("/admin/stats").then(({ data }) => setS(data)).catch((e) => setErreur(lireErreur(e).message));
  }, []);

  if (erreur) return <p className="alert error">{erreur}</p>;
  if (!s) return <p className="muted">Chargement du dashboard…</p>;

  const u = s.utilisateurs, a = s.annonces, act = s.activite;
  const tauxCession = a.total ? Math.round((a.cedees / a.total) * 100) : 0;
  const decidees = act.reservations.terminee + act.reservations.acceptee + act.reservations.refusee;
  const tauxAcceptation = decidees ? Math.round(((act.reservations.terminee + act.reservations.acceptee) / decidees) * 100) : 0;

  const alertes = [
    { n: act.en_attente_3j, texte: "réservation(s) sans réponse depuis plus de 3 jours", ton: "orange" },
    { n: u.bloques, texte: "compte(s) étudiant bloqué(s)", to: "/admin/utilisateurs?bloque=1", ton: "rouge" },
    { n: a.sans_photo, texte: "annonce(s) disponible(s) sans photo", to: "/annonces", ton: "orange" },
    { n: s.categories_vides, texte: "catégorie(s) jamais utilisée(s)", to: "/admin/categories", ton: "gris" },
  ].filter((x) => x.n > 0);

  return (
    <div className="dsh">
      <header className="dsh-hero">
        <div>
          <span className="dsh-date">{new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</span>
          <h1>Bonjour {user?.prenom}</h1>
          <p>Voici l'activité de Campus ReUse : {nb(u.nouveaux_7j)} nouvel(s) étudiant(s) et {nb(a.nouvelles_7j)} annonce(s) cette semaine.</p>
        </div>
        <div className="dsh-hero-actions">
          <Link to="/admin/utilisateurs" className="adm-btn">Gérer les utilisateurs</Link>
          <Link to="/admin/categories" className="adm-btn adm-btn-primary">+ Nouvelle catégorie</Link>
        </div>
      </header>

      <section className="dsh-kpis">
        <Kpi icone="users" titre="Étudiants inscrits" valeur={nb(u.etudiants)} to="/admin/utilisateurs"
             detail={`${nb(u.actifs)} actifs · ${nb(u.bloques)} bloqué(s)`}>
          <Ecart maintenant={u.nouveaux_7j} avant={u.nouveaux_7j_avant} />
        </Kpi>
        <Kpi icone="annonce" titre="Annonces publiées" valeur={nb(a.total)} to="/admin/annonces"
             detail={`${nb(a.disponibles)} disponibles en ce moment`}>
          <Ecart maintenant={a.nouvelles_7j} avant={a.nouvelles_7j_avant} />
        </Kpi>
        <Kpi icone="echange" titre="Échanges terminés" valeur={nb(act.echanges_termines)}
             detail={`${nb(act.reservations_en_cours)} réservation(s) en cours`}>
          <span className="dsh-ecart neutre">{tauxCession} % des annonces cédées</span>
        </Kpi>
        <Kpi icone="message" titre="Messages échangés" valeur={nb(act.messages)}
             detail={`${nb(act.conversations)} conversation(s) · ${nb(act.favoris)} favori(s)`}>
          <span className="dsh-ecart neutre">{nb(act.messages_7j)} cette semaine</span>
        </Kpi>
      </section>

      <div className="dsh-grille">
        <section className="adm-carte dsh-2">
          <div className="adm-carte-tete"><h2>Activité des 8 dernières semaines</h2></div>
          <Courbes semaines={s.semaines} />
        </section>

        <section className="adm-carte">
          <div className="adm-carte-tete"><h2>À surveiller</h2></div>
          {alertes.length === 0 ? (
            <p className="dsh-ok">✓ Tout est en ordre : rien à signaler.</p>
          ) : (
            <ul className="dsh-alertes">
              {alertes.map((x) => {
                const corps = <><span className={`dsh-alerte-ico ${x.ton}`}><Icone d={ICONES.alerte} /></span><span><b>{x.n}</b> {x.texte}</span></>;
                return <li key={x.texte}>{x.to ? <Link to={x.to}>{corps}<span className="dsh-fleche">→</span></Link> : <div>{corps}</div>}</li>;
              })}
            </ul>
          )}
          <h3>Demandes & matching</h3>
          <dl className="dsh-mini">
            <div><dt>Demandes ouvertes</dt><dd>{nb(act.demandes_ouvertes)}<small> / {nb(act.demandes_total)}</small></dd></div>
            <div><dt>Propositions trouvées</dt><dd>{nb(act.matchs)}</dd></div>
            <div><dt>Prix moyen (vente)</dt><dd>{nb(a.prix_moyen)} <small>DT</small></dd></div>
            <div><dt>Valeur en vente</dt><dd>{nb(a.valeur_en_vente)} <small>DT</small></dd></div>
          </dl>
        </section>

        <section className="adm-carte">
          <h2>Annonces par statut</h2>
          <Anneau annonces={a} />
          <h3>Par type</h3>
          <div className="dsh-types">
            {[["dons", "Dons"], ["echanges", "Échanges"], ["ventes", "Ventes"]].map(([k, l]) => (
              <div key={k}><strong>{nb(a[k])}</strong><span>{l}</span></div>
            ))}
          </div>
        </section>

        <section className="adm-carte">
          <div className="adm-carte-tete"><h2>Réservations</h2><span className="dsh-badge">{tauxAcceptation} % acceptées</span></div>
          <Barres couleur="#7c3aed" lignes={RESA.map((r) => ({ label: r.label, n: act.reservations[r.cle] }))} />
        </section>

        <section className="adm-carte">
          <div className="adm-carte-tete"><h2>Top catégories</h2><Link to="/admin/categories">Gérer →</Link></div>
          <Barres couleur="#0d9488" lignes={s.categories.map((c) => ({ label: `${c.icone || ""} ${c.nom}`.trim(), n: c.annonces_count }))} />
        </section>

        <section className="adm-carte">
          <div className="adm-carte-tete"><h2>Derniers inscrits</h2><Link to="/admin/utilisateurs">Tout voir →</Link></div>
          <ul className="dsh-liste">
            {s.derniers_inscrits.map((x) => (
              <li key={x.id}>
                {x.photo_url ? <img src={x.photo_url} alt="" className="dsh-avatar" /> : <span className="dsh-avatar">{x.prenom?.[0]?.toUpperCase()}</span>}
                <div className="dsh-liste-txt">
                  <Link to={`/admin/utilisateurs?search=${encodeURIComponent(x.email)}`}>{x.prenom} {x.name}</Link>
                  <small>{x.etablissement || "Établissement non renseigné"}</small>
                </div>
                {x.bloque ? <span className="dsh-chip rouge">Bloqué</span> : <small className="dsh-date-liste">{dateCourte(x.created_at)}</small>}
              </li>
            ))}
          </ul>
        </section>

        <section className="adm-carte">
          <div className="adm-carte-tete"><h2>Dernières annonces</h2><Link to="/admin/annonces">Tout voir →</Link></div>
          <ul className="dsh-liste">
            {s.dernieres_annonces.map((x) => (
              <li key={x.id}>
                {x.photos?.[0]?.url ? <img src={x.photos[0].url} alt="" className="dsh-vignette" /> : <span className="dsh-vignette">{x.categorie?.icone || "📦"}</span>}
                <div className="dsh-liste-txt">
                  <Link to={`/annonces/${x.id}`}>{x.titre}</Link>
                  <small>{x.user?.prenom} {x.user?.name} · {LIB_TYPE[x.type]}{x.type === "vente" && x.prix ? ` · ${nb(x.prix)} DT` : ""}</small>
                </div>
                <span className={`dsh-chip ${x.statut}`}>{LIB_STATUT[x.statut]}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="adm-carte">
          <h2>Établissements les plus actifs</h2>
          {s.etablissements.length ? (
            <Barres lignes={s.etablissements.map((e) => ({ label: e.etablissement, n: e.n }))} />
          ) : <p className="muted">Aucun établissement renseigné.</p>}
        </section>
      </div>
    </div>
  );
}
