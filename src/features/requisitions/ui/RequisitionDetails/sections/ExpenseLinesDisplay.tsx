// src/features/requisitions/ui/RequisitionDetails/sections/ExpenseLinesDisplay.tsx
import type { RequisitionResponse } from '../../../api/types';
import { GeneralExpenseCard } from '../components/GeneralExpenseCard';
import { TravelExpenseCard } from '../components/TravelExpenseCard';
import { PerDiemExpenseCard } from '../components/PerDiemExpenseCard';

interface ExpenseLinesDisplayProps {
  requisition: RequisitionResponse;
}

export function ExpenseLinesDisplay({ requisition }: ExpenseLinesDisplayProps) {
  // Check if we have actual expense items
  const hasGeneralExpenses = requisition.general_expense_items && requisition.general_expense_items.length > 0;
  const hasTravelExpenses = requisition.travel_expense_items && requisition.travel_expense_items.length > 0;
  const hasPerDiemExpenses = requisition.per_diem_expense_items && requisition.per_diem_expense_items.length > 0;

  // Use actual data from requisition
  const generalExpenses = requisition.general_expense_items || [];
  const travelExpenses = requisition.travel_expense_items || [];
  const perDiemExpenses = requisition.per_diem_expense_items || [];

  return (
    <div className="space-y-6">
      {/* General Expenses Section - Table Layout */}
      {hasGeneralExpenses && (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">📝 General Expenses</h3>
            <span className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
              {generalExpenses.length}
            </span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Program
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Expense Code
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    GST
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Budget Line
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {generalExpenses.map((expense, index) => (
                  <GeneralExpenseCard 
                    key={expense.id} 
                    expense={expense} 
                    index={index} 
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Travel Expenses Section - Table Layout */}
      {hasTravelExpenses && (
        <div className="bg-white border border-blue-200 rounded-lg shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 px-6 py-4 bg-blue-50 border-b border-blue-200">
            <h3 className="text-lg font-semibold text-gray-900">🚗 Travel Expenses</h3>
            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
              {travelExpenses.length}
            </span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-blue-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Program
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    From
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    To
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Distance
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rate
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    GST
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Budget Line
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {travelExpenses.map((expense, index) => (
                  <TravelExpenseCard 
                    key={expense.id} 
                    expense={expense} 
                    index={index} 
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Per Diem Expenses Section - Table Layout */}
      {hasPerDiemExpenses && (
        <div className="bg-white border border-orange-200 rounded-lg shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 px-6 py-4 bg-orange-50 border-b border-orange-200">
            <h3 className="text-lg font-semibold text-gray-900">🍽️ Per Diem Expenses</h3>
            <span className="px-2 py-1 bg-orange-100 text-orange-700 text-sm rounded-full">
              {perDiemExpenses.length}
            </span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-orange-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Program
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Meal Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rate
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    GST
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Budget Line
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {perDiemExpenses.map((expense, index) => (
                  <PerDiemExpenseCard 
                    key={expense.id} 
                    expense={expense} 
                    index={index} 
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State - No Expenses */}
      {!hasGeneralExpenses && !hasTravelExpenses && !hasPerDiemExpenses && (
        <div className="bg-white border border-gray-200 rounded-lg p-8 shadow-sm text-center">
          <div className="text-gray-400 text-5xl mb-3">📋</div>
          <p className="text-gray-600 font-medium">No Expense Items</p>
          <p className="text-sm text-gray-500 mt-1">This requisition has no expense line items.</p>
        </div>
      )}
    </div>
  );
}
