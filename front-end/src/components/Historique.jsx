import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../services/authService";
import API from "../services/api";
import Header from "./Header";
import Footer from "./Footer";

function formatRemaining(minutes) {
  const absolute = Math.abs(minutes);
  if (absolute >= 60) {
    return `${minutes < 0 ? "-" : ""}${Math.floor(absolute / 60)}h ${absolute % 60}m`;
  }
  return `${minutes < 0 ? "-" : ""}${absolute} min`;
}

function VehicleRow({ vehicle, onClick }) {
  return (
    <button type="button" className="agent-vehicle-row" onClick={onClick}>
      <span>{vehicle.plateNumber}</span>
      <strong>{formatRemaining(vehicle.remainingMinutes)}</strong>
    </button>
  );
}

function Historique() {
  const [user] = useState(() => authService.getCurrentUser());
  const [parkings, setParkings] = useState([]);
  const [selectedParking, setSelectedParking] = useState(null);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [state, setState] = useState({ loading: true, error: "" });
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    API.get("/agents/parking-dashboard")
      .then((response) => {
        if (!isMounted) return;
        setParkings(response.data.data || []);
        setState({ loading: false, error: "" });
      })
      .catch((error) => {
        console.error("Failed to load agent parking dashboard", error);
        if (isMounted) {
          setState({
            loading: false,
            error: "Impossible de charger les parkings assignés.",
          });
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredVehicles = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return (selectedParking?.vehicles || []).filter((vehicle) =>
      vehicle.plateNumber.toLowerCase().includes(query),
    );
  }, [searchQuery, selectedParking]);

  const groups = {
    overdue: filteredVehicles.filter(
      (vehicle) => vehicle.remainingMinutes < -15,
    ),
    alerts: filteredVehicles.filter(
      (vehicle) =>
        vehicle.remainingMinutes >= -15 && vehicle.remainingMinutes <= 15,
    ),
    remaining: filteredVehicles.filter(
      (vehicle) => vehicle.remainingMinutes > 15,
    ),
  };

  const openParking = (parking) => {
    setSelectedParking(parking);
    setSelectedVehicle(null);
    setSearchQuery("");
  };

  const closeParking = () => {
    setSelectedParking(null);
    setSelectedVehicle(null);
    setSearchQuery("");
  };

  const handleLogout = async () => {
    authService.logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="app-container agent-history-app">
      <Header onLogout={handleLogout} />
      <main className="agent-history-main">
        {!selectedParking && (
          <section className="agent-view-shell">
            <div className="agent-page-heading">
              <div>
                <h1>Mes parkings</h1>
                <p>Sélectionnez un parking pour voir les véhicules.</p>
              </div>
              <div className="agent-account-chip">
                <strong>👤 Compte agent</strong>
                <span>{user?.email}</span>
              </div>
            </div>
            {state.loading && (
              <p className="page-state">Chargement des parkings...</p>
            )}
            {state.error && <p className="page-error">{state.error}</p>}
            {!state.loading && !state.error && parkings.length === 0 && (
              <p className="page-state">
                Aucun parking approuvé ne vous est assigné.
              </p>
            )}
            <div className="agent-parking-grid">
              {parkings.map((parking) => (
                <article className="agent-parking-card" key={parking._id}>
                  <div className="agent-card-topline">
                    <span className="agent-parking-icon">P</span>
                    <span className="agent-open-badge">Ouvert</span>
                  </div>
                  <h2>{parking.name}</h2>
                  <p>{parking.location}</p>
                  <div className="agent-capacity">
                    <span>
                      <strong>{parking.capacity}</strong>
                      <small>places</small>
                    </span>
                    <span>
                      <strong>{parking.occupied}</strong>
                      <small>occupées</small>
                    </span>
                  </div>
                  <button
                    type="button"
                    className="agent-primary-action"
                    onClick={() => openParking(parking)}
                  >
                    Voir les véhicules →
                  </button>
                </article>
              ))}
            </div>
          </section>
        )}

        {selectedParking && (
          <section className="agent-view-shell agent-parking-details">
            <div className="agent-page-heading">
              <div>
                <h1>{selectedParking.name}</h1>
                <p>État des stationnements</p>
              </div>
              <div className="agent-account-chip">
                <strong>Compte agent</strong>
                <span>{user?.email}</span>
              </div>
            </div>
            <button
              type="button"
              className="agent-back-action"
              onClick={closeParking}
            >
              ← Retour aux parkings
            </button>
            <div className="agent-parking-summary">
              <h2>{selectedParking.name}</h2>
              <p>Suivi des temps de stationnement</p>
            </div>
            <label className="agent-search-field">
              <span>Rechercher par plaque d’immatriculation</span>
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Ex. 123 4567"
              />
            </label>
            <div className="agent-status-grid">
              {[
                ["overdue", "Temps dépassés"],
                ["alerts", "Temps alertes"],
                ["remaining", "Temps restants"],
              ].map(([key, title]) => (
                <section className={`agent-status-card ${key}`} key={key}>
                  <h2>
                    <span />
                    {title}
                  </h2>
                  {groups[key].map((vehicle) => (
                    <VehicleRow
                      key={vehicle.id}
                      vehicle={vehicle}
                      onClick={() => setSelectedVehicle(vehicle)}
                    />
                  ))}
                  {groups[key].length === 0 && (
                    <p className="page-state">Aucun véhicule</p>
                  )}
                </section>
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer />

      {selectedVehicle && (
        <div
          className="agent-history-overlay"
          role="presentation"
          onClick={(event) =>
            event.target === event.currentTarget && setSelectedVehicle(null)
          }
        >
          <section
            className="agent-history-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="agent-history-title"
          >
            <div className="agent-modal-heading">
              <div>
                <h1 id="agent-history-title">Historique du véhicule</h1>
                <p>{selectedVehicle.plateNumber}</p>
              </div>
              <button
                type="button"
                className="agent-close-action"
                onClick={() => setSelectedVehicle(null)}
                aria-label="Fermer"
              >
                ×
              </button>
            </div>
            <div className="agent-vehicle-facts">
              <div>
                <strong>Plaque</strong>
                <span>{selectedVehicle.plateNumber}</span>
              </div>
              <div>
                <strong>Conducteur</strong>
                <span>{selectedVehicle.driver || "-"}</span>
              </div>
              <div>
                <strong>Ville</strong>
                <span>{selectedVehicle.city || "-"}</span>
              </div>
              <div>
                <strong>Marque / modèle</strong>
                <span>{selectedVehicle.brand}</span>
              </div>
              <div>
                <strong>Statut</strong>
                <span
                  className={
                    selectedVehicle.status === "Actif"
                      ? "agent-active-status"
                      : "agent-inactive-status"
                  }
                >
                  {selectedVehicle.status}
                </span>
              </div>
            </div>
            <h2>Historique des stationnements</h2>
            {selectedVehicle.history.map((item) => (
              <div className="agent-history-line" key={item.id}>
                <span>{item.parkingName}</span>
                <span>
                  {new Date(item.dateDebut).toLocaleString("fr-FR")} →{" "}
                  {new Date(item.dateFin).toLocaleString("fr-FR")}
                </span>
              </div>
            ))}
            <h2>Autres véhicules du parking</h2>
            <div className="agent-other-vehicles">
              {selectedParking.vehicles
                .filter((vehicle) => vehicle.id !== selectedVehicle.id)
                .map((vehicle) => (
                  <VehicleRow
                    key={vehicle.id}
                    vehicle={vehicle}
                    onClick={() => setSelectedVehicle(vehicle)}
                  />
                ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

export default Historique;
