const crypto = require("crypto");

const normalizeMethod = (method) => {
  if (method === "card" || method === "carte") return "carte";
  if (method === "d17") return "d17";
  return null;
};

const isValidExpiryDate = (expiryDate) => {
  if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiryDate)) return false;

  const [month, year] = expiryDate.split("/");
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear() % 100;
  const currentMonth = currentDate.getMonth() + 1;

  if (Number(year) < currentYear) return false;
  if (Number(year) === currentYear && Number(month) < currentMonth)
    return false;

  return true;
};

exports.processPayment = async (method, data = {}) => {
  const normalizedMethod = normalizeMethod(method);

  if (!normalizedMethod) {
    return { success: false, error: "Méthode de paiement invalide" };
  }

  if (normalizedMethod === "carte") {
    const cardNumber = String(data.cardNumber || "").replace(/\s+/g, "");
    const cvv = String(data.cvv || "");
    const expiryDate = String(data.expiryDate || "");

    if (!/^\d{16}$/.test(cardNumber)) {
      return {
        success: false,
        error: "Le numéro de carte doit contenir 16 chiffres",
      };
    }

    if (!isValidExpiryDate(expiryDate)) {
      return {
        success: false,
        error: "La date d'expiration est invalide ou expirée",
      };
    }

    if (!/^\d{3}$/.test(cvv)) {
      return { success: false, error: "Le CVV doit contenir 3 chiffres" };
    }

    // Simulation d'appel à une API bancaire
    const transactionId = `CARD-${crypto.randomBytes(6).toString("hex").toUpperCase()}`;
    return {
      success: true,
      transactionId,
      paymentDetails: {
        last4: cardNumber.slice(-4),
        cardType: data.cardType || "inconnu",
      },
    };
  }

  if (normalizedMethod === "d17") {
    const phoneNumber = String(data.phoneNumber || "");

    if (!/^\d{8}$/.test(phoneNumber)) {
      return {
        success: false,
        error: "Le numéro de téléphone D17 doit contenir 8 chiffres",
      };
    }

    // Simulation d'appel à l'API D17
    const transactionId = `D17-${crypto.randomBytes(6).toString("hex").toUpperCase()}`;
    return {
      success: true,
      transactionId,
      paymentDetails: {
        phoneNumber,
      },
    };
  }

  return { success: false, error: "Échec du traitement du paiement" };
};
