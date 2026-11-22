import { createContext, useCallback, useContext, useEffect, useState } from "react";
import api from "../api";
import { useAuth } from "./AuthContext";

const FavorisContext = createContext({ ids: new Set(), basculer: async () => {} });

export function FavorisProvider({ children }) {
  const { user } = useAuth();
  const [ids, setIds] = useState(new Set());

  useEffect(() => {
    if (!user) return setIds(new Set());
    api.get("/favoris/ids").then(({ data }) => setIds(new Set(data))).catch(() => {});
  }, [user?.id]);

  const basculer = useCallback(async (annonceId) => {
    const etait = ids.has(annonceId);
    const maj = (ajouter) => setIds((prev) => {
      const n = new Set(prev);
      ajouter ? n.add(annonceId) : n.delete(annonceId);
      return n;
    });
    maj(!etait);
    try {
      if (etait) await api.delete(`/annonces/${annonceId}/favori`);
      else await api.post(`/annonces/${annonceId}/favori`);
      return !etait;
    } catch (e) {
      maj(etait);
      throw e;
    }
  }, [ids]);

  return <FavorisContext.Provider value={{ ids, basculer }}>{children}</FavorisContext.Provider>;
}

export const useFavoris = () => useContext(FavorisContext);
