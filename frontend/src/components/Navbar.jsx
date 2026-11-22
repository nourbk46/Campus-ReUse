import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import api from "../api";
import { useAuth } from "../context/AuthContext";
import "./Navbar.css";
import "../pages/Echanges.css";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [nonLus, setNonLus] = useState(0);

  useEffect(() => {
    if (!user || user.role === "admin") return; // pas de messagerie pour l'admin
    const lire = () => api.get("/messages/non-lus").then(({ data }) => setNonLus(data.non_lus)).catch(() => {});
    lire();
    const t = setInterval(lire, 30000);
    return () => clearInterval(t);
  }, [user, location.pathname]);

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      navigate("/login");
    }
  };

  const linkClass = ({ isActive }) =>
    isActive ? "nav-link nav-link-active" : "nav-link";

  return (
    <header className="navbar">
      <nav className="navbar-inner" aria-label="Navigation principale">
        <Link to="/" className="logo">
          <span className="logo-mark" aria-hidden="true">♻</span>
          Campus ReUse
        </Link>

        <div className="nav-links">
          {user ? (
            <>
              {user.role === "admin" && (<>
              <NavLink to="/admin" className={linkClass} end>
                Dashboard
              </NavLink>

              <NavLink to="/admin/utilisateurs" className={linkClass}>
                Utilisateurs
              </NavLink>

              <NavLink to="/admin/categories" className={linkClass}>
                Catégories
              </NavLink>
              </>)}

              <NavLink to={user.role === "admin" ? "/admin/annonces" : "/annonces"} className={linkClass} end>
                Annonces
              </NavLink>

              {user.role !== "admin" && (<>
              <NavLink to="/mes-annonces" className={linkClass}>
                Mes annonces
              </NavLink>

              <NavLink to="/mes-demandes" className={linkClass}>
                Mes demandes
              </NavLink>

              <NavLink to="/propositions" className={linkClass}>
                Propositions
              </NavLink>

              <NavLink to="/messages" className={linkClass}>
                Messages
                {nonLus > 0 && <span className="nav-badge" aria-label={`${nonLus} non lus`}>{nonLus}</span>}
              </NavLink>

              <NavLink to="/reservations" className={linkClass}>
                Réservations
              </NavLink>

              <NavLink to="/favoris" className={linkClass}>
                Favoris
              </NavLink>
              </>)}

              <NavLink to="/profil" className="nav-user">
                {user.photo_url ? (
                  <img src={user.photo_url} alt="" className="avatar-sm" />
                ) : (
                  <span className="avatar-sm avatar-initiale" aria-hidden="true">
                    {user.prenom?.[0]?.toUpperCase()}
                  </span>
                )}
                <span className="nav-user-name">{user.prenom}</span>
              </NavLink>

              <button type="button" className="btn-link" onClick={handleLogout}>
                Déconnexion
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={linkClass}>
                Connexion
              </NavLink>
              <Link to="/register" className="btn btn-small">
                Créer un compte
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}