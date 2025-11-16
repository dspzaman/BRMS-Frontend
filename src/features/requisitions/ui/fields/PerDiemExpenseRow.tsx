// src/features/requisitions/ui/fields/PerDiemExpenseRow.tsx
import { useFormContext } from "react-hook-form";
import { useEffect, useRef } from "react";
import type { RequisitionFormData } from "../../model/types";
import { useAuth } from "@/shared/contexts/AuthContext";
import { usePerDiemExpenseTypes } from "../../api/usePerDiemExpenseTypes";
import { useMealRates, getRateForDate } from "../../api/useTravelRates";

interface PerDiemExpenseRowProps {
  index: number;
  onRemove: () => void;
  canRemove: boolean;
  isNewRow?: boolean; // Flag to indicate if this is a newly added row
}

export function PerDiemExpenseRow({ index, onRemove, canRemove, isNewRow = false }: PerDiemExpenseRowProps) {
  const { register, watch, setValue, formState: { errors } } = useFormContext<RequisitionFormData>();
  const { user } = useAuth();
  
  // Get programs from user context
  const programs = user?.programs || [];
  
  // Get travel expenses to extract travel dates
  const travelExpenses = watch('travelExpenses') || [];
  
  // Extract unique travel dates from travel expenses (only dates that are filled in)
  const availableTravelDates = travelExpenses
    .filter(expense => expense.travelDate && expense.travelDate.trim() !== '')
    .map(expense => expense.travelDate)
    .filter((date, index, self) => self.indexOf(date) === index) // Remove duplicates
    .sort(); // Sort chronologically
  
  // Fetch per diem expense types (code 5791 with categories)
  const { data: perDiemExpenseTypes, isLoading: isLoadingExpenseTypes } = usePerDiemExpenseTypes();
  
  // Fetch meal rates (breakfast, lunch, dinner)
  const { data: mealRates, isLoading: isLoadingRates } = useMealRates();
  
  // Watch expense code and category to check if already set
  const expenseCode = watch(`perDiemExpenses.${index}.expenseCode`);
  const category = watch(`perDiemExpenses.${index}.category`);
  
  // Ref for meal date input to auto-focus
  const dateRef = useRef<HTMLInputElement>(null);
  
  // Watch meal date to update rates
  const mealDate = watch(`perDiemExpenses.${index}.mealDate`);
  
  // Auto-focus meal date when row is newly added
  useEffect(() => {
    if (isNewRow && dateRef.current) {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        dateRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isNewRow]);
  
  // Get rates for the selected date (or current active rates)
  const breakfastRate = getRateForDate(mealRates?.breakfast, mealDate || new Date().toISOString().split('T')[0]);
  const lunchRate = getRateForDate(mealRates?.lunch, mealDate || new Date().toISOString().split('T')[0]);
  const dinnerRate = getRateForDate(mealRates?.dinner, mealDate || new Date().toISOString().split('T')[0]);
  
  // Auto-select the first (and only) per diem expense type as default (only for new rows)
  useEffect(() => {
    // Only auto-select if BOTH category and expenseCode are empty (new row)
    // This prevents overriding existing values when editing
    if (perDiemExpenseTypes && perDiemExpenseTypes.length > 0 && !expenseCode && !category) {
      // Auto-select the first option - store expense_code_id
      setValue(`perDiemExpenses.${index}.expenseCode`, perDiemExpenseTypes[0].expense_code_id);
      setValue(`perDiemExpenses.${index}.category`, perDiemExpenseTypes[0].category_id);
    }
  }, [perDiemExpenseTypes, expenseCode, category, index, setValue]);
  
  // Handle expense type change - update both expenseCode and category
  const handleExpenseTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCategoryId = parseInt(e.target.value);
    if (selectedCategoryId && perDiemExpenseTypes) {
      const selectedType = perDiemExpenseTypes.find(type => type.category_id === selectedCategoryId);
      if (selectedType) {
        // Store the fixed expense_code_id and the selected category_id
        setValue(`perDiemExpenses.${index}.expenseCode`, selectedType.expense_code_id);
        setValue(`perDiemExpenses.${index}.category`, selectedType.category_id);
      }
    } else {
      setValue(`perDiemExpenses.${index}.expenseCode`, null as any);
      setValue(`perDiemExpenses.${index}.category`, null);
    }
  };
  
  // Update form rates whenever they change (for summary calculation)
  useEffect(() => {
    setValue(`perDiemExpenses.${index}.breakfastRate`, breakfastRate);
    setValue(`perDiemExpenses.${index}.lunchRate`, lunchRate);
    setValue(`perDiemExpenses.${index}.dinnerRate`, dinnerRate);
  }, [breakfastRate, lunchRate, dinnerRate, index, setValue]);
  
  // Watch meal selections to calculate totals
  const includeBreakfast = watch(`perDiemExpenses.${index}.includeBreakfast`);
  const includeLunch = watch(`perDiemExpenses.${index}.includeLunch`);
  const includeDinner = watch(`perDiemExpenses.${index}.includeDinner`);
  
  // Calculate and store amount, gstAmount, and totalAmount
  useEffect(() => {
    let mealTotal = 0;
    
    // Add breakfast if included
    if (includeBreakfast) {
      const breakfast = parseFloat(String(breakfastRate || 0));
      mealTotal += isNaN(breakfast) ? 0 : breakfast;
    }
    
    // Add lunch if included
    if (includeLunch) {
      const lunch = parseFloat(String(lunchRate || 0));
      mealTotal += isNaN(lunch) ? 0 : lunch;
    }
    
    // Add dinner if included
    if (includeDinner) {
      const dinner = parseFloat(String(dinnerRate || 0));
      mealTotal += isNaN(dinner) ? 0 : dinner;
    }
    
    // Per Diem has no GST
    const gstAmount = 0;
    const totalAmount = mealTotal;
    
    // Update form fields
    setValue(`perDiemExpenses.${index}.amount`, mealTotal.toFixed(2));
    setValue(`perDiemExpenses.${index}.gstAmount`, gstAmount.toFixed(2));
    setValue(`perDiemExpenses.${index}.totalAmount`, totalAmount.toFixed(2));
  }, [includeBreakfast, includeLunch, includeDinner, breakfastRate, lunchRate, dinnerRate, index, setValue]);

  return (
    <div className="border border-gray-300 rounded-lg p-4 bg-white shadow-sm">
      {/* Row Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700">
          Per Diem #{index + 1}
        </h3>
        {canRemove && (
          <button 
            type="button" 
            onClick={onRemove}
            className="text-red-600 hover:text-red-800 text-sm font-medium"
          >
            Remove
          </button>
        )}
      </div>
      {/* Hidden field to ensure expenseCode is registered */}
    <input
  type="hidden"
  {...register(`perDiemExpenses.${index}.expenseCode`, {
    valueAsNumber: true,
  })}
/>


      {/* Form Fields */}
      <div className="space-y-3">
        {/* Row 1: Program, Expense Type, and Travel Date (3 columns) */}
        <div className="grid grid-cols-3 gap-3">
          {/* Program */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Program <span className="text-red-500">*</span>
            </label>
            <select 
              {...register(`perDiemExpenses.${index}.program`, {
                required: "Program is required",
                valueAsNumber: true,
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ems-green-500 focus:border-ems-green-500"
            >
              <option value="">Select program</option>
              {programs.map((program) => (
                <option key={program.program_id} value={program.program_id}>
                  {program.program}
                </option>
              ))}
            </select>
            {errors.perDiemExpenses?.[index]?.program && (
              <p className="mt-1 text-xs text-red-600">
                {errors.perDiemExpenses[index]?.program?.message}
              </p>
            )}
          </div>

          {/* Expense Type (Category + Code) */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Expense Type <span className="text-red-500">*</span>
            </label>
            <select 
              {...register(`perDiemExpenses.${index}.category`, {
                required: "Expense type is required",
                valueAsNumber: true,
              })}
              onChange={handleExpenseTypeChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-ems-green-500 focus:border-ems-green-500"
              disabled={isLoadingExpenseTypes}
            >
              <option value="">
                {isLoadingExpenseTypes ? 'Loading...' : 'Select expense type'}
              </option>
              {perDiemExpenseTypes?.map((expenseType) => (
                <option key={expenseType.id} value={expenseType.category_id}>
                  {expenseType.display_name}
                </option>
              ))}
            </select>
            {errors.perDiemExpenses?.[index]?.category && (
              <p className="mt-1 text-xs text-red-600">
                {errors.perDiemExpenses[index]?.category?.message}
              </p>
            )}
          </div>

          {/* Travel Date */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Travel Date <span className="text-red-500">*</span>
            </label>
            <select
              {...register(`perDiemExpenses.${index}.mealDate`, {
                required: "Travel date is required",
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ems-green-500 focus:border-ems-green-500"
            >
              <option value="">Select travel date</option>
              {availableTravelDates.map((date) => {
                // Parse date as local date to avoid timezone shift
                const [year, month, day] = date.split('-').map(Number);
                const localDate = new Date(year, month - 1, day);
                
                return (
                  <option key={date} value={date}>
                    {localDate.toLocaleDateString('en-US', {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </option>
                );
              })}
            </select>
            {errors.perDiemExpenses?.[index]?.mealDate && (
              <p className="mt-1 text-xs text-red-600">
                {errors.perDiemExpenses[index]?.mealDate?.message}
              </p>
            )}
          </div>
        </div>

        {/* Row 2: Meal Type (Inline checkboxes) */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-2">
            Meal Type <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center gap-6 p-3 bg-gray-50 border border-gray-200 rounded-md">
            {/* Breakfast */}
            <label className="flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                {...register(`perDiemExpenses.${index}.includeBreakfast`)}
                id={`breakfast-${index}`}
                className="h-4 w-4 text-ems-green-600 focus:ring-ems-green-600 border-gray-300 rounded accent-ems-green-600"
                disabled={isLoadingRates}
              />
              <span className="ml-2 text-sm text-gray-700">
                Breakfast <span className="font-semibold text-ems-green-700">
                  {isLoadingRates ? '(Loading...)' : `($${breakfastRate})`}
                </span>
              </span>
            </label>

            {/* Lunch */}
            <label className="flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                {...register(`perDiemExpenses.${index}.includeLunch`)}
                id={`lunch-${index}`}
                className="h-4 w-4 text-ems-green-600 focus:ring-ems-green-600 border-gray-300 rounded accent-ems-green-600"
                disabled={isLoadingRates}
              />
              <span className="ml-2 text-sm text-gray-700">
                Lunch <span className="font-semibold text-ems-green-700">
                  {isLoadingRates ? '(Loading...)' : `($${lunchRate})`}
                </span>
              </span>
            </label>

            {/* Dinner */}
            <label className="flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                {...register(`perDiemExpenses.${index}.includeDinner`)}
                id={`dinner-${index}`}
                className="h-4 w-4 text-ems-green-600 focus:ring-ems-green-600 border-gray-300 rounded accent-ems-green-600"
                disabled={isLoadingRates}
              />
              <span className="ml-2 text-sm text-gray-700">
                Dinner <span className="font-semibold text-ems-green-700">
                  {isLoadingRates ? '(Loading...)' : `($${dinnerRate})`}
                </span>
              </span>
            </label>
          </div>
        </div>

        {/* Row 3: Description */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea 
            {...register(`perDiemExpenses.${index}.description`, {
              required: "Description is required",
            })}
            rows={2}
            placeholder="Purpose of per diem claim (e.g., Conference attendance, Training session)"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ems-green-500 focus:border-ems-green-500"
          />
          {errors.perDiemExpenses?.[index]?.description && (
            <p className="mt-1 text-xs text-red-600">
              {errors.perDiemExpenses[index]?.description?.message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}