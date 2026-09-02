import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import API from "../services/api";

function formatRemaining(minutes) {
  const absolute = Math.abs(minutes);
  if (absolute >= 60) {
    return `${minutes < 0 ? "-" : ""}${Math.floor(absolute / 60)}h ${absolute % 60}m`;
  }
  return `${minutes < 0 ? "-" : ""}${absolute} min`;
}

function VehicleHistory() {
  const { vehicleId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    API.get(`/vehicles/${vehicleId}/history`)
      .then((response) => setData(response.data.data))
      .catch((requestError) => {
        console.error("Failed to load vehicle history", requestError);
        setError("Impossible de charger l’historique du véhicule.");
      });
  }, [vehicleId]);

  return (
    <main
      className={`vehicle-history-page ${
        location.state?.backgroundLocation ? "vehicle-history-modal-page" : ""
      }`}
    >
      <button
        type="button"
        className="back-action"
        onClick={() => navigate(-1)}
      >
        ← Retour
      </button>
      {error && <p className="page-error">{error}</p>}
      {!data && !error && (
        <p className="page-state">Chargement de l’historique...</p>
      )}
      {data && (
        <section className="vehicle-history-panel">
          <div className="history-heading">
            <div>
              <h1>Historique du véhicule</h1>
              <p>{data.vehicle.plateNumber}</p>
            </div>
            <button
              type="button"
              className="close-action"
              onClick={() => navigate(-1)}
              aria-label="Fermer l’historique"
            >
              ×
            </button>
          </div>
          <div className="vehicle-facts">
            <div>
              <strong>Plaque</strong>
              <span>{data.vehicle.plateNumber}</span>
            </div>
            <div>
              <strong>Conducteur</strong>
              <span>{data.vehicle.driver}</span>
            </div>
            <div>
              <strong>Ville</strong>
              <span>{data.vehicle.city}</span>
            </div>
            <div>
              <strong>Marque / modèle</strong>
              <span>{data.vehicle.brand}</span>
            </div>
            <div>
              <strong>Statut</strong>
              <span
                className={`vehicle-status ${
                  data.vehicle.status === "Actif"
                    ? "active-status"
                    : "inactive-status"
                }`}
              >
                {data.vehicle.status}
              </span>
            </div>
          </div>
          <h2>Historique des stationnements</h2>
          {data.history.length === 0 ? (
            <p className="page-state">Aucun historique.</p>
          ) : (
            data.history.map((item) => (
              <div className="history-line" key={item._id}>
                <span>{item.parking?.name || "Parking"}</span>
                <span>
                  {new Date(item.dateDebut).toLocaleString("fr-FR")} →{" "}
                  {new Date(item.dateFin).toLocaleString("fr-FR")}
                </span>
              </div>
            ))
          )}
          <h2>Autres véhicules du parking</h2>
          {data.otherVehicles?.length ? (
            <div className="other-vehicles-list">
              {data.otherVehicles.map((vehicle) => (
                <button
                  type="button"
                  className="other-vehicle-row"
                  key={vehicle.id}
                  onClick={() =>
                    navigate(`/vehicles/${vehicle.id}/history`, {
                      state: {
                        backgroundLocation:
                          location.state?.backgroundLocation || location,
                      },
                    })
                  }
                >
                  <span>{vehicle.plateNumber}</span>
                  <strong>{formatRemaining(vehicle.remainingMinutes)}</strong>
                </button>
              ))}
            </div>
          ) : (
            <p className="page-state">Aucun autre véhicule dans ce parking.</p>
          )}
        </section>
      )}
    </main>
  );
}

export default VehicleHistory;
