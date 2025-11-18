import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { showApprovalConfirmation, showReturnConfirmation } from '@/shared/utils/toastHelpers';
import { useApprovalWorkspace, useReturnForRevision, useApproveWithBudget } from '../../api/useApprovalWorkspace';
import type { ExpenseItemBudgetAssignment } from '../../api/types';
import GeneralExpensesSection from './GeneralExpensesSection';
import TravelExpensesSection from './TravelExpensesSection';
import PerDiemExpensesSection from './PerDiemExpensesSection';
import { SupportingDocumentsDisplay } from '../RequisitionDetails/sections/SupportingDocumentsDisplay';
import BudgetSummaryDrawer from './BudgetSummaryDrawer';

interface ApprovalWorkspaceProps {
  requisitionId: number;
}

export default function ApprovalWorkspace({ requisitionId }: ApprovalWorkspaceProps) {
  const queryClient = useQueryClient();
  
  // Fetch approval workspace data
  const { data: workspace, isLoading, error } = useApprovalWorkspace(requisitionId);

  // State to track budget assignments for each expense item
  const [budgetAssignments, setBudgetAssignments] = useState<{
    general: ExpenseItemBudgetAssignment[];
    travel: ExpenseItemBudgetAssignment[];
    perDiem: ExpenseItemBudgetAssignment[];
  }>({
    general: [],
    travel: [],
    perDiem: [],
  });

  // Debug panel state
  const [showDebug, setShowDebug] = useState(false);

  // Comments state for approval actions
  const [comments, setComments] = useState('');

  // Budget summary modal state
  const [showBudgetModal, setShowBudgetModal] = useState(false);

  // Return for revision mutation
  const returnMutation = useReturnForRevision();

  // Approve with budget mutation
  const approveMutation = useApproveWithBudget();

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ems-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading approval workspace...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !workspace) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <svg
            className="h-6 w-6 text-red-600 mt-0.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div>
            <h3 className="text-lg font-semibold text-red-900 mb-1">
              Failed to Load Approval Workspace
            </h3>
            <p className="text-red-700">
              {error instanceof Error ? error.message : 'An unexpected error occurred'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Calculate total items and assigned items
  const totalItems =
    workspace.general_items.length +
    workspace.travel_items.length +
    workspace.per_diem_items.length;

  // For travel expenses, count items that have budget_line_item assigned in backend
  // For general/per diem, count from local state (assigned at approval time)
  const assignedTravelItems = workspace.travel_items.filter(item => item.budget_line_item).length;
  const assignedPerDiemItems = workspace.per_diem_items.filter(item => item.budget_line_item).length;
  
  const assignedItems =
    budgetAssignments.general.length +
    assignedTravelItems +
    assignedPerDiemItems;

  const allItemsAssigned = totalItems > 0 && assignedItems === totalItems;

  // Handle budget assignment from ExpenseItemRow
  const handleBudgetAssign = (
    type: 'general' | 'travel' | 'perDiem',
    assignment: ExpenseItemBudgetAssignment
  ) => {
    setBudgetAssignments((prev) => {
      const updated = { ...prev };
      // Remove any existing assignment for this item
      updated[type] = updated[type].filter((a) => a.id !== assignment.id);
      // Only add the new assignment if a budget line is selected
      if (assignment.budget_line_item) {
        updated[type] = [...updated[type], assignment];
      }
      return updated;
    });
  };
  
  // Refresh workspace data (for travel expenses after immediate assignment)
  const handleRefreshWorkspace = () => {
    queryClient.invalidateQueries({ queryKey: ['approval-workspace', requisitionId] });
  };

  return (
    <div className="space-y-6">
      {/* Budget Assignment Progress */}
      <div className="bg-ems-green-50 border-2 border-ems-green-500 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <svg
              className="h-5 w-5 text-ems-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <span className="font-medium text-ems-green-900">
              Budget Assignment Progress
            </span>
          </div>
          <div className="text-sm">
            <span className="font-bold text-ems-green-900">{assignedItems}</span>
            <span className="text-ems-green-700"> of </span>
            <span className="font-bold text-ems-green-900">{totalItems}</span>
            <span className="text-ems-green-700"> items assigned</span>
          </div>
        </div>
        {/* Progress bar */}
        <div className="mt-3 bg-green-100 rounded-full h-2 overflow-hidden">
          <div
            className="bg-ems-green-600 h-full transition-all duration-300"
            style={{
              width: totalItems > 0 ? `${(assignedItems / totalItems) * 100}%` : '0%',
            }}
          />
        </div>
      </div>

      {/* Budget Assignment Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Assign Budget Lines
              </h2>
              <p className="text-sm text-gray-600">
                Review and assign budget lines to each expense item. Progress: {assignedItems} of {totalItems} items assigned
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowBudgetModal(true)}
              className="text-sm font-medium text-ems-green-600 hover:text-ems-green-700"
            >
              View All Available Budgets
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="space-y-6">
            {/* General Expenses - Individual Assignment */}
            <GeneralExpensesSection
              items={workspace.requisition.general_expense_items || []}
              availableBudgetLines={workspace.available_budget_lines}
              onBudgetAssign={(assignment) => handleBudgetAssign('general', assignment)}
            />

            {/* Travel Expenses - Bulk Assignment */}
            <TravelExpensesSection
              items={workspace.requisition.travel_expense_items || []}
              availableBudgetLines={workspace.available_budget_lines}
              onBudgetAssign={(assignment) => handleBudgetAssign('travel', assignment)}
              requisitionId={requisitionId}
              onRefresh={handleRefreshWorkspace}
            />

            {/* Per Diem Expenses - Bulk Assignment */}
            <PerDiemExpensesSection
              items={workspace.requisition.per_diem_expense_items || []}
              availableBudgetLines={workspace.available_budget_lines}
              onBudgetAssign={(assignment) => handleBudgetAssign('perDiem', assignment)}
              requisitionId={requisitionId}
              onRefresh={handleRefreshWorkspace}
            />
          </div>
        </div>
      </div>

      {/* Supporting Documents Section */}
      <SupportingDocumentsDisplay requisition={workspace.requisition} />

      {/* Approval Actions Section */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
        {/* Section Header */}
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Approval Actions
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {allItemsAssigned
              ? 'All items have budgets assigned. You can now approve this requisition.'
              : 'Please assign budgets to all items before approving.'}
          </p>
        </div>

        {/* Comments Field */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Comments <span className="text-gray-400">(Optional)</span>
          </label>
          <textarea
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            rows={4}
            placeholder="Add your comments here..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ems-green-500 focus:border-ems-green-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            Your comments will be visible in the requisition history.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => {
              if (!comments.trim()) {
                toast.error('Please add comments before returning for revision');
                return;
              }

              showReturnConfirmation({
                onConfirm: async () => {
                  await returnMutation.mutateAsync({
                    id: requisitionId,
                    data: { comments: comments.trim() },
                  });
                },
              });
            }}
            disabled={returnMutation.isPending || !comments.trim()}
            className="px-6 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {returnMutation.isPending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Processing...
              </>
            ) : (
              <>
                <span className="text-lg">↩</span>
                Return for Revision
              </>
            )}
          </button>
          
          <button
            type="button"
            onClick={() => {
              if (!allItemsAssigned) {
                toast.error('Please assign budgets to all items before approving');
                return;
              }

              showApprovalConfirmation({
                onConfirm: async () => {
                  // Format budget assignments for API
                  const payload = {
                    comments: comments.trim() || undefined,
                    general_items: budgetAssignments.general.map(item => ({
                      id: item.id,
                      expense_category: item.expense_category,
                      expense_code: item.expense_code,
                      budget_line_item: item.budget_line_item,
                    })),
                    travel_items: budgetAssignments.travel.map(item => ({
                      id: item.id,
                      expense_category: item.expense_category,
                      expense_code: item.expense_code,
                      budget_line_item: item.budget_line_item,
                    })),
                    per_diem_items: budgetAssignments.perDiem.map(item => ({
                      id: item.id,
                      expense_category: item.expense_category,
                      expense_code: item.expense_code,
                      budget_line_item: item.budget_line_item,
                    })),
                  };

                  await approveMutation.mutateAsync({
                    id: requisitionId,
                    data: payload,
                  });
                },
              });
            }}
            disabled={!allItemsAssigned || approveMutation.isPending}
            className={
              allItemsAssigned && !approveMutation.isPending
                ? 'px-6 py-2 bg-ems-green-600 text-white rounded-md hover:bg-ems-green-700 flex items-center gap-2'
                : 'px-6 py-2 bg-gray-300 text-gray-500 rounded-md cursor-not-allowed flex items-center gap-2'
            }
          >
            {approveMutation.isPending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Approving...
              </>
            ) : (
              <>
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Approve
              </>
            )}
          </button>
        </div>
      </div>

      {/* Debug Panel (Development Only) */}
      <div className="bg-gray-100 border border-gray-300 rounded-lg overflow-hidden">
        <button
          type="button"
          onClick={() => setShowDebug(!showDebug)}
          className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-200 transition-colors"
        >
          <span className="text-sm font-semibold text-gray-700">
            🔍 Debug Panel (Development)
          </span>
          <svg
            className={`h-5 w-5 text-gray-600 transition-transform ${showDebug ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {showDebug && (
          <div className="p-4 bg-white border-t border-gray-300">
            <div className="space-y-4">
              {/* Workspace Data */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">
                  Workspace Data:
                </h4>
                <pre className="text-xs text-gray-600 overflow-auto max-h-96 bg-gray-50 p-3 rounded border border-gray-200">
                  {JSON.stringify(workspace, null, 2)}
                </pre>
              </div>

              {/* Budget Assignments State */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">
                  Budget Assignments State:
                </h4>
                <pre className="text-xs text-gray-600 overflow-auto max-h-64 bg-gray-50 p-3 rounded border border-gray-200">
                  {JSON.stringify(budgetAssignments, null, 2)}
                </pre>
              </div>

              {/* Progress Summary */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">
                  Progress Summary:
                </h4>
                <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded border border-gray-200">
                  <p>Total Items: {totalItems}</p>
                  <p>Assigned Items: {assignedItems}</p>
                  <p>All Items Assigned: {allItemsAssigned ? 'Yes ✓' : 'No ✗'}</p>
                  <p className="mt-2">General: {budgetAssignments.general.length} assigned</p>
                  <p>Travel: {budgetAssignments.travel.length} assigned</p>
                  <p>Per Diem: {budgetAssignments.perDiem.length} assigned</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Budget Summary Drawer */}
      <BudgetSummaryDrawer
        isOpen={showBudgetModal}
        onClose={() => setShowBudgetModal(false)}
      />
    </div>
  );
}
