import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import API from "../services/api";

function formatRemaining(minutes) {
  const absolute = Math.abs(minutes);
  if (absolute >= 60) {
    return `${minutes < 0 ? "-" : ""}${Math.floor(absolute / 60)}h ${absolute % 60}m`;
  }
  return `${minutes < 0 ? "-" : ""}${absolute} min`;
}

function VehicleRow({ vehicle, onClick }) {
  return (
    <button type="button" className="parking-vehicle-row" onClick={onClick}>
      <span>{vehicle.plateNumber}</span>
      <strong>{formatRemaining(vehicle.remainingMinutes)}</strong>
    </button>
  );
}

function ParkingDetails() {
  const { parkingId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [parking, setParking] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [query, setQuery] = useState("");
  const [state, setState] = useState({ loading: true, error: "" });

  useEffect(() => {
    const loadDetails = async () => {
      try {
        const response = await API.get(`/parkings/${parkingId}/vehicles`);
        setParking(response.data.data.parking);
        setVehicles(response.data.data.vehicles || []);
        setState({ loading: false, error: "" });
      } catch (error) {
        console.error("Failed to load parking vehicles", error);
        setState({
          loading: false,
          error: "Impossible de charger l’état du parking.",
        });
      }
    };
    loadDetails();
  }, [parkingId]);

  const filteredVehicles = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return vehicles.filter((vehicle) =>
      vehicle.plateNumber.toLowerCase().includes(normalizedQuery),
    );
  }, [query, vehicles]);

  const groups = {
    overdue: filteredVehicles.filter((vehicle) => vehicle.remainingMinutes < 0),
    alerts: filteredVehicles.filter(
      (vehicle) =>
        vehicle.remainingMinutes >= 0 && vehicle.remainingMinutes <= 15,
    ),
    remaining: filteredVehicles.filter(
      (vehicle) => vehicle.remainingMinutes > 15,
    ),
  };

  return (
    <main className="parking-page parking-details-page">
      <div className="parking-page-heading">
        <div>
          <h1>{parking?.name || "État des stationnements"}</h1>
          <p>État des stationnements</p>
        </div>
      </div>
      <button
        type="button"
        className="back-action"
        onClick={() => navigate("/parkings")}
      >
        ← Retour aux parkings
      </button>
      {state.loading && (
        <p className="page-state">Chargement des véhicules...</p>
      )}
      {!state.loading && state.error && (
        <p className="page-error">{state.error}</p>
      )}
      {!state.loading && !state.error && (
        <>
          <div className="parking-summary">
            <h2>{parking.name}</h2>
            <p>Suivi des temps de stationnement</p>
          </div>
          <label className="parking-search">
            <span>Rechercher par plaque</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Ex. 123 4567"
            />
          </label>
          <div className="parking-status-grid">
            <section className="status-card overdue-card">
              <h2>
                <span />
                Temps dépassés
              </h2>
              {groups.overdue.map((vehicle) => (
                <VehicleRow
                  key={vehicle.vehicleId}
                  vehicle={vehicle}
                  onClick={() =>
                    navigate(`/vehicles/${vehicle.vehicleId}/history`, {
                      state: { backgroundLocation: location },
                    })
                  }
                />
              ))}
              {groups.overdue.length === 0 && (
                <p className="empty-status">Aucun véhicule</p>
              )}
            </section>
            <section className="status-card alert-card">
              <h2>
                <span />
                Temps alertes
              </h2>
              {groups.alerts.map((vehicle) => (
                <VehicleRow
                  key={vehicle.vehicleId}
                  vehicle={vehicle}
                  onClick={() =>
                    navigate(`/vehicles/${vehicle.vehicleId}/history`, {
                      state: { backgroundLocation: location },
                    })
                  }
                />
              ))}
              {groups.alerts.length === 0 && (
                <p className="empty-status">Aucun véhicule</p>
              )}
            </section>
            <section className="status-card remaining-card">
              <h2>
                <span />
                Temps restants
              </h2>
              {groups.remaining.map((vehicle) => (
                <VehicleRow
                  key={vehicle.vehicleId}
                  vehicle={vehicle}
                  onClick={() =>
                    navigate(`/vehicles/${vehicle.vehicleId}/history`, {
                      state: { backgroundLocation: location },
                    })
                  }
                />
              ))}
              {groups.remaining.length === 0 && (
                <p className="empty-status">Aucun véhicule</p>
              )}
            </section>
          </div>
        </>
      )}
    </main>
  );
}

export default ParkingDetails;
