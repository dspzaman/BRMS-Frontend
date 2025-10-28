// src/features/requisitions/ui/sections/FinancialSummarySection.tsx
import { useFormContext } from "react-hook-form";
import type { RequisitionFormData } from "../../model/types";

export function FinancialSummarySection() {
  const { watch } = useFormContext<RequisitionFormData>();
  
  // Read calculated totals from form state
  const totalAmount = watch('totalAmount') || 0;
  const gstAmount = watch('gstAmount') || 0;
  const totalWithTax = watch('totalWithTax') || 0;
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
      minimumFractionDigits: 2,
    }).format(amount);
  };
  
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      {/* Section Header */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Financial Summary
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Auto-calculated totals from all expense line items
        </p>
      </div>
      
      {/* Summary Display */}
      <div className="bg-ems-green-50 rounded-lg p-6 border-2 border-ems-green-500">
        <div className="grid grid-cols-3 gap-6">
          {/* Total Amount (before GST) */}
          <div>
            <div className="text-xs font-medium text-ems-green-700 uppercase tracking-wide mb-1">
              Total Amount
            </div>
            <div className="text-2xl font-bold text-ems-green-900">
              {formatCurrency(totalAmount)}
            </div>
            <div className="text-xs text-ems-green-600 mt-1">
              Before GST
            </div>
          </div>
          
          {/* GST Amount */}
          <div>
            <div className="text-xs font-medium text-ems-green-700 uppercase tracking-wide mb-1">
              GST Amount
            </div>
            <div className="text-2xl font-bold text-ems-green-900">
              {formatCurrency(gstAmount)}
            </div>
            <div className="text-xs text-ems-green-600 mt-1">
              Tax
            </div>
          </div>
          
          {/* Grand Total */}
          <div>
            <div className="text-xs font-medium text-ems-green-700 uppercase tracking-wide mb-1">
              Grand Total
            </div>
            <div className="text-2xl font-bold text-ems-green-900">
              {formatCurrency(totalWithTax)}
            </div>
            <div className="text-xs text-ems-green-600 mt-1">
              Amount + GST
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}