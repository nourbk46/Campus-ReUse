// Champ de formulaire avec libellé et message d'erreur Laravel
export default function Field({ label, name, error, children, ...props }) {
  const msg = Array.isArray(error) ? error[0] : error;
  return (
    <label className="field">
      <span>{label}</span>
      {children || <input name={name} {...props} className={msg ? "invalid" : ""} />}
      {msg && <small className="error">{msg}</small>}
    </label>
  );
}
