import { useState, useEffect, useMemo } from 'react';
import type {
  GeneralExpenseLineItemResponse,
  TravelExpenseLineItemResponse,
  PerDiemExpenseLineItemResponse,
  BudgetLineItemDetail,
} from '../../api/types';
import { useFormData } from '../../model/useFormData';

type ExpenseItem =
  | GeneralExpenseLineItemResponse
  | TravelExpenseLineItemResponse
  | PerDiemExpenseLineItemResponse;

interface ExpenseItemRowProps {
  item: ExpenseItem;
  availableBudgetLines: BudgetLineItemDetail[];
  onBudgetAssign: (assignment: {
    id: number;
    expense_category: number;
    expense_code: number;
    budget_line_item: number;
  }) => void;
}

export default function ExpenseItemRow({
  item,
  availableBudgetLines,
  onBudgetAssign,
}: ExpenseItemRowProps) {
  // State for editable fields
  const [selectedCategory, setSelectedCategory] = useState<number>(item.expense_category);
  const [selectedExpenseCode, setSelectedExpenseCode] = useState<number>(
    typeof item.expense_code === 'number' 
      ? item.expense_code 
      : item.expense_code?.id || (item.expense_code_details?.id || 0)
  );
  const [selectedBudgetLine, setSelectedBudgetLine] = useState<number | null>(
    item.budget_line_item
  );

  // Fetch categories and expense codes from backend
  const { 
    categories, 
    isLoadingCategories,
    expenseCodeAssignments,
    isLoadingExpenseCodes
  } = useFormData(null, selectedCategory);

  // Get program ID from item
  const programId = item.program;

  // Filter budget lines based on selected category and expense code
  const filteredBudgetLines = availableBudgetLines.filter(
    (bl) =>
      bl.program_id === programId &&
      bl.category_id === selectedCategory &&
      bl.expense_code_id === selectedExpenseCode
  );

  // Check if selected budget line has sufficient funds
  const selectedBudget = filteredBudgetLines.find((bl) => bl.id === selectedBudgetLine);
  const isSufficient = selectedBudget
    ? parseFloat(selectedBudget.remaining_amount) >= parseFloat(item.total_amount)
    : false;

  // Handle budget line selection
  const handleBudgetLineChange = (budgetLineId: number) => {
    setSelectedBudgetLine(budgetLineId);
    onBudgetAssign({
      id: item.id,
      expense_category: selectedCategory,
      expense_code: selectedExpenseCode,
      budget_line_item: budgetLineId,
    });
  };

  // Get expense type label
  const getExpenseTypeLabel = () => {
    if ('travel_date' in item) return 'Travel';
    if ('meal_date' in item) return 'Per Diem';
    return 'General';
  };

  // Check which parent categories have subcategories (memoized)
  const parentCategoriesWithChildren = useMemo(() => {
    return categories
      .filter(c => c.is_main_category)
      .map(parent => ({
        id: parent.id,
        hasChildren: categories.some(c => c.is_subcategory && c.parent_id === parent.id)
      }));
  }, [categories]);

  // Helper function to check if a category should be disabled
  const shouldDisableCategory = (category: typeof categories[0]) => {
    if (!category.is_main_category) return false; // Subcategories are always selectable
    const parentInfo = parentCategoriesWithChildren.find(p => p.id === category.id);
    return parentInfo?.hasChildren || false; // Only disable if it has children
  };

  // Handle category change
  const handleCategoryChange = (categoryId: number) => {
    setSelectedCategory(categoryId);
    // Clear expense code when category changes
    setSelectedExpenseCode(0);
    // Clear budget line
    setSelectedBudgetLine(null);
  };

  // Get expense-specific details
  const getExpenseDetails = () => {
    if ('travel_date' in item) {
      return (
        <div className="text-sm text-gray-600">
          <span className="font-medium">Date:</span> {item.travel_date} |{' '}
          <span className="font-medium">Route:</span> {item.start_address} → {item.end_address} |{' '}
          <span className="font-medium">Distance:</span> {item.total_km} km
        </div>
      );
    }
    if ('meal_date' in item) {
      return (
        <div className="text-sm text-gray-600">
          <span className="font-medium">Date:</span> {item.meal_date} |{' '}
          <span className="font-medium">Meal Type:</span> {item.meal_type}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-sm transition-shadow">
      <div className="grid grid-cols-12 gap-4">
        {/* Left Column - Expense Details */}
        <div className="col-span-5">
          <div className="flex items-start gap-2 mb-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-ems-green-800">
              {getExpenseTypeLabel()}
            </span>
            <span className="text-xs text-gray-500">#{item.id}</span>
          </div>

          <p className="text-sm font-medium text-gray-900 mb-1">{item.description}</p>
          {getExpenseDetails()}

          <div className="mt-2 flex items-center gap-4">
            <div>
              <span className="text-xs text-gray-500">Amount:</span>
              <span className="ml-1 text-sm font-semibold text-gray-900">
                ${item.total_amount}
              </span>
            </div>
            <div>
              <span className="text-xs text-gray-500">Program:</span>
              <span className="ml-1 text-sm font-medium text-gray-700">
                {item.program_name || `Program ${item.program}`}
              </span>
            </div>
          </div>
        </div>

        {/* Middle Column - Category & Expense Code Selection */}
        <div className="col-span-4 space-y-3">
          {/* Category Dropdown */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => handleCategoryChange(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-ems-green-500 focus:border-ems-green-500 focus-visible:ring-ems-green-500 focus-visible:border-ems-green-500 active:border-ems-green-500"
              disabled={isLoadingCategories}
            >
              <option value="">{isLoadingCategories ? 'Loading...' : 'Select category'}</option>
              {categories.map((category) => (
                <option 
                  key={category.id} 
                  value={category.id}
                  disabled={shouldDisableCategory(category)}
                >
                  {category.display_name || category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Expense Code Dropdown */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Expense Code
            </label>
            <select
              value={selectedExpenseCode || ''}
              onChange={(e) => {
                setSelectedExpenseCode(Number(e.target.value));
                // Clear budget line when code changes
                setSelectedBudgetLine(null);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-ems-green-500 focus:border-ems-green-500 focus-visible:ring-ems-green-500 focus-visible:border-ems-green-500 active:border-ems-green-500"
              disabled={!selectedCategory || isLoadingExpenseCodes}
            >
              <option value="">
                {!selectedCategory ? 'Select category first' : isLoadingExpenseCodes ? 'Loading...' : 'Select expense code'}
              </option>
              {/* Show current expense code even if not in loaded list yet */}
              {selectedExpenseCode && item.expense_code_details && 
               !expenseCodeAssignments.some(a => a.id === selectedExpenseCode) && (
                <option value={selectedExpenseCode}>
                  {item.expense_code_details.code} - {item.expense_code_details.description} (Current)
                </option>
              )}
              {expenseCodeAssignments.map((assignment) => (
                <option key={assignment.id} value={assignment.id}>
                  {assignment.code} - {assignment.description}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Right Column - Budget Line Selection */}
        <div className="col-span-3">
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Budget Line
          </label>
          <select
            value={selectedBudgetLine || ''}
            onChange={(e) => handleBudgetLineChange(Number(e.target.value))}
            className={
              selectedBudgetLine && !isSufficient
                ? 'w-full px-3 py-2 border-2 border-red-300 rounded-md text-sm focus:ring-red-500 focus:border-red-500 focus-visible:ring-red-500 focus-visible:border-red-500 active:border-red-500'
                : 'w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-ems-green-500 focus:border-ems-green-500 focus-visible:ring-ems-green-500 focus-visible:border-ems-green-500 active:border-ems-green-500'
            }
          >
            <option value="">Select Budget Line</option>
            {filteredBudgetLines.map((bl) => (
              <option key={bl.id} value={bl.id}>
                {bl.label}
              </option>
            ))}
          </select>

          {/* Budget Status Indicator */}
          {selectedBudgetLine && selectedBudget && (
            <div className="mt-2">
              <div className="text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-500">Remaining:</span>
                  <span className="font-medium text-gray-900">
                    ${selectedBudget.remaining_amount}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Required:</span>
                  <span className="font-medium text-gray-900">${item.total_amount}</span>
                </div>
              </div>
              {isSufficient ? (
                <div className="mt-2 flex items-center gap-1 text-xs text-green-700">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Sufficient funds</span>
                </div>
              ) : (
                <div className="mt-2 flex items-center gap-1 text-xs text-red-700">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Insufficient funds</span>
                </div>
              )}
            </div>
          )}

          {/* No budget lines available warning */}
          {filteredBudgetLines.length === 0 && (
            <div className="mt-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded p-2">
              No budget lines available for this category/code combination
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
