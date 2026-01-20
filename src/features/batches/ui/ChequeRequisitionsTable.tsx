import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Batch } from '../api/types';

interface ChequeRequisitionsTableProps {
  batch: Batch;
  canRemove: boolean;
  onRemoveRequisition: (requisitionId: number, requisitionNumber: string) => void;
  isRemoving: boolean;
}

interface ChequeGroup {
  cheque_number: string;
  cheque_id: number;
  requisition_count: number;
  total_amount: number;
  requisitions: Batch['batch_requisitions'];
}

export function ChequeRequisitionsTable({
  batch,
  canRemove,
  onRemoveRequisition,
  isRemoving,
}: ChequeRequisitionsTableProps) {
  const [expandedCheques, setExpandedCheques] = useState<Set<number>>(new Set());

  const formatCurrency = (amount: string | number) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
    }).format(typeof amount === 'string' ? parseFloat(amount) : amount);
  };

  // Group requisitions by cheque
  const chequeGroups: ChequeGroup[] = [];
  const chequeMap = new Map<number, ChequeGroup>();

  batch.batch_requisitions?.filter(br => br.is_active).forEach((batchReq) => {
    const chequeId = batchReq.assigned_cheque;
    
    if (!chequeId) {
      // Requisition not yet assigned to a cheque
      return;
    }

    if (!chequeMap.has(chequeId)) {
      chequeMap.set(chequeId, {
        cheque_number: `CHQ-${chequeId}`, // Placeholder, should come from API
        cheque_id: chequeId,
        requisition_count: 0,
        total_amount: 0,
        requisitions: [] as Batch['batch_requisitions'],
      });
    }

    const group = chequeMap.get(chequeId)!;
    group.requisition_count++;
    group.total_amount += parseFloat(batchReq.requisition_details.total_with_tax);
    group.requisitions?.push(batchReq);
  });

  chequeGroups.push(...Array.from(chequeMap.values()));

  const toggleCheque = (chequeId: number) => {
    const newExpanded = new Set(expandedCheques);
    if (newExpanded.has(chequeId)) {
      newExpanded.delete(chequeId);
    } else {
      newExpanded.add(chequeId);
    }
    setExpandedCheques(newExpanded);
  };

  // Get unassigned requisitions (not yet assigned to cheques)
  const unassignedRequisitions = batch.batch_requisitions?.filter(
    br => br.is_active && !br.assigned_cheque
  ) || [];

  // If no cheques generated yet, show flat list of requisitions
  if (chequeGroups.length === 0 && unassignedRequisitions.length > 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-yellow-50">
          <h2 className="text-lg font-semibold text-gray-900">
            📋 Requisitions ({unassignedRequisitions.length})
          </h2>
          <p className="text-sm text-yellow-800 mt-1">
            ⚠️ Cheques not generated yet. Generate cheques to group requisitions by payee.
          </p>
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
              {unassignedRequisitions.map((batchReq) => (
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

  if (chequeGroups.length === 0) {
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
          💵 Cheques ({chequeGroups.length})
        </h2>
      </div>
      <div className="divide-y divide-gray-200">
        {chequeGroups.map((cheque) => (
          <div key={cheque.cheque_id}>
            {/* Cheque Summary Row */}
            <div
              onClick={() => toggleCheque(cheque.cheque_id)}
              className="px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-gray-400">
                    {expandedCheques.has(cheque.cheque_id) ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">
                      {cheque.cheque_number}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {cheque.requisition_count} requisition{cheque.requisition_count !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">
                    {formatCurrency(cheque.total_amount)}
                  </p>
                </div>
              </div>
            </div>

            {/* Expanded Requisitions Table */}
            {expandedCheques.has(cheque.cheque_id) && (
              <div className="bg-gray-50 px-6 py-4">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100">
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
                      {cheque.requisitions?.map((batchReq) => (
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
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onRemoveRequisition(
                                    batchReq.requisition_details.id,
                                    batchReq.requisition_details.requisition_number
                                  );
                                }}
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
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
