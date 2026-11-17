// Libellés partagés par les pages d'annonces (Sprint 2)
export const ETATS = { neuf: "Neuf", tres_bon: "Très bon état", bon: "Bon état", use: "Usé" };
export const TYPES = { don: "Don", echange: "Échange", vente: "Vente" };
export const STATUTS = { disponible: "Disponible", reservee: "Réservée", cedee: "Cédée" };

export function prixTexte(annonce) {
  if (annonce.type === "don") return "Gratuit";
  if (annonce.type === "echange") return "Échange";
  return `${Number(annonce.prix).toLocaleString("fr-FR")} DT`;
}

export function depuis(date) {
  const s = Math.floor((Date.now() - new Date(date)) / 1000);
  if (s < 60) return "à l'instant";
  const m = Math.floor(s / 60);
  if (m < 60) return `il y a ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `il y a ${h} h`;
  const j = Math.floor(h / 24);
  if (j < 30) return `il y a ${j} j`;
  return new Date(date).toLocaleDateString("fr-FR");
}

// Sprint 3 — demandes
export const STATUTS_DEMANDE = { ouverte: "Ouverte", cloturee: "Clôturée" };
export const ETATS_MIN = { use: "Usé ou mieux", bon: "Bon état ou mieux", tres_bon: "Très bon état ou mieux", neuf: "Neuf uniquement" };

export function budgetTexte(budget) {
  return Number(budget) > 0 ? `${Number(budget).toLocaleString("fr-FR")} DT max.` : "Don ou échange";
}
