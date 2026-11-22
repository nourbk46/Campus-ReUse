import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api, { lireErreur } from "../api";
import AnnonceCard from "../components/AnnonceCard";
import { ETATS, TYPES } from "../annonces";
import { useAuth } from "../context/AuthContext";
import "./Annonces.css";


const FILTRES = ["q", "categorie", "type", "etat", "prix_min", "prix_max", "tri", "page"];

export default function Annonces() {
  const { user } = useAuth();
  const [params, setParams] = useSearchParams();
  const [categories, setCategories] = useState([]);
  const [resultat, setResultat] = useState(null);
  const [erreur, setErreur] = useState("");
  const [recherche, setRecherche] = useState(params.get("q") || "");
  const [filtresOuverts, setFiltresOuverts] = useState(false);

  useEffect(() => {
    api.get("/categories").then(({ data }) => setCategories(data)).catch(() => {});
  }, []);

  useEffect(() => {
    const query = {};
    FILTRES.forEach((k) => params.get(k) && (query[k] = params.get(k)));
    setResultat(null);
    setErreur("");
    api.get("/annonces", { params: query })
      .then(({ data }) => setResultat(data))
      .catch((e) => setErreur(lireErreur(e).message));
  }, [params]);

  const changer = (cle, valeur) => {
    const p = new URLSearchParams(params);
    valeur ? p.set(cle, valeur) : p.delete(cle);
    if (cle !== "page") p.delete("page");
    setParams(p);
  };

  const onRecherche = (e) => {
    e.preventDefault();
    changer("q", recherche.trim());
  };

  const reinitialiser = () => {
    setRecherche("");
    setParams({});
  };

  const nbFiltres = ["categorie", "type", "etat", "prix_min", "prix_max"].filter((k) => params.get(k)).length;
  const page = resultat?.current_page || 1;

  return (
    <main className="annonces-page">
      <section className="annonces-header">
        <div>
          <span className="eyebrow">ANNONCES</span>
          <h1>Trouve ton prochain objet</h1>
          <p className="muted">Livres, matériel, fournitures… proposés par les étudiants.</p>
        </div>
        {user && user.role !== "admin" && (
          <Link to="/annonces/nouvelle" className="ann-btn ann-btn-primary">+ Déposer une annonce</Link>
        )}
      </section>

      {/* SCRUM-20 : barre de recherche */}
      <form className="search-bar" onSubmit={onRecherche} role="search">
        <span aria-hidden="true">🔎</span>
        <input
          type="search"
          placeholder="Rechercher un objet (titre ou description)…"
          value={recherche}
          onChange={(e) => setRecherche(e.target.value)}
          aria-label="Rechercher une annonce"
        />
        <button className="ann-btn ann-btn-primary">Rechercher</button>
        <button type="button" className="ann-btn ann-btn-ghost filtres-toggle"
                onClick={() => setFiltresOuverts(!filtresOuverts)} aria-expanded={filtresOuverts}>
          Filtres{nbFiltres ? ` (${nbFiltres})` : ""}
        </button>
      </form>

      <div className="annonces-layout">
        {/* SCRUM-21 : panneau de filtres */}
        <aside className={`filtres ${filtresOuverts ? "ouvert" : ""}`} aria-label="Filtres">
          <div className="filtre">
            <label htmlFor="f-cat">Catégorie</label>
            <select id="f-cat" value={params.get("categorie") || ""} onChange={(e) => changer("categorie", e.target.value)}>
              <option value="">Toutes</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.icone} {c.nom}</option>)}
            </select>
          </div>

          <fieldset className="filtre">
            <legend>Type</legend>
            <div className="chips">
              <button type="button" className={!params.get("type") ? "chip actif" : "chip"} onClick={() => changer("type", "")}>Tous</button>
              {Object.entries(TYPES).map(([k, v]) => (
                <button type="button" key={k} className={params.get("type") === k ? "chip actif" : "chip"}
                        onClick={() => changer("type", k)}>{v}</button>
              ))}
            </div>
          </fieldset>

          <div className="filtre">
            <label htmlFor="f-etat">État</label>
            <select id="f-etat" value={params.get("etat") || ""} onChange={(e) => changer("etat", e.target.value)}>
              <option value="">Tous</option>
              {Object.entries(ETATS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>

          <fieldset className="filtre">
            <legend>Prix (DT)</legend>
            <div className="prix-range">
              <input type="number" min="0" placeholder="Min" aria-label="Prix minimum"
                     defaultValue={params.get("prix_min") || ""} key={`min-${params.get("prix_min")}`}
                     onBlur={(e) => changer("prix_min", e.target.value)} />
              <span>–</span>
              <input type="number" min="0" placeholder="Max" aria-label="Prix maximum"
                     defaultValue={params.get("prix_max") || ""} key={`max-${params.get("prix_max")}`}
                     onBlur={(e) => changer("prix_max", e.target.value)} />
            </div>
          </fieldset>

          <button type="button" className="ann-btn ann-btn-ghost ann-btn-full" onClick={reinitialiser}>
            Réinitialiser
          </button>
        </aside>

        <section className="annonces-resultats">
          <div className="resultats-barre">
            <p className="muted" aria-live="polite">
              {resultat ? `${resultat.total} annonce${resultat.total > 1 ? "s" : ""}` : "Chargement…"}
              {params.get("q") && <> pour « <strong>{params.get("q")}</strong> »</>}
            </p>
            <label className="tri">
              Trier par
              <select value={params.get("tri") || "recent"} onChange={(e) => changer("tri", e.target.value === "recent" ? "" : e.target.value)}>
                <option value="recent">Plus récentes</option>
                <option value="ancien">Plus anciennes</option>
                <option value="prix_asc">Prix croissant</option>
                <option value="prix_desc">Prix décroissant</option>
              </select>
            </label>
          </div>

          {erreur && <p className="alert error">{erreur}</p>}

          {resultat && resultat.data.length === 0 && (
            <div className="vide">
              <span aria-hidden="true">🔍</span>
              <h2>Aucun résultat</h2>
              <p className="muted">Essaie un autre mot-clé ou retire des filtres.</p>
              {(params.toString() !== "") && (
                <button className="ann-btn ann-btn-ghost" onClick={reinitialiser}>Voir toutes les annonces</button>
              )}
            </div>
          )}

          {!resultat && !erreur && (
            <div className="annonces-grid">
              {Array.from({ length: 6 }).map((_, i) => <div key={i} className="annonce-card squelette" />)}
            </div>
          )}

          {resultat && resultat.data.length > 0 && (
            <>
              <div className="annonces-grid">
                {resultat.data.map((a) => <AnnonceCard key={a.id} annonce={a} />)}
              </div>
              {resultat.last_page > 1 && (
                <nav className="pagination" aria-label="Pages">
                  <button className="ann-btn ann-btn-ghost" disabled={page <= 1} onClick={() => changer("page", page - 1)}>← Précédent</button>
                  <span>Page {page} / {resultat.last_page}</span>
                  <button className="ann-btn ann-btn-ghost" disabled={page >= resultat.last_page} onClick={() => changer("page", page + 1)}>Suivant →</button>
                </nav>
              )}
            </>
          )}
        </section>
      </div>
    </main>
  );
}
