const { body, param, validationResult } = require("express-validator");

const sectors = [
  "Parking Central",
  "Parking Lafayette",
  "Parking Rue de Irak",
  "Parking Nord",
  "Parking Sud",
];

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Données invalides",
      errors: errors.array().map(({ path, msg }) => ({ path, msg })),
    });
  }
  next();
};

const safeName = body("name")
  .isString()
  .withMessage("Le nom doit être une chaîne")
  .trim()
  .isLength({ min: 2, max: 100 })
  .withMessage("Nom invalide")
  .matches(/^[\p{L} .'-]+$/u)
  .withMessage("Le nom contient des caractères invalides");

const safeEmail = body("email")
  .isString()
  .withMessage("Email invalide")
  .trim()
  .normalizeEmail()
  .isEmail()
  .withMessage("Email invalide")
  .isLength({ max: 254 });

const password = body("password")
  .isString()
  .withMessage("Mot de passe invalide")
  .isLength({ min: 6, max: 128 })
  .withMessage("Le mot de passe doit contenir entre 6 et 128 caractères");

const optionalPassword = body("password")
  .optional({ values: "falsy" })
  .isString()
  .withMessage("Mot de passe invalide")
  .isLength({ min: 6, max: 128 })
  .withMessage("Le mot de passe doit contenir entre 6 et 128 caractères");

const phone = body("phone")
  .optional({ values: "null" })
  .isString()
  .withMessage("Téléphone invalide")
  .trim()
  .isLength({ max: 30 })
  .matches(/^[+()\d .-]+$/)
  .withMessage("Téléphone invalide");

const sector = body("sector")
  .isString()
  .withMessage("Secteur invalide")
  .trim()
  .isIn(sectors)
  .withMessage("Secteur non autorisé");

const id = param("id").isMongoId().withMessage("Identifiant invalide");
const isActive = body("isActive").optional().isBoolean().toBoolean();

module.exports = {
  sectors,
  validate,
  id,
  agentCreate: [
    safeName,
    safeEmail,
    phone,
    sector.optional(),
    password,
    validate,
  ],
  agentUpdate: [
    id,
    safeName.optional(),
    safeEmail.optional(),
    phone,
    sector.optional(),
    optionalPassword,
    isActive,
    validate,
  ],
  adminCreate: [safeName, safeEmail, password, sector, validate],
  adminUpdate: [
    id,
    safeName.optional(),
    safeEmail.optional(),
    sector.optional(),
    optionalPassword,
    validate,
  ],
  login: [
    body("email").isString().trim().isEmail(),
    body("password").isString().isLength({ min: 1, max: 128 }),
    validate,
  ],
  forgotPassword: [
    body("email")
      .isString()
      .trim()
      .normalizeEmail()
      .isEmail()
      .withMessage("Email invalide"),
    validate,
  ],
  resetPassword: [
    body("token").isString().isLength({ min: 20, max: 2048 }),
    body("newPassword").isString().isLength({ min: 6, max: 128 }),
    validate,
  ],
  register: [
    safeName,
    safeEmail,
    password,
    body("confirmPassword").isString().isLength({ min: 6, max: 128 }),
    body("acceptTerms")
      .custom((value) => value === true)
      .withMessage("Conditions requises"),
    validate,
  ],
};
