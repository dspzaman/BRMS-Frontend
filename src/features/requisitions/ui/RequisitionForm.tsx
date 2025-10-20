// src/features/requisitions/ui/RequisitionForm.tsx
import { useForm, FormProvider } from "react-hook-form";
import type { RequisitionFormData } from "../model/types";
import { GeneralExpensesSection } from "./sections/GeneralExpensesSection";
import { useAuth } from "@/shared/contexts/AuthContext";

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
      
      // Travel expenses (we'll add later)
      includeTravelExpenses: false,
      travelExpenses: [],
      
      // Per diem expenses (we'll add later)
      includePerDiemExpenses: false,
      perDiemExpenses: [],
      
      // Basic info (we'll add later)
      requisitionDate: new Date().toISOString().split("T")[0],
      payeeType: null,
      payeeId: null,
      payeeOther: "",
      
      // Documents (we'll add later)
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

  return (
    <FormProvider {...methods}>
      <form className="space-y-8">
        {/* Section 1: General Expenses (Only this for now) */}
        <GeneralExpensesSection />

        {/* Temporary Action Buttons (inline for now) */}
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