import { apiClient } from '@/shared/api/client';
import type {
  RequisitionResponse,
  RequisitionListResponse,
  RequisitionListParams,
  CreateRequisitionRequest,
  UpdateRequisitionRequest,
  SubmitRequisitionRequest,
  ForwardRequisitionRequest,
  ApproveRequisitionRequest,
  RejectRequisitionRequest,
  ReturnRequisitionRequest,
  UploadDocumentRequest,
  SupportingDocumentResponse,
} from './types';

// Base URL for requisition endpoints
const BASE_URL = '/api/requisition-management';

// ============================================================================
// CRUD Operations
// ============================================================================

/**
 * Get list of requisitions with optional filters
 */
export const getRequisitions = async (
  params?: RequisitionListParams
): Promise<RequisitionListResponse> => {
  const response = await apiClient.get<RequisitionListResponse>(
    `${BASE_URL}/requisitions/`,
    { params }
  );
  return response.data;
};

/**
 * Get a single requisition by ID
 */
export const getRequisition = async (id: number): Promise<RequisitionResponse> => {
  const response = await apiClient.get<RequisitionResponse>(
    `${BASE_URL}/requisitions/${id}/`
  );
  return response.data;
};

/**
 * Create a new requisition (draft)
 */
export const createRequisition = async (
  data: CreateRequisitionRequest
): Promise<RequisitionResponse> => {
  const response = await apiClient.post<RequisitionResponse>(
    `${BASE_URL}/requisitions/`,
    data
  );
  return response.data;
};

/**
 * Update an existing requisition
 */
export const updateRequisition = async (
  id: number,
  data: Partial<UpdateRequisitionRequest>
): Promise<RequisitionResponse> => {
  const response = await apiClient.patch<RequisitionResponse>(
    `${BASE_URL}/requisitions/${id}/`,
    data
  );
  return response.data;
};

/**
 * Delete a requisition (only drafts)
 */
export const deleteRequisition = async (id: number): Promise<void> => {
  await apiClient.delete(`${BASE_URL}/requisitions/${id}/`);
};

/**
 * Save requisition as draft
 * Handles both JSON data and file uploads (multipart/form-data)
 */
