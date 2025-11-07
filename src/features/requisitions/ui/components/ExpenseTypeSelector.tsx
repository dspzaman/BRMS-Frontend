import { useFormContext } from 'react-hook-form';
import type { RequisitionFormData } from '../../model/types';

interface ExpenseTypeSelectorProps {
  isOnlyGeneralSelected: boolean;
  isOnlyTravelSelected: boolean;
}

export function ExpenseTypeSelector({
  isOnlyGeneralSelected,
  isOnlyTravelSelected,
}: ExpenseTypeSelectorProps) {
  const { register } = useFormContext<RequisitionFormData>();

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Select Expense Types
      </h3>
      
      <div className="flex items-center gap-8">
        {/* General Expense Checkbox */}
        <label
          className={`flex items-center space-x-3 ${
            isOnlyGeneralSelected ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
          }`}
        >
          <input
            type="checkbox"
            {...register('includeGeneralExpenses')}
            disabled={isOnlyGeneralSelected}
            className="h-4 w-4 text-ems-green-600 focus:ring-ems-green-600 border-gray-300 rounded accent-ems-green-600 disabled:cursor-not-allowed"
          />
          <span className="text-sm font-medium text-gray-900">
            General Expenses
          </span>
          <span className="text-xs text-gray-500">
            (Office supplies, utilities, services, etc.)
          </span>
        </label>

        {/* Travel Expense Checkbox */}
        <label
          className={`flex items-center space-x-3 ${
            isOnlyTravelSelected ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
          }`}
        >
          <input
            type="checkbox"
            {...register('includeTravelExpenses')}
            disabled={isOnlyTravelSelected}
            className="h-4 w-4 text-ems-green-600 focus:ring-ems-green-600 border-gray-300 rounded accent-ems-green-600 disabled:cursor-not-allowed"
          />
          <span className="text-sm font-medium text-gray-900">
            Travel Expenses
          </span>
          <span className="text-xs text-gray-500">
            (Mileage, transportation costs)
          </span>
        </label>
      </div>
    </div>
  );
}