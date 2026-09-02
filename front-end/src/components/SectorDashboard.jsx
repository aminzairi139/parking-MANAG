import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../services/authService";
import API from "../services/api";
import Header from "./Header";
import Footer from "./Footer";

const emptyForm = { name: "", email: "", phone: "" };

function SectorDashboard() {
  const [user] = useState(() => authService.getCurrentUser());
  const [sector, setSector] = useState(null);
  const [agents, setAgents] = useState([]);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [state, setState] = useState({ loading: true, error: "" });
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const totalAgents = agents.length;
  const activeAgents = agents.filter((agent) => agent.isActive).length;
  const inactiveAgents = totalAgents - activeAgents;
  const activePercentage = totalAgents
    ? ((activeAgents / totalAgents) * 100).toFixed(1)
    : "0.0";
  const inactivePercentage = totalAgents
    ? ((inactiveAgents / totalAgents) * 100).toFixed(1)
    : "0.0";

  useEffect(() => {
    let isMounted = true;
    Promise.all([API.get("/agents/sector"), API.get("/agents")])
      .then(([sectorResponse, agentsResponse]) => {
        if (!isMounted) return;
        setSector(sectorResponse.data.data);
        setAgents(agentsResponse.data.data || []);
        setState({ loading: false, error: "" });
      })
      .catch((error) => {
        console.error("Failed to load sector dashboard", error);
        if (isMounted) {
          setState({
            loading: false,
            error: "Impossible de charger les données du secteur.",
          });
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleLogout = () => {
    authService.logout();
    navigate("/login", { replace: true });
  };

  const openCreate = () => {
    setForm(emptyForm);
    setModal({ type: "create" });
  };

  const openEdit = (agent) => {
    setForm({ name: agent.name, email: agent.email, phone: agent.phone || "" });
    setModal({ type: "edit", agent });
  };

  const handleChange = (event) => {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const response =
        modal.type === "create"
          ? await API.post("/agents", form)
          : await API.put(`/agents/${modal.agent._id}`, form);
      const updatedAgent = response.data.data;
      setAgents((current) =>
        modal.type === "create"
          ? [...current, updatedAgent]
          : current.map((agent) =>
              agent._id === updatedAgent._id ? updatedAgent : agent,
            ),
      );
      setModal(null);
    } catch (error) {
      setState((current) => ({
        ...current,
        error:
          error.response?.data?.message || "Impossible d'enregistrer l'agent.",
      }));
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (agent) => {
    try {
      const response = await API.put(`/agents/${agent._id}/toggle-status`);
      setAgents((current) =>
        current.map((item) =>
          item._id === agent._id ? response.data.data : item,
        ),
      );
    } catch (error) {
      setState((current) => ({
        ...current,
        error:
          error.response?.data?.message || "Impossible de modifier le statut.",
      }));
    }
  };

  return (
    <div className="app-container">
      <Header onLogout={handleLogout} />
      <section className="main-content admin-main-content super-admin-page sector-admin-page">
        <div className="admin-panel">
          <div className="admin-heading-row">
            <div>
              <p className="admin-tag">Sector Admin</p>
              <h2>Gestion du secteur {user?.sector || sector?.name || ""}</h2>
              <p className="admin-subtitle">
                Gérez les agents rattachés à votre secteur opérationnel.
              </p>
            </div>
            <button
              type="button"
              className="admin-add-btn"
              onClick={openCreate}
            >
              + Ajouter un agent
            </button>
          </div>

          {state.error && <p className="super-feedback error">{state.error}</p>}
          {state.loading ? (
            <p className="admin-subtitle">Chargement...</p>
          ) : (
            <>
              {sector && (
                <div className="sector-grid sector-single-card">
                  <article className="sector-card">
                    <span className="sector-number">SECTEUR</span>
                    <h3>{sector.name}</h3>
                    <p>{sector.location}</p>
                    <span>{sector.capacity || "-"} places</span>
                  </article>
                </div>
              )}
              <div className="sector-stats-grid">
                <article className="sector-stat-card total">
                  <span className="sector-stat-icon" aria-hidden="true">
                    ♟
                  </span>
                  <div>
                    <span>Total agents</span>
                    <strong>{totalAgents}</strong>
                    <small>Tous les agents</small>
                  </div>
                </article>
                <article className="sector-stat-card active">
                  <span className="sector-stat-icon" aria-hidden="true">
                    ♙
                  </span>
                  <div>
                    <span>Agents actifs</span>
                    <strong>{activeAgents}</strong>
                    <small>{activePercentage}% du total</small>
                  </div>
                </article>
                <article className="sector-stat-card inactive">
                  <span className="sector-stat-icon" aria-hidden="true">
                    ♧
                  </span>
                  <div>
                    <span>Inactifs</span>
                    <strong>{inactiveAgents}</strong>
                    <small>{inactivePercentage}% du total</small>
                  </div>
                </article>
              </div>
              <div className="registered-admins sector-agents-section">
                <div className="section-title">
                  <p className="admin-tag">Équipe opérationnelle</p>
                  <h3>Agents du secteur</h3>
                </div>
                <div className="admin-table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Nom</th>
                        <th>Email</th>
                        <th>Téléphone</th>
                        <th>Statut</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {agents.map((agent) => (
                        <tr key={agent._id}>
                          <td>{agent.name}</td>
                          <td>{agent.email}</td>
                          <td>{agent.phone || "-"}</td>
                          <td>
                            <span
                              className={`agent-status ${agent.isActive ? "active" : "inactive"}`}
                            >
                              {agent.isActive ? "Actif" : "Inactif"}
                            </span>
                          </td>
                          <td className="actions-cell">
                            <button
                              type="button"
                              className="table-action-btn edit"
                              onClick={() => openEdit(agent)}
                              title="Modifier"
                              aria-label="Modifier"
                            >
                              ✎
                            </button>
                            <button
                              type="button"
                              className={`table-action-btn ${agent.isActive ? "delete" : "activate"}`}
                              onClick={() => toggleStatus(agent)}
                              title={agent.isActive ? "Désactiver" : "Activer"}
                              aria-label={
                                agent.isActive ? "Désactiver" : "Activer"
                              }
                            >
                              {agent.isActive ? "⏸" : "▶"}
                            </button>
                          </td>
                        </tr>
                      ))}
                      {!agents.length && (
                        <tr>
                          <td colSpan="5" className="no-results-row">
                            Aucun agent dans ce secteur.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </section>
      <Footer />
      {modal && (
        <div className="admin-modal-overlay" onMouseDown={() => setModal(null)}>
          <form
            className="admin-edit-modal"
            onSubmit={handleSubmit}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="admin-modal-header">
              <div>
                <p className="admin-tag">Agents</p>
                <h3>
                  {modal.type === "create"
                    ? "Ajouter un agent"
                    : "Modifier l’agent"}
                </h3>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setModal(null)}
                aria-label="Fermer"
              >
                ×
              </button>
            </div>
            <label className="super-field">
              Nom complet
              <input
                name="name"
                type="text"
                required
                value={form.name}
                onChange={handleChange}
              />
            </label>
            <label className="super-field">
              Email
              <input
                name="email"
                type="email"
                required
                value={form.email}
                onChange={handleChange}
              />
            </label>
            <label className="super-field">
              Téléphone
              <input
                name="phone"
                type="tel"
                value={form.phone}
                onChange={handleChange}
              />
            </label>
            {modal.type === "edit" && (
              <label className="super-field">
                Mot de passe
                <input
                  name="password"
                  type="password"
                  placeholder="Nouveau mot de passe (laisser vide pour ne pas changer)"
                  value={form.password || ""}
                  onChange={handleChange}
                />
              </label>
            )}
            <div className="form-actions">
              <button type="submit" className="login-btn" disabled={saving}>
                {saving ? "Enregistrement..." : "Enregistrer"}
              </button>
              <button
                type="button"
                className="reset-btn"
                onClick={() => setModal(null)}
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default SectorDashboard;
