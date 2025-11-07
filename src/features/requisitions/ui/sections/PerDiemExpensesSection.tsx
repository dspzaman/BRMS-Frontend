// src/features/requisitions/ui/sections/PerDiemExpensesSection.tsx
import { useFormContext, useFieldArray } from "react-hook-form";
import { useState, useEffect } from "react";
import type { RequisitionFormData } from "../../model/types";
import { ROW_LIMITS, ROW_LIMIT_MESSAGES } from "../../model/constants";
import { useAuth } from "@/shared/contexts/AuthContext";
import { PerDiemExpenseRow } from "../fields/PerDiemExpenseRow";
import { getDefaultProgram } from "../../utils/programUtils";
import { EmptyState } from "../shared/EmptyState";
import { SummaryCard } from "../shared/SummaryCard";

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
  
  // Track the index of the most recently added row for auto-focus
  const [newRowIndex, setNewRowIndex] = useState<number | null>(null);
  
  // Clear newRowIndex after a short delay
  useEffect(() => {
    if (newRowIndex !== null) {
      const timer = setTimeout(() => setNewRowIndex(null), 500);
      return () => clearTimeout(timer);
    }
  }, [newRowIndex]);
  
  // Add new per diem expense row
  const handleAddExpense = () => {
    // Check row limit
    if (fields.length >= ROW_LIMITS.PER_DIEM_EXPENSES) {
      alert(ROW_LIMIT_MESSAGES.PER_DIEM_EXPENSES);
      return;
    }

    const defaultProgram = getDefaultProgram(programs);

    
    append({
      program: defaultProgram,
      category: null,
      expenseCode: null,
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
      gstAmount: "0",      
    totalAmount: "0",    
    });
    
    // Mark the newly added row index for auto-focus
    setNewRowIndex(fields.length);
  };

  // Check if we've reached the row limit
  const isAtRowLimit = fields.length >= ROW_LIMITS.PER_DIEM_EXPENSES;
  
  // Calculate summary totals based on meal selections
  const calculateTotals = () => {
    if (!perDiemExpenses || perDiemExpenses.length === 0) {
      return { totalAmount: '0.00', totalGST: '0.00', grandTotal: '0.00', mealCount: 0 };
    }
    
    let totalAmount = 0;
    let mealCount = 0;
    
    perDiemExpenses.forEach((expense) => {
      // Calculate amount based on selected meals and their rates
      let expenseAmount = 0;
      
      if (expense.includeBreakfast) {
        expenseAmount += parseFloat(expense.breakfastRate || '0');
        mealCount++;
      }
      if (expense.includeLunch) {
        expenseAmount += parseFloat(expense.lunchRate || '0');
        mealCount++;
      }
      if (expense.includeDinner) {
        expenseAmount += parseFloat(expense.dinnerRate || '0');
        mealCount++;
      }
      
      totalAmount += expenseAmount;
    });
    
    // GST is 0% for per diem meals (non-taxable)
    const totalGST = 0;
    const grandTotal = totalAmount + totalGST;
    
    return {
      totalAmount: totalAmount.toFixed(2),
      totalGST: totalGST.toFixed(2),
      grandTotal: grandTotal.toFixed(2),
      mealCount,
    };
  };
  
  const { totalAmount, totalGST, grandTotal, mealCount } = calculateTotals();

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
        {fields.length === 0 ? (
          <EmptyState
            title="No per diem expenses added"
            description="Get started by adding your first per diem expense."
            buttonText="Add First Per Diem Expense"
            onAddClick={handleAddExpense}
            icon="meal"
          />
        ) : (
          // Render per diem expense rows
          fields.map((field, index) => (
            <PerDiemExpenseRow
              key={field.id}
              index={index}
              onRemove={() => remove(index)}
              canRemove={fields.length > 1}
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
          itemLabel="Total Per Diem Items"
          mealCount={mealCount}
          isAddDisabled={isAtRowLimit}
          addButtonTooltip={isAtRowLimit ? ROW_LIMIT_MESSAGES.PER_DIEM_EXPENSES : undefined}
        />
      )}
    </div>
  );
}