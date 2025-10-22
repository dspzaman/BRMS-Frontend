// src/features/requisitions/ui/sections/TravelExpensesSection.tsx
import { useFormContext, useFieldArray } from "react-hook-form";
import type { RequisitionFormData } from "../../model/types";
import { useAuth } from "@/shared/contexts/AuthContext";
import { TravelExpenseRow } from "../fields/TravelExpenseRow";

export function TravelExpensesSection() {
  const { register, control, watch } = useFormContext<RequisitionFormData>();
  const { user } = useAuth();
  
  // Get user's programs from context
  const programs = user?.programs || [];
  
  // Manage array of travel expenses
  const { fields, append, remove } = useFieldArray({
    control,
    name: "travelExpenses",
  });
  
  // Watch all travel expenses to calculate totals
  const travelExpenses = watch("travelExpenses");
  
  // Add new travel expense row
  const handleAddExpense = () => {
    // Auto-select program if:
    // 1. User has only one program, OR
    // 2. User has a primary program
    let defaultProgram: number | null = null;
    
    if (programs.length > 0) {
      if (programs.length === 1) {
        // Only one program - auto-select it
        defaultProgram = programs[0].program_id;
      } else {
        // Multiple programs - select primary if exists
        const primaryProgram = programs.find(p => p.is_primary);
        if (primaryProgram) {
          defaultProgram = primaryProgram.program_id;
        }
      }
    }
    
    append({
      program: defaultProgram,
      category: null,
      travelDate: "",
      startAddress: "",
      endAddress: "",
      description: "",
      totalKm: "",
      ratePerKm: "0.68", // Default rate
      amount: "",
      gstRate: "0",
      gstAmount: "",
      totalAmount: "",
    });
  };
  
  // Calculate summary totals
  const calculateTotals = () => {
    if (!travelExpenses || travelExpenses.length === 0) {
      return { totalAmount: 0, totalGST: 0, grandTotal: 0 };
    }
    
    const totalAmount = travelExpenses.reduce((sum, expense) => {
      const km = parseFloat(expense.totalKm) || 0;
      const rate = parseFloat(expense.ratePerKm) || 0;
      return sum + (km * rate);
    }, 0);
    
    const totalGST = travelExpenses.reduce((sum, expense) => {
      return sum + (parseFloat(expense.gstRate) || 0);
    }, 0);
    
    const grandTotal = totalAmount + totalGST;
    
    return {
      totalAmount: totalAmount.toFixed(2),
      totalGST: totalGST.toFixed(2),
      grandTotal: grandTotal.toFixed(2),
    };
  };
  
  const { totalAmount, totalGST, grandTotal } = calculateTotals();

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      {/* Section Header */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          Travel Expenses
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Add travel expense items for mileage and transportation
        </p>
      </div>

      {/* Travel Expense Rows */}
      <div className="space-y-4">
        {fields.length === 0 ? (
          // Empty state
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No travel expenses added
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by adding your first travel expense.
            </p>
            <div className="mt-6">
              <button
                type="button"
                onClick={handleAddExpense}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-ems-green-600 hover:bg-ems-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ems-green-500"
              >
                <svg
                  className="-ml-1 mr-2 h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                    clipRule="evenodd"
                  />
                </svg>
                Add First Travel Expense
              </button>
            </div>
          </div>
        ) : (
          // Render travel expense rows
          fields.map((field, index) => (
            <TravelExpenseRow
              key={field.id}
              index={index}
              onRemove={() => remove(index)}
              canRemove={fields.length > 1} // Can't remove if only 1 row
            />
          ))
        )}
      </div>

      {/* Summary Section */}
      {fields.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex justify-between items-start">
            <span className="text-sm text-gray-600">
              Total Travel Items: <span className="font-medium text-gray-900">{fields.length}</span>
            </span>
            
            {/* Financial Summary - Right Aligned */}
            <div className="min-w-[300px]">
              <div className="flex justify-end mb-2">
                <button
                  type="button"
                  onClick={handleAddExpense}
                  className="text-sm text-ems-green-600 hover:text-ems-green-700 font-medium"
                >
                  + Add Another Expense
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
      )}

      {/* Per Diem Checkbox */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <label className="flex items-center space-x-3 cursor-pointer">
          <input
            type="checkbox"
            {...register("includePerDiemExpenses")}
            className="h-4 w-4 text-ems-green-600 focus:ring-ems-green-600 border-gray-300 rounded accent-ems-green-600"
          />
          <div>
            <span className="text-sm font-medium text-gray-900">
              Include Per Diem Expenses
            </span>
            <p className="text-xs text-gray-500 mt-0.5">
              Add meals, accommodations, and other per diem expenses for this travel
            </p>
          </div>
        </label>
      </div>
    </div>
  );
}