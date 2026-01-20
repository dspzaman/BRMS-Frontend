// src/app/App.tsx
import { Routes, Route, Navigate, useLocation  } from "react-router-dom";
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
import ProgramBudget from "@/pages/Budget/Overview/index";

// Batch Management Pages
import ReadyPoolPage from "@/pages/batches/ReadyPoolPage";
import BatchListPage from "@/pages/batches/BatchListPage";
import BatchDetailPage from "@/pages/batches/BatchDetailPage";
import MySignaturesPage from "@/pages/batches/MySignaturesPage";
import ChequeGenerationPage from "@/pages/batches/ChequeGenerationPage";
import PaymentProcessingPage from "@/pages/batches/PaymentProcessingPage";
import ProcessedPaymentsPage from "@/pages/batches/ProcessedPaymentsPage";
import { CreateEFTBatchPage } from "@/features/batches/ui/CreateEFTBatchPage";

/**
 * Protects routes that require authentication.
 */
function ProtectedRoute({ children }: { children: React.ReactElement }) {
  const { isAuthenticated, isInitializing } = useAuth();
  const location = useLocation();

  if (isInitializing) {
    return (
      <div className="flex h-screen items-center justify-center text-gray-600">
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

/**
 * Public Routes
 */
function PublicRoute({ children }: { children: React.ReactElement }) {
  const { isAuthenticated, isInitializing } = useAuth();
  const location = useLocation();  

  if (isInitializing) {
    return (
      <div className="flex h-screen items-center justify-center text-gray-600">
        Loading...
      </div>
    );
  }

  // If already authenticated, redirect to dashboard
  if (isAuthenticated) {
    const from = location.state?.from?.pathname || "/dashboard";  
    return <Navigate to={from} replace />;  
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

function SignatureeRoute({ children }: { children: React.ReactElement }) {
  const { user, isInitializing } = useAuth();

  if (isInitializing) {
    return (
      <div className="flex h-screen items-center justify-center text-gray-600">
        Loading...
      </div>
    );
  }

  if (!user?.signaturee_authority) {
    // Not a signaturee → redirect to My Requisitions
    return <Navigate to="/requisitions/my-requisitions" replace />;
  }

  return children;
}

function AccountRoute({ children }: { children: React.ReactElement }) {
  const { isInitializing, hasRole } = useAuth();

  if (isInitializing) {
    return (
      <div className="flex h-screen items-center justify-center text-gray-600">
        Loading...
      </div>
    );
  }

  if (!hasRole('account')) {
    // Not in account department → redirect to My Requisitions
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

      {/* Payment Processing Routes */}
      <Route
        path="/payment-processing"
        element={
          <ProtectedRoute>
            <AccountRoute>
              <PaymentProcessingPage />
            </AccountRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/payment-processing/cheques"
        element={
          <ProtectedRoute>
            <AccountRoute>
              <ChequeGenerationPage />
            </AccountRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/processed-payments"
        element={
          <ProtectedRoute>
            <ProcessedPaymentsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/create-eft-batch"
        element={
          <ProtectedRoute>
            <AccountRoute>
              <CreateEFTBatchPage />
            </AccountRoute>
          </ProtectedRoute>
        }
      />

      {/* Batch Management Routes */}
      <Route
        path="/batches/generate-cheques"
        element={
          <ProtectedRoute>
            <AccountRoute>
              <ChequeGenerationPage />
            </AccountRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/batches/ready-pool"
        element={
          <ProtectedRoute>
            <AccountRoute>
              <ReadyPoolPage />
            </AccountRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/batches/my-signatures"
        element={
          <ProtectedRoute>
            <SignatureeRoute>
              <MySignaturesPage />
            </SignatureeRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/batches/:id"
        element={
          <ProtectedRoute>
            <AccountRoute>
              <BatchDetailPage />
            </AccountRoute>
          </ProtectedRoute>
        }
      />

      <Route
        path="/batches"
        element={
          <ProtectedRoute>
            <AccountRoute>
              <BatchListPage />
            </AccountRoute>
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

      <Route
        path="/budget/program"
        element={
          <ProtectedRoute>
            <ProgramBudget />
          </ProtectedRoute>
        }
      />

      

      {/* Default redirect */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </>
  );
}