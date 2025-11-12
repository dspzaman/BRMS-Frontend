// src/features/requisitions/ui/RequisitionDetails/index.tsx
import type { RequisitionResponse } from '../../api/types';
import { ExpenseLinesDisplay } from './sections/ExpenseLinesDisplay';
import { FinancialSummaryDisplay } from './sections/FinancialSummaryDisplay';
import { StatusHistorySection } from './sections/StatusHistorySection';
import { SupportingDocumentsDisplay } from './sections/SupportingDocumentsDisplay';

interface RequisitionDetailsProps {
  requisition: RequisitionResponse;
}

export function RequisitionDetails({ requisition }: RequisitionDetailsProps) {
  return (
    <div className="space-y-6">
      {/* Expense Lines - Separate sections for General, Travel, Per Diem */}
      <ExpenseLinesDisplay requisition={requisition} />

      {/* Financial Summary */}
      <FinancialSummaryDisplay requisition={requisition} />

      {/* Supporting Documents */}
      <SupportingDocumentsDisplay requisition={requisition} />

      {/* Status History */}
      <StatusHistorySection requisition={requisition} />
    </div>
  );
}
