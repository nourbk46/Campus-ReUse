import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api, { lireErreur } from "../../api";
import { useAuth } from "../../context/AuthContext";

function Statut({ u }) {
  if (u.role === "admin") return <span className="adm-badge adm-badge-admin">Admin</span>;
  return u.bloque ? <span className="adm-badge adm-badge-bloque">Bloqué</span> : <span className="adm-badge adm-badge-actif">Actif</span>;
}

function Avatar({ u }) {
  return u.photo_url ? <img className="adm-av" src={u.photo_url} alt="" />
    : <span className="adm-av adm-av-init" aria-hidden="true">{(u.prenom?.[0] || "?").toUpperCase()}</span>;
}

export default function AdminUsers() {
  const { user: moi } = useAuth();
  const [params, setParams] = useSearchParams();
  const [res, setRes] = useState(null);
  const [recherche, setRecherche] = useState(params.get("search") || "");
  const [message, setMessage] = useState({ texte: "", type: "" });
  const [fiche, setFiche] = useState(null);
  const [confirmer, setConfirmer] = useState(null); 
  const [envoi, setEnvoi] = useState(false);

  const charger = () => {
    const q = {};
    ["search", "bloque", "role", "page"].forEach((k) => params.get(k) && (q[k] = params.get(k)));
    return api.get("/admin/users", { params: q }).then(({ data }) => setRes(data))
      .catch((e) => setMessage({ texte: lireErreur(e).message, type: "error" }));
  };
  useEffect(() => { charger(); }, [params]);

  const changer = (cle, valeur) => {
    const p = new URLSearchParams(params);
    valeur !== "" && valeur != null ? p.set(cle, valeur) : p.delete(cle);
    if (cle !== "page") p.delete("page");
    setParams(p);
  };

  const ouvrirFiche = (u) => {
    setFiche({ ...u, chargement: true });
    api.get(`/admin/users/${u.id}`).then(({ data }) => setFiche(data)).catch(() => setFiche(null));
  };

  const executer = async () => {
    const { u, action } = confirmer;
    setEnvoi(true);
    try {
      const { data } = action === "supprimer"
        ? await api.delete(`/admin/users/${u.id}`)
        : await api.post(`/admin/users/${u.id}/${action}`);
      setMessage({ texte: data.message, type: "success" });
      if (action === "supprimer") setFiche(null);
      else if (fiche?.id === u.id) setFiche({ ...fiche, bloque: data.user.bloque });
      await charger();
    } catch (e) {
      setMessage({ texte: lireErreur(e).message, type: "error" });
    } finally {
      setEnvoi(false);
      setConfirmer(null);
    }
  };

  const filtre = params.get("bloque") === "1" ? "bloques" : params.get("bloque") === "0" ? "actifs" : params.get("role") === "admin" ? "admins" : "tous";
  const choisirFiltre = (f) => {
    const p = new URLSearchParams(params);
    p.delete("bloque"); p.delete("role"); p.delete("page");
    if (f === "bloques") p.set("bloque", "1");
    if (f === "actifs") p.set("bloque", "0");
    if (f === "admins") p.set("role", "admin");
    setParams(p);
  };

  const textes = {
    bloquer: ["Bloquer ce compte ?", "L'étudiant sera déconnecté immédiatement, ne pourra plus se connecter et ses annonces seront masquées.", "Bloquer", "adm-btn-danger"],
    debloquer: ["Débloquer ce compte ?", "L'étudiant pourra de nouveau se connecter et ses annonces réapparaîtront.", "Débloquer", "adm-btn-primary"],
    supprimer: ["Supprimer ce compte ?", "Le compte, ses annonces, demandes, messages, réservations et favoris seront supprimés définitivement. Cette action est irréversible.", "Supprimer définitivement", "adm-btn-danger"],
  };

  const actions = (u) => (u.role === "admin" || u.id === moi?.id) ? null : (
    <>
      {u.bloque
        ? <button className="adm-btn" onClick={() => setConfirmer({ u, action: "debloquer" })}>Débloquer</button>
        : <button className="adm-btn adm-btn-warn" onClick={() => setConfirmer({ u, action: "bloquer" })}>Bloquer</button>}
      <button className="adm-btn adm-btn-danger-ghost" onClick={() => setConfirmer({ u, action: "supprimer" })} aria-label={`Supprimer ${u.prenom} ${u.name}`}>Supprimer</button>
    </>
  );

  return (
    <>
      <header className="adm-tete">
        <div>
          <h1>Utilisateurs</h1>
          <p className="muted">{res ? `${res.total} compte${res.total > 1 ? "s" : ""}` : "Chargement…"}</p>
        </div>
      </header>

      <div className="adm-outils">
        <form className="adm-recherche" role="search" onSubmit={(e) => { e.preventDefault(); changer("search", recherche.trim()); }}>
          <input type="search" placeholder="Nom, e-mail ou établissement…" value={recherche}
                 onChange={(e) => setRecherche(e.target.value)} aria-label="Rechercher un utilisateur" />
          <button className="adm-btn adm-btn-primary">Rechercher</button>
        </form>
        <div className="adm-filtres" role="group" aria-label="Filtrer">
          {[["tous", "Tous"], ["actifs", "Actifs"], ["bloques", "Bloqués"], ["admins", "Admins"]].map(([k, v]) => (
            <button key={k} className={filtre === k ? "actif" : ""} aria-pressed={filtre === k} onClick={() => choisirFiltre(k)}>{v}</button>
          ))}
        </div>
      </div>

      {message.texte && <p className={`alert ${message.type}`} role="status">{message.texte}</p>}

      {res && res.data.length === 0 && <div className="adm-vide">Aucun utilisateur ne correspond.</div>}

      {res && res.data.length > 0 && (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr><th>Utilisateur</th><th>Établissement</th><th className="num">Annonces</th><th>Inscrit le</th><th>Statut</th><th><span className="sr-only">Actions</span></th></tr>
            </thead>
            <tbody>
              {res.data.map((u) => (
                <tr key={u.id} className={u.bloque ? "adm-ligne-bloquee" : ""}>
                  <td>
                    <button className="adm-qui" onClick={() => ouvrirFiche(u)}>
                      <Avatar u={u} />
                      <span><strong>{u.prenom} {u.name}</strong><small>{u.email}</small></span>
                    </button>
                  </td>
                  <td>{u.etablissement || <span className="muted">—</span>}{u.filiere && <small className="adm-sous">{u.filiere}{u.niveau ? ` · ${u.niveau}` : ""}</small>}</td>
                  <td className="num">{u.annonces_count}</td>
                  <td>{new Date(u.created_at).toLocaleDateString("fr-FR")}</td>
                  <td><Statut u={u} /></td>
                  <td><div className="adm-actions">{actions(u)}</div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {res && res.last_page > 1 && (
        <nav className="adm-pages" aria-label="Pages">
          <button className="adm-btn" disabled={res.current_page <= 1} onClick={() => changer("page", res.current_page - 1)}>← Précédent</button>
          <span>Page {res.current_page} / {res.last_page}</span>
          <button className="adm-btn" disabled={res.current_page >= res.last_page} onClick={() => changer("page", res.current_page + 1)}>Suivant →</button>
        </nav>
      )}

      {/* Fiche détaillée (SCRUM-38) */}
      {fiche && (
        <div className="adm-overlay" onClick={() => setFiche(null)}>
          <aside className="adm-fiche" role="dialog" aria-modal="true" aria-labelledby="fiche-titre" onClick={(e) => e.stopPropagation()}>
            <button className="adm-fermer" onClick={() => setFiche(null)} aria-label="Fermer">✕</button>
            <div className="adm-fiche-tete">
              <Avatar u={fiche} />
              <div><h2 id="fiche-titre">{fiche.prenom} {fiche.name}</h2><p className="muted">{fiche.email}</p><Statut u={fiche} /></div>
            </div>
            {fiche.chargement ? <p className="muted">Chargement…</p> : (
              <>
                <dl className="adm-dl adm-dl-fiche">
                  <div><dt>Établissement</dt><dd>{fiche.etablissement || "—"}</dd></div>
                  <div><dt>Filière / niveau</dt><dd>{fiche.filiere || "—"}{fiche.niveau ? ` · ${fiche.niveau}` : ""}</dd></div>
                  <div><dt>Inscrit le</dt><dd>{new Date(fiche.created_at).toLocaleDateString("fr-FR")}</dd></div>
                  <div><dt>E-mail confirmé</dt><dd>{fiche.email_verified_at ? "Oui" : "Non"}</dd></div>
                  <div><dt>Annonces</dt><dd>{fiche.annonces_count}</dd></div>
                  <div><dt>Demandes</dt><dd>{fiche.demandes_count}</dd></div>
                  <div><dt>Réservations faites</dt><dd>{fiche.reservations_count}</dd></div>
                  <div><dt>Échanges terminés</dt><dd>{fiche.echanges_termines}</dd></div>
                </dl>
                {fiche.annonces?.length > 0 && (
                  <>
                    <h3>Dernières annonces</h3>
                    <ul className="adm-mini-annonces">
                      {fiche.annonces.map((a) => (
                        <li key={a.id}>
                          <Link to={`/annonces/${a.id}`}>
                            {a.photos?.[0] ? <img src={a.photos[0].url} alt="" /> : <span>📦</span>}
                            <span><strong>{a.titre}</strong><small>{a.categorie?.nom} · {a.statut}</small></span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
                <div className="adm-fiche-actions">{actions(fiche)}</div>
              </>
            )}
          </aside>
        </div>
      )}

      {confirmer && (
        <div className="adm-overlay adm-overlay-centre" onClick={() => setConfirmer(null)}>
          <div className="adm-modal" role="alertdialog" aria-modal="true" aria-labelledby="conf-titre" onClick={(e) => e.stopPropagation()}>
            <h2 id="conf-titre">{textes[confirmer.action][0]}</h2>
            <p><strong>{confirmer.u.prenom} {confirmer.u.name}</strong> ({confirmer.u.email})</p>
            <p className="muted">{textes[confirmer.action][1]}</p>
            <div className="adm-modal-actions">
              <button className="adm-btn" onClick={() => setConfirmer(null)} autoFocus>Annuler</button>
              <button className={`adm-btn ${textes[confirmer.action][3]}`} onClick={executer} disabled={envoi}>{envoi ? "…" : textes[confirmer.action][2]}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
