const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const smsService = require("../services/smsService");
const User = require("../models/User");
const config = require("../config/config");

const createToken = (user, expiresIn = config.jwtExpire) => {
  return jwt.sign(
    { userId: user._id, role: user.role, sector: user.sector || "" },
    config.jwtSecret,
    {
      expiresIn,
    },
  );
};

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, confirmPassword, acceptTerms, phone } =
      req.body;
    if (
      !name ||
      !email ||
      !password ||
      !confirmPassword ||
      acceptTerms !== true
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Tous les champs sont obligatoires" });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Les mots de passe ne correspondent pas",
      });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "Email already registered" });
    }
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashed,
      role: "user",
      phone,
    });
    const token = createToken(user);
    const publicUser = user.toObject();
    delete publicUser.password;
    delete publicUser.resetPasswordToken;
    delete publicUser.resetPasswordExpires;
    res.status(201).json({
      success: true,
      message: "Compte créé",
      data: { user: publicUser, token },
    });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password, rememberMe = false } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });
    }
    if (user.isActive === false) {
      return res
        .status(403)
        .json({ success: false, message: "Compte désactivé" });
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });
    }
    const token = createToken(user, rememberMe === true ? "7d" : "1h");
    const publicUser = user.toObject();
    delete publicUser.password;
    delete publicUser.resetPasswordToken;
    delete publicUser.resetPasswordExpires;
    res.json({ success: true, data: { user: publicUser, token } });
  } catch (error) {
    next(error);
  }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(200).json({
        success: true,
        message:
          "Si cet email existe, un lien de réinitialisation a été envoyé",
      });
    }

    const token = jwt.sign({ userId: user._id }, config.jwtSecret, {
      expiresIn: 3600,
    });

    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600 * 1000;
    await user.save();

    const resetLink = `${config.frontendUrl}/reset-password?token=${token}`;
    const message = `Réinitialisation de votre mot de passe: ${resetLink}`;

    if (user.phone) {
      await smsService.sendSms(user.phone, message);
    } else {
      console.log(
        "Password reset requested without a configured SMS destination",
      );
    }

    return res.status(200).json({
      success: true,
      message: "Un lien de réinitialisation a été envoyé",
    });
  } catch (error) {
    next(error);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res
        .status(400)
        .json({ message: "Token et nouveau mot de passe requis" });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, config.jwtSecret);
    } catch (error) {
      return res.status(400).json({ message: "Token invalide ou expiré" });
    }

    const user = await User.findOne({
      _id: decoded.userId,
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Token invalide ou expiré" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Mot de passe réinitialisé avec succès",
    });
  } catch (error) {
    next(error);
  }
};
