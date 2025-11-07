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

  // In review statuses
  const reviewStatuses = [
    'initial_review',
    'manager_review',
    'account_confirmation',
    'top_management_review',
    'board_review'
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