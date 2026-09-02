import API from "./api";
import { hasValidToken } from "../utils/token";

const authService = {
  async login(email, password, rememberMe = false) {
    const response = await API.post("/auth/login", {
      email,
      password,
      rememberMe,
    });
    if (response.data && response.data.success) {
      const { token, user } = response.data.data;
      const storage = rememberMe ? localStorage : sessionStorage;
      authService.logout();
      storage.setItem("token", token);
      storage.setItem("user", JSON.stringify(user));
      return { token, user };
    }
    throw new Error(response.data?.message || "Erreur de connexion");
  },

  async register(
    name,
    email,
    password,
    phone,
    role = "user",
    confirmPassword = password,
    acceptTerms = true,
  ) {
    const response = await API.post("/register", {
      name,
      email,
      password,
      confirmPassword,
      acceptTerms,
      phone,
      role,
    });
    if (response.data && response.data.success) {
      return response.data;
    }
    throw new Error(response.data?.message || "Erreur d'inscription");
  },

  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("auth:logout"));
    }
  },

  getCurrentUser() {
    const userStr =
      localStorage.getItem("user") || sessionStorage.getItem("user");
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  getToken() {
    return localStorage.getItem("token") || sessionStorage.getItem("token");
  },

  isAuthenticated() {
    return hasValidToken();
  },

  async forgotPassword(email) {
    const response = await API.post("/auth/forgot-password", { email });
    return response.data;
  },

  async resetPassword(token, newPassword) {
    const response = await API.post("/auth/reset-password", {
      token,
      newPassword,
    });
    return response.data;
  },
};

export default authService;
