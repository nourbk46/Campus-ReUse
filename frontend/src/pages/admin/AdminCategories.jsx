import { useEffect, useState } from "react";
import api, { lireErreur } from "../../api";

export default function AdminCategories() {
  const [cats, setCats] = useState(null);
  const [nouvelle, setNouvelle] = useState({ nom: "", icone: "" });
  const [edition, setEdition] = useState(null); // { id, nom, icone }
  const [erreurs, setErreurs] = useState({});
  const [message, setMessage] = useState({ texte: "", type: "" });
  const [aSupprimer, setASupprimer] = useState(null);
  const [envoi, setEnvoi] = useState(false);

  const charger = () => api.get("/admin/categories").then(({ data }) => setCats(data))
    .catch((e) => setMessage({ texte: lireErreur(e).message, type: "error" }));
  useEffect(() => { charger(); }, []);

  const erreurDe = (e) => {
    const { message, errors } = lireErreur(e);
    return errors.nom?.[0] || message;
  };

  const ajouter = async (e) => {
    e.preventDefault();
    if (!nouvelle.nom.trim()) return setErreurs({ nouvelle: "Le nom de la catégorie est obligatoire." });
    setEnvoi(true);
    try {
      const { data } = await api.post("/admin/categories", nouvelle);
      setNouvelle({ nom: "", icone: "" });
      setErreurs({});
      setMessage({ texte: data.message, type: "success" });
      await charger();
    } catch (err) {
      setErreurs({ nouvelle: erreurDe(err) });
    } finally {
      setEnvoi(false);
    }
  };

  const enregistrer = async () => {
    if (!edition.nom.trim()) return setErreurs({ [edition.id]: "Le nom est obligatoire." });
    setEnvoi(true);
    try {
      const { data } = await api.put(`/admin/categories/${edition.id}`, { nom: edition.nom, icone: edition.icone });
      setEdition(null);
      setErreurs({});
      setMessage({ texte: data.message, type: "success" });
      await charger();
    } catch (err) {
      setErreurs({ [edition.id]: erreurDe(err) });
    } finally {
      setEnvoi(false);
    }
  };

  const supprimer = async () => {
    setEnvoi(true);
    try {
      const { data } = await api.delete(`/admin/categories/${aSupprimer.id}`);
      setMessage({ texte: data.message, type: "success" });
      await charger();
    } catch (err) {
      setMessage({ texte: lireErreur(err).message, type: "error" });
    } finally {
      setEnvoi(false);
      setASupprimer(null);
    }
  };

  return (
    <>
      <header className="adm-tete">
        <div>
          <h1>Catégories</h1>
          <p className="muted">{cats ? `${cats.length} catégorie${cats.length > 1 ? "s" : ""} proposées aux étudiants` : "Chargement…"}</p>
        </div>
      </header>

      {/* SCRUM-39 : ajouter */}
      <form className="adm-carte adm-ajout" onSubmit={ajouter} noValidate>
        <h2>Nouvelle catégorie</h2>
        <div className="adm-ajout-ligne">
          <label className="adm-champ adm-champ-icone">
            <span>Icône</span>
            <input value={nouvelle.icone} maxLength={10} placeholder="📦" onChange={(e) => setNouvelle({ ...nouvelle, icone: e.target.value })} />
          </label>
          <label className="adm-champ adm-champ-nom">
            <span>Nom *</span>
            <input value={nouvelle.nom} maxLength={100} placeholder="ex. Instruments de musique"
                   className={erreurs.nouvelle ? "invalid" : ""}
                   onChange={(e) => { setNouvelle({ ...nouvelle, nom: e.target.value }); setErreurs({}); }} />
          </label>
          <button className="adm-btn adm-btn-primary" disabled={envoi}>Ajouter</button>
        </div>
        {erreurs.nouvelle && <p className="adm-erreur" role="alert">{erreurs.nouvelle}</p>}
      </form>

      {message.texte && <p className={`alert ${message.type}`} role="status">{message.texte}</p>}

      {cats && (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead><tr><th>Catégorie</th><th className="num">Annonces</th><th className="num">Demandes</th><th><span className="sr-only">Actions</span></th></tr></thead>
            <tbody>
              {cats.map((c) => {
                const enEdition = edition?.id === c.id;
                const utilisee = c.annonces_count > 0 || c.demandes_count > 0;
                return (
                  <tr key={c.id}>
                    <td>
                      {enEdition ? (
                        <div className="adm-edit">
                          <input className="adm-edit-icone" value={edition.icone || ""} maxLength={10} aria-label="Icône"
                                 onChange={(e) => setEdition({ ...edition, icone: e.target.value })} />
                          <input value={edition.nom} maxLength={100} aria-label="Nom" autoFocus
                                 className={erreurs[c.id] ? "invalid" : ""}
                                 onChange={(e) => { setEdition({ ...edition, nom: e.target.value }); setErreurs({}); }}
                                 onKeyDown={(e) => { if (e.key === "Enter") enregistrer(); if (e.key === "Escape") setEdition(null); }} />
                          {erreurs[c.id] && <p className="adm-erreur" role="alert">{erreurs[c.id]}</p>}
                        </div>
                      ) : (
                        <span className="adm-cat-nom"><span className="adm-cat-icone" aria-hidden="true">{c.icone || "•"}</span>{c.nom}</span>
                      )}
                    </td>
                    <td className="num">{c.annonces_count}</td>
                    <td className="num">{c.demandes_count}</td>
                    <td>
                      <div className="adm-actions">
                        {enEdition ? (<>
                          <button className="adm-btn" onClick={() => setEdition(null)}>Annuler</button>
                          <button className="adm-btn adm-btn-primary" onClick={enregistrer} disabled={envoi}>Enregistrer</button>
                        </>) : (<>
                          <button className="adm-btn" onClick={() => { setEdition({ id: c.id, nom: c.nom, icone: c.icone }); setErreurs({}); }}>Modifier</button>
                          <button className="adm-btn adm-btn-danger-ghost" disabled={utilisee}
                                  title={utilisee ? "Impossible : la catégorie contient des annonces ou des demandes" : ""}
                                  onClick={() => setASupprimer(c)}>Supprimer</button>
                        </>)}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p className="adm-note">Une catégorie qui contient des annonces ou des demandes ne peut pas être supprimée.</p>
        </div>
      )}

      {aSupprimer && (
        <div className="adm-overlay adm-overlay-centre" onClick={() => setASupprimer(null)}>
          <div className="adm-modal" role="alertdialog" aria-modal="true" aria-labelledby="sup-titre" onClick={(e) => e.stopPropagation()}>
            <h2 id="sup-titre">Supprimer « {aSupprimer.nom} » ?</h2>
            <p className="muted">Elle ne sera plus proposée aux étudiants.</p>
            <div className="adm-modal-actions">
              <button className="adm-btn" onClick={() => setASupprimer(null)} autoFocus>Annuler</button>
              <button className="adm-btn adm-btn-danger" onClick={supprimer} disabled={envoi}>Supprimer</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
