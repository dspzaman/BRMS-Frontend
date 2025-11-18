// src/features/requisitions/ui/MyRequisitions/index.tsx
import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { showDeleteConfirmation } from '@/shared/utils/toastHelpers';
import { useMyRequisitions, useDeleteRequisition } from '../../api/useRequisitions';
import type { RequisitionResponse } from '../../api/types';
import { RequisitionsTable } from './RequisitionsTable';
import { PaginationControls } from './PaginationControls';

type StatusType = 'all' | 'draft' | 'returned' | 'submitted' | 'approved' | 'rejected';

export function MyRequisitionsView() {
  const [activeTab, setActiveTab] = useState<StatusType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch data using custom hook
  const { data, isLoading, isError, error, refetch } = useMyRequisitions({
    page: currentPage,
    page_size: 20,
    search: searchQuery || undefined,
    ordering: '-created_at',
  });

  // Delete mutation
  const deleteMutation = useDeleteRequisition();

  // Get requisitions from API response
  const allRequisitions = data?.results || [];

  // Filter requisitions based on active tab (client-side)
  const filteredRequisitions = useMemo(() => {
    return allRequisitions.filter((req: RequisitionResponse) => {
      if (activeTab === 'draft') {
        return req.current_status === 'draft' && req.revision_count === 0;
      }

      if (activeTab === 'returned') {
        return req.current_status === 'returned_for_revision' && req.revision_count > 0;
      }

      if (activeTab === 'submitted') {
        return [
          'forwarded_for_submission',
          'pending_review',
          'pending_approval',
          'account_confirmation',
          'ed_approval',
          'board_approval',
        ].includes(req.current_status);
      }

      if (activeTab === 'approved') {
        return req.current_status === 'completed';
      }

      if (activeTab === 'rejected') {
        return ['cancelled', 'rejected'].includes(req.current_status);
      }

      return true; // 'all' tab
    });
  }, [allRequisitions, activeTab]);

  // Calculate counts for each tab
  const counts = useMemo(() => {
    return {
      all: allRequisitions.length,
      draft: allRequisitions.filter(r => r.current_status === 'draft' && r.revision_count === 0).length,
      returned: allRequisitions.filter(r => r.current_status === 'draft' && r.revision_count > 0).length,
      submitted: allRequisitions.filter(r => [
        'forwarded_for_submission',
        'pending_review',
        'pending_approval',
        'account_confirmation',
        'ed_approval',
        'board_approval',
      ].includes(r.current_status)).length,
      approved: allRequisitions.filter(r => r.current_status === 'completed').length,
      rejected: allRequisitions.filter(r => ['cancelled', 'rejected'].includes(r.current_status)).length,
    };
  }, [allRequisitions]);

  const tabs = [
    { key: 'all' as StatusType, label: 'All', count: counts.all },
    { key: 'draft' as StatusType, label: 'Drafts', count: counts.draft },
    { key: 'returned' as StatusType, label: 'Returned', count: counts.returned },
    { key: 'submitted' as StatusType, label: 'Submitted', count: counts.submitted },
    { key: 'approved' as StatusType, label: 'Approved', count: counts.approved },
    { key: 'rejected' as StatusType, label: 'Rejected', count: counts.rejected },
  ].filter(tab => tab.key === 'all' || tab.count > 0);

  const handleDelete = async (id: number, requisitionNumber: string) => {
    showDeleteConfirmation({
      itemName: `Requisition ${requisitionNumber}`,
      onConfirm: async () => {
        await deleteMutation.mutateAsync(id);
      },
    });
  };

  return (
    <>
      {/* Header with New Button */}
      

      {/* Status Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`
                py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap
                ${activeTab === tab.key
                  ? 'border-ems-green-600 text-ems-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={`ml-2 py-0.5 px-2.5 rounded-full text-xs ${activeTab === tab.key
                    ? 'bg-ems-green-100 text-ems-green-600'
                    : 'bg-gray-100 text-gray-600'
                  }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Search */}
      <div className="mb-6 flex gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search by requisition ID, title, or payee name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ems-green-500 focus:border-ems-green-500"
          />
        </div>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ems-green-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading requisitions...</p>
        </div>
      ) : isError ? (
        /* Error State */
        <div className="bg-white border border-red-200 rounded-lg p-12 text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Failed to load requisitions
          </h3>
          <p className="text-gray-500 mb-6">
            {error instanceof Error ? error.message : 'An error occurred'}
          </p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-ems-green-600 text-white rounded-md hover:bg-ems-green-700"
          >
            Try Again
          </button>
        </div>
      ) : filteredRequisitions.length === 0 ? (
        /* Empty State */
        <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No requisitions found
          </h3>
          <p className="text-gray-500 mb-6">
            {searchQuery
              ? 'Try adjusting your search criteria'
              : activeTab === 'all'
                ? 'Get started by creating your first requisition'
                : `You don't have any ${activeTab} requisitions yet`
            }
          </p>
          {activeTab === 'all' && !searchQuery && (
            <Link
              to="/requisitions/create"
              className="inline-flex items-center px-4 py-2 bg-ems-green-600 text-white rounded-md hover:bg-ems-green-700"
            >
              <svg
                className="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Create First Requisition
            </Link>
          )}
        </div>
      ) : (
        <>
          {/* Table */}
          <RequisitionsTable
            requisitions={filteredRequisitions}
            onDelete={handleDelete}
            isDeleting={deleteMutation.isLoading}
          />

          {/* Pagination & Results Summary */}
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Showing {((currentPage - 1) * 20) + 1} to {Math.min(currentPage * 20, data?.count || 0)} of {data?.count || 0} requisitions
            </div>

            {data && (
              <PaginationControls
                currentPage={currentPage}
                totalCount={data.count}
                pageSize={20}
                hasNext={!!data.next}
                hasPrevious={!!data.previous}
                onPageChange={setCurrentPage}
              />
            )}
          </div>
        </>
      )}
    </>
  );
}