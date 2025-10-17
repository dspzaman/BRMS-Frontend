import { Header } from "@/layouts/header";
import { Sidebar } from "@/layouts/sidebar";
import { Footer } from "@/layouts/footer";
import RequisitionForm from "@/features/requisitions/ui/RequisitionForm";

export default function CreateRequisition() {
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
              <h1 className="text-3xl font-bold text-gray-900">CREATE NEW REQUISITION</h1>
              <p className="text-gray-600 mt-2">
                Submit a new expense requisition for approval
              </p>
            </div>

            <RequisitionForm />
          </div>
          <Footer />
        </main>
      </div>
    </div>
  );
}