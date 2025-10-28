// src/features/requisitions/ui/RequisitionForm.tsx
import { useForm, FormProvider, useWatch } from "react-hook-form";
import { useEffect, useMemo } from "react";
import type { RequisitionFormData } from "../model/types";
import { GeneralExpensesSection } from "./sections/GeneralExpensesSection";
import { TravelExpensesSection } from "./sections/TravelExpensesSection";
import { PerDiemExpensesSection } from "./sections/PerDiemExpensesSection";
import { SupportingDocumentsSection } from "./sections/SupportingDocumentsSection";
import { FinancialSummarySection } from "./sections/FinancialSummarySection";
import { BasicInfoSection } from "./sections/BasicInfoSection";
import {
  validateGeneralExpenses,
  validateTravelExpenses,
  validatePerDiemExpenses,
  validateBasicInfo,
  validateSupportingDocuments,
  runValidations,
} from "../utils/validation";

export default function RequisitionForm() {
 
  
  // Initialize React Hook Form
  const methods = useForm<RequisitionFormData>({
    defaultValues: {
      // Expense type toggles
      includeGeneralExpenses: true, // Default: General expenses shown
      includeTravelExpenses: false,
      includePerDiemExpenses: false,
      includeSupportingDocuments: false, // Default: Documents hidden
      
      // Start with empty arrays - user adds rows as needed
      generalExpenses: [],
      travelExpenses: [],
      perDiemExpenses: [],
      supportingDocuments: [],
      
      // Basic info
      requisitionDate: new Date().toISOString().split("T")[0],
      payeeType: null,
      payeeId: null,
      payeeOther: "",
      
      // Financial Summary (auto-calculated)
      totalAmount: 0,
      gstAmount: 0,
      totalWithTax: 0,
    },
  });

  // Watch all expenses to auto-calculate totals
  const generalExpenses = useWatch({
    control: methods.control,
    name: 'generalExpenses',
    defaultValue: []
  });
  const travelExpenses = useWatch({
    control: methods.control,
    name: 'travelExpenses',
    defaultValue: []
  });
  const perDiemExpenses = useWatch({
    control: methods.control,
    name: 'perDiemExpenses',
    defaultValue: []
  });
  
  // Auto-calculate financial totals whenever expenses change (memoized for performance)
  const financialTotals = useMemo(() => {
    // Get current values from form
    const generalExpensesValue = generalExpenses || [];
    const travelExpensesValue = travelExpenses || [];
    const perDiemExpensesValue = perDiemExpenses || [];
    
    // Calculate General Expenses
    const generalAmount = generalExpensesValue.reduce((sum, exp) => {
      const amount = parseFloat(String(exp.amount || 0));
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0);
    
    const generalGST = generalExpensesValue.reduce((sum, exp) => {
      const gst = parseFloat(String(exp.gstRate || 0));
      return sum + (isNaN(gst) ? 0 : gst);
    }, 0);
    
    // Calculate Travel Expenses
    const travelAmount = travelExpensesValue.reduce((sum, exp) => {
      const km = parseFloat(String(exp.totalKm || 0));
      const rate = parseFloat(String(exp.ratePerKm || 0));
      return sum + (isNaN(km) || isNaN(rate) ? 0 : km * rate);
    }, 0);
    
    const travelGST = travelExpensesValue.reduce((sum, exp) => {
      const gst = parseFloat(String(exp.gstAmount || 0));
      return sum + (isNaN(gst) ? 0 : gst);
    }, 0);
    
    // Calculate Per Diem Expenses
    const perDiemAmount = perDiemExpensesValue.reduce((sum, exp) => {
      let mealTotal = 0;
      
      // Add breakfast if included
      if (exp.includeBreakfast) {
        const breakfastRate = parseFloat(String(exp.breakfastRate || 0));
        mealTotal += isNaN(breakfastRate) ? 0 : breakfastRate;
      }
      
      // Add lunch if included
      if (exp.includeLunch) {
        const lunchRate = parseFloat(String(exp.lunchRate || 0));
        mealTotal += isNaN(lunchRate) ? 0 : lunchRate;
      }
      
      // Add dinner if included
      if (exp.includeDinner) {
        const dinnerRate = parseFloat(String(exp.dinnerRate || 0));
        mealTotal += isNaN(dinnerRate) ? 0 : dinnerRate;
      }
      
      return sum + mealTotal;
    }, 0);
    
    // Per Diem has no GST
    const perDiemGST = 0;
    
    // Calculate Grand Totals
    const totalAmount = generalAmount + travelAmount + perDiemAmount;
    const gstAmount = generalGST + travelGST + perDiemGST;
    const totalWithTax = totalAmount + gstAmount;
    
    return { totalAmount, gstAmount, totalWithTax };
  }, [generalExpenses, travelExpenses, perDiemExpenses]);
  
  // Update form state when totals change
  useEffect(() => {
    methods.setValue('totalAmount', financialTotals.totalAmount);
    methods.setValue('gstAmount', financialTotals.gstAmount);
    methods.setValue('totalWithTax', financialTotals.totalWithTax);
  }, [financialTotals, methods]);

  // Watch expense type checkboxes
  const includeGeneralExpenses = methods.watch("includeGeneralExpenses");
  const includeTravelExpenses = methods.watch("includeTravelExpenses");
  const includePerDiemExpenses = methods.watch("includePerDiemExpenses");
  const includeSupportingDocuments = methods.watch("includeSupportingDocuments");
  
  // Determine if we should show financial summary (multiple expense types selected)
  const showFinancialSummary = (
    (includeGeneralExpenses && includeTravelExpenses) ||
    (includeTravelExpenses && includePerDiemExpenses)
  );

  // Handle save as draft (no validation required)
  const handleSaveAsDraft = async (data: RequisitionFormData) => {
    console.log("Saving as draft:", data);
    // TODO: Call API to save draft
  };

  // Handle submit (with validation)
  const handleSubmit = async () => {
    // First, trigger React Hook Form validation
    const isValid = await methods.trigger();
    
    if (!isValid) {
      alert("Please fix all validation errors before submitting");
      return;
    }
    
    // Get form data
    const data = methods.getValues();
    
    // Run all custom validations
    const validationError = runValidations([
      () => validateGeneralExpenses(includeGeneralExpenses, methods.getValues),
      () => validateTravelExpenses(includeTravelExpenses, methods.getValues),
      () => validatePerDiemExpenses(includePerDiemExpenses, methods.getValues),
      () => validateBasicInfo(methods.getValues),
      () => validateSupportingDocuments(methods.getValues),
    ]);
    
    if (validationError) {
      alert(validationError);
      return;
    }
    
    console.log("Submitting requisition:", data);
    // TODO: Call API to submit
  };

  // Clear expense arrays when unchecking to prevent stale data submission
  useEffect(() => {
    // Clear general expenses if unchecked
    if (!includeGeneralExpenses) {
      methods.setValue("generalExpenses", []);
    }
    
    // Clear travel expenses if unchecked (also clears per diem)
    if (!includeTravelExpenses) {
      methods.setValue("travelExpenses", []);
      methods.setValue("includePerDiemExpenses", false);
      methods.setValue("perDiemExpenses", []);
    }
    
    // Clear per diem expenses if unchecked (but only if travel is still checked)
    if (!includePerDiemExpenses && includeTravelExpenses) {
      methods.setValue("perDiemExpenses", []);
    }
    
    // Clear supporting documents if unchecked
    if (!includeSupportingDocuments) {
      methods.setValue("supportingDocuments", []);
    }
  }, [includeGeneralExpenses, includeTravelExpenses, includePerDiemExpenses, includeSupportingDocuments, methods]);

  // Ensure at least one expense type is selected
  const isOnlyGeneralSelected = includeGeneralExpenses && !includeTravelExpenses;
  const isOnlyTravelSelected = !includeGeneralExpenses && includeTravelExpenses;

  return (
    <FormProvider {...methods}>
      <form className="space-y-8">
        {/* Expense Type Selection */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Select Expense Types
          </h3>
          
          <div className="flex items-center gap-8">
            {/* General Expense Checkbox */}
            <label className={`flex items-center space-x-3 ${isOnlyGeneralSelected ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}>
              <input
                type="checkbox"
                {...methods.register("includeGeneralExpenses")}
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
            <label className={`flex items-center space-x-3 ${isOnlyTravelSelected ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}>
              <input
                type="checkbox"
                {...methods.register("includeTravelExpenses")}
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

        {/* Section 1: General Expenses (conditional) */}
        {includeGeneralExpenses && <GeneralExpensesSection />}

        {/* Section 2: Travel Expenses (conditional) */}
        {includeTravelExpenses && <TravelExpensesSection />}

        {/* Section 3: Per Diem Expenses (conditional - only if travel is checked) */}
        {includeTravelExpenses && includePerDiemExpenses && <PerDiemExpensesSection />}

        {/* Section 4: Financial Summary (only show if multiple expense types) */}
        {showFinancialSummary && <FinancialSummarySection />}

        {/* Section 5: Basic Information */}
        <BasicInfoSection />

        {/* Section 6: Supporting Documents Checkbox */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              {...methods.register("includeSupportingDocuments")}
              className="h-4 w-4 text-ems-green-600 focus:ring-ems-green-600 border-gray-300 rounded accent-ems-green-600"
            />
            <span className="text-sm font-medium text-gray-900">
              Add Supporting Documents
            </span>
            <span className="text-xs text-gray-500">
              (Optional - Attach relevant files)
            </span>
          </label>
        </div>

        {/* Section 7: Supporting Documents (conditional) */}
        {includeSupportingDocuments && <SupportingDocumentsSection />}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 bg-white border border-gray-200 rounded-lg p-6">
          <button
            type="button"
            onClick={methods.handleSubmit(handleSaveAsDraft)}
            className="px-6 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Save as Draft
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-6 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-ems-green-600 hover:bg-ems-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ems-green-500 disabled:opacity-50"
          >
            Submit Requisition
          </button>
        </div>

        {/* Debug: Show form data (remove in production) */}
        <div className="bg-gray-100 border border-gray-300 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">
            Form Data (Debug):
          </h3>
          <pre className="text-xs text-gray-600 overflow-auto max-h-96">
            {JSON.stringify(methods.watch(), null, 2)}
          </pre>
        </div>
      </form>
    </FormProvider>
  );
}