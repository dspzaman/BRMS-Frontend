// Batch API Types
// Matches backend batch_serializers.py

// Cheque Generation Types
export interface ChequeGroup {
  payee_type: string;
  payee_id: number;
  payee_name: string;
  requisitions: Array<{
    id: number;
    requisition_number: string;
    title: string;
    amount: string;
    prepared_by: string;
  }>;
  total_amount: string;
  requisition_count: number;
}

export interface ChequeGroupsPreview {
  groups: ChequeGroup[];
  total_groups: number;
  total_requisitions: number;
}

export interface GenerateChequeRequest {
  cheque_number: string;
  requisition_ids: number[];
  notes?: string;
}

export interface Cheque {
  id: number;
  cheque_number: string;
  cheque_date: string;
  batch: number | null;
  batch_number?: string;
  payee_type: string;
  payee_id: number;
  payee_name: string;
  total_amount: string;
  status: 'draft' | 'pending' | 'printed' | 'signed' | 'distributed' | 'cashed' | 'void';
  created_at: string;
  created_by: number;
  created_by_name?: string;
  notes: string;
}

export interface BatchSignaturee {
  id: number;
  signaturee: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    full_name: string;
  };
  priority: number;
  signaturee_type: 'primary' | 'secondary' | 'backup';
  status: 'pending' | 'notified' | 'approved' | 'skipped';
  notified_at: string | null;
  signed_at: string | null;
  comments: string;
}

export interface BatchRequisition {
  id: number;
  requisition: number;
  requisition_details: {
    id: number;
    requisition_number: string;
    title: string;
    payee_type: string;
    payee_display: string;
    payment_type: string;
    total_with_tax: string;
    current_status: string;
    prepared_by: number;
    prepared_by_name: string;
    created_at: string;
  };
  is_active: boolean;
  added_by: number;
  added_by_name: string;
  added_at: string;
  removed_by: number | null;
  removed_by_name: string | null;
  removed_at: string | null;
  removal_reason: string;
  assigned_cheque: number | null;
}

export interface BatchHistory {
  id: number;
  action: string;
  performed_by: string;
  performed_at: string;
  old_status: string;
  new_status: string;
  comments: string;
  details: Record<string, any>;
}

export interface Batch {
  id: number;
  batch_number: string;
  batch_type: 'cheque' | 'eft' | 'wire';
  status: 'draft' | 'pending_signatures' | 'partially_approved' | 'fully_approved' | 'payment_processing' | 'payment_confirmed' | 'completed' | 'cancelled';
  created_by: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    full_name: string;
  };
  created_at: string;
  sent_for_signatures_at: string | null;
  fully_approved_at: string | null;
  completed_at: string | null;
  notes: string;
  total_amount: string;
  requisition_count: number;
  required_signatures: number;
  approved_signatures: number;
  expires_at: string | null;
  
  // Related data (only in detail view)
  signaturees?: BatchSignaturee[];
  batch_requisitions?: BatchRequisition[];
  history?: BatchHistory[];
}

export interface BatchListItem {
  id: number;
  batch_number: string;
  batch_type: 'cheque' | 'eft' | 'wire';
  batch_type_display: string;
  status: 'draft' | 'pending_signatures' | 'partially_approved' | 'fully_approved' | 'payment_processing' | 'payment_confirmed' | 'completed' | 'cancelled';
  status_display: string;
  created_by_name: string;
  created_at: string;
  sent_for_signatures_at: string | null;
  fully_approved_at: string | null;
  completed_at: string | null;
  total_amount: string;
  requisition_count: number;
  required_signatures: number;
  signaturee_progress: {
    approved: number;
    total: number;
    display: string;
  };
  notes: string;
}

export interface RequisitionBasic {
  id: number;
  requisition_number: string;
  prepared_by_name: string;
  created_at: string;
  total_with_tax: string;
  payment_type: string;
  payee_name: string;
  description: string;
  current_status: string;
}

export interface ReadyPoolResponse {
  summary: {
    cheque: {
      count: number;
      total_amount: string;
    };
    eft: {
      count: number;
      total_amount: string;
    };
    wire: {
      count: number;
      total_amount: string;
    };
  };
  requisitions: RequisitionBasic[];
  total_count: number;
}

export interface BatchStatistics {
  total_batches: number;
  status_breakdown: Record<string, number>;
  type_breakdown: Record<string, number>;
  financial_summary: {
    total_amount: string;
    total_requisitions: number;
    avg_amount: string;
  };
  pending_signatures: number;
}

// Request types
export interface CreateBatchRequest {
  batch_type: 'cheque' | 'eft' | 'wire';
  notes?: string;
  requisition_ids?: number[];
}

export interface AddRequisitionsRequest {
  requisition_ids: number[];
}

export interface RemoveRequisitionRequest {
  requisition_id: number;
  reason: string;
}

export interface ApproveBatchRequest {
  comments?: string;
}

export interface RejectBatchRequest {
  requisition_ids: number[];
  reason: string;
}

export interface SkipSignatureeRequest {
  signaturee_id: number;
  reason: string;
}

// Response types
export interface BatchResponse {
  batch: Batch;
  message?: string;
}

export interface AddRequisitionsResponse {
  batch: Batch;
  added: string[];
  errors: Array<{
    requisition_number: string;
    error: string;
  }>;
}

export interface RemoveRequisitionResponse {
  batch: Batch;
  message: string;
}

export interface ApproveBatchResponse {
  batch: Batch;
  approval_status: {
    status: 'partially_approved' | 'fully_approved';
    approved_count: number;
    required_count: number;
    message: string;
  };
  message: string;
}

export interface MyPendingBatchesResponse {
  count: number;
  batches: BatchListItem[];
}
