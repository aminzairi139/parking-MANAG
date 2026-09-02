import React, { useState } from "react";
import "./PaymentModal.css";

function PaymentModal({ isOpen, onClose, onConfirm }) {
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [cardData, setCardData] = useState({
    cardNumber: "",
    cardholderName: "",
    expiryDate: "",
    cvv: "",
    cardType: "VISA",
  });
  const [d17Data, setD17Data] = useState({
    phoneNumber: "",
    pinCode: "",
  });

  const handleCardDataChange = (e) => {
    const { name, value } = e.target;
    setCardData((prev) => ({ ...prev, [name]: value }));
  };

  const handleD17DataChange = (e) => {
    const { name, value } = e.target;
    const digitsOnly = value.replace(/\D/g, "");

    if (name === "phoneNumber") {
      setD17Data((prev) => ({
        ...prev,
        [name]: digitsOnly.slice(0, 8),
      }));
    } else if (name === "pinCode") {
      setD17Data((prev) => ({
        ...prev,
        [name]: digitsOnly.slice(0, 4),
      }));
    } else {
      setD17Data((prev) => ({ ...prev, [name]: value }));
    }
  };

  const isCardValid = () => {
    return (
      cardData.cardNumber.trim() &&
      cardData.cardholderName.trim() &&
      cardData.expiryDate.trim() &&
      cardData.cvv.trim()
    );
  };

  const isD17Valid = () => {
    return d17Data.phoneNumber.trim() && d17Data.pinCode.trim();
  };

  const handleConfirm = () => {
    if (paymentMethod === "card" && isCardValid()) {
      onConfirm({ method: "card", data: cardData });
    } else if (paymentMethod === "d17" && isD17Valid()) {
      onConfirm({ method: "d17", data: d17Data });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="payment-modal-overlay">
      <div className="payment-modal">
        <button className="close-btn" onClick={onClose}>
          ✕
        </button>

        <h2>Mode de paiement</h2>

        {/* Payment Method Selection */}
        <div className="payment-methods">
          <button
            className={`payment-method ${paymentMethod === "card" ? "active" : ""}`}
            onClick={() => setPaymentMethod("card")}
          >
            <div className="method-icon">💳</div>
            <span>Carte</span>
          </button>
          <button
            className={`payment-method ${paymentMethod === "d17" ? "active" : ""}`}
            onClick={() => setPaymentMethod("d17")}
          >
            <div className="method-icon">📱</div>
            <span>D17</span>
          </button>
        </div>

        {/* Card Payment Form */}
        {paymentMethod === "card" && (
          <div className="payment-form">
            <div className="form-group">
              <label htmlFor="cardNumber">Numéro de carte</label>
              <input
                type="text"
                id="cardNumber"
                name="cardNumber"
                value={cardData.cardNumber}
                onChange={handleCardDataChange}
                placeholder="1234 5678 9012 3456"
                maxLength="19"
              />
              <div className="card-types">
                {["VISA", "MC", "AMEX"].map((type) => (
                  <button
                    key={type}
                    type="button"
                    className={`card-type-btn ${cardData.cardType === type ? "active" : ""}`}
                    onClick={() =>
                      setCardData((prev) => ({ ...prev, cardType: type }))
                    }
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="cardholderName">Titulaire de la carte</label>
              <input
                type="text"
                id="cardholderName"
                name="cardholderName"
                value={cardData.cardholderName}
                onChange={handleCardDataChange}
                placeholder="Nom Prénom"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="expiryDate">Date d'expiration</label>
                <input
                  type="text"
                  id="expiryDate"
                  name="expiryDate"
                  value={cardData.expiryDate}
                  onChange={handleCardDataChange}
                  placeholder="MM / AA"
                />
              </div>
              <div className="form-group">
                <label htmlFor="cvv">Code CVV</label>
                <input
                  type="text"
                  id="cvv"
                  name="cvv"
                  value={cardData.cvv}
                  onChange={handleCardDataChange}
                  placeholder="•••"
                  maxLength="4"
                />
              </div>
            </div>
          </div>
        )}

        {/* D17 Payment Form */}
        {paymentMethod === "d17" && (
          <div className="payment-form">
            <div className="d17-info">
              <span className="info-badge">
                📱 Paiement mobile D17 — Tunisie
              </span>
            </div>

            <div className="form-group">
              <label htmlFor="phoneNumber">Numéro de téléphone D17</label>
              <div className="phone-input-group">
                <span className="country-code">TN +216</span>
                <input
                  type="text"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={d17Data.phoneNumber}
                  onChange={handleD17DataChange}
                  placeholder="12345678"
                  maxLength="8"
                />
              </div>
              <p className="info-text">
                Vous recevrez une notification sur votre application D17 pour
                confirmer le paiement.
              </p>
            </div>

            <div className="form-group">
              <label htmlFor="pinCode">Code PIN D17</label>
              <input
                type="password"
                id="pinCode"
                name="pinCode"
                value={d17Data.pinCode}
                onChange={handleD17DataChange}
                placeholder="••••"
                maxLength="4"
              />
            </div>
          </div>
        )}

        <div className="security-info">
          <span>🔒 Paiement sécurisé — données chiffrées SSL/TLS</span>
        </div>

        <button
          className="confirm-btn"
          onClick={handleConfirm}
          disabled={
            (paymentMethod === "card" && !isCardValid()) ||
            (paymentMethod === "d17" && !isD17Valid())
          }
        >
          Confirmer le paiement
        </button>
      </div>
    </div>
  );
}

export default PaymentModal;
