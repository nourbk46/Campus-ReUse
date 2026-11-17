import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api, { lireErreur } from "../../api";
import { ETATS, TYPES } from "../../annonces";

// Modération des annonces : consulter, rechercher, filtrer, supprimer
const STATUTS = { disponible: "Disponible", reservee: "Réservée", cedee: "Cédée" };
const nb = (n) => Number(n || 0).toLocaleString("fr-FR");

function Statut({ a }) {
  return <span className={`adm-badge adm-ann-${a.statut}`}>{STATUTS[a.statut]}</span>;
}

function Vignette({ a, grande }) {
  const photo = a.photos?.[0]?.url;
  return photo ? <img className={grande ? "adm-ann-photo-g" : "adm-ann-photo"} src={photo} alt="" />
    : <span className={`${grande ? "adm-ann-photo-g" : "adm-ann-photo"} adm-ann-sans`} aria-hidden="true">{a.categorie?.icone || "📦"}</span>;
}

const prix = (a) => (a.type === "vente" ? `${nb(a.prix)} DT` : TYPES[a.type]);

export default function AdminAnnonces() {
  const [params, setParams] = useSearchParams();
  const [res, setRes] = useState(null);
  const [categories, setCategories] = useState([]);
  const [recherche, setRecherche] = useState(params.get("search") || "");
  const [message, setMessage] = useState({ texte: "", type: "" });
  const [fiche, setFiche] = useState(null);
  const [photo, setPhoto] = useState(0);
  const [aSupprimer, setASupprimer] = useState(null);
  const [motif, setMotif] = useState("");
  const [envoi, setEnvoi] = useState(false);

  const charger = () => {
    const q = {};
    ["search", "statut", "type", "categorie", "tri", "page"].forEach((k) => params.get(k) && (q[k] = params.get(k)));
    return api.get("/admin/annonces", { params: q }).then(({ data }) => setRes(data))
      .catch((e) => setMessage({ texte: lireErreur(e).message, type: "error" }));
  };
  useEffect(() => { charger(); }, [params]);
  useEffect(() => { api.get("/categories").then(({ data }) => setCategories(data)).catch(() => {}); }, []);

  const changer = (cle, valeur) => {
    const p = new URLSearchParams(params);
    valeur !== "" && valeur != null ? p.set(cle, valeur) : p.delete(cle);
    if (cle !== "page") p.delete("page");
    setParams(p);
  };

  const ouvrirFiche = (a) => {
    setPhoto(0);
    setFiche({ ...a, chargement: true });
    api.get(`/admin/annonces/${a.id}`).then(({ data }) => setFiche(data)).catch(() => setFiche(null));
  };

  const supprimer = async () => {
    setEnvoi(true);
    try {
      const { data } = await api.delete(`/admin/annonces/${aSupprimer.id}`, { data: { motif: motif.trim() || null } });
      setMessage({ texte: data.message, type: "success" });
      if (fiche?.id === aSupprimer.id) setFiche(null);
      await charger();
    } catch (e) {
      setMessage({ texte: lireErreur(e).message, type: "error" });
    } finally {
      setEnvoi(false);
      setASupprimer(null);
      setMotif("");
    }
  };

  const statut = params.get("statut") || "";
  const filtresActifs = ["search", "statut", "type", "categorie"].some((k) => params.get(k));

  return (
    <>
      <header className="adm-tete">
        <div>
          <h1>Annonces</h1>
          <p className="muted">{res ? `${res.total} annonce${res.total > 1 ? "s" : ""}${filtresActifs ? " trouvée" + (res.total > 1 ? "s" : "") : " publiées sur la plateforme"}` : "Chargement…"}</p>
        </div>
      </header>

      <div className="adm-outils">
        <form className="adm-recherche" role="search" onSubmit={(e) => { e.preventDefault(); changer("search", recherche.trim()); }}>
          <input type="search" placeholder="Titre, description ou vendeur…" value={recherche}
                 onChange={(e) => setRecherche(e.target.value)} aria-label="Rechercher une annonce" />
          <button className="adm-btn adm-btn-primary">Rechercher</button>
        </form>
        <div className="adm-filtres" role="group" aria-label="Filtrer par statut">
          {[["", "Toutes"], ["disponible", "Disponibles"], ["reservee", "Réservées"], ["cedee", "Cédées"]].map(([k, v]) => (
            <button key={k} className={statut === k ? "actif" : ""} aria-pressed={statut === k} onClick={() => changer("statut", k)}>{v}</button>
          ))}
        </div>
      </div>

      <div className="adm-selects">
        <label>
          <span>Catégorie</span>
          <select value={params.get("categorie") || ""} onChange={(e) => changer("categorie", e.target.value)}>
            <option value="">Toutes</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.icone} {c.nom}</option>)}
          </select>
        </label>
        <label>
          <span>Type</span>
          <select value={params.get("type") || ""} onChange={(e) => changer("type", e.target.value)}>
            <option value="">Tous</option>
            {Object.entries(TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </label>
        <label>
          <span>Tri</span>
          <select value={params.get("tri") || ""} onChange={(e) => changer("tri", e.target.value)}>
            <option value="">Plus récentes</option>
            <option value="ancien">Plus anciennes</option>
          </select>
        </label>
        {filtresActifs && (
          <button className="adm-btn" onClick={() => { setRecherche(""); setParams(new URLSearchParams()); }}>Effacer les filtres</button>
        )}
      </div>

      {message.texte && <p className={`alert ${message.type}`} role="status">{message.texte}</p>}

      {res && res.data.length === 0 && <div className="adm-vide">Aucune annonce ne correspond.</div>}

      {res && res.data.length > 0 && (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr><th>Annonce</th><th>Vendeur</th><th>Catégorie</th><th>Prix / type</th><th className="num">Réservations</th><th>Publiée le</th><th>Statut</th><th><span className="sr-only">Actions</span></th></tr>
            </thead>
            <tbody>
              {res.data.map((a) => (
                <tr key={a.id}>
                  <td>
                    <button className="adm-qui" onClick={() => ouvrirFiche(a)}>
                      <Vignette a={a} />
                      <span><strong>{a.titre}</strong><small>{ETATS[a.etat]} · {a.photos?.length || 0} photo{a.photos?.length > 1 ? "s" : ""}</small></span>
                    </button>
                  </td>
                  <td>
                    {a.user?.prenom} {a.user?.name}
                    {a.user?.bloque ? <span className="adm-badge adm-badge-bloque adm-badge-mini">Bloqué</span> : null}
                    <small className="adm-sous">{a.user?.email}</small>
                  </td>
                  <td>{a.categorie?.icone} {a.categorie?.nom}</td>
                  <td>{prix(a)}</td>
                  <td className="num">{a.reservations_count}</td>
                  <td>{new Date(a.created_at).toLocaleDateString("fr-FR")}</td>
                  <td><Statut a={a} /></td>
                  <td>
                    <div className="adm-actions">
                      <button className="adm-btn" onClick={() => ouvrirFiche(a)}>Voir</button>
                      <button className="adm-btn adm-btn-danger-ghost" onClick={() => setASupprimer(a)} aria-label={`Supprimer ${a.titre}`}>Supprimer</button>
                    </div>
                  </td>
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

      {/* Fiche détaillée de l'annonce */}
      {fiche && (
        <div className="adm-overlay" onClick={() => setFiche(null)}>
          <aside className="adm-fiche" role="dialog" aria-modal="true" aria-labelledby="fiche-titre" onClick={(e) => e.stopPropagation()}>
            <button className="adm-fermer" onClick={() => setFiche(null)} aria-label="Fermer">✕</button>
            {fiche.photos?.length > 0
              ? <img className="adm-ann-grande" src={fiche.photos[photo]?.url} alt={fiche.titre} />
              : <div className="adm-ann-grande adm-ann-sans">{fiche.categorie?.icone || "📦"}</div>}
            {fiche.photos?.length > 1 && (
              <div className="adm-ann-miniatures">
                {fiche.photos.map((p, i) => (
                  <button key={p.id} className={i === photo ? "actif" : ""} onClick={() => setPhoto(i)} aria-label={`Photo ${i + 1}`}><img src={p.url} alt="" /></button>
                ))}
              </div>
            )}
            <div className="adm-ann-tete">
              <h2 id="fiche-titre">{fiche.titre}</h2>
              <Statut a={fiche} />
            </div>
            <p className="adm-ann-prix">{prix(fiche)} <span className="muted">· {ETATS[fiche.etat]} · {fiche.categorie?.icone} {fiche.categorie?.nom}</span></p>
            {fiche.chargement ? <p className="muted">Chargement…</p> : (
              <>
                {fiche.description && <p className="adm-ann-desc">{fiche.description}</p>}
                <dl className="adm-dl adm-dl-fiche">
                  <div><dt>Publiée le</dt><dd>{new Date(fiche.created_at).toLocaleDateString("fr-FR")}</dd></div>
                  <div><dt>Modifiée le</dt><dd>{new Date(fiche.updated_at).toLocaleDateString("fr-FR")}</dd></div>
                  <div><dt>Réservations</dt><dd>{fiche.reservations_count}</dd></div>
                  <div><dt>Conversations</dt><dd>{fiche.conversations_count}</dd></div>
                  <div><dt>En favori</dt><dd>{fiche.favoris_count}</dd></div>
                  <div><dt>Photos</dt><dd>{fiche.photos?.length || 0}</dd></div>
                </dl>
                <h3>Vendeur</h3>
                <div className="adm-ann-vendeur">
                  {fiche.user?.photo_url ? <img className="adm-av" src={fiche.user.photo_url} alt="" />
                    : <span className="adm-av adm-av-init" aria-hidden="true">{(fiche.user?.prenom?.[0] || "?").toUpperCase()}</span>}
                  <span>
                    <strong>{fiche.user?.prenom} {fiche.user?.name}</strong>
                    {fiche.user?.bloque ? <span className="adm-badge adm-badge-bloque adm-badge-mini">Bloqué</span> : null}
                    <small>{fiche.user?.email}{fiche.user?.etablissement ? ` · ${fiche.user.etablissement}` : ""}</small>
                  </span>
                  <Link to={`/admin/utilisateurs?search=${encodeURIComponent(fiche.user?.email || "")}`} className="adm-btn">Voir le compte</Link>
                </div>
                <div className="adm-fiche-actions">
                  <Link to={`/annonces/${fiche.id}`} className="adm-btn">Voir sur le site</Link>
                  <button className="adm-btn adm-btn-danger-ghost" onClick={() => setASupprimer(fiche)}>Supprimer l'annonce</button>
                </div>
              </>
            )}
          </aside>
        </div>
      )}

      {aSupprimer && (
        <div className="adm-overlay adm-overlay-centre" onClick={() => setASupprimer(null)}>
          <div className="adm-modal" role="alertdialog" aria-modal="true" aria-labelledby="conf-titre" onClick={(e) => e.stopPropagation()}>
            <h2 id="conf-titre">Supprimer cette annonce ?</h2>
            <p><strong>{aSupprimer.titre}</strong> — {aSupprimer.user?.prenom} {aSupprimer.user?.name}</p>
            <p className="muted">L'annonce, ses photos, ses réservations et ses conversations seront supprimées définitivement. Le vendeur sera prévenu.</p>
            <label className="adm-motif">
              <span>Motif envoyé au vendeur (facultatif)</span>
              <textarea rows={3} maxLength={500} value={motif} onChange={(e) => setMotif(e.target.value)} placeholder="ex. Objet interdit sur la plateforme" />
            </label>
            <div className="adm-modal-actions">
              <button className="adm-btn" onClick={() => setASupprimer(null)} autoFocus>Annuler</button>
              <button className="adm-btn adm-btn-danger" onClick={supprimer} disabled={envoi}>{envoi ? "…" : "Supprimer définitivement"}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
