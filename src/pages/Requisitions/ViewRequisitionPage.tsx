// src/pages/Requisitions/ViewRequisitionPage.tsx
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from "@/layouts/header";
import { Sidebar } from "@/layouts/sidebar";
import { Footer } from "@/layouts/footer";
import { RequisitionDetails } from '@/features/requisitions/ui/RequisitionDetails';
import { useRequisition } from '@/features/requisitions/api/useRequisitions';
import { StatusBadge } from '@/features/requisitions/ui/MyRequisitions/StatusBadge';
import { ReviewSection } from '@/features/requisitions/ui/sections/ReviewSection';
import { AccountConfirmationSection } from '@/features/requisitions/ui/sections/AccountConfirmationSection';
import { SignatureeConfirmationSection } from '@/features/requisitions/ui/sections/SignatureeConfirmationSection';
import { PaymentConfirmationSection } from '@/features/requisitions/ui/sections/PaymentConfirmationSection';
import { RecallButton } from '@/features/requisitions/ui/components/RecallButton';
import { useAuth } from '@/shared/contexts/AuthContext';

export default function ViewRequisitionPage() {
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
      hour12: true
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
      'staff': 'Staff',
      'vendor': 'Vendor',
      'contractor': 'Contractor',
      'office_credit_card': 'Office Credit Card',
      'other': 'Other'
    };
    return typeMap[requisition.payee_type] || requisition.payee_type;
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
    const axiosError = error as any;
       
    const statusCode = axiosError?.response?.status;
    const is403Error = statusCode === 403;
    
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
                  {['draft', 'forwarded_for_submission', 'returned_for_revision'].includes(requisition.current_status) && (
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
                  
                  {/* Recall button - Show if user completed previous step and current assignee hasn't acted */}
                  {user && requisition.status_history && (
                    (() => {
                      // Find if user has any completed status in history (approved, confirmed, completed, etc.)
                      const userCompletedStatuses = requisition.status_history.filter(
                        s => s.completed_by === user.id && 
                             s.completed_date && 
                             !s.is_current
                      );
                      
                      // Get current status
                      const currentStatus = requisition.status_history.find(s => s.is_current);
                      
                      // Can recall if:
                      // 1. User has completed at least one status
                      // 2. Current status exists and is still pending
                      // 3. User is NOT the current assignee
                      // 4. Requisition is not in terminal state
                      const canRecall = userCompletedStatuses.length > 0 && 
                                       currentStatus && 
                                       currentStatus.action_status === 'pending' && 
                                       requisition.current_assignee !== user.id &&
                                       !['completed', 'cancelled', 'rejected'].includes(requisition.current_status);
                      
                      return canRecall ? (
                        <RecallButton 
                          requisition={requisition} 
                          onSuccess={() => window.location.reload()}
                        />
                      ) : null;
                    })()
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
                  <span>{getPayeeName()}</span>
                  <span className="text-gray-500 text-xs">({getPayeeTypeDisplay()})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">Total Amount:</span>
                  <span className="font-bold text-ems-green-700 text-base">${requisition.total_with_tax}</span>
                </div>
              </div>
            </div>
            {/* Review Section - Show if user is assignee and status is pending_review */}
            {user && 
             requisition.current_assignee === user.id && 
             requisition.current_status === 'pending_review' && (
              <div className="mb-6">
                <ReviewSection 
                  requisition={requisition} 
                  onSuccess={() => navigate('/requisitions/assigned')}
                />
              </div>
            )}

            {/* Account Confirmation Section - Show if user is assignee and status is account_confirmation */}
            {user && 
             requisition.current_assignee === user.id && 
             requisition.current_status === 'account_confirmation' && (
              <div className="mb-6">
                <AccountConfirmationSection 
                  requisition={requisition} 
                  onSuccess={() => navigate('/requisitions/assigned')}
                />
              </div>
            )}

            {/* Signaturee Confirmation Section - Show if user is assignee and status is signaturee_confirmation */}
            {user && 
             requisition.current_assignee === user.id && 
             requisition.current_status === 'signaturee_confirmation' && (
              <div className="mb-6">
                <SignatureeConfirmationSection 
                  requisition={requisition} 
                  onSuccess={() => navigate('/requisitions/assigned')}
                />
              </div>
            )}

            {/* Payment Confirmation Section - Show if user is assignee and status is payment_confirmation */}
            {user && 
             requisition.current_assignee === user.id && 
             requisition.current_status === 'payment_confirmation' && (
              <div className="mb-6">
                <PaymentConfirmationSection 
                  requisition={requisition} 
                  onSuccess={() => navigate('/requisitions/assigned')}
                />
              </div>
            )}

            {/* Requisition Details Component */}
            <RequisitionDetails requisition={requisition} />    
            
          </div>
          <Footer />
        </main>
      </div>
    </div>
  );
}