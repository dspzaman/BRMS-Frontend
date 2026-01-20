// Batch Constants and Labels

export const BATCH_TYPE_LABELS: Record<string, string> = {
  cheque: 'Cheque',
  eft: 'EFT (Electronic Funds Transfer)',
  wire: 'Wire Transfer',
};

export const BATCH_STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  pending_signatures: 'Pending Signatures',
  partially_approved: 'Partially Approved',
  fully_approved: 'Fully Approved',
  payment_processing: 'Payment Processing',
  payment_confirmed: 'Payment Confirmed',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export const SIGNATUREE_STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  notified: 'Notified',
  approved: 'Approved',
  skipped: 'Skipped',
};

export const SIGNATUREE_TYPE_LABELS: Record<string, string> = {
  primary: 'Primary Signaturee',
  secondary: 'Secondary Signaturee',
  backup: 'Backup Signaturee',
};

// Status colors for badges
export const BATCH_STATUS_COLORS: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-800',
  pending_signatures: 'bg-yellow-100 text-yellow-800',
  partially_approved: 'bg-blue-100 text-blue-800',
  fully_approved: 'bg-green-100 text-green-800',
  payment_processing: 'bg-purple-100 text-purple-800',
  payment_confirmed: 'bg-teal-100 text-teal-800',
  completed: 'bg-ems-green-100 text-ems-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

export const SIGNATUREE_STATUS_COLORS: Record<string, string> = {
  pending: 'bg-gray-100 text-gray-700',
  notified: 'bg-yellow-100 text-yellow-700',
  approved: 'bg-green-100 text-green-700',
  skipped: 'bg-orange-100 text-orange-700',
};

// Batch type options for forms
export const BATCH_TYPE_OPTIONS = [
  { value: 'cheque', label: 'Cheque' },
  { value: 'eft', label: 'EFT (Electronic Funds Transfer)' },
  { value: 'wire', label: 'Wire Transfer' },
] as const;

// Icons for batch types
export const BATCH_TYPE_ICONS: Record<string, string> = {
  cheque: '📝',
  eft: '💳',
  wire: '🌐',
};

// Icons for batch statuses
export const BATCH_STATUS_ICONS: Record<string, string> = {
  draft: '📋',
  pending_signatures: '✍️',
  partially_approved: '⏳',
  fully_approved: '✅',
  payment_processing: '💰',
  payment_confirmed: '✔️',
  completed: '🎉',
  cancelled: '❌',
};

// Permissions helper
export const canEditBatch = (status: string): boolean => {
  return status === 'draft';
};

export const canSendForSignatures = (status: string, requisitionCount: number): boolean => {
  return status === 'draft' && requisitionCount > 0;
};

export const canAddRequisitions = (status: string): boolean => {
  return status === 'draft';
};

export const canRemoveRequisitions = (status: string): boolean => {
  return status === 'draft' || status === 'pending_signatures';
};

export const canApproveBatch = (status: string): boolean => {
  return status === 'pending_signatures' || status === 'partially_approved';
};

export const canCancelBatch = (status: string): boolean => {
  return status !== 'completed' && status !== 'cancelled';
};
