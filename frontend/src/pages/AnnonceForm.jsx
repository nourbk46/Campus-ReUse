import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api, { lireErreur } from "../api";
import { ETATS, TYPES } from "../annonces";
import "./Annonces.css";

// SCRUM-17 (publier) et SCRUM-18 (modifier) : le même formulaire
const MAX_PHOTOS = 5;
const MAX_TAILLE = 5 * 1024 * 1024; // 5 Mo

export default function AnnonceForm() {
  const { id } = useParams();            // présent en modification
  const edition = Boolean(id);
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ titre: "", description: "", categorie_id: "", etat: "", type: "", prix: "", statut: "disponible" });
  const [anciennes, setAnciennes] = useState([]);     // photos déjà en ligne
  const [supprimees, setSupprimees] = useState([]);   // ids à retirer
  const [nouvelles, setNouvelles] = useState([]);     // { file, url }
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(edition);
  const [envoi, setEnvoi] = useState(false);

  useEffect(() => {
    api.get("/categories").then(({ data }) => setCategories(data));
    if (edition) {
      api.get(`/annonces/${id}`).then(({ data }) => {
        setForm({
          titre: data.titre, description: data.description || "", categorie_id: String(data.categorie_id),
          etat: data.etat, type: data.type, prix: data.prix ?? "", statut: data.statut,
        });
        setAnciennes(data.photos);
        setLoading(false);
      }).catch((e) => { setMessage(lireErreur(e).message); setLoading(false); });
    }
  }, [id, edition]);

  // Libère les aperçus en quittant la page
  useEffect(() => () => nouvelles.forEach((n) => URL.revokeObjectURL(n.url)), [nouvelles]);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const restantes = anciennes.filter((p) => !supprimees.includes(p.id));
  const nbPhotos = restantes.length + nouvelles.length;

  const ajouterPhotos = (e) => {
    const fichiers = Array.from(e.target.files);
    e.target.value = "";
    const err = [];
    const ok = [];
    fichiers.forEach((f) => {
      if (!["image/jpeg", "image/png"].includes(f.type)) err.push(`${f.name} : JPG ou PNG uniquement.`);
      else if (f.size > MAX_TAILLE) err.push(`${f.name} : 5 Mo maximum.`);
      else ok.push({ file: f, url: URL.createObjectURL(f) });
    });
    const place = MAX_PHOTOS - nbPhotos;
    if (ok.length > place) err.push(`${MAX_PHOTOS} photos maximum.`);
    setNouvelles([...nouvelles, ...ok.slice(0, Math.max(place, 0))]);
    setErrors({ ...errors, photos: err.join(" ") || undefined });
  };

  const retirerNouvelle = (i) => {
    URL.revokeObjectURL(nouvelles[i].url);
    setNouvelles(nouvelles.filter((_, j) => j !== i));
  };

  const valider = () => {
    const err = {};
    if (!form.titre.trim()) err.titre = "Le titre est obligatoire.";
    if (!form.categorie_id) err.categorie_id = "Choisissez une catégorie.";
    if (!form.etat) err.etat = "Indiquez l'état de l'objet.";
    if (!form.type) err.type = "Choisissez le type d'annonce.";
    if (form.type === "vente" && (form.prix === "" || Number(form.prix) < 0)) err.prix = "Indiquez un prix valide.";
    if (nbPhotos < 1) err.photos = "Ajoutez au moins une photo.";
    return err;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    const err = valider();
    setErrors(err);
    if (Object.keys(err).length) return;

    const fd = new FormData();
    ["titre", "description", "categorie_id", "etat", "type"].forEach((k) => fd.append(k, form[k]));
    if (form.type === "vente") fd.append("prix", form.prix);
    if (edition) {
      fd.append("statut", form.statut);
      supprimees.forEach((pid) => fd.append("photos_supprimees[]", pid));
    }
    nouvelles.forEach((n) => fd.append("photos[]", n.file));

    setEnvoi(true);
    try {
      const { data } = await api.post(edition ? `/annonces/${id}` : "/annonces", fd);
      navigate(`/annonces/${data.annonce.id}`);
    } catch (error) {
      const { message, errors } = lireErreur(error);
      setMessage(error.response?.status === 403 ? "Vous ne pouvez modifier que vos propres annonces." : message);
      // regroupe les erreurs photos.0, photos.1… sous « photos »
      const e2 = {};
      Object.entries(errors).forEach(([k, v]) => { e2[k.startsWith("photos") ? "photos" : k] = v[0]; });
      setErrors(e2);
    } finally {
      setEnvoi(false);
    }
  };

  if (loading) return <main className="annonces-page"><p className="muted center">Chargement…</p></main>;

  return (
    <main className="annonces-page form-page">
      <Link to={edition ? "/mes-annonces" : "/annonces"} className="lien-retour">← Retour</Link>
      <form className="annonce-form" onSubmit={onSubmit} noValidate>
        <h1>{edition ? "Modifier l'annonce" : "Déposer une annonce"}</h1>
        <p className="muted">Les champs marqués * sont obligatoires.</p>
        {message && <p className="alert error">{message}</p>}

        <div className="champ">
          <label htmlFor="titre">Titre *</label>
          <input id="titre" name="titre" maxLength={150} value={form.titre} onChange={onChange}
                 placeholder="ex. Livre d'analyse L1" className={errors.titre ? "invalid" : ""} />
          {errors.titre && <small className="error">{errors.titre}</small>}
        </div>

        <div className="champ">
          <label htmlFor="description">Description</label>
          <textarea id="description" name="description" rows={4} maxLength={2000} value={form.description}
                    onChange={onChange} placeholder="État détaillé, accessoires inclus, lieu de remise…" />
        </div>

        <div className="champs-ligne">
          <div className="champ">
            <label htmlFor="categorie_id">Catégorie *</label>
            <select id="categorie_id" name="categorie_id" value={form.categorie_id} onChange={onChange}
                    className={errors.categorie_id ? "invalid" : ""}>
              <option value="">— Choisir —</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.icone} {c.nom}</option>)}
            </select>
            {errors.categorie_id && <small className="error">{errors.categorie_id}</small>}
          </div>
          <div className="champ">
            <label htmlFor="etat">État *</label>
            <select id="etat" name="etat" value={form.etat} onChange={onChange} className={errors.etat ? "invalid" : ""}>
              <option value="">— Choisir —</option>
              {Object.entries(ETATS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            {errors.etat && <small className="error">{errors.etat}</small>}
          </div>
        </div>

        <fieldset className="champ">
          <legend>Type *</legend>
          <div className="type-choix">
            {Object.entries(TYPES).map(([k, v]) => (
              <label key={k} className={form.type === k ? "type-option actif" : "type-option"}>
                <input type="radio" name="type" value={k} checked={form.type === k} onChange={onChange} />
                <span aria-hidden="true">{{ don: "🎁", echange: "🔄", vente: "💰" }[k]}</span> {v}
              </label>
            ))}
          </div>
          {errors.type && <small className="error">{errors.type}</small>}
        </fieldset>

        {form.type === "vente" && (
          <div className="champ champ-prix">
            <label htmlFor="prix">Prix (DT) *</label>
            <input id="prix" name="prix" type="number" min="0" step="0.5" value={form.prix} onChange={onChange}
                   className={errors.prix ? "invalid" : ""} />
            {errors.prix && <small className="error">{errors.prix}</small>}
          </div>
        )}

        {edition && form.statut !== "cedee" && (
          <div className="champ">
            <label htmlFor="statut">Statut</label>
            <select id="statut" name="statut" value={form.statut} onChange={onChange}>
              <option value="disponible">Disponible</option>
              <option value="reservee">Réservée</option>
            </select>
          </div>
        )}

        <fieldset className="champ">
          <legend>Photos * <span className="muted">({nbPhotos}/{MAX_PHOTOS} — JPG ou PNG, 5 Mo max.)</span></legend>
          <div className="photos-grille">
            {restantes.map((p) => (
              <div key={p.id} className="photo-item">
                <img src={p.url} alt="" />
                <button type="button" onClick={() => setSupprimees([...supprimees, p.id])} aria-label="Retirer la photo">✕</button>
              </div>
            ))}
            {nouvelles.map((n, i) => (
              <div key={n.url} className="photo-item nouvelle">
                <img src={n.url} alt="" />
                <button type="button" onClick={() => retirerNouvelle(i)} aria-label="Retirer la photo">✕</button>
              </div>
            ))}
            {nbPhotos < MAX_PHOTOS && (
              <label className="photo-ajout">
                <input type="file" accept="image/jpeg,image/png" multiple onChange={ajouterPhotos} />
                <span aria-hidden="true">＋</span>
                Ajouter
              </label>
            )}
          </div>
          {errors.photos && <small className="error">{errors.photos}</small>}
        </fieldset>

        <div className="form-actions">
          <Link to={edition ? "/mes-annonces" : "/annonces"} className="ann-btn ann-btn-ghost">Annuler</Link>
          <button className="ann-btn ann-btn-primary" disabled={envoi}>
            {envoi ? "Enregistrement…" : edition ? "Enregistrer les modifications" : "Publier l'annonce"}
          </button>
        </div>
      </form>
    </main>
  );
}
