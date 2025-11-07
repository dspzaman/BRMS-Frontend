// src/pages/Requisitions/AssignedRequisitionsPage.tsx
import { Navigate } from "react-router-dom";
import { Header } from "@/layouts/header";
import { Sidebar } from "@/layouts/sidebar";
import { Footer } from "@/layouts/footer";
import { AssignedRequisitions } from "@/features/requisitions/ui/AssignedRequisitions";
import { useAuth } from "@/shared/contexts/AuthContext";

export default function AssignedRequisitionsPage() {
  const { user } = useAuth();

  // Redirect if user doesn't have approval rights
  if (!user?.can_approve) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      {/* Layout: header height ~64px → pt-16 */}
      <div className="flex min-h-screen pt-16">
        <Sidebar />
        <main className="flex-1 bg-white">
          <div className="p-8">
            {/* Page Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">ASSIGNED REQUISITIONS</h1>
              <p className="text-gray-600 mt-2">
                Requisitions requiring your action
              </p>
            </div>

            {/* Main Content */}
            <AssignedRequisitions />
          </div>
          <Footer />
        </main>
      </div>
    </div>
  );
}