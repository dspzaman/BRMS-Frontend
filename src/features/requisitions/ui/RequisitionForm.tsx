import { FormProvider } from 'react-hook-form';
import type { RequisitionFormData } from '../model/types';
import { useRequisitionForm } from '../hooks/useRequisitionForm';
import { ExpenseTypeSelector } from './components/ExpenseTypeSelector';
import { RequisitionFormActions } from './components/RequisitionFormActions';
import { GeneralExpensesSection } from './sections/GeneralExpensesSection';
import { TravelExpensesSection } from './sections/TravelExpensesSection';
import { PerDiemExpensesSection } from './sections/PerDiemExpensesSection';
import { SupportingDocumentsSection } from './sections/SupportingDocumentsSection';
import { FinancialSummarySection } from './sections/FinancialSummarySection';
import { BasicInfoSection } from './sections/BasicInfoSection';

interface RequisitionFormProps {
  mode?: 'create' | 'edit';
  requisitionId?: number;
  initialData?: RequisitionFormData;
  onSuccess?: () => void;
}

export default function RequisitionForm({
  mode = 'create',
  requisitionId,
  initialData,
  onSuccess,
}: RequisitionFormProps) {
  const formState = useRequisitionForm({
    mode,
    requisitionId,
    initialData,
    onSuccess,
  });


  return (
    <FormProvider {...formState.methods}>
      <form className="space-y-8">
        {/* Expense Type Selection */}
        <ExpenseTypeSelector
          isOnlyGeneralSelected={formState.isOnlyGeneralSelected}
          isOnlyTravelSelected={formState.isOnlyTravelSelected}
        />

        {/* Section 1: General Expenses (conditional) */}
        {formState.includeGeneralExpenses && <GeneralExpensesSection />}

        {/* Section 2: Travel Expenses (conditional) */}
        {formState.includeTravelExpenses && <TravelExpensesSection />}

        {/* Section 3: Per Diem Expenses (conditional - only if travel is checked) */}
        {formState.includeTravelExpenses && formState.includePerDiemExpenses && (
          <PerDiemExpensesSection />
        )}

        {/* Section 4: Financial Summary (only show if multiple expense types) */}
        {formState.showFinancialSummary && <FinancialSummarySection />}

        {/* Section 5: Basic Information */}
        <BasicInfoSection />

        {/* Section 6: Supporting Documents Checkbox */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              {...formState.methods.register('includeSupportingDocuments')}
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
        {formState.includeSupportingDocuments && <SupportingDocumentsSection />}

        {/* Section 8: Comments (Optional - for Submit/Forward actions) */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Comments</h3>
          <p className="text-sm text-gray-600 mb-4">
            Add optional comments for this requisition. Comments will be included when you submit or forward the requisition.
          </p>
          <textarea
            {...formState.methods.register('comments')}
            placeholder="Add any relevant notes or comments..."
            rows={4}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ems-green-500 focus:border-ems-green-500"
          />
        </div>

        {/* Action Buttons */}
        <RequisitionFormActions
          mode={mode}
          onSave={formState.handleSaveAsDraft}
          onSubmit={formState.handleSubmit}
          onForward={formState.handleForward}
          isSaving={formState.isSaving}
        />

        {/* Debug: Show form data (remove in production) */}
        <div className="bg-gray-100 border border-gray-300 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">
            Form Data (Debug):
          </h3>
          <pre className="text-xs text-gray-600 overflow-auto max-h-96">
            {JSON.stringify(formState.methods.watch(), null, 2)}
          </pre>
        </div>
      </form>
    </FormProvider>
  );
}