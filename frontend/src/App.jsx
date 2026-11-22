import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { FavorisProvider } from "./context/FavorisContext";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Profile from "./pages/Profile";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminHome from "./pages/admin/AdminHome";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminAnnonces from "./pages/admin/AdminAnnonces";
import Annonces from "./pages/Annonces";
import AnnonceDetail from "./pages/AnnonceDetail";
import AnnonceForm from "./pages/AnnonceForm";
import MesAnnonces from "./pages/MesAnnonces";
import MesDemandes from "./pages/MesDemandes";
import DemandeForm from "./pages/DemandeForm";
import Propositions from "./pages/Propositions";
import Messages from "./pages/Messages";
import Reservations from "./pages/Reservations";
import MesFavoris from "./pages/MesFavoris";
import "./styles/espace-etudiant.css"; 

function GuestOnly({ children }) {
  const { user } = useAuth();
  if (user) return <Navigate to={user.role === "admin" ? "/admin" : "/"} replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <FavorisProvider>
      <BrowserRouter>
        <Navbar />
        <main className="container">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<GuestOnly><Register /></GuestOnly>} />
            <Route path="/login" element={<GuestOnly><Login /></GuestOnly>} />
            <Route path="/forgot-password" element={<GuestOnly><ForgotPassword /></GuestOnly>} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/profil" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            {/* Sprint 2 — annonces */}
            <Route path="/annonces" element={<Annonces />} />
            <Route path="/annonces/:id" element={<AnnonceDetail />} />
            <Route path="/annonces/nouvelle" element={<ProtectedRoute role="etudiant"><AnnonceForm /></ProtectedRoute>} />
            <Route path="/annonces/:id/modifier" element={<ProtectedRoute role="etudiant"><AnnonceForm /></ProtectedRoute>} />
            <Route path="/mes-annonces" element={<ProtectedRoute role="etudiant"><MesAnnonces /></ProtectedRoute>} />
            {/* Sprint 3 — demandes et matching */}
            <Route path="/mes-demandes" element={<ProtectedRoute role="etudiant"><MesDemandes /></ProtectedRoute>} />
            <Route path="/demandes/nouvelle" element={<ProtectedRoute role="etudiant"><DemandeForm /></ProtectedRoute>} />
            <Route path="/demandes/:id/modifier" element={<ProtectedRoute role="etudiant"><DemandeForm /></ProtectedRoute>} />
            <Route path="/propositions" element={<ProtectedRoute role="etudiant"><Propositions /></ProtectedRoute>} />
            {/* Sprint 4 — messagerie et échanges */}
            <Route path="/messages" element={<ProtectedRoute role="etudiant"><Messages /></ProtectedRoute>} />
            <Route path="/messages/:id" element={<ProtectedRoute role="etudiant"><Messages /></ProtectedRoute>} />
            <Route path="/reservations" element={<ProtectedRoute role="etudiant"><Reservations /></ProtectedRoute>} />
            <Route path="/favoris" element={<ProtectedRoute role="etudiant"><MesFavoris /></ProtectedRoute>} />
            {/* Sprint 5 — administration */}
            <Route path="/admin" element={<ProtectedRoute role="admin"><AdminLayout /></ProtectedRoute>}>
              <Route index element={<AdminHome />} />
              <Route path="utilisateurs" element={<AdminUsers />} />
              <Route path="categories" element={<AdminCategories />} />
              <Route path="annonces" element={<AdminAnnonces />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </BrowserRouter>
      </FavorisProvider>
    </AuthProvider>
  );
}
