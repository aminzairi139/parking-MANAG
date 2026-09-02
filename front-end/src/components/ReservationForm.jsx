import React from "react";

function ReservationForm({
  showForm,
  onToggleForm,
  formData,
  onInputChange,
  onSubmit,
  selectedParking,
}) {
  const isFormComplete = () => {
    return (
      formData.ownerName.trim() &&
      formData.plateNumber.trim() &&
      formData.carNickname.trim() &&
      formData.manufacturer
    );
  };

  const handleSubmitClick = (e) => {
    e.preventDefault();
    if (!selectedParking) {
      alert("Veuillez choisir un parking approuvé avant de confirmer l'ajout.");
      return;
    }
    if (isFormComplete()) {
      onSubmit(e);
    } else {
      alert("Veuillez remplir tous les champs obligatoires");
    }
  };

  return (
    <section className="left-section">
      <h2>ajout du véhicule</h2>
      <button onClick={onToggleForm} className="reservation-btn">
        {showForm ? "annulation" : "ajout du véhicule"}
      </button>

      {selectedParking ? (
        <div className="selected-parking-banner">
          <strong>Parking sélectionné:</strong> {selectedParking.name} -{" "}
          {selectedParking.location}
        </div>
      ) : (
        <div className="selected-parking-banner note">
          Choisissez un parking approuvé ci-dessus avant d'ajouter votre
          véhicule.
        </div>
      )}

      {showForm && (
        <form className="reservation-form" onSubmit={handleSubmitClick}>
          <div className="registration-region">
            {["Autre", "RS", "TN"].map((region) => (
              <label
                key={region}
                className={`region-option ${formData.registrationRegion === region ? "active" : ""}`}
              >
                <input
                  type="radio"
                  name="registrationRegion"
                  value={region}
                  checked={formData.registrationRegion === region}
                  onChange={onInputChange}
                />
                {region}
              </label>
            ))}
          </div>

          {formData.registrationRegion === "TN" && (
            <div className="tunisia-badge">
              <button type="button">120</button>
              <span>تونس</span>
              <button type="button">130</button>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="ownerName">Nom du conducteur </label>
            <input
              type="text"
              id="ownerName"
              name="ownerName"
              value={formData.ownerName}
              onChange={onInputChange}
              placeholder="Entrez le nom du conducteur"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="plateNumber">
              Numéro d'immatriculation des véhicule
            </label>
            <input
              type="text"
              id="plateNumber"
              name="plateNumber"
              value={formData.plateNumber}
              onChange={onInputChange}
              placeholder="EXEMPLE: 13-TUN-255"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="carNickname">Modéle de la véhicule </label>
            <input
              type="text"
              id="carNickname"
              name="carNickname"
              value={formData.carNickname}
              onChange={onInputChange}
              placeholder="exp: Mercedes-Benz c-180"
            />
          </div>

          <div className="form-group">
            <label htmlFor="carType">La marques des véhicules</label>
            <select
              id="carType"
              name="carType"
              value={formData.carType}
              onChange={onInputChange}
            >
              <option value="شعبية">شعبية</option>
              <option value="véhicule sportif">véhicule sportif</option>
              <option value="2*">2*4</option>
              <option value="4*4">4*4</option>
              <option value="électrique">électrique</option>
              <option value="hybride">hybride</option>
            </select>
          </div>

          <div className="form-group color-row">
            <label htmlFor="carColor">Couleur du véhicule </label>
            <input
              type="color"
              id="carColor"
              name="carColor"
              value={formData.carColor}
              onChange={onInputChange}
            />
            <span className="color-label">{formData.carColor}</span>
          </div>

          <div className="form-group">
            <label htmlFor="subscriptionType">Type d'abonnement</label>
            <select
              id="subscriptionType"
              name="subscriptionType"
              value={formData.subscriptionType}
              onChange={onInputChange}
            >
              <option value="1heure">1heure</option>
              <option value="2 HEURES">2heures</option>
              <option value="3HEURES">3heures</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="manufacturer">Maison du véhicule </label>
            <select
              id="manufacturer"
              name="manufacturer"
              value={formData.manufacturer}
              onChange={onInputChange}
              required
            >
              <option value="">Sélectionnez une marque</option>
              <option value="Audi">Audi</option>
              <option value="BMW">BMW</option>
              <option value="Chery">Chery</option>
              <option value="Haval">Haval</option>
              <option value="Mercedes-Benz">Mercedes-Benz</option>
              <option value="Toyota">Toyota</option>
              <option value="Honda">Honda</option>
              <option value="Ford">Ford</option>
              <option value="Volkswagen">Volkswagen</option>
              <option value="Nissan">Nissan</option>
              <option value="Hyundai">Hyundai</option>
              <option value="Kia">Kia</option>
              <option value="Peugeot">Peugeot</option>
              <option value="Renault">Renault</option>
              <option value="Citroën">Citroën</option>
              <option value="Fiat">Fiat</option>
              <option value="Opel">Opel</option>
              <option value="Seat">Seat</option>
              <option value="Skoda">Skoda</option>
              <option value="Volvo">Volvo</option>
              <option value="Mazda">Mazda</option>
              <option value="Mitsubishi">Mitsubishi</option>
              <option value="Suzuki">Suzuki</option>
              <option value="Subaru">Subaru</option>
              <option value="Jeep">Jeep</option>
              <option value="Land Rover">Land Rover</option>
              <option value="Jaguar">Jaguar</option>
              <option value="Porsche">Porsche</option>
              <option value="Ferrari">Ferrari</option>
              <option value="Lamborghini">Lamborghini</option>
              <option value="Tesla">Tesla</option>
              <option value="Autre">Autre</option>
            </select>
          </div>

          <button type="submit" className="submit-btn">
            Confirmer l'ajout
          </button>
        </form>
      )}
    </section>
  );
}

export default ReservationForm;
