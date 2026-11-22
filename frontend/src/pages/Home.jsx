import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import api from "../api";
import { useAuth } from "../context/AuthContext";
import "./Home.css";
import "./Dashboard.css";
import "./Echanges.css";

function Icon({ name }) {
  const common = {
    width: 25,
    height: 25,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };

  const icons = {
    book: <><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21z" /><path d="M4 5.5v13A2.5 2.5 0 0 1 6.5 16H20" /></>,
    laptop: <><rect x="3" y="4" width="18" height="13" rx="2" /><path d="M2 21h20M8 17l-1 4m9-4 1 4" /></>,
    bag: <><rect x="3" y="7" width="18" height="14" rx="2" /><path d="M8 7V5a4 4 0 0 1 8 0v2M9 12v1m6-1v1" /></>,
    leaf: <><path d="M20 4c-8 0-14 3-14 10a6 6 0 0 0 6 6c7 0 10-6 8-16Z" /><path d="M4 21c3-6 7-9 13-12" /></>,
    arrow: <><path d="M5 12h14m-6-6 6 6-6 6" /></>,
    heart: <path d="M20.8 8.8c0 5.5-8.8 11-8.8 11s-8.8-5.5-8.8-11A4.8 4.8 0 0 1 12 6.5a4.8 4.8 0 0 1 8.8 2.3Z" />,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="10" cy="7" r="4" /><path d="M20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></>,
  };

  return <svg {...common}>{icons[name]}</svg>;
}

const VITRINE = [
  { titre: "Calculatrice TI-83 Premium", categorie: "Informatique", type: "vente", prix: 45, emoji: "🧮" },
  { titre: "Lot de manuels de L1", categorie: "Livres & cours", type: "don", emoji: "📚" },
  { titre: "Blouse de laboratoire", categorie: "Vêtements", type: "echange", emoji: "🥼" },
];

