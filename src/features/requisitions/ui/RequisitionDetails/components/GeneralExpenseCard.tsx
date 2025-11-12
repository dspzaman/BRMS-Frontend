// src/features/requisitions/ui/RequisitionDetails/components/GeneralExpenseCard.tsx
import type { GeneralExpenseLineItemResponse } from '../../../api/types';

interface GeneralExpenseCardProps {
  expense: GeneralExpenseLineItemResponse;
  index: number;
}

export function GeneralExpenseCard({ expense, index }: GeneralExpenseCardProps) {
  // Extract expense path and code details from the API response
  const expensePath = (expense as any).expense_path;
  const expenseCodeDetails = (expense as any).expense_code_details;

  return (
    <tr className="border-b border-gray-200 hover:bg-gray-50">
      {/* Program */}
      <td className="px-4 py-3 text-sm text-gray-900">
        {expense.program_name || `Program ${expense.program}`}
      </td>
      
      {/* Category Path (Category > Subcategory) */}
      <td className="px-4 py-3 text-sm text-gray-700">
        {expensePath || '-'}
      </td>
      
      {/* Expense Code (Code - Description) */}
      <td className="px-4 py-3 text-sm text-gray-700">
        {expenseCodeDetails ? `${expenseCodeDetails.code} - ${expenseCodeDetails.description}` : '-'}
      </td>
      
      {/* Description */}
      <td className="px-4 py-3 text-sm text-gray-700">
        {expense.description || '-'}
      </td>
      
      {/* Amount */}
      <td className="px-4 py-3 text-sm text-right text-gray-900">
        ${parseFloat(expense.amount).toFixed(2)}
      </td>
      
      {/* GST */}
      <td className="px-4 py-3 text-sm text-right text-gray-900">
        ${parseFloat(expense.gst_amount).toFixed(2)}
      </td>
      
      {/* Total */}
      <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900">
        ${parseFloat(expense.total_amount).toFixed(2)}
      </td>
      
      {/* Budget Line */}
      <td className="px-4 py-3 text-sm text-gray-700">
        {expense.budget_line_item ? `Budget ${expense.budget_line_item}` : '-'}
      </td>
    </tr>
  );
}
