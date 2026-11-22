import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import api, { lireErreur } from "../api";
import Field from "../components/Field";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get("token");
  const email = params.get("email");

  const [form, setForm] = useState({ password: "", password_confirmation: "" });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [expire, setExpire] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!token || !email) {
    return (
      <div className="card auth-card">
        <p className="alert error">Lien incomplet. Refaites une demande de réinitialisation.</p>
        <Link to="/forgot-password" className="btn">Nouvelle demande</Link>
      </div>
    );
  }

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.password_confirmation) {
      setErrors({ password_confirmation: "Les mots de passe ne correspondent pas." });
      return;
    }
    setLoading(true);
    try {
      await api.post("/reset-password", { token, email, ...form });
      navigate("/login?reset=1");
    } catch (error) {
      const { message, errors } = lireErreur(error);
      setMessage(message);
      setErrors(errors);
      setExpire(error.response?.status === 422 && !Object.keys(errors).length);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card auth-card">
      <h1>Nouveau mot de passe</h1>
      <p className="muted">Compte : {email}</p>
      {message && <p className="alert error">{message}</p>}
      {expire && <p><Link to="/forgot-password">Demander un nouveau lien</Link></p>}
      <form onSubmit={onSubmit}>
        <Field label="Nouveau mot de passe (8 caractères min.)" name="password" type="password"
               value={form.password} onChange={onChange} error={errors.password} minLength={8} required />
        <Field label="Confirmer" name="password_confirmation" type="password"
               value={form.password_confirmation} onChange={onChange} error={errors.password_confirmation} required />
        <button className="btn btn-full" disabled={loading}>{loading ? "Enregistrement…" : "Enregistrer"}</button>
      </form>
    </div>
  );
}
