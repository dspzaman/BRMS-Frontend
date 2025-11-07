// src/features/requisitions/ui/fields/GeneralExpenseRow.tsx
import { useMemo, useRef, useEffect } from "react";
import { useFormContext } from "react-hook-form";
import type { RequisitionFormData } from "../../model/types";
import { useFormData } from "../../model/useFormData";
import { useAuth } from "@/shared/contexts/AuthContext";

interface GeneralExpenseRowProps {
  index: number;
  onRemove: () => void;
  canRemove: boolean;
  isNewRow?: boolean; // Flag to indicate if this is a newly added row
}

export function GeneralExpenseRow({ index, onRemove, canRemove, isNewRow = false }: GeneralExpenseRowProps) {
  const { register, watch, setValue, formState: { errors } } = useFormContext<RequisitionFormData>();
  const { user } = useAuth();
  
  // Ref for category dropdown to auto-focus
  const categoryRef = useRef<HTMLSelectElement>(null);
  
  // Watch the selected category to filter expense codes
  const selectedCategory = watch(`generalExpenses.${index}.category`);
  const selectedProgram = watch(`generalExpenses.${index}.program`);
  
  // Track previous category to detect manual changes
  const prevCategory = useRef(selectedCategory);
  
  // Auto-focus category dropdown when row is added and program is already selected
  useEffect(() => {
    if (isNewRow && categoryRef.current) {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        categoryRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isNewRow]);
  
  // Clear expense code when category changes (but not on initial load)
  useEffect(() => {
    if (prevCategory.current !== undefined && prevCategory.current !== selectedCategory) {
      setValue(`generalExpenses.${index}.expenseCode`, null);
    }
    prevCategory.current = selectedCategory;
  }, [selectedCategory, setValue, index]);
  
  // Get programs from user context
  const programs = user?.programs || [];
  
  // Fetch categories and expense codes from backend
  const { 
    categories, 
    isLoadingCategories,
    expenseCodeAssignments,
    isLoadingExpenseCodes
  } = useFormData(null, selectedCategory);

  // Watch amount and GST to calculate total
  const amount = watch(`generalExpenses.${index}.amount`);
  const gst = watch(`generalExpenses.${index}.gstRate`);
  
  // Calculate total: amount + GST (memoized)
  const totalAmount = useMemo(() => {
    const amountNum = parseFloat(amount) || 0;
    const gstNum = parseFloat(gst) || 0;
    return (amountNum + gstNum).toFixed(2);
  }, [amount, gst]);

  // Check which parent categories have subcategories (memoized)
  const parentCategoriesWithChildren = useMemo(() => {
    return categories
      .filter(c => c.is_main_category)
      .map(parent => ({
        id: parent.id,
        hasChildren: categories.some(c => c.is_subcategory && c.parent_id === parent.id)
      }));
  }, [categories]);

  // Helper function to check if a category should be disabled
  const shouldDisableCategory = (category: typeof categories[0]) => {
    if (!category.is_main_category) return false; // Subcategories are always selectable
    const parentInfo = parentCategoriesWithChildren.find(p => p.id === category.id);
    return parentInfo?.hasChildren || false; // Only disable if it has children
  };
  const gstValuePh = watch(`generalExpenses.${index}.gstRate`);

  return (
    <div className="grid grid-cols-[1fr_1fr_1fr_2fr_1fr_1fr_1fr_100px] gap-3 px-3 py-2 border-b border-gray-200">
      {/* Program */}
      <div>
        <select 
          {...register(`generalExpenses.${index}.program`, {
            required: "Program is required",
            valueAsNumber: true,
          })}
          className="w-full px-4 py-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-ems-green-500 focus:border-ems-green-500"
        >
          <option value="">Select program</option>
          {programs.map((prog, idx) => (
            <option key={idx} value={prog.program_id}>
              {prog.program}
            </option>
          ))}
        </select>
        {errors.generalExpenses?.[index]?.program && (
          <p className="mt-1 text-xs text-red-600">
            {errors.generalExpenses[index]?.program?.message}
          </p>
        )}
      </div>

      {/* Category */}
      <div>
        <select 
          {...register(`generalExpenses.${index}.category`, {
            required: "Category is required",
            valueAsNumber: true,
          })}
          value={selectedCategory || ""}
          onChange={(e) => {
            const value = e.target.value === "" ? null : parseInt(e.target.value, 10);
            setValue(`generalExpenses.${index}.category`, value);
          }}
          ref={categoryRef}
          className="w-full px-4 py-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-ems-green-500 focus:border-ems-green-500"
          disabled={isLoadingCategories}
        >
          <option value="">{isLoadingCategories ? "Loading..." : "Select category"}</option>
          {categories.map((category) => (
            <option 
              key={category.id} 
              value={category.id}
              disabled={shouldDisableCategory(category)}
            >
              {category.display_name || category.name}
            </option>
          ))}
        </select>
        {errors.generalExpenses?.[index]?.category && (
          <p className="mt-1 text-xs text-red-600">
            {errors.generalExpenses[index]?.category?.message}
          </p>
        )}
      </div>

      {/* Expense Code */}
      <div>
        <select 
          {...register(`generalExpenses.${index}.expenseCode`, {
            required: "Expense code is required",
            valueAsNumber: true,
          })}
          value={watch(`generalExpenses.${index}.expenseCode`) || ""}
          onChange={(e) => {
            const value = e.target.value === "" ? null : parseInt(e.target.value, 10);
            setValue(`generalExpenses.${index}.expenseCode`, value);
          }}
          className="w-full px-4 py-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-ems-green-500 focus:border-ems-green-500"
          disabled={!selectedCategory || isLoadingExpenseCodes}
        >
          <option value="">
            {!selectedCategory 
              ? "Select category first" 
              : isLoadingExpenseCodes 
              ? "Loading..." 
              : "Select expense code"}
          </option>
          {expenseCodeAssignments.map((expenseCode) => (
            <option key={expenseCode.id} value={expenseCode.id}>
              {expenseCode.code} - {expenseCode.description}
            </option>
          ))}
        </select>
        {errors.generalExpenses?.[index]?.expenseCode && (
          <p className="mt-1 text-xs text-red-600">
            {errors.generalExpenses[index]?.expenseCode?.message}
          </p>
        )}
      </div>

      {/* Description */}
      <div>
        <input
          type="text"
          {...register(`generalExpenses.${index}.description`, {
            required: "Description is required",
          })}
          className="w-full px-4 py-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-ems-green-500 focus:border-ems-green-500"
          placeholder="Enter description"
        />
        {errors.generalExpenses?.[index]?.description && (
          <p className="mt-1 text-xs text-red-600">
            {errors.generalExpenses[index]?.description?.message}
          </p>
        )}
      </div>

      {/* Amount */}
      <div>
        <input
          type="number"
          step="0.01"
          {...register(`generalExpenses.${index}.amount`, {
            required: "Amount is required",
            min: { value: 0.01, message: "Amount must be greater than 0" },
          })}
          className="w-full px-4 py-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-ems-green-500 focus:border-ems-green-500"
          placeholder="Amount"
        />
        {errors.generalExpenses?.[index]?.amount && (
          <p className="mt-1 text-xs text-red-600">
            {errors.generalExpenses[index]?.amount?.message}
          </p>
        )}
      </div>

      {/* GST */}
      <div>
        <input
          type="text"
          {...register(`generalExpenses.${index}.gstRate`, {
            pattern: {
              value: /^\d*\.?\d*$/,
              message: "GST must be a valid number"
            },
            validate: (value) => {
              if (!value || value === '') return true; // Optional field
              const num = parseFloat(value);
              if (isNaN(num)) return "GST must be a valid number";
              if (num < 0) return "GST cannot be negative";
              return true;
            }
          })}
          className="w-full px-4 py-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-ems-green-500 focus:border-ems-green-500"
          placeholder="GST"
          inputMode="decimal"
        />
        {errors.generalExpenses?.[index]?.gstRate && (
          <p className="mt-1 text-xs text-red-600">
            {errors.generalExpenses[index]?.gstRate?.message}
          </p>
        )}
      </div>

      {/* Total */}
      <div>
        <input
          type="text"
          value={totalAmount}
          className="w-full px-4 py-3 border border-gray-300 rounded-md text-sm bg-gray-50 focus:outline-none font-semibold text-gray-900"
          placeholder="0.00"
          readOnly
        />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-center">
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="text-red-600 hover:text-red-800 focus:outline-none"
            title="Remove expense"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}