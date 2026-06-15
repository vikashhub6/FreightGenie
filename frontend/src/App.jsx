import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./features/auth/context/AuthContext";
import ProtectedRoute from "./shared/components/ProtectedRoute";

// Auth
import LoginPage from "./features/auth/pages/LoginPage";
import RegisterPage from "./features/auth/pages/RegisterPage";
import ProfilePage from "./features/auth/pages/ProfilePage";

// Dashboard
import DashboardPage from "./features/dashboard/pages/DashboardPage";

// Analytics (Phase 2)
import AnalyticsDashboardPage from "./features/analytics/pages/AnalyticsDashboardPage";

// Shipment
import CreateShipmentPage from "./features/shipment/pages/CreateShipmentPage";
import ShipmentDetailPage from "./features/shipment/pages/ShipmentDetailPage";

// Exporter (no auth)
import ExporterUploadPage from "./features/exporter/pages/ExporterUploadPage";

// Admin
import AdminPanelPage from "./features/admin/pages/AdminPanelPage";

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/upload/:token" element={<ExporterUploadPage />} />

          {/* Protected routes */}
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/analytics" element={<ProtectedRoute><AnalyticsDashboardPage /></ProtectedRoute>} />
          <Route path="/shipment/create" element={<ProtectedRoute><CreateShipmentPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute><AdminPanelPage /></ProtectedRoute>} />

          {/* Default */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
