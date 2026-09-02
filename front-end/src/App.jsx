import React from "react";
import "./App.css";
import "./responsive.css";
import {
  BrowserRouter as Router,
  useLocation,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { LoginPage, RegistrationPage } from "./components";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import Historique from "./components/Historique";
import AjoutVehicule from "./components/AjoutVehicule";
import SuperAdminDashboard from "./components/SuperAdminDashboard";
import SectorDashboard from "./components/SectorDashboard";
import { hasValidToken } from "./utils/token";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

function AppRoutes() {
  const { user, loading } = useAuth();
  const location = useLocation();
  const backgroundLocation = location.state?.backgroundLocation;

  if (loading) return null;

  return (
    <>
      <Routes location={backgroundLocation || location}>
        <Route
          path="/"
          element={
            user && hasValidToken() ? (
              <Navigate
                to={
                  user.role === "sector_admin"
                    ? "/sector-dashboard"
                    : user.role === "agent"
                      ? "/historique"
                      : user.role === "admin" || user.role === "super_admin"
                        ? "/admin"
                        : "/ajout"
                }
                replace
              />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/inscription" element={<RegistrationPage />} />
        </Route>

        <Route
          element={<ProtectedRoute requiredRole={["agent", "sector_admin"]} />}
        >
          <Route path="/sector-dashboard" element={<SectorDashboard />} />
          <Route path="/historique" element={<Historique />} />
        </Route>

        <Route
          element={<ProtectedRoute requiredRole={["admin", "super_admin"]} />}
        >
          <Route path="/admin" element={<SuperAdminDashboard />} />
        </Route>

        <Route element={<ProtectedRoute requiredRole="user" />}>
          <Route path="/ajout" element={<AjoutVehicule />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
