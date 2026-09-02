import { jwtDecode } from "jwt-decode";

export function getValidToken() {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  if (!token) return null;

  try {
    const payload = jwtDecode(token);
    if (!payload.exp || payload.exp * 1000 <= Date.now()) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");
      return null;
    }
    return token;
  } catch {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    return null;
  }
}

export function hasValidToken() {
  return Boolean(getValidToken());
}
