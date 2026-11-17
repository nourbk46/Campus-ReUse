import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useFavoris } from "../context/FavorisContext";

// Bouton cœur : ajoute / retire une annonce des favoris
export default function FavoriButton({ annonce, variante = "carte" }) {
  const { user } = useAuth();
  const { ids, basculer } = useFavoris();
  const navigate = useNavigate();

  if (user && user.id === annonce.user_id) return null; // pas sur ses propres annonces
  if (user?.role === "admin") return null;                // l'admin ne met pas en favori

  const actif = ids.has(annonce.id);
  const onClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return navigate("/login");
    basculer(annonce.id).catch(() => {});
  };

  return (
    <button type="button" className={`fav-btn fav-${variante} ${actif ? "actif" : ""}`} onClick={onClick}
            aria-pressed={actif} aria-label={actif ? "Retirer des favoris" : "Ajouter aux favoris"}
            title={actif ? "Retirer des favoris" : "Ajouter aux favoris"}>
      <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
        <path d="M12 20.5s-7.8-4.7-9.4-9.6C1.4 7.4 3.6 4 7.1 4c2 0 3.6 1.1 4.9 2.9C13.3 5.1 14.9 4 16.9 4c3.5 0 5.7 3.4 4.5 6.9-1.6 4.9-9.4 9.6-9.4 9.6Z"
              fill={actif ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      </svg>
      {variante === "large" && <span>{actif ? "Dans mes favoris" : "Ajouter aux favoris"}</span>}
    </button>
  );
}
