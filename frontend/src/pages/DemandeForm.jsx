import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api, { lireErreur } from "../api";
import { ETATS_MIN } from "../annonces";
import "./Annonces.css";
import "./Demandes.css";

// SCRUM-22 (publier) et SCRUM-23 (modifier) : formulaire de demande
export default function DemandeForm() {
  const { id } = useParams();
  const edition = Boolean(id);
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ titre: "", description: "", categorie_id: "", budget_max: "", etat_min: "bon", statut: "ouverte" });
  const [gratuit, setGratuit] = useState(false);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(edition);
  const [envoi, setEnvoi] = useState(false);

  useEffect(() => {
    api.get("/categories").then(({ data }) => setCategories(data));
    if (edition) {
      api.get(`/demandes/${id}`).then(({ data }) => {
        setForm({
          titre: data.titre, description: data.description || "", categorie_id: String(data.categorie_id),
          budget_max: Number(data.budget_max) > 0 ? String(data.budget_max) : "", etat_min: data.etat_min, statut: data.statut,
        });
        setGratuit(Number(data.budget_max) === 0);
        setLoading(false);
      }).catch((e) => {
        setMessage(e.response?.status === 403 ? "Vous ne pouvez modifier que vos propres demandes." : lireErreur(e).message);
        setLoading(false);
      });
    }
  }, [id, edition]);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const valider = () => {
    const err = {};
    if (!form.titre.trim()) err.titre = "Le titre est obligatoire.";
    if (!form.categorie_id) err.categorie_id = "Choisissez une catégorie.";
    if (!gratuit && (form.budget_max === "" || Number(form.budget_max) <= 0)) err.budget_max = "Indiquez un budget, ou cochez « Don ou échange uniquement ».";
    return err;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    const err = valider();
    setErrors(err);
    if (Object.keys(err).length) return;

    const payload = { ...form, budget_max: gratuit ? 0 : Number(form.budget_max) };
    if (!edition) delete payload.statut;

    setEnvoi(true);
    try {
      const { data } = edition ? await api.put(`/demandes/${id}`, payload) : await api.post("/demandes", payload);
      // Après publication : directement aux propositions trouvées, sinon à la liste
      navigate(data.propositions > 0 ? `/propositions?demande=${data.demande.id}` : "/mes-demandes");
    } catch (error) {
      const { message, errors } = lireErreur(error);
      setMessage(error.response?.status === 403 ? "Vous ne pouvez modifier que vos propres demandes." : message);
      const e2 = {};
      Object.entries(errors).forEach(([k, v]) => { e2[k] = v[0]; });
      setErrors(e2);
    } finally {
      setEnvoi(false);
    }
  };

  if (loading) return <main className="annonces-page"><p className="muted center">Chargement…</p></main>;

  return (
    <main className="annonces-page form-page">
      <Link to="/mes-demandes" className="lien-retour">← Mes demandes</Link>
      <form className="annonce-form" onSubmit={onSubmit} noValidate>
        <h1>{edition ? "Modifier la demande" : "Publier une demande"}</h1>
        <p className="muted">Décris l'objet que tu cherches. Les annonces qui correspondent apparaîtront dans « Mes propositions ».</p>
        {message && <p className="alert error">{message}</p>}

        <div className="champ">
          <label htmlFor="titre">Je cherche… *</label>
          <input id="titre" name="titre" maxLength={150} value={form.titre} onChange={onChange}
                 placeholder="ex. Calculatrice graphique TI-83" className={errors.titre ? "invalid" : ""} />
          {errors.titre && <small className="error">{errors.titre}</small>}
          <small className="aide">Les mots du titre et de la description servent au calcul des correspondances.</small>
        </div>

        <div className="champ">
          <label htmlFor="description">Précisions</label>
          <textarea id="description" name="description" rows={3} maxLength={2000} value={form.description}
                    onChange={onChange} placeholder="Modèle, usage, matière…" />
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
            <label htmlFor="etat_min">État minimum accepté *</label>
            <select id="etat_min" name="etat_min" value={form.etat_min} onChange={onChange}>
              {Object.entries(ETATS_MIN).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
        </div>

        <fieldset className="champ">
          <legend>Budget maximum *</legend>
          <label className="dem-check">
            <input type="checkbox" checked={gratuit} onChange={(e) => setGratuit(e.target.checked)} />
            Don ou échange uniquement (budget 0 DT)
          </label>
          {!gratuit && (
            <div className="dem-budget">
              <input id="budget_max" name="budget_max" type="number" min="0" step="0.5" value={form.budget_max}
                     onChange={onChange} aria-label="Budget maximum en DT" className={errors.budget_max ? "invalid" : ""} />
              <span>DT</span>
            </div>
          )}
          {errors.budget_max && <small className="error">{errors.budget_max}</small>}
        </fieldset>

        {edition && (
          <div className="champ">
            <label htmlFor="statut">Statut</label>
            <select id="statut" name="statut" value={form.statut} onChange={onChange}>
              <option value="ouverte">Ouverte</option>
              <option value="cloturee">Clôturée (j'ai trouvé)</option>
            </select>
          </div>
        )}

        <div className="form-actions">
          <Link to="/mes-demandes" className="ann-btn ann-btn-ghost">Annuler</Link>
          <button className="ann-btn ann-btn-primary" disabled={envoi}>
            {envoi ? "Recherche des correspondances…" : edition ? "Enregistrer" : "Publier la demande"}
          </button>
        </div>
      </form>
    </main>
  );
}
