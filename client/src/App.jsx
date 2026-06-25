import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import LoginForm from "./components/auth/LoginForm";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import InvoicePage from "./pages/InvoicePage";
import Calculator from "./pages/Calculator";
import InvoiceHistory from "./pages/InvoiceHistory";
import BeanTypes from "./pages/BeanTypes";
import ProfileCard from "./components/auth/ProfileCard";
import ChangePasswordForm from "./components/auth/ChangePasswordForm";
import SettingsForm from "./components/auth/SettingsForm";

export default function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center text-gray-400">
          <div className="animate-spin w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full mx-auto mb-3" />
          <p>ခေတ္တ စောင့်ပါ...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginForm />} />

      {/* Protected — wrapped in Layout */}
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/new-invoice" element={<InvoicePage />} />
                <Route path="/calculator" element={<Calculator />} />
                <Route path="/invoices" element={<InvoiceHistory />} />
                <Route path="/beans" element={<BeanTypes />} />
                <Route path="/profile" element={<ProfileCard />} />
                <Route path="/settings" element={<SettingsForm />} />
                <Route path="/change-password" element={<ChangePasswordForm />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
