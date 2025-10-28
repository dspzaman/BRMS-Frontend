// src/features/requisitions/ui/sections/TravelExpensesSection.tsx
import { useFormContext, useFieldArray } from "react-hook-form";
import type { RequisitionFormData } from "../../model/types";
import { useAuth } from "@/shared/contexts/AuthContext";
import { TravelExpenseRow } from "../fields/TravelExpenseRow";
import { getDefaultProgram } from "../../utils/programUtils";
import { EmptyState } from "../shared/EmptyState";
import { SummaryCard } from "../shared/SummaryCard";
import { useState, useEffect } from "react";

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
  
  // Track the index of the most recently added row for auto-focus
  const [newRowIndex, setNewRowIndex] = useState<number | null>(null);
  
  // Clear newRowIndex after a short delay
  useEffect(() => {
    if (newRowIndex !== null) {
      const timer = setTimeout(() => setNewRowIndex(null), 500);
      return () => clearTimeout(timer);
    }
  }, [newRowIndex]);
  
  // Add new travel expense row
  const handleAddExpense = () => {
    const defaultProgram = getDefaultProgram(programs);

    
    append({
      program: defaultProgram,
      category: null,
      expenseCodeAssignment: null,
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
    
    // Mark the newly added row index for auto-focus
    setNewRowIndex(fields.length);
  };
  
  // Calculate summary totals
  const calculateTotals = () => {
    if (!travelExpenses || travelExpenses.length === 0) {
      return { totalAmount: '0.00', totalGST: '0.00', grandTotal: '0.00' };
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
          <EmptyState
            title="No travel expenses added"
            description="Get started by adding your first travel expense."
            buttonText="Add First Travel Expense"
            onAddClick={handleAddExpense}
            icon="travel"
          />
        ) : (
          // Render travel expense rows
          fields.map((field, index) => (
            <TravelExpenseRow
              key={field.id}
              index={index}
              onRemove={() => remove(index)}
              canRemove={fields.length > 1} // Can't remove if only 1 row
              isNewRow={index === newRowIndex} // Pass flag for newly added row
            />
          ))
        )}
      </div>

      {/* Summary Section */}
      {fields.length > 0 && (
        <SummaryCard
          itemCount={fields.length}
          totalAmount={totalAmount}
          totalGST={totalGST}
          grandTotal={grandTotal}
          onAddClick={handleAddExpense}
          itemLabel="Total Travel Items"
        />
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