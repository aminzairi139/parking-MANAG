import React from "react";

function Header({ onLogout }) {
  return (
    <header className="app-header">
      <h1>Parking Management System</h1>
      <button onClick={onLogout} className="logout-btn">
        Déconnexion
      </button>
    </header>
  );
}

export default Header;
