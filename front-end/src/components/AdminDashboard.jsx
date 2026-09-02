import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, logout } from "../utils/auth";
import Header from "./Header";
import Footer from "./Footer";
import API from "../services/api";

function AdminDashboard() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const [sectors, setSectors] = useState([]);
  const [sectorAdmins, setSectorAdmins] = useState([]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    sector: "",
  });
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadUser = async () => {
      const currentUser = await getCurrentUser();
      if (isMounted) {
        setUser(currentUser);
      }
    };

    const loadDashboard = async () => {
      try {
        const [sectorResponse, adminResponse] = await Promise.all([
          API.get("/admin/sectors"),
          API.get("/admin/sector-admins"),
        ]);
        if (!isMounted) return;
        setSectors(sectorResponse.data.data || []);
        setSectorAdmins(adminResponse.data.data || []);
      } catch (err) {
        console.error("Failed to load Super Admin data", err);
        if (isMounted) {
          setFeedback({
            type: "error",
            message: "Les données n’ont pas pu être chargées.",
          });
        }
      }
    };

    loadUser();
    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  const handleFormChange = (event) => {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const handleCreateAdmin = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setFeedback({ type: "", message: "" });
    try {
      const response = await API.post("/admins", {
        ...form,
      });
      const createdAdmin = response.data.data;
      setSectorAdmins((current) => [
        ...current,
        {
          ...createdAdmin,
          sector: form.sector,
        },
      ]);
      setForm({ name: "", email: "", password: "", sector: "" });
      setFeedback({
        type: "success",
        message: "Admin de secteur créé avec succès.",
      });
    } catch (err) {
      setFeedback({
        type: "error",
        message:
          err.response?.data?.message || "Impossible de créer cet admin.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (admin) => {
    setEditingAdmin(admin);
    setEditForm({ name: admin.name, email: admin.email, password: "" });
  };

  const handleEditChange = (event) => {
    setEditForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const handleUpdateAdmin = async (event) => {
    event.preventDefault();
    setIsEditing(true);
    try {
      const response = await API.put(`/admins/${editingAdmin._id}`, editForm);
      setSectorAdmins((current) =>
        current.map((admin) =>
          admin._id === editingAdmin._id ? response.data.data : admin,
        ),
      );
      setEditingAdmin(null);
      setFeedback({ type: "success", message: "Admin modifié avec succès." });
    } catch (err) {
      setFeedback({
        type: "error",
        message:
          err.response?.data?.message || "Impossible de modifier cet admin.",
      });
    } finally {
      setIsEditing(false);
    }
  };

  return (
    <div className="app-container">
      <Header onLogout={handleLogout} />

      <section className="main-content admin-main-content super-admin-page">
        <div className="admin-panel">
          <div className="admin-heading-row">
            <div>
              <p className="admin-tag">Super Admin</p>
              <h2>
                Secteurs{" "}
                <span className="sector-count">
                  {sectors.length} zones opérationnelles
                </span>
              </h2>
              <p className="admin-subtitle">
                Pilotage des parkings approuvés et de leurs administrateurs.
              </p>
            </div>
            <span className="admin-user">{user?.email}</span>
          </div>

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
            <form className="sector-admin-form" onSubmit={handleCreateAdmin}>
              <div className="section-title">
                <p className="admin-tag">Accès</p>
                <h3>Créer un admin de secteur</h3>
              </div>
              <label className="super-field">
                Nom complet
                <input
                  name="name"
                  type="text"
                  required
                  value={form.name}
                  onChange={handleFormChange}
                  placeholder="Ex. Amine Ben Salem"
                />
              </label>
              <label className="super-field">
                Email
                <input
                  name="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={handleFormChange}
                  placeholder="admin@exemple.com"
                />
              </label>
              <label className="super-field">
                Mot de passe
                <input
                  name="password"
                  type="password"
                  required
                  minLength="6"
                  value={form.password}
                  onChange={handleFormChange}
                  placeholder="6 caractères minimum"
                />
              </label>
              <label className="super-field">
                Secteur
                <select
                  name="sector"
                  required
                  value={form.sector}
                  onChange={handleFormChange}
                >
                  <option value="">Sélectionner un secteur</option>
                  {sectors.map((sector) => (
                    <option key={sector._id} value={sector.name}>
                      {sector.name}
                    </option>
                  ))}
                </select>
              </label>
              {feedback.message && (
                <p className={`super-feedback ${feedback.type}`}>
                  {feedback.message}
                </p>
              )}
              <div className="form-actions">
                <button
                  type="submit"
                  className="login-btn"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Création..." : "Créer l’admin"}
                </button>
                <button
                  type="button"
                  className="reset-btn"
                  onClick={() => {
                    setForm({ name: "", email: "", password: "", sector: "" });
                    setFeedback({ type: "", message: "" });
                  }}
                >
                  Réinitialiser
                </button>
              </div>
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
                    {sectorAdmins.map((admin) => (
                      <tr key={admin._id}>
                        <td>{admin.name}</td>
                        <td>{admin.email}</td>
                        <td>{admin.sector || "-"}</td>
                        <td>
                          <span
                            className={`agent-status ${admin.isActive ? "active" : "inactive"}`}
                          >
                            {admin.isActive ? "Actif" : "Inactif"}
                          </span>
                        </td>
                        <td className="actions-cell">
                          <button
                            type="button"
                            className="table-action-btn edit"
                            title="Modifier le statut"
                            aria-label="Modifier"
                            onClick={() => openEditModal(admin)}
                          >
                            ✎
                          </button>
                          <button
                            type="button"
                            className="table-action-btn delete"
                            title="Voir les détails"
                            aria-label="Voir les détails"
                          >
                            ⌕
                          </button>
                        </td>
                      </tr>
                    ))}
                    {sectorAdmins.length === 0 && (
                      <tr>
                        <td colSpan="5" className="no-results-row">
                          Aucun admin de secteur enregistré.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
      {editingAdmin && (
        <div
          className="admin-modal-overlay"
          onMouseDown={() => setEditingAdmin(null)}
        >
          <form
            className="admin-edit-modal"
            onSubmit={handleUpdateAdmin}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="admin-modal-header">
              <div>
                <p className="admin-tag">Administration</p>
                <h3>Modifier l’admin</h3>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setEditingAdmin(null)}
                aria-label="Fermer"
              >
                ×
              </button>
            </div>
            <label className="super-field">
              Nom
              <input
                name="name"
                type="text"
                required
                value={editForm.name}
                onChange={handleEditChange}
              />
            </label>
            <label className="super-field">
              Email
              <input
                name="email"
                type="email"
                required
                value={editForm.email}
                onChange={handleEditChange}
              />
            </label>
            <label className="super-field">
              Mot de passe
              <input
                name="password"
                type="password"
                minLength="6"
                value={editForm.password}
                onChange={handleEditChange}
                placeholder="Laisser vide pour conserver"
              />
            </label>
            <div className="form-actions">
              <button type="submit" className="login-btn" disabled={isEditing}>
                {isEditing ? "Enregistrement..." : "Enregistrer"}
              </button>
              <button
                type="button"
                className="reset-btn"
                onClick={() => setEditingAdmin(null)}
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

export default AdminDashboard;
