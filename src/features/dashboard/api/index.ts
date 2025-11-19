// features/dashboard/api/index.ts
import { useQuery } from '@tanstack/react-query';
import { useMyRequisitions, useMyDrafts, useAssignedToMe } from '@/features/requisitions/api/useRequisitions';
import { useAuth } from '@/shared/contexts/AuthContext';

export interface DashboardStats {
  myRequisitions: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    thisMonthTotal: number;
  };
  drafts: {
    count: number;
  };
  assignedToMe: {
    count: number;
  };
  recentActivity: Array<{
    id: number;
    requisition_number: string;
    description: string;
    total_amount: number;
    current_status: string;
    created_at: string;
    prepared_by: {
      first_name: string;
      last_name: string;
    };
  }>;
}

/**
 * Hook to fetch dashboard statistics for the current user
 * Aggregates data from multiple requisition endpoints
 */
export function useDashboardStats() {
  const { user } = useAuth();
  
  // Fetch all requisitions for current user
  const { data: myRequisitionsData, isLoading: isLoadingRequisitions } = useMyRequisitions();
  
  // Fetch drafts
  const { data: draftsData, isLoading: isLoadingDrafts } = useMyDrafts();
  
  // Fetch assigned requisitions (for approvers)
  const { data: assignedData, isLoading: isLoadingAssigned } = useAssignedToMe();

  return useQuery<DashboardStats>({
    queryKey: ['dashboard-stats', user?.id],
    queryFn: () => {
      const requisitions = myRequisitionsData?.results || [];
      const drafts = draftsData || [];
      const assigned = assignedData?.results || [];

      // Calculate stats
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      const pendingStatuses = ['submitted', 'pending_review', 'pending_approval', 'forwarded_for_submission'];
      const approvedStatuses = ['approved', 'account_confirmation', 'account_confirmed', 'completed'];
      const rejectedStatuses = ['rejected', 'changes_requested'];

      const pending = requisitions.filter(r => pendingStatuses.includes(r.current_status)).length;
      const approved = requisitions.filter(r => approvedStatuses.includes(r.current_status)).length;
      const rejected = requisitions.filter(r => rejectedStatuses.includes(r.current_status)).length;

      // Calculate this month's total amount
      const thisMonthTotal = requisitions
        .filter(r => {
          const createdDate = new Date(r.created_at);
          return createdDate.getMonth() === currentMonth && 
                 createdDate.getFullYear() === currentYear &&
                 approvedStatuses.includes(r.current_status);
        })
        .reduce((sum, r) => sum + parseFloat(r.total_amount || '0'), 0);

      // Get recent activity (last 5 requisitions)
      const recentActivity = requisitions
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5);

      return {
        myRequisitions: {
          total: requisitions.length,
          pending,
          approved,
          rejected,
          thisMonthTotal,
        },
        drafts: {
          count: drafts.length,
        },
        assignedToMe: {
          count: assigned.length,
        },
        recentActivity,
      };
    },
    enabled: !isLoadingRequisitions && !isLoadingDrafts && !isLoadingAssigned,
    staleTime: 30 * 1000, // 30 seconds
  });
}
