// src/features/requisitions/ui/RequisitionForm.tsx
import { useForm, FormProvider } from "react-hook-form";
import type { RequisitionFormData } from "../model/types";
import { GeneralExpensesSection } from "./sections/GeneralExpensesSection";
import { useAuth } from "@/shared/contexts/AuthContext";
import { TravelExpensesSection } from "./sections/TravelExpensesSection";
import { PerDiemExpensesSection } from "./sections/PerDiemExpensesSection";
import { SupportingDocumentsSection } from "./sections/SupportingDocumentsSection";
import { BasicInfoSection } from "./sections/BasicInfoSection";

export default function RequisitionForm() {
  const { user } = useAuth();
  
  // Determine default program for initial row
  const getDefaultProgram = () => {
    const programs = user?.programs || [];
    
    if (programs.length === 1) {
      return programs[0].program_id; // Only one program
    } else {
      const primaryProgram = programs.find(p => p.is_primary);
      return primaryProgram ? primaryProgram.program_id : null; // Primary or null
    }
  };
  
  // Initialize React Hook Form
  const methods = useForm<RequisitionFormData>({
    defaultValues: {
      // Expense type toggles
      includeGeneralExpenses: true, // Default: General expenses shown
      includeTravelExpenses: false,
      includePerDiemExpenses: false,
      
      // Start with one general expense row
      generalExpenses: [
        {
          program: getDefaultProgram(),
          budget: null,
          category: null,
          expenseCodeAssignment: null,
          amount: "",
          gstRate: "0",
          description: "",
        },
      ],
      
      // Start with one travel expense row
      travelExpenses: [
        {
          program: getDefaultProgram(),
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
        },
      ],
      
      // Per diem expenses
      perDiemExpenses: [],
      
      // Basic info
      requisitionDate: new Date().toISOString().split("T")[0],
      payeeType: null,
      payeeId: null,
      payeeOther: "",
      
      // Documents
      documents: [],
    },
  });

  // Handle save as draft
  const handleSaveAsDraft = async (data: RequisitionFormData) => {
    console.log("Saving as draft:", data);
    // TODO: Call API to save draft
  };

  // Handle submit
  const handleSubmit = async (data: RequisitionFormData) => {
    console.log("Submitting requisition:", data);
    // TODO: Call API to submit
  };

  // Watch expense type checkboxes
  const includeGeneralExpenses = methods.watch("includeGeneralExpenses");
  const includeTravelExpenses = methods.watch("includeTravelExpenses");
  const includePerDiemExpenses = methods.watch("includePerDiemExpenses");

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

        {/* Section 4: Supporting Documents */}
        <SupportingDocumentsSection />

        {/* Section 5: Basic Information */}
        <BasicInfoSection />

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
            onClick={methods.handleSubmit(handleSubmit)}
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