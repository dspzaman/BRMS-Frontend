// src/pages/Requisitions/EditRequisitionPage.tsx
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from "@/layouts/header";
import { Sidebar } from "@/layouts/sidebar";
import { Footer } from "@/layouts/footer";
import RequisitionForm from '@/features/requisitions/ui/RequisitionForm';
import { useRequisition } from '@/features/requisitions/api/useRequisitions';
import { transformAPIToFormData } from '@/features/requisitions/utils/transformers';
import { StatusHistorySection } from '@/features/requisitions/ui/RequisitionDetails/sections/StatusHistorySection';


export default function EditRequisitionPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: requisition, isLoading, error } = useRequisition(Number(id));

  // Handle loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex min-h-screen pt-16">
          <Sidebar />
          <main className="flex-1 bg-white flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ems-green-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading requisition...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // Handle error state
  if (error || !requisition) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex min-h-screen pt-16">
          <Sidebar />
          <main className="flex-1 bg-white flex items-center justify-center">
            <div className="text-center p-8">
              <div className="text-red-600 text-5xl mb-4">⚠️</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Requisition Not Found
              </h2>
              <p className="text-gray-600 mb-6">
                The requisition you're looking for doesn't exist or you don't have permission to edit it.
              </p>
              <button
                onClick={() => navigate('/requisitions/my-requisitions')}
                className="px-4 py-2 bg-ems-green-600 text-white rounded-md hover:bg-ems-green-700"
              >
                Back to My Requisitions
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // Check if requisition is editable (drafts and forwarded requisitions can be edited)
  const editableStatuses = ['draft', 'forwarded_for_submission', 'returned_for_revision'];
  if (!editableStatuses.includes(requisition.current_status)) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex min-h-screen pt-16">
          <Sidebar />
          <main className="flex-1 bg-white flex items-center justify-center">
            <div className="text-center p-8">
              <div className="text-yellow-600 text-5xl mb-4">🔒</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Cannot Edit Requisition
              </h2>
              <p className="text-gray-600 mb-6">
                Only draft, forwarded, and returned-for-revision requisitions can be edited. This requisition has status: {requisition.current_status_display}

              </p>
              <button
                onClick={() => navigate('/requisitions/my-requisitions')}
                className="px-4 py-2 bg-ems-green-600 text-white rounded-md hover:bg-ems-green-700"
              >
                Back to My Requisitions
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // Transform API data to form data
  const initialData = transformAPIToFormData(requisition);
  console.log('🔍 initialData.travelExpenses:', initialData.travelExpenses);
console.log('🔍 initialData.includeTravelExpenses:', initialData.includeTravelExpenses);

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
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    {requisition.current_status === 'forwarded_for_submission'
                      ? `Review & Submit Requisition ${requisition.requisition_number}`
                      : `Edit Requisition ${requisition.requisition_number}`
                    }
                  </h1>
                  <p className="text-gray-600 mt-2">
                    {requisition.current_status === 'forwarded_for_submission'
                      ? 'Review, edit if needed, and submit this requisition'
                      : 'Update your draft requisition before submitting'
                    }
                  </p>
                </div>
                <button
                  onClick={() => navigate('/requisitions/my-requisitions')}
                  className="text-gray-600 hover:text-gray-900 flex items-center"
                >
                  <svg
                    className="h-5 w-5 mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 19l-7-7m0 0l7-7m-7 7h18"
                    />
                  </svg>
                  Back to List
                </button>
              </div>
            </div>

            {/* Requisition Form */}
            <div className="space-y-6">
              <RequisitionForm
                mode="edit"
                requisitionId={Number(id)}
                initialData={initialData}
                onSuccess={() => {
                  // Navigate based on status - forwarded goes to assigned, drafts/returned to my requisitions
                  if (requisition.current_status === 'forwarded_for_submission') {
                    navigate('/requisitions/assigned');
                  } else {
                    navigate('/requisitions/my-requisitions');
                  }
                }}
              />

              {/* Status History - so user sees why it was returned */}
              <StatusHistorySection requisition={requisition} />
            </div>
          </div>
          <Footer />
        </main>
      </div>
    </div>
  );
}