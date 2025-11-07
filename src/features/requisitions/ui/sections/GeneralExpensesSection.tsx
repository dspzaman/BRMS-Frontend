// src/features/requisitions/ui/sections/GeneralExpensesSection.tsx
import { useFormContext, useFieldArray } from "react-hook-form";
import type { RequisitionFormData } from "../../model/types";
import { GeneralExpenseRow } from "../fields/GeneralExpenseRow";
import { useAuth } from "@/shared/contexts/AuthContext";
import { getDefaultProgram } from "../../utils/programUtils";
import { EmptyState } from "../shared/EmptyState";
import { SummaryCard } from "../shared/SummaryCard";
import { useState, useEffect } from "react";
import { ROW_LIMITS, ROW_LIMIT_MESSAGES } from "../../model/constants";

export function GeneralExpensesSection() {
  const { control, watch } = useFormContext<RequisitionFormData>();
  const { user } = useAuth();
  
  // Manage array of general expenses
  const { fields, append, remove } = useFieldArray({
    control,
    name: "generalExpenses",
  });
  
  // Watch all general expenses to calculate totals
  const generalExpenses = watch("generalExpenses");
  
  // Get user's programs from context (has program_id and is_primary)
  const programs = user?.programs || [];

  // Track the index of the most recently added row for auto-focus
  const [newRowIndex, setNewRowIndex] = useState<number | null>(null);
  
  // Clear newRowIndex after a short delay
  useEffect(() => {
    if (newRowIndex !== null) {
      const timer = setTimeout(() => setNewRowIndex(null), 500);
      return () => clearTimeout(timer);
    }
  }, [newRowIndex]);

  // Add new expense row
  const handleAddExpense = () => {
    // Check row limit
    if (fields.length >= ROW_LIMITS.GENERAL_EXPENSES) {
      alert(ROW_LIMIT_MESSAGES.GENERAL_EXPENSES);
      return;
    }

    const defaultProgram = getDefaultProgram(programs);

    
    append({
      program: defaultProgram,
      budget: null,
      category: null,
      expenseCode: null,
      amount: "",
      gstRate: "",
      description: "",
    });
    
    // Mark the newly added row index for auto-focus
    setNewRowIndex(fields.length);
  };

  // Check if we've reached the row limit
  const isAtRowLimit = fields.length >= ROW_LIMITS.GENERAL_EXPENSES;
  
  // Calculate summary totals
  const calculateTotals = () => {
    if (!generalExpenses || generalExpenses.length === 0) {
      return { totalAmount: '0.00', totalGST: '0.00', grandTotal: '0.00' };
    }
    
    const totalAmount = generalExpenses.reduce((sum, expense) => {
      return sum + (parseFloat(expense.amount) || 0);
    }, 0);
    
    const totalGST = generalExpenses.reduce((sum, expense) => {
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            General Expenses
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Add general expense items for this requisition
          </p>
        </div>
        
      </div>

      {/* Expense Rows - Always show (General Expenses is the primary expense type) */}
      <div className="space-y-4">
        {fields.map((field, index) => (
          <GeneralExpenseRow
            key={field.id}
            index={index}
            onRemove={() => remove(index)}
            canRemove={fields.length > 1} // Can't remove if only 1 row
            isNewRow={index === newRowIndex} // Pass flag for newly added row
          />
        ))}
      </div>

      {/* Summary (if expenses exist) */}
      {fields.length > 0 && (
        <SummaryCard
          itemCount={fields.length}
          totalAmount={totalAmount}
          totalGST={totalGST}
          grandTotal={grandTotal}
          onAddClick={handleAddExpense}
          isAddDisabled={isAtRowLimit}
          addButtonTooltip={isAtRowLimit ? ROW_LIMIT_MESSAGES.GENERAL_EXPENSES : undefined}
        />
      )}
    </div>
  );
}