function Landing() {
  const [annonces, setAnnonces] = useState([]);
  const [total, setTotal] = useState(null);

  useEffect(() => {
    api.get("/annonces", { params: { per_page: 3 } })
      .then(({ data }) => { setAnnonces(data.data || []); setTotal(data.total ?? null); })
      .catch(() => {});
  }, []);

  const cartes = annonces.length
    ? annonces.map((a) => ({ id: a.id, titre: a.titre, categorie: a.categorie?.nom, type: a.type, prix: a.prix, photo: a.photos?.[0]?.url, emoji: a.categorie?.icone || "📦" }))
    : VITRINE;

  return (
    <main className="home-page">
      <section className="hero">
        <div className="hero-content">
          <div className="hero-label">
            <span className="label-dot" />
            LA COMMUNAUTÉ DU PARTAGE ÉTUDIANT
          </div>

          <h1>
            Tes objets ont
            <span> encore plein</span>
            <br />
            de choses à vivre&nbsp;!
          </h1>

          <p className="hero-description">
            Un livre que tu as terminé ? Des fournitures dont tu n'as plus
            besoin ? Offre-leur une deuxième vie et trouve ce qu'il te faut
            auprès des étudiants de ton campus.
          </p>

          <div className="hero-buttons">
            <Link to="/register" className="btn-primary">
              Rejoindre la communauté <Icon name="arrow" />
            </Link>
            <Link to="/login" className="btn-secondary">
              J'ai déjà un compte
            </Link>
          </div>

          <div className="hero-benefits">
            <span><Icon name="heart" /> Gratuit</span>
            <span><Icon name="users" /> Entre étudiants</span>
            <span><Icon name="leaf" /> Écoresponsable</span>
          </div>
        </div>

        <div className="hero-visual">
          <div className="hv-fond" aria-hidden="true" />

          <div className="hv-panel">
            <div className="hv-entete">
              <span className="hv-points" aria-hidden="true"><i /><i /><i /></span>
              <span>Annonces près de chez toi</span>
            </div>
            <ul className="hv-cartes">
              {cartes.map((c, i) => (
                <li key={c.id ?? i} className="hv-carte" style={{ animationDelay: `${0.25 + i * 0.12}s` }}>
                  <div className="hv-photo">
                    {c.photo ? <img src={c.photo} alt="" /> : <span aria-hidden="true">{c.emoji}</span>}
                  </div>
                  <div className="hv-infos">
                    <strong>{c.titre}</strong>
                    <small>{c.categorie}</small>
                  </div>
                  <span className={`hv-prix hv-${c.type}`}>{c.type === "vente" ? `${Number(c.prix)} DT` : c.type === "don" ? "Gratuit" : "Échange"}</span>
                </li>
              ))}
            </ul>
            <Link to="/annonces" className="hv-voir">Voir toutes les annonces <Icon name="arrow" /></Link>
          </div>

          <div className="hv-bulle hv-bulle-haut">
            <span className="hv-bulle-ico hv-vert">✓</span>
            <div><strong>Réservation acceptée</strong><small>Remise demain à la bibliothèque</small></div>
          </div>

          <div className="hv-bulle hv-bulle-bas">
            <span className="hv-bulle-ico">♻️</span>
            <div><strong>{total != null ? `${total} objet${total > 1 ? "s" : ""}` : "Des dizaines d'objets"}</strong><small>attendent une 2ᵉ vie</small></div>
          </div>
        </div>
      </section>

      <section className="categories-section">
        <div className="section-heading">
          <span className="eyebrow">CAMPUS REUSE</span>
          <h2>Tout peut avoir une deuxième vie.</h2>
          <p>Explore les catégories et trouve ton prochain coup de cœur.</p>
        </div>

        <div className="category-grid">
          <Link to="/annonces" className="category-card category-book">
            <span className="category-icon">📚</span>
            <div>
              <h3>Livres & cours</h3>
              <p>Manuels, romans, notes...</p>
            </div>
            <span className="category-arrow">↗</span>
          </Link>

          <Link to="/annonces" className="category-card category-tech">
            <span className="category-icon">💻</span>
            <div>
              <h3>Informatique</h3>
              <p>PC, accessoires, câbles...</p>
            </div>
            <span className="category-arrow">↗</span>
          </Link>

          <Link to="/annonces" className="category-card category-supply">
            <span className="category-icon">✏️</span>
            <div>
              <h3>Fournitures</h3>
              <p>Stylos, sacs, matériel...</p>
            </div>
            <span className="category-arrow">↗</span>
          </Link>
        </div>
      </section>

      <section className="how-section">
        <div className="section-heading">
          <span className="eyebrow">C'EST TOUT SIMPLE</span>
          <h2>Le partage en 3 étapes.</h2>
        </div>

        <div className="steps-grid">
          <div className="step-card">
            <span className="step-number">01</span>
            <div className="step-emoji">📸</div>
            <h3>Publie ton objet</h3>
            <p>Ajoute une photo et quelques informations sur ce que tu souhaites échanger.</p>
          </div>

          <div className="step-card">
            <span className="step-number">02</span>
            <div className="step-emoji">🔎</div>
            <h3>Trouve ton bonheur</h3>
            <p>Découvre les annonces des autres étudiants de ta communauté.</p>
          </div>

          <div className="step-card">
            <span className="step-number">03</span>
            <div className="step-emoji">🤝</div>
            <h3>Échange et profite</h3>
            <p>Contacte l'étudiant et donne une nouvelle vie aux objets.</p>
          </div>
        </div>
      </section>

      <section className="bottom-cta">
        <div>
          <span>🌿 UN PETIT GESTE, UN GRAND IMPACT</span>
          <h2>Prêt à rejoindre le mouvement ?</h2>
          <p>Fais partie d'une communauté étudiante qui partage autrement.</p>
        </div>
        <Link to="/register" className="btn-cta">
          Créer mon compte <Icon name="arrow" />
        </Link>
      </section>

      <footer className="home-footer">
        <strong>♻ Campus ReUse</strong>
        <span>Le partage étudiant, tout simplement.</span>
      </footer>
    </main>
  );
}

/* ---------- Tableau de bord (utilisateur connecté) ---------- */

const TYPE_INFO = {
  vente: { label: "Ventes", couleur: "#2563eb" },
  don: { label: "Dons", couleur: "#0d9488" },
  echange: { label: "Échanges", couleur: "#d97706" },
};
const STATUT_LABEL = { disponible: "Disponible", reservee: "Réservée", cedee: "Cédée" };

