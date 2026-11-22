import { useState } from "react";
import { Link } from "react-router-dom";
import api, { lireErreur } from "../api";
import Field from "../components/Field";
import AuthAside from "../components/AuthAside";
import "./Login.css";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);
    try {
      const { data } = await api.post("/forgot-password", { email });
      setIsError(false);
      setMessage(data.message);
    } catch (error) {
      setIsError(true);
      setMessage(lireErreur(error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <AuthAside
        titre="Pas de panique !"
        texte="Ça arrive à tout le monde. On t'envoie un lien pour choisir un nouveau mot de passe."
        points={["Lien valable 30 minutes", "Ton compte et tes annonces restent intacts", "Reconnecte-toi en moins d'une minute"]}
      />

      <section className="auth-main">
        <div className="auth-form">
          <span className="auth-eyebrow">Mot de passe oublié</span>
          <h1>Réinitialise ton mot de passe</h1>
          <p className="auth-subtitle">Saisis ton e-mail, nous t'enverrons un lien valable 30 minutes.</p>

          {message && (
            <p className={`alert ${isError ? "error" : "success"}`} role={isError ? "alert" : "status"}>
              {message}
            </p>
          )}

          <form onSubmit={onSubmit}>
            <Field label="E-mail" name="email" type="email" autoComplete="email"
                   value={email} onChange={(e) => setEmail(e.target.value)} required />
            <button type="submit" className="btn btn-full" disabled={loading}>
              {loading ? "Envoi…" : "Envoyer le lien"}
            </button>
          </form>

          <p className="center"><Link to="/login">← Retour à la connexion</Link></p>
        </div>
      </section>
    </main>
  );
}