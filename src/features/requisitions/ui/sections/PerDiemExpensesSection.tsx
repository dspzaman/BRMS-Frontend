// src/features/requisitions/ui/sections/PerDiemExpensesSection.tsx
import { useFormContext, useFieldArray } from "react-hook-form";
import type { RequisitionFormData } from "../../model/types";
import { useAuth } from "@/shared/contexts/AuthContext";
import { PerDiemExpenseRow } from "../fields/PerDiemExpenseRow";

export function PerDiemExpensesSection() {
  const { control, watch } = useFormContext<RequisitionFormData>();
  const { user } = useAuth();
  
  // Get user's programs from context
  const programs = user?.programs || [];
  
  // Manage array of per diem expenses
  const { fields, append, remove } = useFieldArray({
    control,
    name: "perDiemExpenses",
  });
  
  // Watch all per diem expenses to calculate totals
  const perDiemExpenses = watch("perDiemExpenses");
  
  // Add new per diem expense row
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
      expenseCodeAssignment: null,
      mealDate: "",
      includeBreakfast: false,
      includeLunch: false,
      includeDinner: false,
      description: "",
      breakfastRate: "28.40",
      lunchRate: "27.40",
      dinnerRate: "57.70",
      amount: "",
      gstRate: "0",
      gstAmount: "",
      totalAmount: "",
    });
  };
  
  // Calculate summary totals
  const calculateTotals = () => {
    if (!perDiemExpenses || perDiemExpenses.length === 0) {
      return { totalAmount: 0, totalGST: 0, grandTotal: 0 };
    }
    
    const totalAmount = perDiemExpenses.reduce((sum, expense) => {
      return sum + (parseFloat(expense.amount) || 0);
    }, 0);
    
    const totalGST = perDiemExpenses.reduce((sum, expense) => {
      return sum + (parseFloat(expense.gstAmount) || 0);
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
          Per Diem Expenses
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Add meal allowances and per diem expenses
        </p>
      </div>

      {/* Per Diem Expense Rows */}
      <div className="space-y-4">
        {!fields.length ? (
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
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No per diem expenses added
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by adding your first per diem expense.
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
                Add First Per Diem Expense
              </button>
            </div>
          </div>
        ) : (
          // Render per diem expense rows
          fields.map((field, index) => (
            <PerDiemExpenseRow
              key={field.id}
              index={index}
              onRemove={() => remove(index)}
              canRemove={fields.length > 1}
            />
          ))
        )}
      </div>

      {/* Summary Section */}
      {fields.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex justify-between items-start">
            <span className="text-sm text-gray-600">
              Total Per Diem Items: <span className="font-medium text-gray-900">{fields.length}</span>
            </span>
            
            {/* Financial Summary - Right Aligned */}
            <div className="min-w-[300px]">
              <div className="flex justify-end mb-2">
                <button
                  type="button"
                  onClick={handleAddExpense}
                  className="text-sm text-ems-green-600 hover:text-ems-green-700 font-medium"
                >
                  + Add Another Per Diem Expense
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
    </div>
  );
}