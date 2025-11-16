import { useNavigate } from 'react-router-dom';
import type { RequisitionResponse } from '../../api/types';

interface RequisitionActionButtonsProps {
  requisition: RequisitionResponse;
}

export function RequisitionActionButtons({ requisition }: RequisitionActionButtonsProps) {
  const navigate = useNavigate();

  // forwarded_for_submission → Review & Submit (edit page)
  if (requisition.current_status === 'forwarded_for_submission') {
    return (
      <div className="flex gap-2">
        <button
          onClick={() => navigate(`/requisitions/edit/${requisition.id}`)}
          className="px-4 py-2 bg-ems-green-600 text-white text-sm font-medium rounded-lg hover:bg-ems-green-700"
        >
          Review & Submit
        </button>
      </div>
    );
  }

  // pending_review → Review (view page)
  if (requisition.current_status === 'pending_review') {
    return (
      <div className="flex gap-2">
        <button
          onClick={() => navigate(`/requisitions/view/${requisition.id}`)}
          className="px-4 py-2 bg-ems-green-600 text-white text-sm font-medium rounded-lg hover:bg-ems-green-700"
        >
          Review
        </button>
      </div>
    );
  }

  // pending_approval → Review & Approve (approval workspace)
  if (requisition.current_status === 'pending_approval') {
    return (
      <div className="flex gap-2">
        <button
          onClick={() => navigate(`/requisitions/approve/${requisition.id}`)}
          className="px-4 py-2 bg-ems-green-600 text-white text-sm font-medium rounded-lg hover:bg-ems-green-700"
        >
          ✓ Review & Approve
        </button>
      </div>
    );
  }

  // All other statuses: no actions here
  return null;
}