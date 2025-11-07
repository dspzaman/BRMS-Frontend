import { Header } from "@/layouts/header";
import { Sidebar } from "@/layouts/sidebar";
import { Footer } from "@/layouts/footer";
import RequisitionForm from "@/features/requisitions/ui/RequisitionForm";
import { useAuth } from "@/shared/contexts/AuthContext";

export default function CreateRequisition() {
  const { user } = useAuth();

  // Format submission limit message
  const getSubmissionLimitMessage = () => {
    const limit = user?.max_submission_threshold;
    
    if (limit === null || limit === undefined) {
      return "You have unlimited submission authority.";
    }
    
    // Format as currency
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(limit);
    
    return `You can submit requisitions up to ${formatted}`;
  };

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
              {/* <p className="text-gray-600 mt-2">
                Submit a new expense requisition for approval
              </p> */}
              <div className="mt-3 inline-flex items-center px-4 py-2 rounded-lg bg-ems-green-50 border-2 border-ems-green-500">
                <svg
                  className="h-4 w-4 text-ems-green-600 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="text-sm font-medium text-ems-green-900">
                  {getSubmissionLimitMessage()}
                </span>
              </div>
            </div>

            <RequisitionForm />
          </div>
          <Footer />
        </main>
      </div>
    </div>
  );
}