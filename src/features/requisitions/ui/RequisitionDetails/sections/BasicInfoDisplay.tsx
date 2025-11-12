// src/features/requisitions/ui/RequisitionDetails/sections/BasicInfoDisplay.tsx
import type { RequisitionResponse } from '../../../api/types';

interface BasicInfoDisplayProps {
  requisition: RequisitionResponse;
}

export function BasicInfoDisplay({ requisition }: BasicInfoDisplayProps) {
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

  // Get payee type display
  const getPayeeTypeDisplay = (type: string) => {
    const types: Record<string, string> = {
      'staff': 'Staff Member',
      'vendor': 'Vendor',
      'new_vendor': 'New Vendor',
      'office_credit_card': 'Office Credit Card',
      'other': 'Other'
    };
    return types[type] || type;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
      {/* Section Header */}
      <div className="bg-gradient-to-r from-ems-green-600 to-ems-green-700 px-6 py-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <span>📝</span>
          <span>Basic Information</span>
        </h3>
      </div>

      {/* Content - 2 Column Grid */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          {/* Prepared By */}
          <div>
            <label className="text-sm font-medium text-gray-500">Prepared By</label>
            <p className="text-base text-gray-900 mt-1">
              {requisition.prepared_by_name || 'N/A'} <span className="text-gray-500">at</span> {formatDateTime(requisition.created_at)}
            </p>
          </div>

          {/* Submitted By */}
          <div>
            <label className="text-sm font-medium text-gray-500">Submitted By</label>
            <p className="text-base text-gray-900 mt-1">
              {requisition.submitted_by_name || 'Not submitted yet'} 
              {requisition.submitted_at && (
                <span> <span className="text-gray-500">at</span> {formatDateTime(requisition.submitted_at)}</span>
              )}
            </p>
          </div>

          {/* Payee */}
          <div>
            <label className="text-sm font-medium text-gray-500">Payee</label>
            <p className="text-base text-gray-900 mt-1">
              {requisition.payee_name || 'N/A'} 
              <span className="text-gray-500 text-sm ml-2">({getPayeeTypeDisplay(requisition.payee_type)})</span>
            </p>
          </div>

          {/* Total Amount */}
          <div>
            <label className="text-sm font-medium text-gray-500">Total Amount</label>
            <p className="text-2xl font-bold text-ems-green-700 mt-1">
              ${requisition.total_with_tax}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
