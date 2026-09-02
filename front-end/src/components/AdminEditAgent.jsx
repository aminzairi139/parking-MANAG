import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getCurrentUser, logout } from "../utils/auth";
import API from "../services/api";
import Header from "./Header";
import Footer from "./Footer";

function AdminEditAgent() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const [agent, setAgent] = useState(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [tempPassword, setTempPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadUser = async () => {
      const currentUser = await getCurrentUser();
      if (isMounted) {
        setUser(currentUser);
      }
    };

    const loadAgent = async () => {
      try {
        const response = await API.get(`/admin/agents/${id}`);
        if (!isMounted) return;
        if (!response.data.success || !response.data.data) {
          navigate("/admin", { replace: true });
          return;
        }

        const found = response.data.data;
        setAgent(found);
        setFullName(found.name || "");
        setEmail(found.email || "");
        setPhone(found.phone || "");
        setTempPassword("");
      } catch (err) {
        console.error("Failed to load agent", err);
        if (isMounted) {
          navigate("/admin", { replace: true });
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadUser();
    loadAgent();

    return () => {
      isMounted = false;
    };
  }, [id, navigate]);

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  const handleCancel = () => {
    navigate("/admin", { replace: true });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !phone.trim()) {
      setError("Veuillez remplir les champs obligatoires.");
      return;
    }

    try {
      const payload = {
        name: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
      };

      if (tempPassword.trim()) {
        payload.password = tempPassword.trim();
      }

      await API.put(`/admin/agents/${id}`, payload);
      navigate("/admin", { replace: true });
    } catch (err) {
      console.error("Failed to update agent", err);
      setError(
        err.response?.data?.message || "Impossible de mettre à jour l'agent.",
      );
    }
  };

  if (loading) {
    return (
      <div className="app-container">
        <Header onLogout={handleLogout} />
        <section className="main-content admin-form-page">
          <div className="admin-card">
            <p>Chargement de l'agent...</p>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="app-container">
        <Header onLogout={handleLogout} />
        <section className="main-content admin-form-page">
          <div className="admin-card">
            <p>Agent introuvable. Redirection en cours...</p>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  return (
    <div className="app-container">
      <Header onLogout={handleLogout} />
      <section className="main-content admin-form-page">
        <div className="admin-card">
          <div className="admin-form-header">
            <h2>Modifier l'agent</h2>
            <p className="admin-form-description">
              Modifiez les informations de l'agent municipal et enregistrez vos
              modifications.
            </p>
            <p className="admin-form-user">
              Connecté en tant que {user?.email} ({user?.role})
            </p>
          </div>

          <form className="admin-create-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="fullName">Nom complet</label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Karim Ben Ali"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Adresse email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="karim.ali@mairie.tn"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Téléphone</label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+216 98 123 456"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="tempPassword">Mot de passe temporaire</label>
              <input
                id="tempPassword"
                type="text"
                value={tempPassword}
                onChange={(e) => setTempPassword(e.target.value)}
                placeholder="Laisser vide pour garder l'ancien mot de passe"
              />
            </div>

            {error && <p className="form-error">{error}</p>}

            <div className="admin-form-actions">
              <button
                type="button"
                className="btn-cancel"
                onClick={handleCancel}
              >
                Annuler
              </button>
              <button type="submit" className="btn-save">
                Enregistrer
              </button>
            </div>
          </form>
        </div>
      </section>
      <Footer />
    </div>
  );
}

export default AdminEditAgent;
