import { Outlet } from "react-router-dom";
import "./Admin.css";

// Espace administrateur (Sprint 5) : les pages sont accessibles depuis la barre de navigation
export default function AdminLayout() {
  return (
    <div className="adm-shell adm-sans-menu">
      <Outlet />
    </div>
  );
}
