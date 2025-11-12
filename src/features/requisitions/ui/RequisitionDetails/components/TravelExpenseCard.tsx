// src/features/requisitions/ui/RequisitionDetails/components/TravelExpenseCard.tsx
import type { TravelExpenseLineItemResponse } from '../../../api/types';

interface TravelExpenseCardProps {
  expense: TravelExpenseLineItemResponse;
  index: number;
}

export function TravelExpenseCard({ expense, index }: TravelExpenseCardProps) {
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  return (
    <tr className="border-b border-gray-200 hover:bg-blue-50">
      {/* Program */}
      <td className="px-4 py-3 text-sm text-gray-900">
        {expense.program_name || `Program ${expense.program}`}
      </td>
      
      {/* Travel Date */}
      <td className="px-4 py-3 text-sm text-gray-900">
        {formatDate(expense.travel_date)}
      </td>
      
      {/* From Address */}
      <td className="px-4 py-3 text-sm text-gray-700">
        {expense.start_address || '-'}
      </td>
      
      {/* To Address */}
      <td className="px-4 py-3 text-sm text-gray-700">
        {expense.end_address || '-'}
      </td>
      
      {/* Distance */}
      <td className="px-4 py-3 text-sm text-right text-gray-900">
        {parseFloat(expense.total_km).toFixed(0)} km
      </td>
      
      {/* Rate */}
      <td className="px-4 py-3 text-sm text-right text-gray-900">
        ${parseFloat(expense.rate_per_km).toFixed(2)}/km
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
      
      {/* Description */}
      <td className="px-4 py-3 text-sm text-gray-700">
        {expense.description || '-'}
      </td>
      
      {/* Budget Line */}
      <td className="px-4 py-3 text-sm text-gray-700">
        {expense.budget_line_item ? `Budget ${expense.budget_line_item}` : '-'}
      </td>
    </tr>
  );
}
