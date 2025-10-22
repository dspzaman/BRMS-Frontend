// src/features/requisitions/ui/fields/PerDiemExpenseRow.tsx
import { useFormContext } from "react-hook-form";
import type { RequisitionFormData } from "../../model/types";
import { useAuth } from "@/shared/contexts/AuthContext";

interface PerDiemExpenseRowProps {
  index: number;
  onRemove: () => void;
  canRemove: boolean;
}

export function PerDiemExpenseRow({ index, onRemove, canRemove }: PerDiemExpenseRowProps) {
  const { register, watch, formState: { errors } } = useFormContext<RequisitionFormData>();
  const { user } = useAuth();
  
  // Get programs from user context
  const programs = user?.programs || [];

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

      {/* Form Fields */}
      <div className="space-y-3">
        {/* Row 1: Program, Expense Type, and Meal Date (3 columns) */}
        <div className="grid grid-cols-3 gap-3">
          {/* Program */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Program <span className="text-red-500">*</span>
            </label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ems-green-500 focus:border-ems-green-500">
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
            <select className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ems-green-500 focus:border-ems-green-500">
              <option value="">Select expense type</option>
              <option value="1">Admin &gt; Living Expenses - 5791</option>
              <option value="2">Program Delivery &gt; Living Expenses - 5791</option>
            </select>
            {errors.perDiemExpenses?.[index]?.expenseCodeAssignment && (
              <p className="mt-1 text-xs text-red-600">
                {errors.perDiemExpenses[index]?.expenseCodeAssignment?.message}
              </p>
            )}
          </div>

          {/* Meal Date */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Meal Date <span className="text-red-500">*</span>
            </label>
            <input 
              type="date" 
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ems-green-500 focus:border-ems-green-500"
            />
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
                id={`breakfast-${index}`}
                className="h-4 w-4 text-ems-green-600 focus:ring-ems-green-600 border-gray-300 rounded accent-ems-green-600"
              />
              <span className="ml-2 text-sm text-gray-700">
                Breakfast <span className="font-semibold text-ems-green-700">($28.40)</span>
              </span>
            </label>

            {/* Lunch */}
            <label className="flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                id={`lunch-${index}`}
                className="h-4 w-4 text-ems-green-600 focus:ring-ems-green-600 border-gray-300 rounded accent-ems-green-600"
              />
              <span className="ml-2 text-sm text-gray-700">
                Lunch <span className="font-semibold text-ems-green-700">($27.40)</span>
              </span>
            </label>

            {/* Dinner */}
            <label className="flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                id={`dinner-${index}`}
                className="h-4 w-4 text-ems-green-600 focus:ring-ems-green-600 border-gray-300 rounded accent-ems-green-600"
              />
              <span className="ml-2 text-sm text-gray-700">
                Dinner <span className="font-semibold text-ems-green-700">($57.70)</span>
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