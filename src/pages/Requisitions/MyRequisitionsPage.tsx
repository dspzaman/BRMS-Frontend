// src/pages/Requisitions/MyRequisitionsPage.tsx
import { Header } from "@/layouts/header";
import { Sidebar } from "@/layouts/sidebar";
import { Footer } from "@/layouts/footer";
import { MyRequisitionsView } from "@/features/requisitions/ui/MyRequisitions";

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
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">MY REQUISITIONS</h1>
              <p className="text-gray-600 mt-2">
                View and manage all your expense requisitions
              </p>
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