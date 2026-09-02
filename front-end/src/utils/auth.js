import authService from "../services/authService";

export async function login(email, password) {
  try {
    const { user } = await authService.login(email, password);
    return user;
  } catch (error) {
    console.error("Login utility error:", error.message);
    return null;
  }
}

export async function logout() {
  authService.logout();
}

export async function getCurrentUser() {
  return authService.getCurrentUser();
}

export async function isAuthenticated() {
  return authService.isAuthenticated();
}