export const saveAsDraft = async (
  data: CreateRequisitionRequest,
  files?: { index: number; file: File; documentType: string; description: string }[]
): Promise<RequisitionResponse> => {
  // If files are present, use FormData for multipart upload
  if (files && files.length > 0) {
    const formData = new FormData();
    
    // Append JSON data as a string (Django will parse it)
    formData.append('data', JSON.stringify(data));
    
    // Append each file with metadata
    files.forEach((fileData) => {
      formData.append(`document_${fileData.index}_file`, fileData.file);
      formData.append(`document_${fileData.index}_type`, fileData.documentType);
      formData.append(`document_${fileData.index}_description`, fileData.description);
    });
    
    const response = await apiClient.post<RequisitionResponse>(
      `${BASE_URL}/requisitions/save-as-draft/`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  }
  
  // No files - send as regular JSON
  const response = await apiClient.post<RequisitionResponse>(
    `${BASE_URL}/requisitions/save-as-draft/`,
    data
  );
  return response.data;
};

/**
 * Update an existing draft requisition
 * Handles both JSON data and file uploads (multipart/form-data)
 */
export const updateDraft = async (
  id: number,
  data: CreateRequisitionRequest,
  files?: { index: number; file: File; documentType: string; description: string }[],
  existingDocumentIds?: number[]
): Promise<RequisitionResponse> => {
  // If files are present OR we need to preserve existing documents, use FormData
  if ((files && files.length > 0) || (existingDocumentIds && existingDocumentIds.length > 0)) {
    const formData = new FormData();
    
    // Append JSON data as a string (Django will parse it)
    formData.append('data', JSON.stringify(data));
    
    // Append existing document IDs to preserve
    if (existingDocumentIds && existingDocumentIds.length > 0) {
      formData.append('existing_document_ids', JSON.stringify(existingDocumentIds));
    }
    
    // Append each file with metadata
    if (files && files.length > 0) {
      files.forEach((fileData) => {
        formData.append(`document_${fileData.index}_file`, fileData.file);
        formData.append(`document_${fileData.index}_type`, fileData.documentType);
        formData.append(`document_${fileData.index}_description`, fileData.description);
      });
    }
    
    const response = await apiClient.post<RequisitionResponse>(
      `${BASE_URL}/requisitions/${id}/update-draft/`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  }
  
  // No files and no existing documents - send as regular JSON
  const response = await apiClient.post<RequisitionResponse>(
    `${BASE_URL}/requisitions/${id}/update-draft/`,
    data
  );
  return response.data;
};

/**
 * Get current user's draft requisitions
 */
export const getMyDrafts = async (): Promise<RequisitionResponse[]> => {
  const response = await apiClient.get<RequisitionResponse[]>(
    `${BASE_URL}/requisitions/my-drafts/`
  );
  return response.data;
};

// ============================================================================
// Workflow Actions
// ============================================================================

/**
 * Submit a requisition for approval
 * If user doesn't have submission authority, this will fail
 */
export const submitRequisition = async (
  id: number,
  data?: SubmitRequisitionRequest
): Promise<RequisitionResponse> => {
  const response = await apiClient.post<RequisitionResponse>(
    `${BASE_URL}/requisitions/${id}/submit/`,
    data
  );
  return response.data.requisition;
};

/**
 * Forward a requisition to supervisor for submission
 * Used when user exceeds their submission threshold
 */
export const forwardRequisition = async (
  id: number,
  data: ForwardRequisitionRequest
): Promise<RequisitionResponse> => {
  const response = await apiClient.post<{ message: string; requisition: RequisitionResponse }>(
    `${BASE_URL}/requisitions/${id}/forward-for-submission/`,
    data
  );
  return response.data.requisition;
};

/**
 * Approve a requisition
 */
export const approveRequisition = async (
  id: number,
  data?: ApproveRequisitionRequest
): Promise<RequisitionResponse> => {
  const response = await apiClient.post<RequisitionResponse>(
    `${BASE_URL}/requisitions/${id}/approve/`,
    data
  );
  return response.data;
};

/**
 * Reject a requisition
 */
export const rejectRequisition = async (
  id: number,
  data: RejectRequisitionRequest
): Promise<RequisitionResponse> => {
  const response = await apiClient.post<RequisitionResponse>(
    `${BASE_URL}/requisitions/${id}/reject/`,
    data
  );
  return response.data;
};

/**
 * Return a requisition for revision
 */
export const returnRequisition = async (
  id: number,
  data: ReturnRequisitionRequest
): Promise<RequisitionResponse> => {
  const response = await apiClient.post<RequisitionResponse>(
    `${BASE_URL}/requisitions/${id}/return/`,
    data
  );
  return response.data;
};

/**
 * Cancel a requisition
 */
export const cancelRequisition = async (
  id: number,
  comments?: string
): Promise<RequisitionResponse> => {
  const response = await apiClient.post<RequisitionResponse>(
    `${BASE_URL}/requisitions/${id}/cancel/`,
    { comments }
  );
  return response.data;
};

// ============================================================================
// Supporting Documents
// ============================================================================

/**
 * Upload a supporting document for a requisition
 */
export const uploadDocument = async (
  data: UploadDocumentRequest
): Promise<SupportingDocumentResponse> => {
  const formData = new FormData();
  formData.append('requisition', data.requisition.toString());
  formData.append('document_type', data.document_type);
  formData.append('file', data.file);
  if (data.description) {
    formData.append('description', data.description);
  }

  const response = await apiClient.post<SupportingDocumentResponse>(
    `${BASE_URL}/supporting-documents/`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return response.data;
};

/**
 * Delete a supporting document
 */
export const deleteDocument = async (id: number): Promise<void> => {
  await apiClient.delete(`${BASE_URL}/supporting-documents/${id}/`);
};

/**
 * Review and forward a requisition to next approver
 */
export const reviewAndForward = async (params: {
  id: number;
  comments?: string;
}): Promise<RequisitionResponse> => {
  const response = await apiClient.post<{ requisition: RequisitionResponse }>(
    `${BASE_URL}/requisitions/${params.id}/review-and-forward/`,
    { comments: params.comments || '' }
  );
  return response.data.requisition;
};
// ============================================================================
// Query Helpers
// ============================================================================

/**
 * Get requisitions pending my action
 */
export const getMyPendingRequisitions = async (): Promise<RequisitionResponse[]> => {
  const response = await apiClient.get<RequisitionListResponse>(
    `${BASE_URL}/requisitions/`,
    {
      params: {
        current_assignee: 'me', // Backend should handle 'me' as current user
        status__in: 'forwarded_for_submission,initial_review,manager_review,account_confirmation,top_management_review,board_review',
      },
    }
  );
  return response.data.results;
};

/**
 * Get requisitions I prepared
 */
export const getMyRequisitions = async (
  params?: RequisitionListParams
): Promise<RequisitionListResponse> => {
  const response = await apiClient.get<RequisitionListResponse>(
    `${BASE_URL}/requisitions/`,
    {
      params: {
        ...params,
        prepared_by: 'me', // Backend should handle 'me' as current user
      },
    }
  );
  return response.data;
};

/**
 * Get requisitions forwarded to me for submission
 */
export const getForwardedToMe = async (): Promise<RequisitionResponse[]> => {
  const response = await apiClient.get<RequisitionListResponse>(
    `${BASE_URL}/requisitions/`,
    {
      params: {
        current_assignee: 'me',
        status: 'forwarded_for_submission',
      },
    }
  );
  return response.data.results;
};

/**
 * Get requisitions pending my approval
 */
export const getPendingApprovals = async (): Promise<RequisitionResponse[]> => {
  const response = await apiClient.get<RequisitionListResponse>(
    `${BASE_URL}/requisitions/`,
    {
      params: {
        current_assignee: 'me',
        status__in: 'initial_review,manager_review,account_confirmation,top_management_review,board_review',
      },
    }
  );
  return response.data.results;
};

/**
 * Get requisitions returned to me for revision
 */
export const getReturnedToMe = async (): Promise<RequisitionResponse[]> => {
  const response = await apiClient.get<RequisitionListResponse>(
    `${BASE_URL}/requisitions/`,
    {
      params: {
        prepared_by: 'me',
        current_status: 'returned_for_revision',
      },
    }
  );
  return response.data.results;
};

// ============================================================================
// Validation Helpers
// ============================================================================

/**
 * Check if user can submit a requisition based on amount
 */
export const checkSubmissionAuthority = async (
  amount: number
): Promise<{ can_submit: boolean; forward_to?: number; reason?: string }> => {
  const response = await apiClient.post(
    `${BASE_URL}/requisitions/check-submission-authority/`,
    { amount }
  );
  return response.data;
};

/**
 * Get suggested approver for a requisition amount
 */
export const getSuggestedApprover = async (
  amount: number
): Promise<{ approver_id: number; approver_name: string; approval_limit: number }> => {
  const response = await apiClient.post(
    `${BASE_URL}/requisitions/get-suggested-approver/`,
    { amount }
  );
  return response.data;
};
/**
 * Get requisitions processed by current user
 */
export const getMyProcessedRequisitions = async (): Promise<{
  count: number;
  results: RequisitionResponse[];
}> => {
  const response = await apiClient.get<{
    count: number;
    results: RequisitionResponse[];
  }>(`${BASE_URL}/requisitions/my-processed/`);
  return response.data;
};

/**
 * Get team requisitions based on hierarchical access
 * Supports filtering by status, program, and search query
 */
export const getTeamRequisitions = async (params?: {
  status?: string;
  program?: string;
  search?: string;
}): Promise<{
  count: number;
  results: RequisitionResponse[];
}> => {
  const response = await apiClient.get<{
    count: number;
    results: RequisitionResponse[];
  }>(`${BASE_URL}/requisitions/team/`, {
    params: {
      status: params?.status || 'all',
      program: params?.program || 'all',
      search: params?.search || '',
    },
  });
  return response.data;
};

// ============================================================================
// Export all
// ============================================================================

export default {
  // CRUD
  getRequisitions,
  getRequisition,
  createRequisition,
  updateRequisition,
  deleteRequisition,
  saveAsDraft,
  getMyDrafts,
  
  // Workflow
  submitRequisition,
  forwardRequisition,
  reviewAndForward,
  approveRequisition,
  rejectRequisition,
  returnRequisition,
  cancelRequisition,
  getMyProcessedRequisitions,
  
  // Documents
  uploadDocument,
  deleteDocument,
  
  // Queries
  getMyPendingRequisitions,
  getMyRequisitions,
  getForwardedToMe,
  getPendingApprovals,
  getReturnedToMe,
  getTeamRequisitions,
  
  // Validation
  checkSubmissionAuthority,
  getSuggestedApprover,
};