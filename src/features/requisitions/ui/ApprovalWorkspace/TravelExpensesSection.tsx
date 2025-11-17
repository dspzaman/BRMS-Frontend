import { useState } from 'react';
import toast from 'react-hot-toast';
import { useTravelExpenseTypes } from '../../api/usePerDiemExpenseTypes';
import { updateTravelBudgetAssignment } from '../../api/requisitionApi';
import type {
  TravelExpenseLineItemResponse,
  BudgetLineItemDetail,
  ExpenseItemBudgetAssignment,
} from '../../api/types';

interface TravelExpensesSectionProps {
  items: TravelExpenseLineItemResponse[];
  availableBudgetLines: BudgetLineItemDetail[];
  onBudgetAssign: (assignment: ExpenseItemBudgetAssignment) => void;
  requisitionId: number;
  onRefresh?: () => void;
}

export default function TravelExpensesSection({
  items,
  availableBudgetLines,
  onBudgetAssign,
  requisitionId,
  onRefresh,
}: TravelExpensesSectionProps) {
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [bulkCategory, setBulkCategory] = useState<number | ''>('');
  const [bulkBudgetLine, setBulkBudgetLine] = useState<number | ''>('');
  const [isAssigning, setIsAssigning] = useState(false);
  
  // Fetch travel expense types (categories with code 5798)
  const { data: travelExpenseTypes, isLoading: isLoadingTypes } = useTravelExpenseTypes();

  if (items.length === 0) return null;

  // Toggle individual item selection with program validation
  const toggleItemSelection = (itemId: number) => {
    const item = items.find((i) => i.id === itemId);
    if (!item) return;

    setSelectedItems((prev) => {
      // If deselecting, just remove it
      if (prev.includes(itemId)) {
        const newSelection = prev.filter((id) => id !== itemId);
        // If no items selected, clear category
        if (newSelection.length === 0) {
          setBulkCategory('');
        }
        return newSelection;
      }

      // If selecting, check if it's from a different program than already selected items
      if (prev.length > 0) {
        const firstSelectedItem = items.find((i) => i.id === prev[0]);
        if (firstSelectedItem && firstSelectedItem.program !== item.program) {
          toast.warning('Cannot select travel expenses from different programs. Please select items from the same program only.');
          return prev; // Don't add the item
        }
      }

      // If this is the first item being selected, auto-select its category
      if (prev.length === 0 && item.expense_category) {
        setBulkCategory(item.expense_category);
      }

      // Add the item
      return [...prev, itemId];
    });
  };

  // Toggle all items (only if all items are from the same program)
  const toggleAllItems = () => {
    if (selectedItems.length === items.length) {
      setSelectedItems([]);
      setBulkCategory('');
    } else {
      // Check if all items are from the same program
      const programs = [...new Set(items.map(item => item.program))];
      if (programs.length > 1) {
        toast.warning('Cannot select all items because they are from different programs. Please select items from one program at a time.');
        return;
      }
      // Auto-select category from first item
      if (items.length > 0 && items[0].expense_category) {
        setBulkCategory(items[0].expense_category);
      }
      setSelectedItems(items.map((item) => item.id));
    }
  };

  // Apply bulk assignment to selected items
  const applyBulkAssignment = async () => {
    if (!bulkBudgetLine || selectedItems.length === 0) {
      toast.error('Please select items and a budget line');
      return;
    }

    // Get the expense code ID for travel (5798)
    const travelExpenseCodeId = travelExpenseTypes?.[0]?.expense_code_id;
    if (!travelExpenseCodeId) {
      toast.error('Travel expense code not found');
      return;
    }

    setIsAssigning(true);
    
    try {
      // Update each selected item via API sequentially to avoid SQLite locking
      for (const itemId of selectedItems) {
        const item = items.find((i) => i.id === itemId);
        if (item) {
          await updateTravelBudgetAssignment(
            requisitionId,
            itemId,
            {
              budget_line_item: Number(bulkBudgetLine),
              expense_category: bulkCategory || undefined,
            }
          );
          
          // Update local state for progress tracking
          onBudgetAssign({
            id: itemId,
            expense_category: bulkCategory || item.expense_category,
            expense_code: travelExpenseCodeId,
            budget_line_item: Number(bulkBudgetLine),
          });
        }
      }
      
      toast.success(`Successfully assigned budget to ${selectedItems.length} item(s)`);
      
      // Refresh the workspace data to show updated status
      if (onRefresh) {
        onRefresh();
      }
      
      // Clear selections after assignment
      setSelectedItems([]);
      setBulkBudgetLine('');
      setBulkCategory('');
    } catch (error: any) {
      console.error('Failed to assign budget:', error);
      toast.error(error?.response?.data?.error || 'Failed to assign budget');
    } finally {
      setIsAssigning(false);
    }
  };

  // Get program ID from first selected item (all selected items must have same program)
  const selectedProgramId = selectedItems.length > 0
    ? items.find((item) => item.id === selectedItems[0])?.program
    : null;
  
  // Get the expense code ID for travel (5798)
  const travelExpenseCodeId = travelExpenseTypes?.[0]?.expense_code_id;

  // Filter budget lines based on selections (always filter by travel code 5798)
  const filteredBudgetLines = selectedProgramId
    ? availableBudgetLines.filter(
        (bl) =>
          bl.program_id === selectedProgramId &&
          (!bulkCategory || bl.category_id === bulkCategory) &&
          bl.expense_code_id === travelExpenseCodeId // Always filter by travel code
      )
    : [];

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-900">
          Travel Expenses ({items.length})
        </h3>
        {selectedItems.length > 0 && (
          <span className="text-sm text-ems-green-700 font-medium">
            {selectedItems.length} selected
          </span>
        )}
      </div>

      {/* Bulk Assignment Controls */}
      {selectedItems.length > 0 && (
        <div className="bg-ems-green-50 border-2 border-ems-green-500 rounded-lg p-4 mb-4">
          {/* Program Info */}
          <div className="mb-3 pb-3 border-b border-ems-green-300">
            <span className="text-sm font-medium text-ems-green-900">
              Program: {items.find(i => i.id === selectedItems[0])?.program_name || 'N/A'}
            </span>
            <span className="text-xs text-ems-green-700 ml-2">
              (All selected items must be from the same program)
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Category (Optional)
              </label>
              <select
                value={bulkCategory}
                onChange={(e) => setBulkCategory(e.target.value ? Number(e.target.value) : '')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-ems-green-500 focus:border-ems-green-500"
                disabled={isLoadingTypes}
              >
                <option value="">Select Category</option>
                {travelExpenseTypes?.map((type) => (
                  <option key={type.category_id} value={type.category_id}>
                    {type.parent_category_name ? `${type.parent_category_name} > ` : ''}{type.category_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Budget Line *
              </label>
              <select
                value={bulkBudgetLine}
                onChange={(e) => setBulkBudgetLine(e.target.value ? Number(e.target.value) : '')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-ems-green-500 focus:border-ems-green-500"
              >
                <option value="">Select Budget Line</option>
                {filteredBudgetLines.map((bl) => (
                  <option key={bl.id} value={bl.id}>
                    {bl.label} (${bl.remaining_amount})
                  </option>
                ))}
              </select>
            </div>
            <div className="pt-5">
              <button
                onClick={applyBulkAssignment}
                disabled={!bulkBudgetLine || isAssigning}
                className={
                  bulkBudgetLine && !isAssigning
                    ? 'px-4 py-2 bg-ems-green-600 text-white rounded-md hover:bg-ems-green-700 text-sm font-medium flex items-center gap-2'
                    : 'px-4 py-2 bg-gray-300 text-gray-500 rounded-md cursor-not-allowed text-sm font-medium flex items-center gap-2'
                }
              >
                {isAssigning && (
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {isAssigning ? 'Assigning...' : 'Assign to Selected'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="w-12 px-4 py-3">
                <input
                  type="checkbox"
                  checked={selectedItems.length === items.length}
                  onChange={toggleAllItems}
                  className="h-4 w-4 text-ems-green-600 focus:ring-ems-green-500 border-gray-300 rounded"
                />
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Program
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Date
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Route
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Distance
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Budget Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {items.map((item) => (
              <tr
                key={item.id}
                className={selectedItems.includes(item.id) ? 'bg-green-50' : 'hover:bg-gray-50'}
              >
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(item.id)}
                    onChange={() => toggleItemSelection(item.id)}
                    className="h-4 w-4 text-ems-green-600 focus:ring-ems-green-500 border-gray-300 rounded"
                  />
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  {item.program_name || 'N/A'}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">{item.travel_date}</td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {item.start_address} → {item.end_address}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">{item.total_km} km</td>
                <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                  ${item.total_amount}
                </td>
                <td className="px-4 py-3 text-sm">
                  {item.budget_line_item ? (
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-green-700">
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="text-xs font-medium">Assigned</span>
                      </div>
                      {(() => {
                        const budgetLine = availableBudgetLines.find(bl => bl.id === item.budget_line_item);
                        return budgetLine ? (
                          <div className="text-xs text-gray-600">
                            <div className="font-medium">{budgetLine.label}</div>
                            <div className="text-gray-500">Remaining: ${budgetLine.remaining_amount}</div>
                          </div>
                        ) : (
                          <div className="text-xs text-gray-500">Budget #{item.budget_line_item}</div>
                        );
                      })()}
                    </div>
                  ) : (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                      Not Assigned
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
