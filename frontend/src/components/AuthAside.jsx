import { useState } from "react";
import { Link } from "react-router-dom";

// Panneau de gauche des pages Connexion / Inscription / Mot de passe oublié
function Check() {
  return (
    <svg viewBox="0 0 20 20" width="20" height="20" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="10" fill="rgba(255,255,255,.16)" />
      <path d="m6 10.2 2.8 2.8L14 7.6" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function AuthAside({ titre, texte, points }) {
  return (
    <aside className="auth-aside">
      <Link to="/" className="auth-brand">
        <span className="auth-brand-mark" aria-hidden="true">♻</span>
        Campus ReUse
      </Link>

      <div className="auth-aside-body">
        <h2>{titre}</h2>
        <p>{texte}</p>
        <ul>
          {points.map((p) => <li key={p}><Check />{p}</li>)}
        </ul>
      </div>

      {/* Petit aperçu de l'application */}
      <div className="auth-apercu" aria-hidden="true">
        <div className="auth-apercu-carte">
          <span className="auth-apercu-photo">📚</span>
          <span className="auth-apercu-txt"><strong>Lot de manuels de L1</strong><small>Livres & cours · ISET Rades</small></span>
          <span className="auth-apercu-prix">Gratuit</span>
        </div>
        <div className="auth-apercu-bulle">
          <span>✓</span>
          <span><strong>Réservation acceptée</strong><small>Remise demain à la bibliothèque</small></span>
        </div>
      </div>

      <small className="auth-aside-foot">Gratuit · Entre étudiants · Écoresponsable</small>
    </aside>
  );
}

// Champ mot de passe avec bouton Afficher / Masquer
export function MotDePasse({ label, name, value, onChange, error, autoComplete, required, aide }) {
  const [visible, setVisible] = useState(false);
  const msg = Array.isArray(error) ? error[0] : error;
  return (
    <label className="field">
      <span>{label}</span>
      <div className="auth-mdp">
        <input name={name} type={visible ? "text" : "password"} value={value} onChange={onChange}
               autoComplete={autoComplete} required={required} className={msg ? "invalid" : ""} />
        <button type="button" onClick={() => setVisible(!visible)} aria-label={visible ? "Masquer le mot de passe" : "Afficher le mot de passe"}>
          {visible ? "Masquer" : "Afficher"}
        </button>
      </div>
      {aide}
      {msg && <small className="error">{msg}</small>}
    </label>
  );
}
