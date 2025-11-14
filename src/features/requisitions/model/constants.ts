// Payee Type Options
export const PAYEE_TYPE_OPTIONS = [
  { value: 'staff', label: 'Staff Member' },
  { value: 'vendor', label: 'Vendor' },
  { value: 'contractor', label: 'Contractor' },
  { value: 'other', label: 'Other' },
] as const;

// Expense Type Options
export const EXPENSE_TYPE_OPTIONS = [
  { value: 'general', label: 'General Expense' },
  { value: 'travel', label: 'Travel Expense' },
  { value: 'per_diem', label: 'Per Diem' },
] as const;

// Meal Type Options (for Per Diem)
export const MEAL_TYPE_OPTIONS = [
  { value: 'breakfast', label: 'Breakfast' },
  { value: 'lunch', label: 'Lunch' },
  { value: 'dinner', label: 'Dinner' },
] as const;

// Document Type Options
export const DOCUMENT_TYPE_OPTIONS = [
  { value: 'invoice', label: 'Invoice' },
  { value: 'receipt', label: 'Receipt' },
  { value: 'quote', label: 'Quote' },
  { value: 'other', label: 'Other' },
] as const;

/**
 * Maximum row limits for requisition form sections
 * These limits prevent performance issues and accidental data overload
 */
export const ROW_LIMITS = {
  GENERAL_EXPENSES: 10,
  TRAVEL_EXPENSES: 25,
  PER_DIEM_EXPENSES: 10,
  SUPPORTING_DOCUMENTS: 5,
} as const;

/**
 * User-friendly messages for row limit warnings
 */
export const ROW_LIMIT_MESSAGES = {
  GENERAL_EXPENSES: `You can add up to ${ROW_LIMITS.GENERAL_EXPENSES} general expense items per requisition.`,
  TRAVEL_EXPENSES: `You can add up to ${ROW_LIMITS.TRAVEL_EXPENSES} travel expense items per requisition.`,
  PER_DIEM_EXPENSES: `You can add up to ${ROW_LIMITS.PER_DIEM_EXPENSES} per diem expense items per requisition.`,
  SUPPORTING_DOCUMENTS: `You can upload up to ${ROW_LIMITS.SUPPORTING_DOCUMENTS} documents per requisition.`,
} as const;

// Requisition Status Options
export const REQUISITION_STATUS = {
  DRAFT: 'draft',
  SUBMITTED: 'submitted',
  PENDING_APPROVAL: 'pending_approval',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  COMPLETED: 'completed',
} as const;

export const STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  forwarded_for_submission: 'Forwarded for Submission',
  pending_review: 'Review',
  pending_approval: 'Approval',
  returned_for_revision: 'Returned',
  account_confirmation: 'Account Confirmation',
  ed_approval: 'ED Approval',
  board_approval: 'Board Approval',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

// File Upload Constraints
export const FILE_UPLOAD_CONSTRAINTS = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_FILE_TYPES: [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ],
  ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.gif', '.pdf', '.doc', '.docx', '.xls', '.xlsx'],
} as const;