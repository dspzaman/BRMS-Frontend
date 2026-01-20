import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useBatch, useSendForSignatures, useApproveBatch, useCancelBatch, useRemoveRequisition } from '../api';
import {
  BATCH_TYPE_LABELS,
  BATCH_STATUS_LABELS,
  BATCH_STATUS_COLORS,
  BATCH_TYPE_ICONS,
  BATCH_STATUS_ICONS,
  SIGNATUREE_STATUS_LABELS,
  SIGNATUREE_STATUS_COLORS,
  canSendForSignatures,
  canApproveBatch,
  canCancelBatch,
  canRemoveRequisitions,
} from '../model';
import { ChequeRequisitionsTable } from './ChequeRequisitionsTable';
import { FlatRequisitionsTable } from './FlatRequisitionsTable';

export function BatchDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const batchId = parseInt(id || '0', 10);

  const { data: batch, isLoading, error } = useBatch(batchId);
  const sendForSignaturesMutation = useSendForSignatures(batchId);
  const approveBatchMutation = useApproveBatch(batchId);
  const cancelBatchMutation = useCancelBatch(batchId);
  const removeRequisitionMutation = useRemoveRequisition(batchId);

  const [approvalComments, setApprovalComments] = useState('');
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
    }).format(parseFloat(amount));
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-CA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleSendForSignatures = async () => {
    if (window.confirm('Send this batch for signatures?')) {
      try {
        await sendForSignaturesMutation.mutateAsync();
      } catch (error) {
        console.error('Failed to send for signatures:', error);
      }
    }
  };

  const handleApproveBatch = async () => {
    try {
      await approveBatchMutation.mutateAsync({ comments: approvalComments });
      setShowApprovalModal(false);
      setApprovalComments('');
    } catch (error) {
      console.error('Failed to approve batch:', error);
    }
  };

  const handleCancelBatch = async () => {
    try {
      await cancelBatchMutation.mutateAsync(cancelReason);
      setShowCancelModal(false);
      navigate('/batches');
    } catch (error) {
      console.error('Failed to cancel batch:', error);
    }
  };

  const handleRemoveRequisition = async (requisitionId: number, requisitionNumber: string) => {
    const reason = window.prompt(`Remove requisition ${requisitionNumber} from batch?\n\nPlease provide a reason:`);
    if (reason) {
      try {
        await removeRequisitionMutation.mutateAsync({ requisition_id: requisitionId, reason });
      } catch (error) {
        console.error('Failed to remove requisition:', error);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading batch details...</div>
      </div>
    );
  }

  if (error || !batch) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Failed to load batch details</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link to="/batches" className="text-ems-green-600 hover:text-ems-green-700">
              ← Back to Batches
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            {BATCH_TYPE_ICONS[batch.batch_type]} {batch.batch_number}
          </h1>
          <div className="flex items-center gap-2 mt-2">
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm font-medium">
              {BATCH_TYPE_LABELS[batch.batch_type]}
            </span>
            <span className={`px-2 py-1 rounded text-sm font-medium ${BATCH_STATUS_COLORS[batch.status]}`}>
              {BATCH_STATUS_ICONS[batch.status]} {BATCH_STATUS_LABELS[batch.status]}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {canSendForSignatures(batch.status, batch.requisition_count) && (
            <button
              onClick={handleSendForSignatures}
              disabled={sendForSignaturesMutation.isPending}
              className="px-4 py-2 bg-ems-green-600 text-white rounded-lg hover:bg-ems-green-700 disabled:opacity-50"
            >
              Send for Signatures
            </button>
          )}
          {canApproveBatch(batch.status) && (
            <button
              onClick={() => setShowApprovalModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Approve Batch
            </button>
          )}
          {canCancelBatch(batch.status) && (
            <button
              onClick={() => setShowCancelModal(true)}
              className="px-4 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50"
            >
              Cancel Batch
            </button>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-600">Requisitions</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{batch.requisition_count}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-600">Total Amount</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(batch.total_amount)}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-600">Signatures</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {batch.approved_signatures} / {batch.required_signatures}
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-600">Created</p>
          <p className="text-sm font-medium text-gray-900 mt-1">{formatDate(batch.created_at)}</p>
          <p className="text-xs text-gray-500 mt-1">by {batch.created_by.full_name}</p>
        </div>
      </div>

      {/* Notes */}
      {batch.notes && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm font-medium text-blue-900 mb-1">Notes</p>
          <p className="text-sm text-blue-800">{batch.notes}</p>
        </div>
      )}

      {/* Signaturees */}
      {batch.signaturees && batch.signaturees.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">✍️ Signaturees</h2>
          <div className="space-y-3">
            {batch.signaturees.map((sig) => (
              <div key={sig.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-ems-green-100 text-ems-green-700 rounded-full flex items-center justify-center font-semibold">
                    {sig.priority}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{sig.signaturee.full_name}</p>
                    <p className="text-sm text-gray-600">{sig.signaturee.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${SIGNATUREE_STATUS_COLORS[sig.status]}`}>
                    {SIGNATUREE_STATUS_LABELS[sig.status]}
                  </span>
                  {sig.signed_at && (
                    <p className="text-xs text-gray-500 mt-1">{formatDate(sig.signed_at)}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Requisitions - Conditional rendering based on batch type */}
      {batch.batch_type === 'cheque' ? (
        <ChequeRequisitionsTable
          batch={batch}
          canRemove={canRemoveRequisitions(batch.status)}
          onRemoveRequisition={handleRemoveRequisition}
          isRemoving={removeRequisitionMutation.isPending}
        />
      ) : (
        <FlatRequisitionsTable
          batch={batch}
          canRemove={canRemoveRequisitions(batch.status)}
          onRemoveRequisition={handleRemoveRequisition}
          isRemoving={removeRequisitionMutation.isPending}
        />
      )}

      {/* Approval Modal */}
      {showApprovalModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Approve Batch</h2>
            </div>
            <div className="px-6 py-4">
              <label htmlFor="comments" className="block text-sm font-medium text-gray-700 mb-2">
                Comments (Optional)
              </label>
              <textarea
                id="comments"
                value={approvalComments}
                onChange={(e) => setApprovalComments(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ems-green-500"
                placeholder="Add any comments about your approval..."
              />
              {approveBatchMutation.isError && (
                <p className="text-sm text-red-600 mt-2">Failed to approve batch. Please try again.</p>
              )}
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => setShowApprovalModal(false)}
                disabled={approveBatchMutation.isPending}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleApproveBatch}
                disabled={approveBatchMutation.isPending}
                className="flex-1 px-4 py-2 bg-ems-green-600 text-white rounded-lg hover:bg-ems-green-700"
              >
                {approveBatchMutation.isPending ? 'Approving...' : 'Approve'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Cancel Batch</h2>
            </div>
            <div className="px-6 py-4">
              <p className="text-sm text-gray-600 mb-4">
                Are you sure you want to cancel this batch? All requisitions will be returned to the ready pool.
              </p>
              <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Cancellation
              </label>
              <textarea
                id="reason"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                placeholder="Explain why this batch is being cancelled..."
              />
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                disabled={cancelBatchMutation.isPending}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Keep Batch
              </button>
              <button
                onClick={handleCancelBatch}
                disabled={cancelBatchMutation.isPending || !cancelReason.trim()}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {cancelBatchMutation.isPending ? 'Cancelling...' : 'Cancel Batch'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
