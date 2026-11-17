import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { lireErreur } from "../api";
import { useAuth } from "../context/AuthContext";
import Field from "../components/Field";
import AuthAside, { MotDePasse } from "../components/AuthAside";
import "./Login.css";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [form, setForm] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      navigate(user.role === "admin" ? "/admin" : "/");
    } catch (error) {
      setMessage(lireErreur(error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <AuthAside
        titre="Bon retour parmi nous !"
        texte="Retrouve tes annonces, tes messages et tes réservations là où tu les as laissés."
        points={["Tes conversations t'attendent", "Suis tes réservations en temps réel", "Découvre les nouvelles annonces de ton campus"]}
      />

      <section className="auth-main">
        <div className="auth-form">
          <span className="auth-eyebrow">Connexion</span>
          <h1>Content de te revoir</h1>
          <p className="auth-subtitle">Connecte-toi pour accéder à ton espace étudiant.</p>

          {params.get("verified") && (
            <p className="alert success" role="status">E-mail confirmé. Tu peux te connecter.</p>
          )}
          {params.get("reset") && (
            <p className="alert success" role="status">Mot de passe modifié. Connecte-toi.</p>
          )}
          {message && <p className="alert error" role="alert">{message}</p>}

          <form onSubmit={onSubmit}>
            <Field label="E-mail" name="email" type="email" autoComplete="email"
                   value={form.email} onChange={onChange} required />
            <MotDePasse label="Mot de passe" name="password" autoComplete="current-password"
                        value={form.password} onChange={onChange} required />
            <p className="right"><Link to="/forgot-password">Mot de passe oublié ?</Link></p>
            <button type="submit" className="btn btn-full" disabled={loading}>
              {loading ? "Connexion…" : "Se connecter"}
            </button>
          </form>

          <div className="auth-separateur"><span>Nouveau sur Campus ReUse ?</span></div>
          <Link to="/register" className="auth-btn-secondaire">Créer un compte gratuitement</Link>
        </div>
      </section>
    </main>
  );
}