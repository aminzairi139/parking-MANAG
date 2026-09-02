import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import authService from "../services/authService";
import { hasValidToken } from "../utils/token";

function ProtectedRoute({ requiredRole }) {
  const location = useLocation();

  if (!hasValidToken()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const user = authService.getCurrentUser();
  const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
  const hasRole = requiredRole
    ? roles.includes(user.role) ||
      (requiredRole === "user" && user.role === "client") ||
      (requiredRole === "client" && user.role === "user")
    : true;

  if (!hasRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
