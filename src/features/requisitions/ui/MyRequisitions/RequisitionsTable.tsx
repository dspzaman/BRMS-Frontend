import { useNavigate } from 'react-router-dom';
import type { RequisitionResponse } from '../../api/types';
import { StatusBadge } from './StatusBadge';

interface RequisitionsTableProps {
  requisitions: RequisitionResponse[];
  onDelete: (id: number, requisitionNumber: string) => void;
  isDeleting: boolean;
}

export function RequisitionsTable({ requisitions, onDelete, isDeleting }: RequisitionsTableProps) {
  const navigate = useNavigate();

  const getPayeeName = (req: RequisitionResponse): string => {
    if (req.payee_staff_name) return req.payee_staff_name;
    if (req.payee_vendor_name) return req.payee_vendor_name;
    if (req.payee_card_holder_name) return req.payee_card_holder_name;
    if (req.payee_other_name) return req.payee_other_name;
    return 'Unknown';
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              ID
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Payee
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Amount
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {requisitions.map((req) => (
            <tr key={req.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {req.requisition_number}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {new Date(req.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {getPayeeName(req)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                ${parseFloat(req.total_with_tax).toFixed(2)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <StatusBadge requisition={req} />
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex justify-end gap-3">
                  {req.current_status === 'draft' ? (
                    <>
                      <button
                        onClick={() => navigate(`/requisitions/edit/${req.id}`)}
                        className="text-ems-green-600 hover:text-ems-green-900"
                        disabled={isDeleting}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onDelete(req.id, req.requisition_number)}
                        className="text-red-600 hover:text-red-900 disabled:opacity-50"
                        disabled={isDeleting}
                      >
                        {isDeleting ? 'Deleting...' : 'Delete'}
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => navigate(`/requisitions/view/${req.id}`)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      View
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}