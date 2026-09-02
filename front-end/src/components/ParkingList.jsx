import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import authService from "../services/authService";

function ParkingList() {
  const [parkings, setParkings] = useState([]);
  const [state, setState] = useState({ loading: true, error: "" });
  const navigate = useNavigate();
  const user = authService.getCurrentUser();

  useEffect(() => {
    const loadParkings = async () => {
      try {
        const userId = user?._id || user?.id;
        const response = await API.get(`/parkings/user/${userId}`);
        setParkings(response.data.data || []);
      } catch (error) {
        console.error("Failed to load user parkings", error);
        setState({
          loading: false,
          error: "Impossible de charger vos parkings.",
        });
        return;
      }
      setState({ loading: false, error: "" });
    };

    if (user?._id || user?.id) loadParkings();
  }, [user?._id, user?.id]);

  return (
    <main className="parking-page">
      <div className="parking-page-heading">
        <div>
          <h1>Mes parkings</h1>
          <p>Sélectionnez un parking pour voir les véhicules.</p>
        </div>
        <div className="account-chip">
          Compte connecté
          <br />
          <strong>{user?.email}</strong>
        </div>
      </div>
      {state.loading && (
        <p className="page-state">Chargement des parkings...</p>
      )}
      {!state.loading && state.error && (
        <p className="page-error">{state.error}</p>
      )}
      {!state.loading && !state.error && parkings.length === 0 && (
        <p className="page-state">Aucun parking ne vous est assigné.</p>
      )}
      <div className="parking-dashboard-grid">
        {parkings.map((parking) => (
          <article className="parking-dashboard-card" key={parking._id}>
            <div className="parking-card-topline">
              <span className="parking-icon">P</span>
              <span className="parking-open">Ouvert</span>
            </div>
            <h2>{parking.name}</h2>
            <p>{parking.location}</p>
            <div className="parking-capacity">
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
              className="primary-action"
              onClick={() => navigate(`/parkings/${parking._id}/vehicles`)}
            >
              Voir les véhicules →
            </button>
          </article>
        ))}
      </div>
    </main>
  );
}

export default ParkingList;