function DbIcon({ name }) {
  const p = {
    box: <><path d="M21 8 12 3 3 8v8l9 5 9-5Z" /><path d="m3 8 9 5 9-5M12 13v8" /></>,
    live: <><circle cx="12" cy="12" r="3" /><path d="M5.6 5.6a9 9 0 0 0 0 12.8M18.4 5.6a9 9 0 0 1 0 12.8" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    coin: <><circle cx="12" cy="12" r="9" /><path d="M15 9.5c-.5-1-1.6-1.5-3-1.5-1.7 0-3 .9-3 2s1.3 1.7 3 2 3 .9 3 2-1.3 2-3 2c-1.4 0-2.5-.5-3-1.5M12 6v12" /></>,
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>,
    list: <><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" /></>,
    chat: <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12Z" />,
    user: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
    check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
    plus: <path d="M12 5v14M5 12h14" />,
    arrow: <path d="M5 12h14m-6-6 6 6-6 6" />,
  };
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {p[name]}
    </svg>
  );
}

function Kpi({ icon, label, value, hint, tone }) {
  return (
    <div className={`db-kpi db-kpi-${tone}`}>
      <div className="db-kpi-top">
        <span className="db-kpi-icon"><DbIcon name={icon} /></span>
        <span className="db-kpi-label">{label}</span>
      </div>
      <strong className="db-kpi-value">{value}</strong>
      <span className="db-kpi-hint">{hint}</span>
    </div>
  );
}

