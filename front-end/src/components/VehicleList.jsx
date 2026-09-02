import React from "react";

function VehicleList({ vehicles, isLoading, error, onSelect }) {
  return (
    <section className="dashboard-card vehicles-card">
      <h2>Mes véhicules</h2>
      {isLoading && <p className="card-state">Chargement des véhicules...</p>}
      {!isLoading && error && <p className="card-error">{error}</p>}
      {!isLoading && !error && vehicles.length === 0 && (
        <p className="card-state">Aucun véhicule enregistré.</p>
      )}
      {!isLoading && !error && vehicles.length > 0 && (
        <div className="vehicle-list">
          {vehicles.map((vehicle) => (
            <button
              type="button"
              className="vehicle-item"
              key={vehicle._id}
              onClick={() => onSelect(vehicle)}
            >
              <span className="vehicle-registration">
                {vehicle.registrationNumber}
              </span>
              <span className="vehicle-type">{vehicle.type}</span>
            </button>
          ))}
        </div>
      )}
      <p className="card-hint">
        Cliquez sur un véhicule pour l’utiliser dans la réservation.
      </p>
    </section>
  );
}

export default VehicleList;
