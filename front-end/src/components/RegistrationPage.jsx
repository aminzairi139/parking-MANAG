import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import authService from "../services/authService";

const initialValues = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  acceptTerms: false,
};

function validate(values) {
  const errors = {};
  if (!values.name.trim()) errors.name = "Le nom est obligatoire.";
  if (!values.email.trim()) {
    errors.email = "L’adresse e-mail est obligatoire.";
  } else if (!/^\S+@\S+\.\S+$/.test(values.email)) {
    errors.email = "Saisissez une adresse e-mail valide.";
  }
  if (!values.password) {
    errors.password = "Le mot de passe est obligatoire.";
  } else if (values.password.length < 6) {
    errors.password = "Le mot de passe doit contenir au moins 6 caractères.";
  }
  if (!values.confirmPassword) {
    errors.confirmPassword = "Confirmez votre mot de passe.";
  } else if (values.password !== values.confirmPassword) {
    errors.confirmPassword = "Les mots de passe ne correspondent pas.";
  }
  if (!values.acceptTerms) errors.acceptTerms = "Vous devez accepter les CGU.";
  return errors;
}

function RegistrationPage() {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    const nextValues = {
      ...values,
      [name]: type === "checkbox" ? checked : value,
    };
    setValues(nextValues);
    setErrors((current) => ({
      ...current,
      [name]: validate(nextValues)[name],
    }));
    setServerError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationErrors = validate(values);
    setErrors(validationErrors);
    setServerError("");
    setSuccess("");
    if (Object.keys(validationErrors).length > 0) return;

    setSubmitting(true);
    try {
      await authService.register(
        values.name,
        values.email,
        values.password,
        undefined,
        "user",
        values.confirmPassword,
        values.acceptTerms,
      );
      setSuccess("Compte créé. Redirection vers la connexion...");
      window.setTimeout(() => navigate("/login", { replace: true }), 900);
    } catch (error) {
      setServerError(
        error.response?.data?.message ||
          error.message ||
          "Impossible de créer le compte.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-container registration-container">
      <section className="login-box registration-box">
        <div className="registration-heading">
          <span className="registration-mark">P</span>
          <h1>Parking Management</h1>
          <h2>Créer un compte</h2>
          <p>Rejoignez votre espace de gestion du stationnement.</p>
        </div>
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="name">Nom complet *</label>
            <input
              id="name"
              name="name"
              value={values.name}
              onChange={handleChange}
              autoComplete="name"
            />
            {errors.name && <p className="field-error">{errors.name}</p>}
          </div>
          <div className="form-group">
            <label htmlFor="registration-email">Adresse e-mail *</label>
            <input
              id="registration-email"
              name="email"
              type="email"
              value={values.email}
              onChange={handleChange}
              autoComplete="email"
            />
            {errors.email && <p className="field-error">{errors.email}</p>}
          </div>
          <div className="form-group">
            <label htmlFor="registration-password">Mot de passe *</label>
            <input
              id="registration-password"
              name="password"
              type="password"
              value={values.password}
              onChange={handleChange}
              autoComplete="new-password"
            />
            {errors.password && (
              <p className="field-error">{errors.password}</p>
            )}
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirmer le mot de passe *</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={values.confirmPassword}
              onChange={handleChange}
              autoComplete="new-password"
            />
            {errors.confirmPassword && (
              <p className="field-error">{errors.confirmPassword}</p>
            )}
          </div>
          <label className="terms-check">
            <input
              type="checkbox"
              name="acceptTerms"
              checked={values.acceptTerms}
              onChange={handleChange}
            />
            <span>
              J’accepte les{" "}
              <a href="/cgu" onClick={(event) => event.preventDefault()}>
                conditions générales d’utilisation
              </a>{" "}
              *
            </span>
          </label>
          {errors.acceptTerms && (
            <p className="field-error terms-error">{errors.acceptTerms}</p>
          )}
          {serverError && <p className="form-error">{serverError}</p>}
          {success && <p className="form-success">{success}</p>}
          <button type="submit" className="login-btn" disabled={submitting}>
            {submitting ? "Création..." : "Créer mon compte"}
          </button>
        </form>
        <hr />
          <br />
        <p className="registration-login-link">
          Déjà un compte ? <Link to="/login">Se connecter</Link>
        </p>
      </section>
    </div>
  );
}

export default RegistrationPage;
