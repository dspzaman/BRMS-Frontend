// src/app/App.tsx
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/shared/contexts/AuthContext";

// Pages
import LoginPage from "@/pages/Login/LoginPage";
import DashboardPage from "@/pages/Dashboard/DashboardPage";
import ForgotPassword from "@/pages/Login/ForgotPassword";
import ResetPassword from "@/pages/Login/ResetPassword";
import ProfilePage from "@/pages/Profile/ProfilePage";
import CreateRequisition from "@/pages/Requisitions/CreateRequisition";
import MyRequisitionsPage from "@/pages/Requisitions/MyRequisitionsPage";
import AssignedRequisitionsPage from "@/pages/Requisitions/AssignedRequisitionsPage";
import EditRequisitionPage from "@/pages/Requisitions/EditRequisitionPage";
import ViewRequisitionPage from "@/pages/Requisitions/ViewRequisitionPage";

/**
 * Protects routes that require authentication.
 */
function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { isAuthenticated, isInitializing } = useAuth();

  if (isInitializing) {
    return (
      <div className="flex h-screen items-center justify-center text-gray-600">
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

/**
 * Public Routes
 */
function PublicRoute({ children }: { children: JSX.Element }) {
  const { isAuthenticated, isInitializing } = useAuth();

  if (isInitializing) {
    return (
      <div className="flex h-screen items-center justify-center text-gray-600">
        Loading...
      </div>
    );
  }

  // If already authenticated, redirect to dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

/**
 * Main App Component
 */
export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />

      <Route
        path="/forgot-password"
        element={
          <PublicRoute>
            <ForgotPassword />
          </PublicRoute>
        }
      />

      <Route
        path="/reset-password/:uid/:token"
        element={
          <PublicRoute>
            <ResetPassword />
          </PublicRoute>
        }
      />

      {/* Protected routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/requisitions/create"
        element={
          <ProtectedRoute>
            <CreateRequisition />
          </ProtectedRoute>
        }
      />

      <Route
        path="/requisitions/my-requisitions"
        element={
          <ProtectedRoute>
            <MyRequisitionsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/requisitions/assigned"
        element={
          <ProtectedRoute>
            <AssignedRequisitionsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/requisitions/edit/:id"
        element={
          <ProtectedRoute>
            <EditRequisitionPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/requisitions/view/:id"
        element={
          <ProtectedRoute>
            <ViewRequisitionPage />
          </ProtectedRoute>
        }
      />

      {/* Default redirect */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}