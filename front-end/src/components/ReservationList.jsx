import React from "react";

const statusLabels = {
  en_attente: "en attente",
  confirmé: "confirmée",
  annulé: "annulée",
  terminé: "terminée",
};

function formatDate(value) {
  return value ? new Date(value).toLocaleString("fr-FR") : "-";
}

function ReservationList({ reservations, isLoading, error }) {
  return (
    <section className="dashboard-card reservations-card">
      <h2>Mes réservations</h2>
      {isLoading && (
        <p className="card-state">Chargement des réservations...</p>
      )}
      {!isLoading && error && <p className="card-error">{error}</p>}
      {!isLoading && !error && reservations.length === 0 && (
        <p className="card-state">Aucune réservation pour le moment.</p>
      )}
      {!isLoading && !error && reservations.length > 0 && (
        <div className="reservation-summary-list">
          {reservations.map((reservation) => (
            <article className="reservation-summary" key={reservation._id}>
              <strong>{reservation.numImmatriculation}</strong>
              <span>Début : {formatDate(reservation.dateDebut)}</span>
              <span>Fin : {formatDate(reservation.dateFin)}</span>
              <span
                className={`reservation-status status-${reservation.statut}`}
              >
                {statusLabels[reservation.statut] || reservation.statut}
              </span>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default ReservationList;
