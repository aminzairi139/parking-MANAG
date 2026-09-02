import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, logout } from "../utils/auth";
import API from "../services/api";
import Header from "./Header";
import Footer from "./Footer";

const DEFAULT_PASSWORD = "123456";

function AdminCreateAgent() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [tempPassword, setTempPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadUser = async () => {
      const currentUser = await getCurrentUser();
      if (isMounted) {
        setUser(currentUser);
      }
    };

    loadUser();

    return () => {
      isMounted = false;
    };
  }, []);

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
      const password = tempPassword.trim() || DEFAULT_PASSWORD;
      await API.post("/admin/agents", {
        name: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password,
      });
      navigate("/admin", { replace: true });
    } catch (err) {
      console.error("Failed to create agent", err);
      setError(err.response?.data?.message || "Impossible de créer l'agent.");
    }
  };

  return (
    <div className="app-container">
      <Header onLogout={handleLogout} />
      <section className="main-content admin-form-page">
        <div className="admin-card">
          <div className="admin-form-header">
            <h2>Créer un agent</h2>
            <p className="admin-form-description">
              Remplissez le formulaire ci-dessous pour ajouter un nouvel agent
              municipal.
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
                placeholder="Jean Dupont"
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
                placeholder="agent@ville.fr"
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
                placeholder="+216 XX XXX XXX"
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
                placeholder="Mot de passe temporaire (optionnel)"
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

export default AdminCreateAgent;
