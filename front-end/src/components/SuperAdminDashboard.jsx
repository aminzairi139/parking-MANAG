import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../services/authService";
import API from "../services/api";
import Header from "./Header";
import Footer from "./Footer";

const emptyAgent = { name: "", email: "", phone: "", sector: "", password: "" };
const emptyAdmin = { name: "", email: "", password: "", sector: "" };

function SuperAdminDashboard() {
  const [user] = useState(() => authService.getCurrentUser());
  const [tab, setTab] = useState("sectors");
  const [sectors, setSectors] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [agents, setAgents] = useState([]);
  const [stats, setStats] = useState(null);
  const [modal, setModal] = useState(null);
  const [agentForm, setAgentForm] = useState(emptyAgent);
  const [adminForm, setAdminForm] = useState(emptyAdmin);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState({ type: "", message: "" });
  const navigate = useNavigate();

  const loadData = async () => {
    setLoading(true);
    try {
      const [sectorResponse, adminResponse, agentResponse, statsResponse] =
        await Promise.all([
          API.get("/admin/sectors"),
          API.get("/admin/sector-admins"),
          API.get("/agents/all"),
          API.get("/stats/global"),
        ]);
      setSectors(sectorResponse.data.data || []);
      setAdmins(adminResponse.data.data || []);
      setAgents(agentResponse.data.data || []);
      setStats(statsResponse.data.data || null);
      setNotice({ type: "", message: "" });
    } catch (error) {
      setNotice({
        type: "error",
        message:
          error.response?.data?.message || "Impossible de charger les données.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    Promise.resolve().then(loadData);
  }, []);

  const totals = useMemo(() => {
    const total = agents.length + admins.length;
    const activeAgents = agents.filter(
      (agent) => agent.isActive !== false,
    ).length;
    const activeAdmins = admins.filter(
      (admin) => admin.isActive !== false,
    ).length;
    return {
      total,
      active: activeAgents + activeAdmins,
      inactive: total - activeAgents - activeAdmins,
      activeAgents,
      activeAdmins,
    };
  }, [agents, admins]);

  const logout = () => {
    authService.logout();
    navigate("/login", { replace: true });
  };

  const openAgent = (agent = null) => {
    setAgentForm(agent ? { ...agent, password: "" } : emptyAgent);
    setModal({ type: agent ? "edit-agent" : "create-agent", item: agent });
  };

  const handleAgentChange = (event) => {
    setAgentForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const handleAdminChange = (event) => {
    setAdminForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const openAdmin = (admin) => {
    setAdminForm({
      name: admin.name,
      email: admin.email,
      password: "",
      sector: admin.sector || "",
    });
    setModal({ type: "edit-admin", item: admin });
  };

  const saveAdminEdit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const response = await API.put(`/admins/${modal.item._id}`, adminForm);
      setAdmins((current) =>
        current.map((admin) =>
          admin._id === response.data.data._id ? response.data.data : admin,
        ),
      );
      setModal(null);
      setNotice({
        type: "success",
        message: "Admin de secteur modifié avec succès.",
      });
    } catch (error) {
      setNotice({
        type: "error",
        message:
          error.response?.data?.message || "Impossible de modifier l’admin.",
      });
    } finally {
      setSaving(false);
    }
  };

  const toggleAdmin = async (admin) => {
    try {
      const response = await API.patch(
        `/admin/sector-admins/${admin._id}/toggle`,
      );
      setAdmins((current) =>
        current.map((item) =>
          item._id === admin._id ? response.data.data : item,
        ),
      );
      setNotice({ type: "success", message: "Statut de l’admin mis à jour." });
    } catch (error) {
      setNotice({
        type: "error",
        message:
          error.response?.data?.message || "Impossible de modifier le statut.",
      });
    }
  };

  const saveAgent = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const response =
        modal.type === "create-agent"
          ? await API.post("/agents", agentForm)
          : await API.put(`/agents/${modal.item._id}`, agentForm);
      const saved = response.data.data;
      setAgents((current) =>
        modal.type === "create-agent"
          ? [...current, saved]
          : current.map((agent) => (agent._id === saved._id ? saved : agent)),
      );
      setModal(null);
      setNotice({ type: "success", message: "Agent enregistré avec succès." });
    } catch (error) {
      setNotice({
        type: "error",
        message:
          error.response?.data?.message || "Impossible d'enregistrer l'agent.",
      });
    } finally {
      setSaving(false);
    }
  };

  const saveAdmin = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const response = await API.post("/admins", adminForm);
      setAdmins((current) => [...current, response.data.data]);
      setAdminForm(emptyAdmin);
      setNotice({
        type: "success",
        message: "Admin de secteur créé avec succès.",
      });
    } catch (error) {
      setNotice({
        type: "error",
        message:
          error.response?.data?.message || "Impossible de créer l’admin.",
      });
    } finally {
      setSaving(false);
    }
  };

  const toggleAgent = async (agent) => {
    try {
      const response = await API.put(`/agents/${agent._id}/toggle-status`);
      setAgents((current) =>
        current.map((item) =>
          item._id === agent._id ? response.data.data : item,
        ),
      );
    } catch (error) {
      setNotice({
        type: "error",
        message:
          error.response?.data?.message || "Impossible de modifier le statut.",
      });
    }
  };

  const renderAgents = () => (
    <section className="registered-admins super-section">
      <div className="section-title section-toolbar">
        <div>
          <p className="admin-tag">Tous les secteurs</p>
          <h3>Gestion des agents</h3>
        </div>
        <button
          type="button"
          className="admin-add-btn"
          onClick={() => openAgent()}
        >
          + Ajouter un agent
        </button>
      </div>
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Nom</th>
              <th>Email</th>
              <th>Téléphone</th>
              <th>Secteur</th>
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
                <td>{agent.sector || "-"}</td>
                <td>
                  <span
                    className={`agent-status ${agent.isActive !== false ? "active" : "inactive"}`}
                  >
                    {agent.isActive !== false ? "Actif" : "Inactif"}
                  </span>
                </td>
                <td className="actions-cell">
                  <button
                    type="button"
                    className="table-action-btn edit"
                    onClick={() => openAgent(agent)}
                    title="Modifier"
                    aria-label="Modifier"
                  >
                    ✎
                  </button>
                  <button
                    type="button"
                    className={`table-action-btn ${agent.isActive !== false ? "delete" : "activate"}`}
                    onClick={() => toggleAgent(agent)}
                    title="Activer ou désactiver"
                    aria-label="Activer ou désactiver"
                  >
                    {agent.isActive !== false ? "⏸" : "▶"}
                  </button>
                </td>
              </tr>
            ))}
            {!agents.length && (
              <tr>
                <td colSpan="6" className="no-results-row">
                  Aucun agent enregistré.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );

  const renderStats = () => {
    const distribution = stats?.repartitionStatuts || {
      admins: { actifs: 0, inactifs: 0 },
      agents: { actifs: 0, inactifs: 0 },
    };
    const maxStaff = Math.max(
      ...(stats?.statsParSecteur || []).map(
        (item) => item.nbAdmins + item.nbAgents,
      ),
      1,
    );
    return (
      <section className="super-section stats-section">
        <p className="admin-tag">Vue d’ensemble</p>
        <h3>Tableau de bord statistiques</h3>
        <div className="global-stats-grid">
          <StatCard
            tone="total"
            label="Total utilisateurs"
            value={stats?.totalUsers ?? totals.total}
            detail={`${stats?.totalAdmins ?? admins.length} admins · ${stats?.totalAgents ?? agents.length} agents`}
            icon="◉"
          />
          <StatCard
            tone="active"
            label="Actifs"
            value={stats?.actifs?.total ?? totals.active}
            detail={`${stats?.actifs?.admins ?? totals.activeAdmins} admins · ${stats?.actifs?.agents ?? totals.activeAgents} agents`}
            icon="✓"
          />
          <StatCard
            tone="inactive"
            label="Inactifs"
            value={stats?.inactifs?.total ?? totals.inactive}
            detail={`${stats?.inactifs?.admins ?? 0} admins · ${stats?.inactifs?.agents ?? 0} agents`}
            icon="!"
          />
        </div>
        <p className="realtime-label">● Données en temps réel</p>
        <div className="stats-panels">
          <div className="stats-panel">
            <h4>Effectifs par secteur</h4>
            {(stats?.statsParSecteur || []).map((item) => (
              <div className="sector-stat-row" key={item.secteur}>
                <div>
                  <strong>{item.code}</strong>
                  <span>{item.secteur}</span>
                </div>
                <b>
                  {item.nbAdmins} admin · {item.nbAgents} agents
                </b>
                <div className="staff-bar">
                  <i
                    style={{
                      width: `${((item.nbAdmins + item.nbAgents) / maxStaff) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="stats-panel">
            <h4>Répartition des statuts</h4>
            <StatusBar
              label="Admins"
              active={distribution.admins.actifs}
              inactive={distribution.admins.inactifs}
            />
            <StatusBar
              label="Agents"
              active={distribution.agents.actifs}
              inactive={distribution.agents.inactifs}
            />
          </div>
        </div>
      </section>
    );
  };

  return (
    <div className="app-container">
      <Header onLogout={logout} />
      <section className="main-content admin-main-content super-admin-page">
        <div className="admin-panel super-admin-panel">
          <div className="admin-heading-row">
            <div>
              <p className="admin-tag">Super Admin</p>
              <h2>Centre de pilotage</h2>
              <p className="admin-subtitle">
                Connecté en tant que {user?.email}
              </p>
            </div>
            <span className="admin-user">Administration globale</span>
          </div>
          <nav className="super-tabs" aria-label="Navigation Super Admin">
            <button
              className={tab === "sectors" ? "active" : ""}
              onClick={() => setTab("sectors")}
            >
              Administ Secteur
            </button>
            <button
              className={tab === "agents" ? "active" : ""}
              onClick={() => setTab("agents")}
            >
              Agents
            </button>
            <button
              className={tab === "stats" ? "active" : ""}
              onClick={() => setTab("stats")}
            >
              Statistiques
            </button>
            <button
              className={tab === "settings" ? "active" : ""}
              onClick={() => setTab("settings")}
            >
              Paramètres
            </button>
          </nav>
          {notice.message && (
            <p className={`super-feedback ${notice.type}`}>{notice.message}</p>
          )}
          {loading ? (
            <p className="admin-subtitle">Chargement...</p>
          ) : tab === "agents" ? (
            renderAgents()
          ) : tab === "stats" ? (
            renderStats()
          ) : tab === "settings" ? (
            <section className="super-section">
              <p className="admin-tag">Configuration</p>
              <h3>Paramètres</h3>
              <p className="admin-subtitle">
                Les paramètres de la plateforme seront disponibles
                prochainement.
              </p>
            </section>
          ) : (
            <>
              <div className="sector-grid">
                {sectors.map((sector, index) => (
                  <article className="sector-card" key={sector._id}>
                    <span className="sector-number">0{index + 1}</span>
                    <h3>{sector.name}</h3>
                    <p>{sector.location}</p>
                    <span>{sector.capacity || "-"} places</span>
                  </article>
                ))}
              </div>
              <div className="super-admin-layout">
                <form
                  className="sector-admin-form responsive-form"
                  onSubmit={saveAdmin}
                >
                  <div className="section-title">
                    <p className="admin-tag">Accès</p>
                    <h3>Créer un admin de secteur</h3>
                  </div>
                  <label className="super-field">
                    Nom complet
                    <input
                      name="name"
                      required
                      value={adminForm.name}
                      onChange={handleAdminChange}
                    />
                  </label>
                  <label className="super-field">
                    Email
                    <input
                      name="email"
                      type="email"
                      required
                      value={adminForm.email}
                      onChange={handleAdminChange}
                    />
                  </label>
                  <label className="super-field">
                    Mot de passe
                    <input
                      name="password"
                      type="password"
                      minLength="6"
                      required
                      value={adminForm.password}
                      onChange={handleAdminChange}
                    />
                  </label>
                  <label className="super-field">
                    Secteur
                    <select
                      name="sector"
                      required
                      value={adminForm.sector}
                      onChange={handleAdminChange}
                    >
                      <option value="">Sélectionner un secteur</option>
                      {sectors.map((sector) => (
                        <option key={sector._id} value={sector.name}>
                          {sector.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <button type="submit" className="login-btn" disabled={saving}>
                    {saving ? "Création..." : "Créer l’admin"}
                  </button>
                </form>
                <div className="registered-admins">
                  <div className="section-title">
                    <p className="admin-tag">Gestion</p>
                    <h3>Admins enregistrés</h3>
                  </div>
                  <div className="admin-table-container">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Nom</th>
                          <th>Email</th>
                          <th>Secteur</th>
                          <th>Statut</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {admins.map((admin) => (
                          <tr key={admin._id}>
                            <td>{admin.name}</td>
                            <td>{admin.email}</td>
                            <td>{admin.sector || "-"}</td>
                            <td>
                              <span
                                className={`agent-status ${admin.isActive !== false ? "active" : "inactive"}`}
                              >
                                {admin.isActive !== false ? "Actif" : "Inactif"}
                              </span>
                            </td>
                            <td className="actions-cell">
                              <button
                                type="button"
                                className="table-action-btn edit"
                                onClick={() => openAdmin(admin)}
                                title="Modifier"
                                aria-label="Modifier"
                              >
                                ✎
                              </button>
                              <button
                                type="button"
                                className={`table-action-btn ${admin.isActive !== false ? "delete" : "activate"}`}
                                onClick={() => toggleAdmin(admin)}
                                title={
                                  admin.isActive !== false
                                    ? "Désactiver"
                                    : "Activer"
                                }
                                aria-label={
                                  admin.isActive !== false
                                    ? "Désactiver"
                                    : "Activer"
                                }
                              >
                                {admin.isActive !== false ? "⏸" : "▶"}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
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
            className="admin-edit-modal responsive-form"
            onSubmit={modal.type === "edit-admin" ? saveAdminEdit : saveAgent}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="admin-modal-header">
              <div>
                <p className="admin-tag">Agents</p>
                <h3>
                  {modal.type === "create-agent"
                    ? "Ajouter un agent"
                    : modal.type === "edit-admin"
                      ? "Modifier l’admin de secteur"
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
            {modal.type === "edit-admin" ? (
              <>
                <label className="super-field">
                  Nom complet
                  <input
                    name="name"
                    required
                    value={adminForm.name}
                    onChange={handleAdminChange}
                  />
                </label>
                <label className="super-field">
                  Email
                  <input
                    name="email"
                    type="email"
                    required
                    value={adminForm.email}
                    onChange={handleAdminChange}
                  />
                </label>
                <label className="super-field">
                  Mot de passe
                  <input
                    name="password"
                    type="password"
                    minLength="6"
                    value={adminForm.password}
                    onChange={handleAdminChange}
                    placeholder="Laisser vide pour conserver"
                  />
                </label>
                <label className="super-field">
                  Secteur
                  <select
                    name="sector"
                    required
                    value={adminForm.sector}
                    onChange={handleAdminChange}
                  >
                    <option value="">Sélectionner un secteur</option>
                    {sectors.map((sector) => (
                      <option key={sector._id} value={sector.name}>
                        {sector.name}
                      </option>
                    ))}
                  </select>
                </label>
              </>
            ) : (
              <>
                <label className="super-field">
                  Nom complet
                  <input
                    name="name"
                    required
                    value={agentForm.name}
                    onChange={handleAgentChange}
                  />
                </label>
                <label className="super-field">
                  Email
                  <input
                    name="email"
                    type="email"
                    required
                    value={agentForm.email}
                    onChange={handleAgentChange}
                  />
                </label>
                <label className="super-field">
                  Téléphone
                  <input
                    name="phone"
                    value={agentForm.phone}
                    onChange={handleAgentChange}
                  />
                </label>
                <label className="super-field">
                  Secteur
                  <select
                    name="sector"
                    required
                    value={agentForm.sector}
                    onChange={handleAgentChange}
                  >
                    <option value="">Sélectionner un secteur</option>
                    {sectors.map((sector) => (
                      <option key={sector._id} value={sector.name}>
                        {sector.name}
                      </option>
                    ))}
                  </select>
                </label>
                {modal.type === "edit-agent" && (
                  <label className="super-field">
                    Mot de passe
                    <input
                      name="password"
                      type="password"
                      minLength="6"
                      value={agentForm.password}
                      onChange={handleAgentChange}
                      placeholder="Laisser vide pour conserver"
                    />
                  </label>
                )}
              </>
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

function StatCard({ tone, label, value, detail, icon }) {
  return (
    <article className={`global-stat-card ${tone}`}>
      <span className="global-stat-icon">{icon}</span>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        <small>{detail}</small>
      </div>
    </article>
  );
}

function StatusBar({ label, active, inactive }) {
  const total = active + inactive || 1;
  return (
    <div className="status-bar-row">
      <div>
        <strong>{label}</strong>
        <span>
          {active} actifs · {inactive} inactifs
        </span>
      </div>
      <div className="status-bar">
        <i style={{ width: `${(active / total) * 100}%` }} />
        <b style={{ width: `${(inactive / total) * 100}%` }} />
      </div>
    </div>
  );
}

export default SuperAdminDashboard;
