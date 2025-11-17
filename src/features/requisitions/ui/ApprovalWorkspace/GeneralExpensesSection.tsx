import type {
  GeneralExpenseLineItemResponse,
  BudgetLineItemDetail,
  ExpenseItemBudgetAssignment,
} from '../../api/types';
import ExpenseItemRow from './ExpenseItemRow';

interface GeneralExpensesSectionProps {
  items: GeneralExpenseLineItemResponse[];
  availableBudgetLines: BudgetLineItemDetail[];
  onBudgetAssign: (assignment: ExpenseItemBudgetAssignment) => void;
}

export default function GeneralExpensesSection({
  items,
  availableBudgetLines,
  onBudgetAssign,
}: GeneralExpensesSectionProps) {
  if (items.length === 0) return null;

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-3">
        General Expenses ({items.length})
      </h3>
      <div className="space-y-3">
        {items.map((item) => (
          <ExpenseItemRow
            key={item.id}
            item={item}
            availableBudgetLines={availableBudgetLines}
            onBudgetAssign={onBudgetAssign}
          />
        ))}
      </div>
    </div>
  );
}
