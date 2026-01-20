import { Link } from 'react-router-dom';
import type { Batch } from '../api/types';

interface FlatRequisitionsTableProps {
  batch: Batch;
  canRemove: boolean;
  onRemoveRequisition: (requisitionId: number, requisitionNumber: string) => void;
  isRemoving: boolean;
}

export function FlatRequisitionsTable({
  batch,
  canRemove,
  onRemoveRequisition,
  isRemoving,
}: FlatRequisitionsTableProps) {
  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
    }).format(parseFloat(amount));
  };

  const activeRequisitions = batch.batch_requisitions?.filter(br => br.is_active) || [];

  if (activeRequisitions.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-8 text-center text-gray-500">
        No requisitions in this batch
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">
          📋 Requisitions ({activeRequisitions.length})
        </h2>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Requisition #
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Payee
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Description
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Amount
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Added By
              </th>
              {canRemove && (
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {activeRequisitions.map((batchReq) => (
              <tr key={batchReq.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                  <Link
                    to={`/requisitions/view/${batchReq.requisition_details.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-ems-green-600 hover:text-ems-green-700 hover:underline"
                  >
                    {batchReq.requisition_details.requisition_number}
                  </Link>
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {batchReq.requisition_details.payee_display}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">
                  {batchReq.requisition_details.title}
                </td>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                  {formatCurrency(batchReq.requisition_details.total_with_tax)}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {batchReq.added_by_name}
                </td>
                {canRemove && (
                  <td className="px-4 py-3 text-sm">
                    <button
                      onClick={() =>
                        onRemoveRequisition(
                          batchReq.requisition_details.id,
                          batchReq.requisition_details.requisition_number
                        )
                      }
                      disabled={isRemoving}
                      className="text-red-600 hover:text-red-700 disabled:opacity-50"
                    >
                      Remove
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
