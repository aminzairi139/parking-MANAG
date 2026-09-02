import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { hasValidToken } from "../utils/token";

function PublicRoute() {
  const location = useLocation();

  if (hasValidToken()) {
    return <Navigate to="/dashboard" state={{ from: location }} replace />;
  }

  return <Outlet />;
}

export default PublicRoute;
