import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api, { lireErreur } from "../api";
import { useAuth } from "../context/AuthContext";
import { ETATS, STATUTS, TYPES, prixTexte, depuis } from "../annonces";
import "./Annonces.css";
import "./Echanges.css";
import FavoriButton from "../components/FavoriButton";

// Détail d'une annonce (ouvert depuis la liste)
export default function AnnonceDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [annonce, setAnnonce] = useState(null);
  const [erreur, setErreur] = useState("");
  const [photo, setPhoto] = useState(0);

  useEffect(() => {
    api.get(`/annonces/${id}`)
      .then(({ data }) => setAnnonce(data))
      .catch((e) => setErreur(e.response?.status === 404 ? "Cette annonce n'existe plus." : lireErreur(e).message));
  }, [id]);

  if (erreur) {
    return (
      <main className="annonces-page">
        <div className="vide"><span aria-hidden="true">😕</span><h2>{erreur}</h2>
          <Link to="/annonces" className="ann-btn ann-btn-ghost">← Retour aux annonces</Link></div>
      </main>
    );
  }
  if (!annonce) return <main className="annonces-page"><p className="muted center">Chargement…</p></main>;

  const proprio = user && user.id === annonce.user_id;
  const photos = annonce.photos || [];

  return (
    <main className="annonces-page">
      <button className="lien-retour" onClick={() => navigate(-1)}>← Retour</button>

      <article className="detail">
        <div className="detail-galerie">
          <div className="detail-photo">
            {photos[photo] ? <img src={photos[photo].url} alt={annonce.titre} /> : <span aria-hidden="true">📦</span>}
          </div>
          {photos.length > 1 && (
            <div className="detail-miniatures">
              {photos.map((p, i) => (
                <button key={p.id} className={i === photo ? "actif" : ""} onClick={() => setPhoto(i)} aria-label={`Photo ${i + 1}`}>
                  <img src={p.url} alt="" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="detail-infos">
          <div className="detail-badges">
            <span className={`type-badge type-${annonce.type}`}>{TYPES[annonce.type]}</span>
            <span className={`statut-badge statut-${annonce.statut}`}>{STATUTS[annonce.statut]}</span>
          </div>
          <h1>{annonce.titre}</h1>
          <p className="detail-prix">{prixTexte(annonce)}</p>

          <dl className="detail-liste">
            <dt>Catégorie</dt><dd>{annonce.categorie?.icone} {annonce.categorie?.nom}</dd>
            <dt>État</dt><dd>{ETATS[annonce.etat]}</dd>
            <dt>Publiée</dt><dd>{depuis(annonce.created_at)}</dd>
          </dl>

          {annonce.description && (<><h2>Description</h2><p className="detail-description">{annonce.description}</p></>)}

          <div className="detail-auteur">
            {annonce.user?.photo_url
              ? <img src={annonce.user.photo_url} alt="" />
              : <span className="initiale">{annonce.user?.prenom?.[0]}</span>}
            <div>
              <strong>{annonce.user?.prenom} {annonce.user?.name}</strong>
              <span className="muted">{annonce.user?.etablissement || "Étudiant"}</span>
            </div>
          </div>

          <ActionsAnnonce annonce={annonce} proprio={proprio} user={user} />
          {!proprio && <FavoriButton annonce={annonce} variante="large" />}
        </div>
      </article>
    </main>
  );
}

// SCRUM-28 (contacter) et SCRUM-30 (réserver)
function ActionsAnnonce({ annonce, proprio, user }) {
  const navigate = useNavigate();
  const [ecrire, setEcrire] = useState(false);
  const [texte, setTexte] = useState(`Bonjour, ton annonce « ${annonce.titre} » est-elle toujours disponible ?`);
  const [reservation, setReservation] = useState(null);
  const [message, setMessage] = useState({ texte: "", type: "" });
  const [envoi, setEnvoi] = useState(false);

  const admin = user?.role === "admin";

  useEffect(() => {
    if (!user || proprio || admin) return;
    api.get("/reservations/envoyees")
      .then(({ data }) => setReservation(data.find((r) => r.annonce_id === annonce.id && ["en_attente", "acceptee", "terminee"].includes(r.statut)) || null))
      .catch(() => {});
  }, [annonce.id, user, proprio, admin]);

  if (proprio) {
    return (
      <div className="detail-actions">
        <Link to={`/annonces/${annonce.id}/modifier`} className="ann-btn ann-btn-primary ann-btn-full">Modifier mon annonce</Link>
        <Link to="/reservations" className="ann-btn ann-btn-ghost ann-btn-full">Voir les réservations reçues</Link>
      </div>
    );
  }
  if (admin) {
    return (
      <div className="detail-actions">
        <p className="detail-info">Vue administrateur : tu peux consulter cette annonce, mais pas la réserver ni contacter le vendeur.</p>
        <Link to={`/admin/utilisateurs?search=${encodeURIComponent(annonce.user?.name || "")}`} className="ann-btn ann-btn-ghost ann-btn-full">Gérer le compte du vendeur</Link>
      </div>
    );
  }
  if (!user) {
    return <Link to="/login" className="ann-btn ann-btn-primary ann-btn-full">Connecte-toi pour contacter ou réserver</Link>;
  }

  const envoyer = async () => {
    if (!texte.trim()) return setMessage({ texte: "Le message ne peut pas être vide.", type: "error" });
    setEnvoi(true);
    try {
      const { data } = await api.post("/conversations", { annonce_id: annonce.id, contenu: texte });
      navigate(`/messages/${data.conversation.id}`);
    } catch (e) {
      setMessage({ texte: lireErreur(e).message, type: "error" });
      setEnvoi(false);
    }
  };

  const reserver = async () => {
    setEnvoi(true);
    try {
      const { data } = await api.post(`/annonces/${annonce.id}/reserver`);
      setReservation(data.reservation);
      setMessage({ texte: data.message, type: "success" });
    } catch (e) {
      const { message, errors } = lireErreur(e);
      setMessage({ texte: errors.annonce?.[0] || message, type: "error" });
    } finally {
      setEnvoi(false);
    }
  };

  const libelles = { en_attente: "Réservation envoyée : en attente de réponse du propriétaire.", acceptee: "Réservation acceptée ! Organise la remise puis confirme l'échange.", terminee: "Échange terminé." };

  return (
    <div className="detail-actions">
      {message.texte && <p className={`alert ${message.type}`} role="status">{message.texte}</p>}

      {reservation ? (
        <p className="detail-info">{libelles[reservation.statut]} <Link to="/reservations?onglet=envoyees">Mes réservations →</Link></p>
      ) : annonce.statut === "disponible" ? (
        <button className="ann-btn ann-btn-primary ann-btn-full" onClick={reserver} disabled={envoi}>Réserver cet objet</button>
      ) : (
        <p className="detail-info">Cet objet n'est plus disponible à la réservation.</p>
      )}

      {ecrire ? (
        <div className="detail-contact">
          <label htmlFor="msg" className="sr-only">Ton message</label>
          <textarea id="msg" rows={3} maxLength={2000} value={texte} onChange={(e) => setTexte(e.target.value)} autoFocus />
          <div className="form-actions" style={{ marginTop: 0 }}>
            <button className="ann-btn ann-btn-ghost" onClick={() => setEcrire(false)}>Annuler</button>
            <button className="ann-btn ann-btn-primary" onClick={envoyer} disabled={envoi || !texte.trim()}>Envoyer</button>
          </div>
        </div>
      ) : (
        <button className="ann-btn ann-btn-ghost ann-btn-full" onClick={() => setEcrire(true)}>Contacter {annonce.user?.prenom || "le vendeur"}</button>
      )}
    </div>
  );
}
