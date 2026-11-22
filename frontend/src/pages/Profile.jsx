import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { lireErreur } from "../api";
import { useAuth } from "../context/AuthContext";
import Field from "../components/Field";
import NotificationsPanel from "../components/NotificationsPanel";
import "./Echanges.css";
import "./Profile.css";

export default function Profile() {
  const { saveUser, clearSession } = useAuth();
  const navigate = useNavigate();

  const [profil, setProfil] = useState(null);
  const [edition, setEdition] = useState(false);
  const [form, setForm] = useState({});
  const [photo, setPhoto] = useState(null);
  const [apercu, setApercu] = useState(null);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState({ texte: "", type: "" });
  const [confirmSuppr, setConfirmSuppr] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get("/profile").then(({ data }) => {
      setProfil(data);
      saveUser(data);
    });
  }, []);

  useEffect(() => {
    if (!confirmSuppr) return;
    const onKey = (e) => e.key === "Escape" && setConfirmSuppr(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [confirmSuppr]);

  useEffect(() => () => apercu && URL.revokeObjectURL(apercu), [apercu]);

  const ouvrirEdition = () => {
    setForm({
      filiere: profil.filiere || "", niveau: profil.niveau || "",
      current_password: "", password: "", password_confirmation: "",
    });
    setErrors({});
    setMessage({ texte: "", type: "" });
    setEdition(true);
  };

  const annulerEdition = () => {
    setEdition(false);
    setApercu(null);
    setPhoto(null);
    setErrors({});
  };

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onPhoto = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    if (!["image/jpeg", "image/png"].includes(f.type)) return setErrors({ photo: "Format JPG ou PNG uniquement." });
    if (f.size > 2 * 1024 * 1024) return setErrors({ photo: "La photo ne doit pas dépasser 2 Mo." });
    setErrors({});
    setPhoto(f);
    setApercu(URL.createObjectURL(f));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (form.password && form.password.length < 8)
      return setErrors({ password: "Au moins 8 caractères." });
    if (form.password !== form.password_confirmation)
      return setErrors({ password_confirmation: "Les mots de passe ne correspondent pas." });

    const fd = new FormData();
    fd.append("filiere", form.filiere);
    fd.append("niveau", form.niveau);
    if (photo) fd.append("photo", photo);
    if (form.password) {
      fd.append("current_password", form.current_password);
      fd.append("password", form.password);
      fd.append("password_confirmation", form.password_confirmation);
    }

    setLoading(true);
    try {
      const { data } = await api.post("/profile", fd);
      setProfil(data.user);
      saveUser(data.user);
      setEdition(false);
      setPhoto(null);
      setApercu(null);
      setMessage({ texte: data.message, type: "success" });
    } catch (error) {
      const { message, errors } = lireErreur(error);
      setErrors(errors);
      setMessage({ texte: message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const supprimerCompte = async () => {
    try {
      await api.delete("/profile");
      clearSession();
      navigate("/register");
    } catch (error) {
      setConfirmSuppr(false);
      setMessage({ texte: lireErreur(error).message, type: "error" });
    }
  };

  if (!profil) {
    return (
      <main className="profile-page">
        <p className="profile-loading" role="status">Chargement…</p>
      </main>
    );
  }

  const photoAffichee = apercu || profil.photo_url;

  const dateInscription = new Date(profil.created_at).toLocaleDateString("fr-FR");

  return (
    <main className="profile-page">
      {message.texte && (
        <p className={`alert ${message.type}`} role={message.type === "error" ? "alert" : "status"}>
          {message.texte}
        </p>
      )}

      {/* En-tête : photo + infos principales */}
      <section className="profile-hero">
        <div className="hero-main">
          {photoAffichee ? (
            <img src={photoAffichee} alt="Photo de profil" className="avatar-lg" />
          ) : (
            <div className="avatar-lg avatar-initiale" aria-hidden="true">
              {profil.prenom?.[0]}{profil.name?.[0]}
            </div>
          )}
          <div className="hero-id">
            <h1>{profil.prenom} {profil.name}</h1>
            <p className="muted">{profil.email}</p>
            <div className="profile-badges">
              {!profil.email_verified_at && <span className="badge warn">E-mail non confirmé</span>}
              {profil.role === "admin" && <span className="badge">Administrateur</span>}
            </div>
          </div>
          {!edition && (
            <button type="button" className="btn hero-action" onClick={ouvrirEdition}>
              Modifier le profil
            </button>
          )}
        </div>

        {!edition && (
          <dl className="hero-stats">
            <div><dt>Établissement</dt><dd>{profil.etablissement || "—"}</dd></div>
            <div><dt>Filière</dt><dd>{profil.filiere || "—"}</dd></div>
            <div><dt>Niveau</dt><dd>{profil.niveau || "—"}</dd></div>
            <div><dt>Membre depuis</dt><dd>{dateInscription}</dd></div>
          </dl>
        )}
      </section>

      {!edition ? (
        <>
          {/* Grille de sections */}
          <div className="profile-grid">
            <section className="panel">
              <h3>Coordonnées</h3>
              <dl className="infos">
                <div><dt>Prénom</dt><dd>{profil.prenom || "—"}</dd></div>
                <div><dt>Nom</dt><dd>{profil.name || "—"}</dd></div>
                <div><dt>E-mail</dt><dd>{profil.email}</dd></div>
              </dl>
            </section>

            <section className="panel">
              <h3>Compte</h3>
              <dl className="infos">
                <div><dt>Rôle</dt><dd>{profil.role === "admin" ? "Administrateur" : "Utilisateur"}</dd></div>
                <div><dt>E-mail</dt><dd>{profil.email_verified_at ? "Confirmé" : "Non confirmé"}</dd></div>
                <div><dt>Inscription</dt><dd>{dateInscription}</dd></div>
              </dl>
            </section>

            {/* SCRUM-34 : notifications par e-mail */}
            <NotificationsPanel profil={profil} onChange={setProfil} />
          </div>

          {/* L'administrateur ne peut pas supprimer son propre compte */}
          {profil.role !== "admin" && (
          <section className="panel panel-danger">
            <div>
              <h3>Supprimer le compte</h3>
              <p className="panel-text">
                Ton compte et toutes tes annonces seront définitivement supprimés.
              </p>
            </div>
            <button type="button" className="btn btn-danger-outline btn-sm" onClick={() => setConfirmSuppr(true)}>
              Supprimer mon compte
            </button>
          </section>
          )}
        </>
      ) : (
        <form onSubmit={onSubmit}>
          <div className="profile-grid">
            <section className="panel">
              <h3>Photo de profil</h3>
              <Field label="JPG ou PNG, 2 Mo maximum" error={errors.photo}>
                <input type="file" accept="image/png,image/jpeg" onChange={onPhoto} />
              </Field>
            </section>

            <section className="panel">
              <h3>Études</h3>
              <Field label="Filière" name="filiere" value={form.filiere} onChange={onChange} error={errors.filiere} required />
              <Field label="Niveau" error={errors.niveau}>
                <select name="niveau" value={form.niveau} onChange={onChange}>
                  {["L1", "L2", "L3", "M1", "M2", "Ingénieur", "Doctorat"].map((n) => <option key={n}>{n}</option>)}
                </select>
              </Field>
            </section>

            <section className="panel">
              <h3>Mot de passe <small className="muted">(facultatif)</small></h3>
              <Field label="Mot de passe actuel" name="current_password" type="password" autoComplete="current-password"
                     value={form.current_password} onChange={onChange} error={errors.current_password} />
              <Field label="Nouveau" name="password" type="password" autoComplete="new-password"
                     value={form.password} onChange={onChange} error={errors.password} />
              <Field label="Confirmer" name="password_confirmation" type="password" autoComplete="new-password"
                     value={form.password_confirmation} onChange={onChange} error={errors.password_confirmation} />
            </section>
          </div>

          <div className="actions">
            <button type="submit" className="btn" disabled={loading}>
              {loading ? "Enregistrement…" : "Enregistrer"}
            </button>
            <button type="button" className="btn btn-secondary" onClick={annulerEdition}>Annuler</button>
          </div>
        </form>
      )}

      {confirmSuppr && (
        <div className="modal-overlay" onClick={() => setConfirmSuppr(false)}>
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-titre"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="modal-titre">Supprimer ton compte ?</h2>
            <p>Ton compte et toutes tes annonces seront définitivement supprimés. Cette action est irréversible.</p>
            <div className="actions">
              <button type="button" className="btn btn-secondary" onClick={() => setConfirmSuppr(false)} autoFocus>
                Annuler
              </button>
              <button type="button" className="btn btn-danger" onClick={supprimerCompte}>Oui, supprimer</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}