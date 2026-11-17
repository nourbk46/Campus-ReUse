import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api, { lireErreur } from "../api";
import { useAuth } from "../context/AuthContext";
import { prixTexte } from "../annonces";
import "./Annonces.css";
import "./Echanges.css";

// SCRUM-28 : messagerie — liste des conversations + discussion (actualisée toutes les 5 s)
function heure(date) {
  const d = new Date(date);
  const auj = new Date().toDateString() === d.toDateString();
  return auj ? d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
             : d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

function Avatar({ u }) {
  return u?.photo_url
    ? <img className="msg-avatar" src={u.photo_url} alt="" />
    : <span className="msg-avatar msg-avatar-init" aria-hidden="true">{u?.prenom?.[0]?.toUpperCase()}</span>;
}

export default function Messages() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState(null);
  const [conv, setConv] = useState(null);
  const [texte, setTexte] = useState("");
  const [erreur, setErreur] = useState("");
  const [envoi, setEnvoi] = useState(false);
  const finRef = useRef(null);

  const chargerListe = () =>
    api.get("/conversations").then(({ data }) => setConversations(data)).catch((e) => setErreur(lireErreur(e).message));

  const chargerConv = (cid) =>
    api.get(`/conversations/${cid}`).then(({ data }) => setConv(data))
      .catch((e) => setErreur(e.response?.status === 403 ? "Cette conversation ne te concerne pas." : lireErreur(e).message));

  useEffect(() => { chargerListe(); }, []);

  // Ouvre la conversation sélectionnée et l'actualise régulièrement
  useEffect(() => {
    setConv(null);
    setErreur("");
    if (!id) return;
    chargerConv(id).then(chargerListe);
    const t = setInterval(() => chargerConv(id), 5000);
    return () => clearInterval(t);
  }, [id]);

  useEffect(() => { finRef.current?.scrollIntoView({ block: "end" }); }, [conv?.messages?.length]);

  const envoyer = async (e) => {
    e.preventDefault();
    if (!texte.trim()) return setErreur("Le message ne peut pas être vide.");
    setEnvoi(true);
    setErreur("");
    try {
      await api.post(`/conversations/${id}/messages`, { contenu: texte });
      setTexte("");
      await chargerConv(id);
      chargerListe();
    } catch (err) {
      setErreur(lireErreur(err).message);
    } finally {
      setEnvoi(false);
    }
  };

  const autre = conv && (conv.acheteur_id === user.id ? conv.vendeur : conv.acheteur);

  return (
    <main className="annonces-page msg-page">
      <section className="annonces-header">
        <div>
          <span className="eyebrow">MESSAGERIE</span>
          <h1>Messages</h1>
        </div>
      </section>

      <div className={`msg-layout ${id ? "msg-ouvert" : ""}`}>
        {/* Liste des conversations */}
        <aside className="msg-liste" aria-label="Conversations">
          {!conversations && <p className="muted msg-vide-liste">Chargement…</p>}
          {conversations?.length === 0 && (
            <div className="msg-vide-liste">
              <p><strong>Aucune conversation</strong></p>
              <p className="muted">Ouvre une annonce et clique « Contacter le vendeur ».</p>
              <Link to="/annonces" className="ann-btn ann-btn-ghost">Voir les annonces</Link>
            </div>
          )}
          <ul>
            {conversations?.map((c) => {
              const o = c.acheteur_id === user.id ? c.vendeur : c.acheteur;
              return (
                <li key={c.id}>
                  <button className={`msg-conv ${String(c.id) === id ? "actif" : ""}`} onClick={() => navigate(`/messages/${c.id}`)}>
                    <Avatar u={o} />
                    <span className="msg-conv-texte">
                      <span className="msg-conv-haut">
                        <strong>{o?.prenom} {o?.name}</strong>
                        {c.dernier_message && <small>{heure(c.dernier_message.created_at)}</small>}
                      </span>
                      <span className="msg-conv-annonce">{c.annonce?.titre}</span>
                      <span className="msg-conv-apercu">
                        {c.dernier_message ? `${c.dernier_message.user_id === user.id ? "Toi : " : ""}${c.dernier_message.contenu}` : ""}
                      </span>
                    </span>
                    {c.non_lus > 0 && <span className="msg-badge" aria-label={`${c.non_lus} non lus`}>{c.non_lus}</span>}
                  </button>
                </li>
              );
            })}
          </ul>
        </aside>

        {/* Discussion */}
        <section className="msg-fil" aria-label="Discussion">
          {!id && <div className="msg-placeholder"><span aria-hidden="true">💬</span><p>Choisis une conversation</p></div>}
          {id && !conv && !erreur && <p className="muted msg-placeholder">Chargement…</p>}
          {id && erreur && !conv && <p className="alert error" style={{ margin: 20 }}>{erreur}</p>}

          {conv && (
            <>
              <header className="msg-fil-tete">
                <button className="msg-retour" onClick={() => navigate("/messages")} aria-label="Retour aux conversations">←</button>
                <Avatar u={autre} />
                <div className="msg-fil-qui">
                  <strong>{autre?.prenom} {autre?.name}</strong>
                  <small>{conv.acheteur_id === user.id ? "Vendeur" : "Intéressé(e) par ton annonce"}{autre?.etablissement ? ` · ${autre.etablissement}` : ""}</small>
                </div>
                <Link to={`/annonces/${conv.annonce.id}`} className="msg-annonce">
                  {conv.annonce.photos?.[0] ? <img src={conv.annonce.photos[0].url} alt="" /> : <span>📦</span>}
                  <span><strong>{conv.annonce.titre}</strong><small>{prixTexte(conv.annonce)}</small></span>
                </Link>
              </header>

              <ol className="msg-messages">
                {conv.messages.map((m, i) => {
                  const moi = m.user_id === user.id;
                  const jour = new Date(m.created_at).toDateString();
                  const nouveauJour = i === 0 || new Date(conv.messages[i - 1].created_at).toDateString() !== jour;
                  return (
                    <li key={m.id} className={moi ? "moi" : "lui"}>
                      {nouveauJour && <span className="msg-jour">{new Date(m.created_at).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}</span>}
                      <div className="msg-bulle">
                        <p>{m.contenu}</p>
                        <small>{new Date(m.created_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}{moi && (m.lu_at ? " · Lu" : " · Envoyé")}</small>
                      </div>
                    </li>
                  );
                })}
                <li ref={finRef} aria-hidden="true" />
              </ol>

              <form className="msg-saisie" onSubmit={envoyer}>
                {erreur && <p className="error" role="alert">{erreur}</p>}
                <textarea rows={1} maxLength={2000} placeholder="Écris ton message…" value={texte}
                          onChange={(e) => { setTexte(e.target.value); setErreur(""); }}
                          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); envoyer(e); } }}
                          aria-label="Message" />
                <button className="ann-btn ann-btn-primary" disabled={envoi || !texte.trim()}>{envoi ? "…" : "Envoyer"}</button>
              </form>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
