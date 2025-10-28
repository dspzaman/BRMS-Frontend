// src/features/requisitions/ui/shared/SummaryCard.tsx

interface SummaryCardProps {
  itemCount: number;
  totalAmount: string;
  totalGST: string;
  grandTotal: string;
  onAddClick: () => void;
  addButtonText?: string;
  itemLabel?: string;
  mealCount?: number; // Optional for Per Diem
}

export function SummaryCard({
  itemCount,
  totalAmount,
  totalGST,
  grandTotal,
  onAddClick,
  addButtonText = "+ Add Another Expense",
  itemLabel = "Total Expense Items",
  mealCount,
}: SummaryCardProps) {
  return (
    <div className="mt-6 pt-6 border-t border-gray-200">
      <div className="flex justify-between items-start">
        <div className="text-sm text-gray-600">
          {itemLabel}: <span className="font-medium text-gray-900">{itemCount}</span>
          {mealCount !== undefined && (
            <span className="ml-4">
              Total Meals: <span className="font-medium text-gray-900">{mealCount}</span>
            </span>
          )}
        </div>
        
        {/* Financial Summary - Right Aligned */}
        <div className="min-w-[300px]">
          <div className="flex justify-end mb-2">
            <button
              type="button"
              onClick={onAddClick}
              className="text-sm text-ems-green-600 hover:text-ems-green-700 font-medium"
            >
              {addButtonText}
            </button>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Total Amount:</span>
              <span className="font-medium text-gray-900">${totalAmount}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Total GST:</span>
              <span className="font-medium text-gray-900">${totalGST}</span>
            </div>
            <div className="flex justify-between items-center text-base pt-2 border-t border-gray-300">
              <span className="font-semibold text-gray-900">Grand Total:</span>
              <span className="font-bold text-ems-green-600 text-lg">${grandTotal}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}