import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import authService from "../services/authService";
import { useAuth } from "../contexts/AuthContext";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    let isMounted = true;

    const checkExistingUser = () => {
      const existingUser = authService.getCurrentUser();
      if (isMounted && existingUser) {
        navigate(
          existingUser.role === "sector_admin"
            ? "/sector-dashboard"
            : existingUser.role === "agent"
              ? "/historique"
              : existingUser.role === "admin" ||
                  existingUser.role === "super_admin"
                ? "/admin"
                : "/ajout",
          {
            replace: true,
          },
        );
      }
    };

    checkExistingUser();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError("");
      const { user } = await login(email, password, rememberMe);

      const dest =
        user.role === "sector_admin"
          ? "/sector-dashboard"
          : user.role === "agent"
            ? "/historique"
            : user.role === "admin" || user.role === "super_admin"
              ? "/admin"
              : "/ajout";

      navigate(dest, { replace: true });
    } catch (err) {
      setError(
        err.response?.status === 400
          ? "Adresse e-mail ou mot de passe incorrect"
          : err.message || "Erreur de connexion",
      );
    }
  };

  return (
    <div className="login-container responsive-login-page">
      <div className="login-box">
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <img
            src="/public/téléchargement.png"
            alt="logo de parking"
            width="96"
            height="96"
          />
        </div>

        <h1>Parking Management</h1>
        <h2>Connexion</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Identifiant</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nom@domaine.com"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Mot de passe</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="......"
              required
            />
          </div>

          <label className="remember-me">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(event) => setRememberMe(event.target.checked)}
            />
            Rester connecté
          </label>

          {error && (
            <p style={{ color: "#e74c3c", marginBottom: "12px" }}>{error}</p>
          )}

          <button type="submit" className="login-btn">
            Se connecter
          </button>
          <hr />
          <br />
          <p className="signup-redirect">
            <Link to="/inscription">Pas encore de compte ? S'inscrire</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
