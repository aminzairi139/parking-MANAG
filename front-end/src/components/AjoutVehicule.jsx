import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, logout } from "../utils/auth";
import API from "../services/api";
import ReservationForm from "./ReservationForm";
import PaymentModal from "./PaymentModal";
import Header from "./Header";
import Footer from "./Footer";
import VehicleList from "./VehicleList";
import ReservationList from "./ReservationList";

const DEFAULT_APPROVED_PARKINGS = [
  { _id: "default-1", name: "Parking Central", location: "Centre-ville" },
  {
    _id: "default-2",
    name: "Parking Lafayette",
    location: "Quartier Lafayette",
  },
  { _id: "default-3", name: "Parking Nord", location: "Zone Nord" },
  { _id: "default-4", name: "Parking Ouest", location: "Zone Ouest" },
  { _id: "default-5", name: "Parking Sud", location: "Avenue Sud" },
  { _id: "default-6", name: "Parking Est", location: "Boulevard Est" },
  { _id: "default-7", name: "Parking Gare", location: "Zone de la gare" },
];

function AjoutVehicule() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [reservations, setReservations] = useState([]);
  const [selectedParking, setSelectedParking] = useState(null);
  const [approvedParkings, setApprovedParkings] = useState([]);
  const [isLoadingParkings, setIsLoadingParkings] = useState(true);
  const [vehicles, setVehicles] = useState([]);
  const [userReservations, setUserReservations] = useState([]);
  const [isLoadingCards, setIsLoadingCards] = useState(false);
  const [cardsError, setCardsError] = useState("");

  const handleSelectParking = (parking) => {
    setSelectedParking(parking);
    setShowForm(true);
    navigate("/ajout");
  };

  useEffect(() => {
    let isMounted = true;

    const loadUser = async () => {
      const currentUser = await getCurrentUser();
      if (isMounted) {
        setUser(currentUser);
      }
    };

    const loadParkings = async () => {
      try {
        const resp = await API.get("/users/parkings");
        if (isMounted) {
          const parkings = resp.data.data || [];
          setApprovedParkings(
            parkings.length > 0 ? parkings : DEFAULT_APPROVED_PARKINGS,
          );
        }
      } catch (err) {
        console.error("Failed to load approved parkings", err);
        if (isMounted) {
          setApprovedParkings(DEFAULT_APPROVED_PARKINGS);
        }
      } finally {
        if (isMounted) {
          setIsLoadingParkings(false);
        }
      }
    };

    loadUser();
    loadParkings();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!user?._id && !user?.id) return;
    const userId = user._id || user.id;
    let isMounted = true;

    const loadDashboardCards = async () => {
      setIsLoadingCards(true);
      setCardsError("");
      try {
        const [vehiclesResponse, reservationsResponse] = await Promise.all([
          API.get(`/vehicles/user/${userId}`),
          API.get(`/reservations/user/${userId}`),
        ]);
        if (isMounted) {
          setVehicles(vehiclesResponse.data.data || []);
          setUserReservations(reservationsResponse.data.data || []);
        }
      } catch (error) {
        console.error("Failed to load user dashboard data", error);
        if (isMounted) {
          setCardsError("Impossible de charger vos véhicules et réservations.");
        }
      } finally {
        if (isMounted) setIsLoadingCards(false);
      }
    };

    loadDashboardCards();
    return () => {
      isMounted = false;
    };
  }, [user]);

  const [formData, setFormData] = useState({
    registrationRegion: "Autre",
    ownerName: "",
    plateNumber: "",
    carNickname: "",
    carType: "véhicule sportif",
    carColor: "#3a5478",
    manufacturer: "",
    subscriptionType: "1heure",
  });

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  const onInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleVehicleSelect = (vehicle) => {
    setFormData((prev) => ({
      ...prev,
      plateNumber: vehicle.registrationNumber,
      carType: vehicle.type,
    }));
    setShowForm(true);
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (!selectedParking) {
      alert(
        "L’ajout d’un véhicule n’est possible que si vous choisissez d’abord un parking approuvé.",
      );
      return;
    }
    // Show payment modal instead of directly adding the vehicle
    setShowPaymentModal(true);
  };

  const handlePaymentConfirm = (paymentData) => {
    // Add vehicle after payment is confirmed — persist to backend
    (async () => {
      const payload = {
        parkingId: selectedParking?._id || selectedParking?.name,
        parkingName: selectedParking?.name,
        plateNumber: formData.plateNumber,
        subscriptionType: formData.subscriptionType,
        ownerName: formData.ownerName,
        carType: formData.carType,
        carColor: formData.carColor,
        manufacturer: formData.manufacturer,
        // amount: optional — backend will compute default when omitted
      };
      try {
        const resp = await API.post("/users/reserve", payload);
        const created = resp?.data?.data;
        const newRes = {
          id: created?.id || reservations.length + 1,
          ...formData,
          parking: selectedParking?.name ?? "Parking non sélectionné",
          payment: paymentData,
          fullName: formData.ownerName,
          date: new Date().toLocaleString("fr-FR"),
          _backend: created,
        };
        setReservations((prev) => [...prev, newRes]);
        setFormData({
          registrationRegion: "Autre",
          ownerName: "",
          plateNumber: "",
          carNickname: "",
          carType: "véhicule sportif",
          carColor: "#3a5478",
          manufacturer: "",
          subscriptionType: "1heure",
        });
        setShowPaymentModal(false);
        setShowForm(false);
        setShowSuccessModal(true);
      } catch (err) {
        console.error("Reservation failed", err);
        alert(
          "La réservation a échoué. Vérifiez la console pour plus de détails.",
        );
        setShowPaymentModal(false);
      }
    })();
  };

  return (
    <div className="app-container">
      <Header onLogout={handleLogout} />
      <section className="main-content">
        <div className="right-section">
          <h2>Ajout du véhicule</h2>
          <p>
            Connecté : {user?.email} (role : {user?.role})
          </p>
          <div className="parking-cards-section">
            <h3>Parkings approuvés</h3>
            {isLoadingParkings ? (
              <p>Chargement des parkings approuvés...</p>
            ) : (
              <div className="parking-cards">
                {approvedParkings.map((parking) => (
                  <div
                    key={parking._id}
                    className={`parking-card ${selectedParking?._id === parking._id ? "selected" : ""}`}
                    onClick={() => handleSelectParking(parking)}
                  >
                    <div className="parking-card-header">
                      <span className="parking-logo">P</span>
                      <span className="parking-name">{parking.name}</span>
                    </div>
                    <div className="parking-card-body">
                      <p>l'emlacement: {parking.location}</p>
                    </div>
                    <div className="parking-card-actions">
                      <button type="button" className="parking-card-button">
                        Accéder àu parking
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="reservation-workspace">
            <ReservationForm
              selectedParking={selectedParking}
              showForm={showForm}
              onToggleForm={() => setShowForm(!showForm)}
              formData={formData}
              onInputChange={onInputChange}
              onSubmit={onSubmit}
            />
            <aside className="user-dashboard-cards">
              <VehicleList
                vehicles={vehicles}
                isLoading={isLoadingCards}
                error={cardsError}
                onSelect={handleVehicleSelect}
              />
              <ReservationList
                reservations={userReservations}
                isLoading={isLoadingCards}
                error={cardsError}
              />
            </aside>
          </div>
          {reservations.length > 0 && (
            <div style={{ marginTop: "1rem" }}>
              <h3>Véhicules ajoutés</h3>
              <ul>
                {reservations.map((item) => (
                  <li
                    key={item.id}
                  >{`${item.ownerName} - ${item.plateNumber} (${item.carType})`}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onConfirm={handlePaymentConfirm}
      />

      {showSuccessModal && (
        <div className="success-modal-overlay">
          <div className="success-modal">
            <div className="success-icon">✓</div>
            <h2>Succès</h2>
            <p>Réservation ajoutée avec succès!</p>
            <button
              type="button"
              className="success-button"
              onClick={() => setShowSuccessModal(false)}
            >
              OK
            </button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default AjoutVehicule;
