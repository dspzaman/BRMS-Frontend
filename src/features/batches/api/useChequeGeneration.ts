import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/client';
import type { ChequeGroupsPreview, GenerateChequeRequest, Cheque } from './types';

// Query Keys
export const chequeGenerationKeys = {
  all: ['cheque-generation'] as const,
  preview: (requisitionIds: number[]) => [...chequeGenerationKeys.all, 'preview', requisitionIds] as const,
  draftList: () => [...chequeGenerationKeys.all, 'draft-list'] as const,
};

/**
 * Preview how requisitions will be grouped into cheques by payee
 */
export function usePreviewChequeGroups(requisitionIds: number[]) {
  return useQuery({
    queryKey: chequeGenerationKeys.preview(requisitionIds),
    queryFn: async () => {
      const { data } = await apiClient.get<ChequeGroupsPreview>(
        '/api/requisition-management/cheques/preview-groups/',
        {
          params: {
            requisition_ids: requisitionIds.join(','),
          },
        }
      );
      return data;
    },
    enabled: requisitionIds.length > 0,
  });
}

/**
 * Generate a single cheque from a group of requisitions
 */
export function useGenerateCheque() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: GenerateChequeRequest) => {
      const { data } = await apiClient.post<{ message: string; cheque: Cheque }>(
        '/api/requisition-management/cheques/generate/',
        request
      );
      return data;
    },
    onSuccess: () => {
      // Invalidate draft cheques list
      queryClient.invalidateQueries({ queryKey: chequeGenerationKeys.draftList() });
      // Invalidate ready pool (requisitions are now assigned to cheques)
      queryClient.invalidateQueries({ queryKey: ['batches', 'ready-pool'] });
    },
  });
}

/**
 * Get list of draft cheques (not yet in batch)
 */
export function useDraftCheques() {
  return useQuery({
    queryKey: chequeGenerationKeys.draftList(),
    queryFn: async () => {
      const { data } = await apiClient.get<{ cheques: Cheque[]; count: number }>(
        '/api/requisition-management/cheques/draft/'
      );
      return data;
    },
  });
}
