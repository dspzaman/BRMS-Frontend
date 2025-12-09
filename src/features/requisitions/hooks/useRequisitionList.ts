import { useState, useMemo } from 'react';
import { useAssignedToMe } from '../api/useRequisitions';

interface FilterState {
  status: string;
  search: string;
  sortBy: 'date' | 'amount' | 'status';
  sortOrder: 'asc' | 'desc';
}

/**
 * Hook to manage requisition list with filtering and sorting
 */
export function useRequisitionList() {
  const [filters, setFilters] = useState<FilterState>({
    status: 'all',
    search: '',
    sortBy: 'date',
    sortOrder: 'desc',
  });

  // Fetch assigned requisitions
  const { data, isLoading, error } = useAssignedToMe();

  // Extract requisitions from response
  const requisitions = useMemo(() => {
    return data?.results || [];
  }, [data]);

  // Apply filters and sorting
  const filteredRequisitions = useMemo(() => {
    let filtered = [...requisitions];

    // Filter by status
    if (filters.status !== 'all') {
      filtered = filtered.filter((req) => req.current_status === filters.status);
    }

    // Filter by search (requisition number, prepared by name)
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (req) =>
          req.requisition_number?.toLowerCase().includes(searchLower) ||
          req.prepared_by_name?.toLowerCase().includes(searchLower) ||
          req.submitted_by_name?.toLowerCase().includes(searchLower)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (filters.sortBy) {
        case 'date':
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
        case 'amount':
            const aAmount = Number(a.total_with_tax ?? 0);
            const bAmount = Number(b.total_with_tax ?? 0);
            comparison = aAmount - bAmount;

          break;
        case 'status':
          comparison = a.current_status.localeCompare(b.current_status);
          break;
      }

      return filters.sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [requisitions, filters]);

  // Group by status for summary
  const summary = useMemo(() => {
    return {
      forSubmission: requisitions.filter((r) => r.current_status === 'forwarded_for_submission').length,
      forApproval: requisitions.filter((r) =>
        ['pending_approval', 'account_confirmation', 'ed_approval', 'board_approval'].includes(r.current_status)
      ).length,
      forReview: requisitions.filter((r) =>
        ['pending_review'].includes(r.current_status)
      ).length,
      
      total: requisitions.length,
    };
  }, [requisitions]);

  return {
    requisitions: filteredRequisitions,
    isLoading,
    error,
    filters,
    setFilters,
    summary,
    totalCount: requisitions.length,
    filteredCount: filteredRequisitions.length,
  };
}
