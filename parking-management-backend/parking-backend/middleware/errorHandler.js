const errorHandler = (error, req, res, next) => {
  const status = error.status || 500;
  const production = process.env.NODE_ENV === "production";
  const message =
    production && status >= 500 ? "Erreur interne du serveur" : error.message;

  if (!production || status >= 500) console.error(error);
  res.status(status).json({ success: false, message });
};

module.exports = errorHandler;
