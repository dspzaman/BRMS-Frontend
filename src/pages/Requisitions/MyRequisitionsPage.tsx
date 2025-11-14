// src/pages/Requisitions/MyRequisitionsPage.tsx
import { Header } from "@/layouts/header";
import { Sidebar } from "@/layouts/sidebar";
import { Footer } from "@/layouts/footer";
import { MyRequisitionsView } from "@/features/requisitions/ui/MyRequisitions";
import { Link } from "react-router-dom";

export default function MyRequisitionsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      {/* Layout: header height ~64px → pt-16 */}
      <div className="flex min-h-screen pt-16">
        <Sidebar />
        <main className="flex-1 bg-white">
          <div className="p-8">
            {/* Page Header */}
            <div className="mb-8 flex items-center justify-between">
  <div>
    <h1 className="text-3xl font-bold text-gray-900">MY REQUISITIONS</h1>
    <p className="text-gray-600 mt-2">
      View and manage all your expense requisitions
    </p>
  </div>

  <Link
    to="/requisitions/create"
    className="px-4 py-2 bg-ems-green-600 text-white rounded-md hover:bg-ems-green-700 font-medium flex items-center"
  >
    <svg
      className="h-5 w-5 mr-2"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 4v16m8-8H4"
      />
    </svg>
    New Requisition
  </Link>
</div>

            {/* Main Content */}
            <MyRequisitionsView />
          </div>
          <Footer />
        </main>
      </div>
    </div>
  );
}