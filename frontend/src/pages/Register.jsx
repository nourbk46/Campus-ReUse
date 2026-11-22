import { useState } from "react";
import { Link } from "react-router-dom";
import api, { lireErreur } from "../api";
import Field from "../components/Field";
import AuthAside, { MotDePasse } from "../components/AuthAside";
import "./Login.css";

const vide = {
  name: "", prenom: "", email: "", password: "", password_confirmation: "",
  filiere: "", niveau: "", etablissement: "",
};

function force(mdp) {
  let n = 0;
  if (mdp.length >= 8) n++;
  if (/[A-Z]/.test(mdp) && /[a-z]/.test(mdp)) n++;
  if (/\d/.test(mdp)) n++;
  if (/[^A-Za-z0-9]/.test(mdp) || mdp.length >= 12) n++;
  return n;
}
const NIVEAUX = ["Trop court", "Faible", "Moyen", "Bon", "Excellent"];

export default function Register() {
  const [form, setForm] = useState(vide);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [succes, setSucces] = useState(false);
  const [loading, setLoading] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const valider = () => {
    const err = {};
    Object.entries(form).forEach(([k, v]) => { if (!v.trim()) err[k] = "Champ obligatoire."; });
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) err.email = "Format d'e-mail invalide.";
    if (form.password && form.password.length < 8) err.password = "Au moins 8 caractères.";
    if (form.password !== form.password_confirmation)
      err.password_confirmation = "Les mots de passe ne correspondent pas.";
    return err;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    const err = valider();
    setErrors(err);
    if (Object.keys(err).length) return;

    setLoading(true);
    try {
      const { data } = await api.post("/register", form);
      setSucces(true);
      setMessage(data.message);
      setForm(vide);
    } catch (error) {
      const { message, errors } = lireErreur(error);
      setMessage(message);
      setErrors(errors);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page auth-wide">
      <AuthAside
        titre="Rejoins la communauté du partage étudiant."
        texte="Donne une seconde vie à tes livres, ta tech et tes fournitures, et trouve ce qu'il te faut près de chez toi."
        points={["Publie tes objets en quelques clics", "Reçois des propositions qui correspondent à tes demandes", "Échange en toute confiance avec d'autres étudiants"]}
      />

      <section className="auth-main">
        <div className="auth-form">
          {succes ? (
            <>
              <div className="auth-succes-ico" aria-hidden="true">✓</div>
              <h1>Compte créé !</h1>
              <p className="auth-subtitle">Plus qu'une étape : confirme ton adresse e-mail.</p>
              <p className="alert success" role="status">{message}</p>
              <p className="auth-subtitle">Clique sur le lien reçu par e-mail pour activer ton compte.</p>
              <Link to="/login" className="btn btn-full">Aller à la connexion</Link>
            </>
          ) : (
            <>
              <span className="auth-eyebrow">Inscription · gratuite</span>
              <h1>Crée ton compte</h1>
              <p className="auth-subtitle">Moins de 2 minutes pour rejoindre les étudiants de ton campus.</p>
              {message && <p className="alert error" role="alert">{message}</p>}

              <form onSubmit={onSubmit} noValidate>
                <p className="auth-etape"><span>1</span> Qui es-tu ?</p>
                <div className="row">
                  <Field label="Nom" name="name" autoComplete="family-name" value={form.name} onChange={onChange} error={errors.name} />
                  <Field label="Prénom" name="prenom" autoComplete="given-name" value={form.prenom} onChange={onChange} error={errors.prenom} />
                </div>
                <Field label="E-mail" name="email" type="email" autoComplete="email" value={form.email} onChange={onChange} error={errors.email} />
                <p className="auth-etape"><span>2</span> Tes études</p>
                <Field label="Établissement" name="etablissement" value={form.etablissement} onChange={onChange}
                       error={errors.etablissement} placeholder="ex. ISET Rades" />
                <div className="row">
                  <Field label="Filière" name="filiere" value={form.filiere} onChange={onChange} error={errors.filiere} />
                  <Field label="Niveau" error={errors.niveau}>
                    <select name="niveau" value={form.niveau} onChange={onChange} className={errors.niveau ? "invalid" : ""}>
                      <option value="">— Choisir —</option>
                      {["L1", "L2", "L3", "M1", "M2", "Ingénieur", "Doctorat"].map((n) => (
                        <option key={n}>{n}</option>
                      ))}
                    </select>
                  </Field>
                </div>
                <p className="auth-etape"><span>3</span> Sécurité</p>
                <div className="row">
                  <MotDePasse label="Mot de passe" name="password" autoComplete="new-password"
                              value={form.password} onChange={onChange} error={errors.password}
                              aide={form.password && (
                                <span className={`auth-force f${force(form.password)}`}>
                                  <span className="auth-force-barres"><i /><i /><i /><i /></span>
                                  {NIVEAUX[force(form.password)]}
                                </span>
                              )} />
                  <MotDePasse label="Confirmer" name="password_confirmation" autoComplete="new-password"
                              value={form.password_confirmation} onChange={onChange} error={errors.password_confirmation} />
                </div>
                <button type="submit" className="btn btn-full" disabled={loading}>
                  {loading ? "Création…" : "Créer mon compte"}
                </button>
              </form>

              <p className="auth-mentions">En créant un compte, tu t'engages à publier uniquement des objets que tu possèdes et à respecter les autres étudiants.</p>
              <p className="center">Déjà inscrit ? <Link to="/login">Se connecter</Link></p>
            </>
          )}
        </div>
      </section>
    </main>
  );
}