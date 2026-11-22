import { useState } from "react";
import api, { lireErreur } from "../api";
import { useAuth } from "../context/AuthContext";

export default function NotificationsPanel({ profil, onChange }) {
  const { saveUser } = useAuth();
  const [actif, setActif] = useState(Boolean(profil.notifications_email));
  const [etat, setEtat] = useState({ texte: "", erreur: false });
  const [envoi, setEnvoi] = useState(false);

  const basculer = async () => {
    const valeur = !actif;
    setActif(valeur);
    setEnvoi(true);
    try {
      const { data } = await api.post("/profile", { notifications_email: valeur ? 1 : 0 });
      saveUser(data.user);
      onChange?.(data.user);
      setEtat({ texte: valeur ? "E-mails activés." : "E-mails désactivés.", erreur: false });
    } catch (e) {
      setActif(!valeur);
      setEtat({ texte: lireErreur(e).message, erreur: true });
    } finally {
      setEnvoi(false);
    }
  };

  return (
    <section className="panel">
      <h3>Notifications</h3>
      <div className="notif-ligne">
        <div>
          <strong>Recevoir les notifications par e-mail</strong>
          <p className="notif-aide">Nouveaux messages, réservations, échanges à confirmer.</p>
        </div>
        <button type="button" role="switch" aria-checked={actif} disabled={envoi}
                className={`notif-switch ${actif ? "on" : ""}`} onClick={basculer}
                aria-label="Recevoir les notifications par e-mail">
          <span />
        </button>
      </div>
      {etat.texte && <p className={`notif-etat ${etat.erreur ? "err" : ""}`} role="status">{etat.texte}</p>}
    </section>
  );
}
