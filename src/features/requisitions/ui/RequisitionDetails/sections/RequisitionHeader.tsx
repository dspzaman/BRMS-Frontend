// src/features/requisitions/ui/RequisitionDetails/sections/RequisitionHeader.tsx
import type { RequisitionResponse } from '../../../api/types';

interface RequisitionHeaderProps {
  requisition: RequisitionResponse;
}

export function RequisitionHeader({ requisition }: RequisitionHeaderProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">📋 REQUISITION HEADER</h2>
        <p className="text-gray-600">Requisition Number | Status Badge | Action Buttons</p>
        <p className="text-sm text-gray-500 mt-2">Submitted by | Date | Current Assignee</p>
      </div>
    </div>
  );
}
