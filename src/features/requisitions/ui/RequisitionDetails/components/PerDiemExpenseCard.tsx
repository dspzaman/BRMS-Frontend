// src/features/requisitions/ui/RequisitionDetails/components/PerDiemExpenseCard.tsx
import type { PerDiemExpenseLineItemResponse } from '../../../api/types';

interface PerDiemExpenseCardProps {
  expense: PerDiemExpenseLineItemResponse;
  index: number;
}

export function PerDiemExpenseCard({ expense }: PerDiemExpenseCardProps) {
  const mealTypeLabels = {
    breakfast: 'Breakfast',
    lunch: 'Lunch',
    dinner: 'Dinner',
    full_day: 'Full Day'
  };

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
    <tr className="border-b border-gray-200 hover:bg-orange-50">
      {/* Program */}
      <td className="px-4 py-3 text-sm text-gray-900">
        {expense.program_name || `Program ${expense.program}`}
      </td>
      
      {/* Meal Date */}
      <td className="px-4 py-3 text-sm text-gray-900">
        {formatDate(expense.meal_date)}
      </td>
      
      {/* Meal Type */}
      <td className="px-4 py-3 text-sm text-gray-900">
        {mealTypeLabels[expense.meal_type]}
      </td>
      
      {/* Description */}
      <td className="px-4 py-3 text-sm text-gray-700">
        {expense.description || '-'}
      </td>
      
      {/* Rate Amount */}
      <td className="px-4 py-3 text-sm text-right text-gray-900">
        ${parseFloat(expense.rate_amount).toFixed(2)}
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
        {expense.budget_line_item_details || '-'}
      </td>
    </tr>
  );
}
