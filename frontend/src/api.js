import axios from "axios";

// Les appels /api sont relayés vers Laravel (http://localhost:8000) par Vite (voir vite.config.js)
const api = axios.create({
  baseURL: "/api",
  headers: { Accept: "application/json" },
});

// Ajoute le token Sanctum à chaque requête
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Token expiré ou supprimé : on vide la session
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401 && localStorage.getItem("token")) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Transforme une erreur Laravel en { message, errors }
export function lireErreur(error) {
  const data = error.response?.data || {};
  return {
    message: data.message || "Une erreur est survenue. Vérifiez que le serveur Laravel est lancé.",
    errors: data.errors || {},
  };
}

export default api;