function ActiviteChart({ data }) {
  const max = Math.max(1, ...data.map((d) => d.total));
  const total = data.reduce((s, d) => s + d.total, 0);
  if (!total) {
    return <p className="db-chart-empty">Aucune annonce publiée ces 8 dernières semaines.</p>;
  }
  return (
    <div className="db-chart" role="img"
         aria-label={`${total} annonce(s) publiée(s) sur les 8 dernières semaines`}>
      <div className="db-chart-axis"><span>{max}</span><span>0</span></div>
      <div className="db-chart-bars">
        {data.map((d) => (
          <div key={d.semaine} className="db-bar-col" tabIndex={0}
               aria-label={`Semaine du ${d.label} : ${d.total} annonce(s)`}>
            <div className="db-bar-track">
              <div className="db-bar" style={{ height: `${(d.total / max) * 100}%` }} />
              <span className="db-tip">{d.total} annonce{d.total > 1 ? "s" : ""}<small>sem. du {d.label}</small></span>
            </div>
            <span className="db-bar-label">{d.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function RepartitionTypes({ m }) {
  const items = [
    { key: "vente", n: m.ventes },
    { key: "don", n: m.dons },
    { key: "echange", n: m.echanges },
  ];
  const total = items.reduce((s, i) => s + i.n, 0);
  if (!total) return <p className="db-empty-line">Aucune annonce pour l'instant.</p>;
  return (
    <>
      <div className="db-stack" role="img"
           aria-label={items.map((i) => `${TYPE_INFO[i.key].label} : ${i.n}`).join(", ")}>
        {items.filter((i) => i.n).map((i) => (
          <span key={i.key} style={{ flexGrow: i.n, background: TYPE_INFO[i.key].couleur }}
                title={`${TYPE_INFO[i.key].label} : ${i.n}`} />
        ))}
      </div>
      <ul className="db-legend">
        {items.map((i) => (
          <li key={i.key}>
            <span className="db-swatch" style={{ background: TYPE_INFO[i.key].couleur }} />
            {TYPE_INFO[i.key].label}
            <strong>{i.n}</strong>
            <span className="db-pct">{Math.round((i.n / total) * 100)} %</span>
          </li>
        ))}
      </ul>
    </>
  );
}

function ProfilRing({ pct }) {
  const r = 34;
  const c = 2 * Math.PI * r;
  return (
    <svg className="db-ring" viewBox="0 0 80 80" role="img" aria-label={`Profil complété à ${pct} %`}>
      <circle cx="40" cy="40" r={r} className="db-ring-bg" />
      <circle cx="40" cy="40" r={r} className="db-ring-fg"
              strokeDasharray={c} strokeDashoffset={c * (1 - pct / 100)} />
      <text x="40" y="45" textAnchor="middle">{pct}%</text>
    </svg>
  );
}

function prixCourt(a) {
  if (a.type === "don") return "Gratuit";
  if (a.type === "echange") return "Échange";
  return `${Number(a.prix).toLocaleString("fr-FR")} DT`;
}

function Dashboard({ user }) {
  const [data, setData] = useState(null);
  const [erreur, setErreur] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    api
      .get("/dashboard", { signal: controller.signal })
      .then(({ data }) => setData(data))
      .catch((error) => {
        if (error.name !== "CanceledError") {
          console.error("Dashboard :", error);
          setErreur(true);
        }
      });
    return () => controller.abort();
  }, []);

  const firstName = user?.prenom || user?.name || "étudiant";
  const aujourdhui = new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
  const m = data?.mes_annonces;
  const v = (x) => (data ? x : "—");

  return (
    <main className="db-page">
      {/* En-tête */}
      <header className="db-header">
        <div>
          <p className="db-date">{aujourdhui}</p>
          <h1>Bonjour {firstName}</h1>
          <p className="db-sub">
            {m
              ? m.disponibles
                ? `Tu as ${m.disponibles} annonce${m.disponibles > 1 ? "s" : ""} en ligne en ce moment.`
                : "Tu n'as aucune annonce en ligne. Publie ton premier objet !"
              : "Voici un aperçu de ton activité."}
          </p>
        </div>
        <div className="db-header-actions">
          <Link to="/favoris" className="db-btn db-btn-ghost">♡ Favoris{data ? ` (${data.stats.favoris})` : ""}</Link>
          <Link to="/annonces" className="db-btn db-btn-ghost"><DbIcon name="search" /> Explorer</Link>
          <Link to="/annonces/nouvelle" className="db-btn db-btn-primary"><DbIcon name="plus" /> Déposer une annonce</Link>
        </div>
      </header>

      {erreur && <p className="db-alert">Impossible de charger les statistiques. Vérifie que le serveur Laravel est lancé.</p>}

      {/* À faire (Sprint 4) */}
      {data && (data.stats.messages > 0 || data.echanges?.reservations_a_traiter > 0 || data.echanges?.echanges_a_confirmer > 0) && (
        <nav className="db-todo" aria-label="À faire">
          {data.stats.messages > 0 && <Link to="/messages"><strong>{data.stats.messages}</strong> message{data.stats.messages > 1 ? "s" : ""} non lu{data.stats.messages > 1 ? "s" : ""}</Link>}
          {data.echanges.reservations_a_traiter > 0 && <Link to="/reservations"><strong>{data.echanges.reservations_a_traiter}</strong> réservation{data.echanges.reservations_a_traiter > 1 ? "s" : ""} à accepter ou refuser</Link>}
          {data.echanges.echanges_a_confirmer > 0 && <Link to="/reservations"><strong>{data.echanges.echanges_a_confirmer}</strong> échange{data.echanges.echanges_a_confirmer > 1 ? "s" : ""} à confirmer</Link>}
        </nav>
      )}

      {/* Indicateurs clés */}
      <section className="db-kpis" aria-label="Indicateurs">
        <Kpi icon="box" tone="blue" label="Annonces publiées" value={v(m?.total)}
             hint={m ? `+${m.cette_semaine} cette semaine` : "…"} />
        <Kpi icon="live" tone="green" label="En ligne" value={v(m?.disponibles)}
             hint="Visibles par les étudiants" />
        <Kpi icon="clock" tone="amber" label="Réservées" value={v(m?.reservees)}
             hint={m ? `${m.cedees} cédée${m.cedees > 1 ? "s" : ""} au total` : "…"} />
        <Kpi icon="coin" tone="slate" label="Valeur en vente" value={data ? `${m.valeur_en_vente.toLocaleString("fr-FR")} DT` : "—"}
             hint="Annonces de vente disponibles" />
      </section>

      <div className="db-grid">
        {/* Colonne principale */}
        <div className="db-col">
          <section className="db-card">
            <div className="db-card-head">
              <div>
                <h2>Activité de publication</h2>
                <p>Annonces publiées par semaine — 8 dernières semaines</p>
              </div>
            </div>
            {data ? <ActiviteChart data={data.activite} /> : <div className="db-skeleton" style={{ height: 200 }} />}
          </section>

          <section className="db-card">
            <div className="db-card-head">
              <div>
                <h2>Mes dernières annonces</h2>
                <p>Les 4 plus récentes, tous statuts</p>
              </div>
              <Link to="/mes-annonces" className="db-link">Tout voir <DbIcon name="arrow" /></Link>
            </div>
            {!data && <div className="db-skeleton" style={{ height: 180 }} />}
            {data && data.recentes.length === 0 && (
              <div className="db-empty">
                <p>Tu n'as encore rien publié.</p>
                <Link to="/annonces/nouvelle" className="db-btn db-btn-primary"><DbIcon name="plus" /> Déposer ma première annonce</Link>
              </div>
            )}
            {data && data.recentes.length > 0 && (
              <ul className="db-recent">
                {data.recentes.map((a) => (
                  <li key={a.id}>
                    <Link to={`/annonces/${a.id}`} className="db-recent-row">
                      <span className="db-thumb">{a.photo ? <img src={a.photo} alt="" /> : <DbIcon name="box" />}</span>
                      <span className="db-recent-main">
                        <strong>{a.titre}</strong>
                        <small>{a.categorie} · {new Date(a.created_at).toLocaleDateString("fr-FR")}</small>
                      </span>
                      <span className="db-recent-price">{prixCourt(a)}</span>
                      <span className={`db-status db-status-${a.statut}`}>{STATUT_LABEL[a.statut]}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        {/* Colonne latérale */}
        <div className="db-col">
          <section className="db-card">
            <div className="db-card-head"><div><h2>Ton profil</h2><p>Un profil complet inspire confiance</p></div></div>
            {data ? (
              <div className="db-profile">
                <ProfilRing pct={data.profil.completion} />
                <ul className="db-steps">
                  {data.profil.etapes.map((e) => (
                    <li key={e.cle} className={e.fait ? "fait" : ""}>
                      <span className="db-step-dot">{e.fait && <DbIcon name="check" />}</span>
                      {e.label}
                    </li>
                  ))}
                </ul>
              </div>
            ) : <div className="db-skeleton" style={{ height: 150 }} />}
            {data && data.profil.completion < 100 && (
              <Link to="/profil" className="db-link db-link-block">Compléter mon profil <DbIcon name="arrow" /></Link>
            )}
          </section>

          <section className="db-card">
            <div className="db-card-head"><div><h2>Mes annonces par type</h2><p>Dons, échanges et ventes</p></div></div>
            {data ? <RepartitionTypes m={m} /> : <div className="db-skeleton" style={{ height: 90 }} />}
            {data && data.categories.length > 0 && (
              <>
                <h3 className="db-subtitle">Catégories</h3>
                <ul className="db-cats">
                  {data.categories.slice(0, 4).map((c) => (
                    <li key={c.nom}>
                      <span>{c.icone} {c.nom}</span>
                      <span className="db-cat-bar"><span style={{ width: `${(c.total / data.categories[0].total) * 100}%` }} /></span>
                      <strong>{c.total}</strong>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </section>

          <section className="db-card db-card-dark">
            <div className="db-card-head"><div><h2>Sur Campus ReUse</h2><p>L'activité de toute la communauté</p></div></div>
            <dl className="db-platform">
              <div><dt>Annonces disponibles</dt><dd>{v(data?.plateforme.annonces_disponibles)}</dd></div>
              <div><dt>Nouvelles cette semaine</dt><dd>{v(data?.plateforme.nouvelles_semaine)}</dd></div>
              <div><dt>Étudiants inscrits</dt><dd>{v(data?.plateforme.etudiants)}</dd></div>
              <div><dt>Objets cédés</dt><dd>{v(data?.plateforme.objets_cedes)}</dd></div>
            </dl>
          </section>
        </div>
      </div>

      {/* Raccourcis */}
      <section className="db-shortcuts" aria-label="Raccourcis">
        <Link to="/messages" className="db-shortcut"><DbIcon name="chat" /><span><strong>Messages{data?.stats?.messages ? ` (${data.stats.messages})` : ""}</strong><small>Mes conversations</small></span></Link>
        <Link to="/reservations" className="db-shortcut"><DbIcon name="clock" /><span><strong>Réservations</strong><small>{data?.echanges ? `${data.echanges.echanges_termines} échange${data.echanges.echanges_termines > 1 ? "s" : ""} terminé${data.echanges.echanges_termines > 1 ? "s" : ""}` : "Reçues et envoyées"}</small></span></Link>
        <Link to="/propositions" className="db-shortcut"><DbIcon name="search" /><span><strong>Propositions{data?.matching?.propositions ? ` (${data.matching.propositions})` : ""}</strong><small>Annonces pour mes demandes</small></span></Link>
        <Link to="/mes-demandes" className="db-shortcut"><DbIcon name="list" /><span><strong>Mes demandes</strong><small>{data?.matching ? `${data.matching.demandes_ouvertes} ouverte${data.matching.demandes_ouvertes > 1 ? "s" : ""}` : "Ce que je cherche"}</small></span></Link>
      </section>
    </main>
  );
}

export default function Home() {
  const { user, isAuthenticated } = useAuth();

  if (isAuthenticated && user?.role === "admin") return <Navigate to="/admin" replace />;
  return isAuthenticated ? <Dashboard user={user} /> : <Landing />;
}