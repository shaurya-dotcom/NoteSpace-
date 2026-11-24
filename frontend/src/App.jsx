import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import SharedNote from "./pages/SharedNote";
import AdminPanel from "./pages/AdminPanel";
import "./App.css";

const hasStoredSession = () => {
  try {
    return Boolean(
      localStorage.getItem("token") ||
        localStorage.getItem("user") ||
        localStorage.getItem("authToken") ||
        localStorage.getItem("ns_token") ||
        localStorage.getItem("ns_user")
    );
  } catch {
    return false;
  }
};

const getStoredUser = () => {
  try {
    const raw =
      localStorage.getItem("user") ||
      localStorage.getItem("ns_user") ||
      sessionStorage.getItem("user") ||
      sessionStorage.getItem("ns_user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const ProtectedRoute = ({ children, adminOnly = false, forceLoggedOut = false }) => {
  const { user, loading } = useAuth();
  const activeUser = user || getStoredUser();

  if (loading) return <div>Loading workspace...</div>;
  if (forceLoggedOut || (!activeUser && !hasStoredSession())) {
    return <Navigate to="/login" replace />;
  }

  const normalizedRole = String(activeUser?.role || "").toLowerCase();
  if (adminOnly && normalizedRole !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
};

function AppRoutes() {
  const [forceLoggedOut, setForceLoggedOut] = useState(false);

  useEffect(() => {
    const handleLogoutEvent = () => {
      setForceLoggedOut(true);
    };

    const handleStorageChange = () => {
      setForceLoggedOut(!hasStoredSession());
    };

    window.addEventListener("notespace:logout", handleLogoutEvent);
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("notespace:logout", handleLogoutEvent);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  return (
    <Routes>
      <Route
        path="/login"
        element={<Login onLoggedIn={() => setForceLoggedOut(false)} />}
      />
      <Route path="/share/:token" element={<SharedNote />} />
      <Route
        path="/"
        element={
          <ProtectedRoute forceLoggedOut={forceLoggedOut}>
            <Dashboard onLogout={() => setForceLoggedOut(true)} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute adminOnly forceLoggedOut={forceLoggedOut}>
            <AdminPanel onLogout={() => setForceLoggedOut(true)} />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}