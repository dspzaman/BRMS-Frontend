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

// Requisition Status Options
export const REQUISITION_STATUS = {
  DRAFT: 'draft',
  SUBMITTED: 'submitted',
  PENDING_APPROVAL: 'pending_approval',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  COMPLETED: 'completed',
} as const;

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