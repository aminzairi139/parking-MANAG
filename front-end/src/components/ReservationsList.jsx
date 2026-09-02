import React from "react";

function formatRemainingTime(dateFin) {
  if (!dateFin) return null;
  const end = new Date(dateFin);
  const now = new Date();
  const diff = end - now;
  if (diff <= 0) {
    return "Temps restant : terminé";
  }
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  if (hours > 0) {
    return `Temps restant : ${hours}h ${minutes}m`;
  }
  return `Temps restant : ${minutes}m`;
}

function formatEndDate(dateFin) {
  return `Date de fin : ${new Date(dateFin).toLocaleString("fr-FR")}`;
}

function ReservationsList({ reservations, searchQuery, onSearchChange }) {
  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filteredReservations = normalizedQuery
    ? reservations.filter((res) => {
        const plate = (res.plateNumber || "").toLowerCase();
        return plate.includes(normalizedQuery);
      })
    : reservations;

  return (
    <section className="right-section">
      <div className="search-container">
        <h2>Historique des réservations</h2>
        <input
          type="text"
          placeholder="Rechercher par plaque d'immatriculation"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="reservations-list">
        {filteredReservations.length > 0 ? (
          filteredReservations.map((reservation) => (
            <div key={reservation.id} className="reservation-card">
              <div className="reservation-header">
                <span className="plate-number">
                  Plaque: {reservation.plateNumber}
                </span>
                <span className="subscription-type">
                  {reservation.subscriptionType}
                </span>
              </div>
              <div className="reservation-details">
                <p>
                  <strong>Nom:</strong>{" "}
                  {reservation.fullName || reservation.ownerName}
                </p>

                <p>
                  <strong>Date:</strong> {reservation.date}
                </p>
                {reservation.dateFin && (
                  <>
                    <p className="remaining-time">
                      {formatRemainingTime(reservation.dateFin)}
                    </p>
                    <p className="end-date">
                      {formatEndDate(reservation.dateFin)}
                    </p>
                  </>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="no-results">
            <p>Aucune réservation trouvée pour "{searchQuery}"</p>
          </div>
        )}
      </div>
    </section>
  );
}

export default ReservationsList;
