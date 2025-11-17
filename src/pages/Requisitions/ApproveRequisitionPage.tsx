// src/pages/Requisitions/ApproveRequisitionPage.tsx
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '@/layouts/header';
import { Sidebar } from '@/layouts/sidebar';
import { Footer } from '@/layouts/footer';
import { useRequisition } from '@/features/requisitions/api/useRequisitions';
import { StatusHistorySection } from '@/features/requisitions/ui/RequisitionDetails/sections/StatusHistorySection';
import { StatusBadge } from '@/features/requisitions/ui/MyRequisitions/StatusBadge';
import { useAuth } from '@/shared/contexts/AuthContext';
import ApprovalWorkspace from '@/features/requisitions/ui/ApprovalWorkspace';

export default function ApproveRequisitionPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: requisition, isLoading, error } = useRequisition(Number(id));
  const { user } = useAuth();

  // Format date and time
  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  // Get payee name based on payee type
  const getPayeeName = () => {
    if (!requisition) return 'N/A';
    switch (requisition.payee_type) {
      case 'staff':
        return requisition.payee_staff_name || 'N/A';
      case 'vendor':
      case 'contractor':
        return requisition.payee_vendor_name || 'N/A';
      case 'office_credit_card':
        return requisition.payee_card_holder_name || 'N/A';
      case 'other':
        return requisition.payee_other_name || requisition.payee_other || 'N/A';
      default:
        return 'N/A';
    }
  };

  // Get payee type display name
  const getPayeeTypeDisplay = () => {
    if (!requisition) return '';
    const typeMap: Record<string, string> = {
      staff: 'Staff',
      vendor: 'Vendor',
      contractor: 'Contractor',
      office_credit_card: 'Office Credit Card',
      other: 'Other',
    };
    return typeMap[requisition.payee_type] || requisition.payee_type;
  };

  // Loading state
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

  // Error / not found
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
                The requisition you&apos;re trying to approve doesn&apos;t exist or you don&apos;t have permission to view it.
              </p>
              <button
                onClick={() => navigate('/requisitions/assigned')}
                className="px-4 py-2 bg-ems-green-600 text-white rounded-md hover:bg-ems-green-700"
              >
                Back to Assigned Requisitions
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // Guard: must be pending_approval, current assignee, and user.can_approve === true
  const isPendingApproval = requisition.current_status === 'pending_approval';
  const isAssignee = user && requisition.current_assignee === user.id;
  const canApproveFlag = user?.can_approve === true;

  if (!isPendingApproval || !isAssignee || !canApproveFlag) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex min-h-screen pt-16">
          <Sidebar />
          <main className="flex-1 bg-white flex items-center justify-center">
            <div className="text-center p-8 max-w-xl">
              <div className="text-yellow-600 text-5xl mb-4">🔒</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Cannot Access Approval Workspace
              </h2>
              <p className="text-gray-600 mb-4">
                This approval workspace is only available when the requisition is in{' '}
                <span className="font-semibold">Pending Approval</span>, and you are the
                current assignee with approval permissions.
              </p>
              <p className="text-sm text-gray-500 mb-6">
                Current status: {requisition.current_status_display || requisition.current_status}
              </p>
              <button
                onClick={() => navigate('/requisitions/assigned')}
                className="px-4 py-2 bg-ems-green-600 text-white rounded-md hover:bg-ems-green-700"
              >
                Back to Assigned Requisitions
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
                <button
                  onClick={() => navigate('/requisitions/assigned')}
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
                  Back to Assigned
                </button>
              </div>

              {/* Metadata Row */}
              <div className="flex items-center gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Submitted by:</span>
                  <span>
                    {requisition.submitted_by_name
                      ? `${requisition.submitted_by_name} at ${formatDateTime(
                          requisition.submitted_at,
                        )}`
                      : 'Not submitted yet'}
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
                  <span>{getPayeeName()}</span>
                  <span className="text-gray-500 text-xs">
                    ({getPayeeTypeDisplay()})
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">Total Amount:</span>
                  <span className="font-bold text-ems-green-700 text-base">
                    ${requisition.total_with_tax}
                  </span>
                </div>
              </div>
            </div>

            {/* Approval Workspace */}
            <div className="space-y-6">
              <ApprovalWorkspace requisitionId={requisition.id} />

              {/* Status history for context */}
              <StatusHistorySection requisition={requisition} />
            </div>
          </div>
          <Footer />
        </main>
      </div>
    </div>
  );
}