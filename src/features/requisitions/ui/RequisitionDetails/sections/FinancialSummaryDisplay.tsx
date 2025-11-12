// src/features/requisitions/ui/RequisitionDetails/sections/FinancialSummaryDisplay.tsx
import type { RequisitionResponse } from '../../../api/types';

interface FinancialSummaryDisplayProps {
  requisition: RequisitionResponse;
}

export function FinancialSummaryDisplay({ requisition }: FinancialSummaryDisplayProps) {
  // Format currency
  const formatCurrency = (amount: string | number) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return num.toFixed(2);
  };

  // Calculate GST rate percentage
  const gstRate = requisition.gst_rate ? parseFloat(requisition.gst_rate) : 0;

  return (
    <div className="bg-gradient-to-br from-ems-green-50 to-white border border-ems-green-200 rounded-lg p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">💵 Financial Summary</h3>
      <div className="space-y-2">
        <div className="flex justify-between text-gray-700">
          <span>Subtotal:</span>
          <span className="font-medium">${formatCurrency(requisition.total_amount)}</span>
        </div>
        <div className="flex justify-between text-gray-700">
          <span>GST ({gstRate}%):</span>
          <span className="font-medium">${formatCurrency(requisition.gst_amount)}</span>
        </div>
        <div className="border-t border-gray-300 pt-2 mt-2"></div>
        <div className="flex justify-between text-xl font-bold text-ems-green-700">
          <span>TOTAL:</span>
          <span>${formatCurrency(requisition.total_with_tax)}</span>
        </div>
      </div>
    </div>
  );
}
