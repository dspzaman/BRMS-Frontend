// src/pages/Requisitions/ViewRequisitionPage.tsx
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from "@/layouts/header";
import { Sidebar } from "@/layouts/sidebar";
import { Footer } from "@/layouts/footer";
import { RequisitionDetails } from '@/features/requisitions/ui/RequisitionDetails';
import { useRequisition } from '@/features/requisitions/api/useRequisitions';
import { StatusBadge } from '@/features/requisitions/ui/MyRequisitions/StatusBadge';

export default function ViewRequisitionPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: requisition, isLoading, error } = useRequisition(Number(id));

  // Format date and time
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

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
    // Check if it's a 403 Forbidden error (Access Denied)
    const is403Error = error?.response?.status === 403;
    const is404Error = error?.response?.status === 404;
    
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex min-h-screen pt-16">
          <Sidebar />
          <main className="flex-1 bg-white flex items-center justify-center">
            <div className="text-center p-8">
              {is403Error ? (
                // 403 - Access Denied
                <>
                  <div className="text-red-600 text-5xl mb-4">🔒</div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Access Denied
                  </h2>
                  <p className="text-gray-600 mb-6">
                    You do not have permission to view this requisition.
                  </p>
                  <p className="text-sm text-gray-500 mb-6">
                    Only the creator, assignee, approvers, and authorized personnel can view this requisition.
                  </p>
                </>
              ) : (
                // 404 or other errors - Not Found
                <>
                  <div className="text-red-600 text-5xl mb-4">⚠️</div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Requisition Not Found
                  </h2>
                  <p className="text-gray-600 mb-6">
                    The requisition you're looking for doesn't exist or has been deleted.
                  </p>
                </>
              )}
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
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <h1 className="text-3xl font-bold text-gray-900">
                    {requisition.requisition_number}
                  </h1>
                  <StatusBadge requisition={requisition} />
                </div>
                <div className="flex gap-3">
                  {/* Edit button for drafts and forwarded requisitions */}
                  {['draft', 'forwarded_for_submission'].includes(requisition.current_status) && (
                    <button
                      onClick={() => navigate(`/requisitions/edit/${id}`)}
                      className="px-4 py-2 bg-ems-green-600 text-white rounded-md hover:bg-ems-green-700 flex items-center gap-2"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit
                    </button>
                  )}
                  <button
                    onClick={() => navigate('/requisitions/my-requisitions')}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <svg
                      className="h-5 w-5"
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
              
              {/* Metadata Row - Single Line */}
              <div className="flex items-center gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Submitted by:</span>
                  <span>
                    {requisition.submitted_by_name 
                      ? `${requisition.submitted_by_name} at ${formatDateTime(requisition.submitted_at)}` 
                      : 'Not submitted yet'
                    }
                  </span>
                </div>
                {requisition.current_assignee_name && (
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Assigned to:</span>
                    <span>
                      {requisition.current_assignee_name} 
                      <span className="text-gray-500 text-xs ml-1">
                        ({requisition.current_status_display || requisition.current_status})
                      </span>
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <span className="font-medium">Payee:</span>
                  <span>{requisition.payee_name || 'N/A'}</span>
                  <span className="text-gray-500 text-xs">({requisition.payee_type_display || requisition.payee_type})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">Total Amount:</span>
                  <span className="font-bold text-ems-green-700 text-base">${requisition.total_with_tax}</span>
                </div>
              </div>
            </div>

            {/* Requisition Details Component */}
            <RequisitionDetails requisition={requisition} />
          </div>
          <Footer />
        </main>
      </div>
    </div>
  );
}