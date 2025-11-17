// src/app/App.tsx
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from 'react-hot-toast';
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
import ViewReports from "@/pages/Reports/ViewReports";
import ApproveRequisitionPage from "@/pages/Requisitions/ApproveRequisitionPage";


/**
 * Protects routes that require authentication.
 */
function ProtectedRoute({ children }: { children: React.ReactElement }) {
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
function PublicRoute({ children }: { children: React.ReactElement }) {
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

function ApproverRoute({ children }: { children: React.ReactElement }) {
  const { user, isInitializing } = useAuth();

  if (isInitializing) {
    return (
      <div className="flex h-screen items-center justify-center text-gray-600">
        Loading...
      </div>
    );
  }

  if (!user?.can_approve) {
    // Not an approver → redirect to My Requisitions
    return <Navigate to="/requisitions/my-requisitions" replace />;
  }

  return children;
}

/**
 * Main App Component
 */
export default function App() {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#fff',
            color: '#374151',
            border: '1px solid #e5e7eb',
          },
          success: {
            iconTheme: {
              primary: '#116B28',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
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
            <ApproverRoute>
              <AssignedRequisitionsPage />
            </ApproverRoute>
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

      <Route
        path="/requisitions/approve/:id"
        element={
          <ProtectedRoute>
            <ApproverRoute>
              <ApproveRequisitionPage />
            </ApproverRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/reports"
        element={
          <ProtectedRoute>
            <ViewReports />
          </ProtectedRoute>
        }
      />

      {/* Default redirect */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </>
  );
}