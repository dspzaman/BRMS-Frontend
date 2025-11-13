import type { RequisitionResponse } from '../../api/types';

interface StatusBadgeProps {
  requisition: RequisitionResponse;
}

export function StatusBadge({ requisition }: StatusBadgeProps) {
  // Special case: Returned for revision
  if (requisition.current_status === 'draft' && requisition.revision_count > 0) {
    return (
      <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 flex items-center gap-1">
        <span>↩️</span>
        Returned (Rev {requisition.revision_count})
      </span>
    );
  }

  // Regular draft
  if (requisition.current_status === 'draft') {
    return (
      <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
        📝 Draft
      </span>
    );
  }

  // Returned for revision (NEW STATUS)
  if (requisition.current_status === 'returned_for_revision') {
    return (
      <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 flex items-center gap-1">
        <span>↩️</span>
        Returned for Revision
      </span>
    );
  }

  // Forwarded for submission
  if (requisition.current_status === 'forwarded_for_submission') {
    return (
      <span className="px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: '#fef3c7', color: '#f59e0b' }}>
        ↗️ Forwarded for Submission
      </span>
    );
  }

  // Submitted
  if (requisition.current_status === 'submitted') {
    return (
      <span className="px-3 py-1 rounded-full text-xs font-medium bg-ems-green-50 text-ems-green-600">
        📤 Submitted
      </span>
    );
  }

  // Pending Review
  if (requisition.current_status === 'pending_review') {
    return (
      <span className="px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: '#dbeafe', color: '#3b82f6' }}>
        👀 Pending Review
      </span>
    );
  }

  // Pending Approval
  if (requisition.current_status === 'pending_approval') {
    return (
      <span className="px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: '#fef3c7', color: '#f59e0b' }}>
        ⏳ Pending Approval
      </span>
    );
  }

  // ED Approval
  if (requisition.current_status === 'ed_approval') {
    return (
      <span className="px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: '#e0e7ff', color: '#6366f1' }}>
        🔍 ED Approval
      </span>
    );
  }

  // Board Approval
  if (requisition.current_status === 'board_approval') {
    return (
      <span className="px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: '#fce7f3', color: '#ec4899' }}>
        📋 Board Approval
      </span>
    );
  }

  // Account Confirmation
  if (requisition.current_status === 'account_confirmation') {
    return (
      <span className="px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: '#d1fae5', color: '#10b981' }}>
        💰 Account Confirmation
      </span>
    );
  }

  // In review statuses
  const reviewStatuses = [
    'initial_review',
    'manager_review',
    'top_management_review',
  ];
  
  if (reviewStatuses.includes(requisition.current_status)) {
    return (
      <span className="px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: '#dbeafe', color: '#3b82f6' }}>
        👀 In Review
      </span>
    );
  }

  // Completed
  if (requisition.current_status === 'completed') {
    return (
      <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
        ✓ Approved
      </span>
    );
  }

  // Rejected/Cancelled
  if (['cancelled', 'rejected'].includes(requisition.current_status)) {
    return (
      <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
        ✗ Rejected
      </span>
    );
  }

  // Fallback
  return (
    <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
      {requisition.current_status_display || requisition.current_status}
    </span>
  );
}