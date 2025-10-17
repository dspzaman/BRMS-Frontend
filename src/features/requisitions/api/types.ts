// API Request/Response Types for Requisitions

import type { PayeeType, ExpenseType } from "../model/types";

// ============================================================================
// API Response Types (from backend)
// ============================================================================

export interface RequisitionStatusResponse {
  id: number;
  requisition: number;
  status: string;
  status_display: string;
  assigned_to: number | null;
  assigned_to_name?: string;
  assigned_by: number;
  assigned_by_name?: string;
  assigned_date: string;
  completed_by: number | null;
  completed_by_name?: string;
  completed_date: string | null;
  action_status: string;
  action_status_display: string;
  comments: string;
  is_current: boolean;
}

export interface SupportingDocumentResponse {
  id: number;
  requisition: number;
  document_type: string;
  file_name: string;
  file_path: string;
  file_size: number;
  file_size_mb: number;
  uploaded_by: number;
  uploaded_by_name?: string;
  uploaded_at: string;
  description: string;
}

export interface GeneralExpenseLineItemResponse {
  id: number;
  requisition: number;
  program: number;
  program_name?: string;
  expense_code_assignment: number;
  expense_code?: {
    id: number;
    code: string;
    description: string;
  };
  budget_line_item: number | null;
  description: string;
  amount: string;
  gst_rate: string;
  gst_amount: string;
  total_amount: string;
  line_order: number;
  created_at: string;
  updated_at: string;
}

export interface TravelExpenseLineItemResponse {
  id: number;
  requisition: number;
  program: number;
  program_name?: string;
  expense_code_assignment: number;
  expense_code?: {
    id: number;
    code: string;
    description: string;
  };
  budget_line_item: number | null;
  travel_date: string;
  start_address: string;
  end_address: string;
  description: string;
  total_km: string;
  rate_per_km: string;
  amount: string;
  gst_rate: string;
  gst_amount: string;
  total_amount: string;
  line_order: number;
  created_at: string;
  updated_at: string;
}

export interface PerDiemExpenseLineItemResponse {
  id: number;
  requisition: number;
  program: number;
  program_name?: string;
  expense_code_assignment: number;
  expense_code?: {
    id: number;
    code: string;
    description: string;
  };
  budget_line_item: number | null;
  meal_date: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'full_day';
  description: string;
  rate_amount: string;
  amount: string;
  gst_rate: string;
  gst_amount: string;
  total_amount: string;
  line_order: number;
  created_at: string;
  updated_at: string;
}

export interface RequisitionResponse {
  id: number;
  requisition_number: string;
  title: string;
  
  // Payee
  payee_type: PayeeType;
  payee_staff: number | null;
  payee_staff_name?: string;
  payee_vendor: number | null;
  payee_vendor_name?: string;
  payee_card_holder: number | null;
  payee_card_holder_name?: string;
  payee_other: number | null;
  payee_other_name?: string;
  
  // Financial
  total_amount: string;
  gst_rate: string;
  gst_amount: string;
  total_with_tax: string;
  
  // Workflow
  prepared_by: number;
  prepared_by_name?: string;
  submitted_by: number | null;
  submitted_by_name?: string;
  current_status: string;
  current_status_display?: string;
  current_assignee: number | null;
  current_assignee_name?: string;
  revision_count: number;
  
  // Timestamps
  created_at: string;
  updated_at: string;
  submitted_at: string | null;
  
  // Related data (if expanded)
  status_history?: RequisitionStatusResponse[];
  supporting_documents?: SupportingDocumentResponse[];
  general_expense_items?: GeneralExpenseLineItemResponse[];
  travel_expense_items?: TravelExpenseLineItemResponse[];
  per_diem_expense_items?: PerDiemExpenseLineItemResponse[];
  
  // Helper computed fields
  programs?: number[];
}

// ============================================================================
// API Request Types (to backend)
// ============================================================================

export interface GeneralExpenseLineItemRequest {
  program: number;
  expense_code_assignment: number;
  budget_line_item?: number | null;
  description: string;
  amount: number;
  gst_rate: number;
  line_order: number;
}

export interface TravelExpenseLineItemRequest {
  program: number;
  expense_code_assignment: number;
  budget_line_item?: number | null;
  travel_date: string; // YYYY-MM-DD
  start_address: string;
  end_address: string;
  description: string;
  total_km: number;
  rate_per_km: number;
  gst_rate: number;
  line_order: number;
}

export interface PerDiemExpenseLineItemRequest {
  program: number;
  expense_code_assignment: number;
  budget_line_item?: number | null;
  meal_date: string; // YYYY-MM-DD
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'full_day';
  description?: string;
  rate_amount: number;
  gst_rate: number;
  line_order: number;
}

export interface CreateRequisitionRequest {
  title: string;
  
  // Payee
  payee_type: PayeeType;
  payee_staff?: number | null;
  payee_vendor?: number | null;
  payee_card_holder?: number | null;
  payee_other?: number | null;
  
  // Line items
  general_expense_items?: GeneralExpenseLineItemRequest[];
  travel_expense_items?: TravelExpenseLineItemRequest[];
  per_diem_expense_items?: PerDiemExpenseLineItemRequest[];
}

export interface UpdateRequisitionRequest extends Partial<CreateRequisitionRequest> {
  id: number;
}

export interface SubmitRequisitionRequest {
  comments?: string;
}

export interface ForwardRequisitionRequest {
  forward_to: number; // User ID to forward to
  comments?: string;
}

export interface ApproveRequisitionRequest {
  comments?: string;
}

export interface RejectRequisitionRequest {
  comments: string; // Required for rejection
}

export interface ReturnRequisitionRequest {
  comments: string; // Required when returning for revision
}

// ============================================================================
// List/Filter Types
// ============================================================================

export interface RequisitionListParams {
  page?: number;
  page_size?: number;
  status?: string;
  prepared_by?: number;
  current_assignee?: number;
  search?: string;
  ordering?: string;
}

export interface RequisitionListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: RequisitionResponse[];
}

// ============================================================================
// Upload Types
// ============================================================================

export interface UploadDocumentRequest {
  requisition: number;
  document_type: 'receipt' | 'invoice' | 'quote' | 'contract' | 'other';
  file: File;
  description?: string;
}