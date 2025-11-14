// src/features/requisitions/ui/RequisitionDetails/sections/StatusHistorySection.tsx
import type { RequisitionResponse } from '../../../api/types';
import { StatusTimelineItem } from '../components/StatusTimelineItem';
import { STATUS_LABELS } from '../../../model/constants';


interface StatusHistorySectionProps {
  requisition: RequisitionResponse;
}

export function StatusHistorySection({ requisition }: StatusHistorySectionProps) {
  // Get status history from requisition, filter out draft status, sorted by date (oldest first)
  const statusHistory = requisition.status_history || [];
  const filteredHistory = statusHistory.filter(item => item.status !== 'draft');
  const sortedHistory = [...filteredHistory].sort((a, b) => 
    new Date(a.assigned_date).getTime() - new Date(b.assigned_date).getTime()
  );

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

  // Get status icon
  const getStatusIcon = (status: string) => {
    const icons: Record<string, string> = {
      'draft': '📝',
      'forwarded_for_submission': '➡️',
      'submitted': '✅',
      'pending_review': '🔍',
      'pending_approval': '⏳',
      'approved': '✅',
      'rejected': '❌',
      'changes_requested': '🔄',
      'account_confirmation': '💰',
      'completed': '✅',
      'cancelled': '🚫'
    };
    return icons[status] || '📎';
  };

  const getActionLabel = (statusItem: any) => {
  const { status, action_status } = statusItem;

  // Final completion
  if (status === 'completed' && action_status === 'completed') {
    return 'Completed';
  }

  if (action_status === 'approved') {
    return 'Approved';
  }
  if (action_status === 'forwarded') {
    return 'Forwarded';
  }
  if (action_status === 'returned') {
    return 'Returned for revision';
  }
  if (action_status === 'rejected') {
    return 'Rejected';
  }
  if (action_status === 'cancelled') {
    return 'Cancelled';
  }

  // Fallback
  if (action_status === 'pending' || !statusItem.completed_date) {
    return 'In progress';
  }

  return 'Completed';
};

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        📜 Status History ({sortedHistory.length})
      </h3>
      
      {sortedHistory.length > 0 ? (
        <div className="space-y-4">
          {sortedHistory.map((statusItem, index) => {
            const isLast = index === sortedHistory.length - 1;
            const statusDisplay =
                STATUS_LABELS[statusItem.status] || statusItem.status_display || statusItem.status;

            const assignedByName = statusItem.assigned_by_name || 'System';
            const assignedToName = statusItem.assigned_to_name || 'N/A';
            
            return (
              <div key={statusItem.id} className="flex gap-4">
                <div className="flex flex-col items-center">
                  
                  <div className={`w-3 h-3 rounded-full ${
                    statusItem.action_status === 'completed' || statusItem.action_status === 'forwarded'
                      ? 'bg-ems-green-600'
                      : 'bg-gray-400'
                  }`}></div>
                  {!isLast && <div className="w-0.5 h-full bg-gray-300"></div>}
                </div>
                <div className="flex-1 pb-4">
                  <p className="font-medium text-gray-900">
                    {getStatusIcon(statusItem.status)} {statusDisplay}
                  </p>
                  <p className="text-sm text-gray-600">
                    {formatDateTime(statusItem.assigned_date)} by {assignedByName}
                    {statusItem.assigned_to && (
                      <span className="text-gray-500"> → Assigned to: {assignedToName}</span>
                    )}
                  </p>
                  {statusItem.comments && (
                    <p className="text-sm text-gray-500 italic mt-1 bg-gray-50 p-2 rounded">
                      "{statusItem.comments}"
                    </p>
                  )}
                 
                  {statusItem.completed_date && (
                    <p className="text-xs text-gray-500 mt-1">
                      {getActionLabel(statusItem)}: {formatDateTime(statusItem.completed_date)}
                      {statusItem.completed_by_name && ` by ${statusItem.completed_by_name}`}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="text-gray-400 text-4xl mb-2">📜</div>
          <p className="text-gray-600">No status history available</p>
        </div>
      )}
    </div>
  );
}
