import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "./Header";
import ReservationForm from "./ReservationForm";
import ReservationsList from "./ReservationsList";
import Footer from "./Footer";
import API from "../services/api";
import authService from "../services/authService";

function Dashboard() {
  const [showReservationForm, setShowReservationForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [reservations, setReservations] = useState([]);
  const navigate = useNavigate();
  const [newReservation, setNewReservation] = useState({
    registrationRegion: "Autre",
    ownerName: "",
    cin: "",
    plateNumber: "",
    carNickname: "",
    carType: "véhicule sportif",
    carColor: "#3a5478",
    manufacturer: "",
    parking: "",
    subscriptionType: "1heure",
  });

  const fetchReservations = async () => {
    try {
      const response = await API.get("/users/reservations");
      if (response.data && response.data.success) {
        const mapped = response.data.data.map((res) => ({
          id: res._id || res.id,
          plateNumber: res.numImmatriculation,
          subscriptionType: res.typeReservation,
          fullName: res.nomConducteur,
          ownerName: res.nomConducteur,
          cin: res.client?.cin || res.client?.phone || "",
          date: new Date(res.dateDebut).toLocaleString("fr-FR"),
          dateFin: res.dateFin,
        }));
        setReservations(mapped);
      }
    } catch (err) {
      console.error("Failed to fetch reservations", err);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const handleLogout = () => {
    authService.logout();
    navigate("/login", { replace: true });
  };

  const handleReservationSubmit = (e) => {
    e.preventDefault();
    // Redirect to the proper /ajout page where parkings are listed
    navigate("/ajout");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewReservation({
      ...newReservation,
      [name]: value,
    });
  };

  const handleChooseFactory = () => {
    const name = prompt(
      "Entrez le nom du fabricant:",
      newReservation.manufacturer || "",
    );
    if (name !== null) {
      setNewReservation({ ...newReservation, manufacturer: name });
    }
  };

  const handleChooseParking = () => {
    const place = prompt(
      "Entrez le nom du parking approuvé:",
      newReservation.parking || "",
    );
    if (place !== null) {
      setNewReservation({ ...newReservation, parking: place });
    }
  };

  return (
    <div className="app-container">
      <Header onLogout={handleLogout} />

      <main className="main-content">
        <ReservationForm
          showForm={showReservationForm}
          onToggleForm={() => setShowReservationForm(!showReservationForm)}
          formData={newReservation}
          onInputChange={handleInputChange}
          onSubmit={handleReservationSubmit}
          onChooseFactory={handleChooseFactory}
          onChooseParking={handleChooseParking}
        />

        <ReservationsList
          reservations={reservations}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
      </main>

      <Footer />
    </div>
  );
}

export default Dashboard;
