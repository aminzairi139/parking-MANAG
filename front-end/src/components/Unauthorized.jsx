import React from "react";
import { Link } from "react-router-dom";

function Unauthorized() {
  return (
    <div className="login-container" style={{ minHeight: "70vh" }}>
      <div className="login-box" style={{ maxWidth: "480px" }}>
        <h1>Accès refusé</h1>
        <p>Vous n’êtes pas autorisé à accéder à cette section.</p>
        <Link to="/login" className="login-btn">
          Revenir à la connexion
        </Link>
      </div>
    </div>
  );
}

export default Unauthorized;
