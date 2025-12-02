import { useState, useEffect } from 'react';
import { useAuth } from '@/shared/contexts/AuthContext';
import { apiClient } from '@/shared/api/client';
import { Footer } from '@/layouts/footer';

interface ExpenseCodeSummary {
  id: number;
  code: string;
  description: string;
  allocated: number;
  spent: number;
  remaining: number;
}

interface BudgetLineTransaction {
  id: number;
  budget_line_item: number;
  amount: number | string;
  status: string;
  reserved_at: string | null;
  confirmed_at: string | null;
  requisition_id: number;
  requisition_number: string;
  requisition_total_amount: number | string;
  expense_code: string;
  expense_type: string;
}

interface SubcategorySummary {
  name: string | null;
  allocated: number;
  spent: number;
  remaining: number;
  expense_codes: ExpenseCodeSummary[];
}

interface CategorySummary {
  name: string;
  allocated: number;
  spent: number;
  remaining: number;
  subcategories: SubcategorySummary[];
}

interface BudgetSummary {
  id: number;
  fiscal_year_label: string;
  funder_name: string;
  grant_name: string;
  total_awarded_amount: number;
  total_allocated: number;
  total_spent: number;
  total_remaining: number;
  categories: CategorySummary[];
}

interface ProgramBudgetData {
  program_id: number;
  program_name: string;
  budgets: BudgetSummary[];
}

export default function ProgramBudget() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [programBudgets, setProgramBudgets] = useState<ProgramBudgetData[]>([]);
  const [expandedBudgets, setExpandedBudgets] = useState<Set<number>>(new Set());
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [expandedSubcategories, setExpandedSubcategories] = useState<Set<string>>(new Set());

  // Drawer state for expense code details
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedExpenseCode, setSelectedExpenseCode] = useState<ExpenseCodeSummary | null>(null);
  const [transactions, setTransactions] = useState<BudgetLineTransaction[]>([]);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [transactionsError, setTransactionsError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.programs) {
      fetchBudgetSummaries();
    }
  }, [user]);

  const fetchBudgetSummaries = async () => {
    if (!user?.programs) return;

    setLoading(true);
    try {
      const budgetPromises = user.programs.map(async (prog) => {
        try {
          // Fetch budget summary for each program
          const response = await apiClient.get<{ budgets: BudgetSummary[] }>(
            `/api/budget/programs/${prog.program_id}/budget-summary/`
          );
          return {
            program_id: prog.program_id,
            program_name: prog.program,
            budgets: response.data.budgets || [],
          };
        } catch (error) {
          console.error(`Failed to fetch budget for program ${prog.program}:`, error);
          return {
            program_id: prog.program_id,
            program_name: prog.program,
            budgets: [],
          };
        }
      });

      const results = await Promise.all(budgetPromises);
      setProgramBudgets(results.filter((r) => r.budgets.length > 0));
    } catch (error) {
      console.error('Failed to fetch budget summaries:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleBudget = (budgetId: number) => {
    setExpandedBudgets((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(budgetId)) {
        newSet.delete(budgetId);
      } else {
        newSet.add(budgetId);
      }
      return newSet;
    });
  };

  const toggleCategory = (key: string) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  };

  const toggleSubcategory = (key: string) => {
    setExpandedSubcategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  };

  const formatCurrency = (amount: number | string) => {
    const num = typeof amount === 'number' ? amount : Number(amount || 0);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(num);
  };

  const getUtilizationColor = (spent: number, allocated: number) => {
    if (allocated === 0) return 'text-gray-500';
    const percentage = (spent / allocated) * 100;
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 75) return 'text-yellow-600';
    return 'text-ems-green-700';
  };

  const handleViewExpenseCode = async (code: ExpenseCodeSummary) => {
    setSelectedExpenseCode(code);
    setIsDrawerOpen(true);

    setTransactions([]);
    setTransactionsError(null);
    setTransactionsLoading(true);

    try {
      const response = await apiClient.get<BudgetLineTransaction[]>(
        `/api/requisition-management/requisitions/budget-lines/${code.id}/transactions/`,
        { params: { limit: 5 } }
      );
      setTransactions(response.data);
    } catch (error) {
      console.error('Failed to load budget line transactions', error);
      setTransactionsError('Unable to load recent transactions for this budget line.');
    } finally {
      setTransactionsLoading(false);
    }
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedExpenseCode(null);
    setTransactions([]);
    setTransactionsError(null);
    setTransactionsLoading(false);
  };

  return (
    <main className="flex-1 bg-white">
      <div className="p-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">PROGRAM BUDGET</h1>
          <p className="text-gray-600 mt-2">
            View all available budgets for your programs
          </p>
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ems-green-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading budget summaries...</p>
            </div>
          </div>
        ) : programBudgets.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
            <svg
              className="h-16 w-16 text-gray-400 mx-auto mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p className="text-gray-600">No active budgets found for your programs</p>
          </div>
        ) : (
          <div className="space-y-6">
            {programBudgets.map((programData) => (
              <div
                key={programData.program_id}
                className="border border-gray-200 rounded-lg overflow-hidden shadow-sm"
              >
                {/* Program Header */}
                <div className="bg-ems-green-50 px-6 py-4 border-b border-ems-green-200">
                  <h3 className="text-xl font-semibold text-ems-green-700">
                    {programData.program_name}
                  </h3>
                  <p className="text-sm text-ems-green-600 mt-1">
                    {programData.budgets.length} Active Budget
                    {programData.budgets.length !== 1 ? 's' : ''}
                  </p>
                </div>

                {/* Budgets */}
                <div className="divide-y divide-gray-300">
                  {programData.budgets.map((budget) => {
                    const budgetKey = `${programData.program_id}-${budget.id}`;
                    return (
                      <div
                        key={budgetKey}
                        className="bg-white border-l-4 border-ems-green-600"
                      >
                        {/* Budget Header */}
                        <button
                          onClick={() => toggleBudget(budget.id)}
                          className="w-full px-6 py-5 flex items-center justify-between hover:bg-gray-50 transition-all"
                        >
                          <div className="flex-1 text-left">
                            <div className="flex items-center gap-3">
                              <svg
                                className="h-5 w-5 text-ems-green-600"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                              </svg>
                              <h4 className="font-semibold text-ems-green-900 text-lg">
                                {budget.funder_name} - {budget.fiscal_year_label}
                              </h4>
                              <span className="px-2 py-0.5 text-xs font-medium bg-gray-200 text-gray-600 rounded-full">
                                {budget.grant_name}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 mt-2 text-sm ml-8">
                              <span className="text-gray-700">
                                Total:{' '}
                                <span className="font-semibold text-gray-900">
                                  {formatCurrency(budget.total_allocated)}
                                </span>
                              </span>
                              <span className="text-gray-400">|</span>
                              <span
                                className={getUtilizationColor(
                                  budget.total_spent,
                                  budget.total_allocated
                                )}
                              >
                                Spent:{' '}
                                <span className="font-semibold">
                                  {formatCurrency(budget.total_spent)}
                                </span>
                              </span>
                              <span className="text-gray-400">|</span>
                              <span className="text-ems-green-700">
                                Remaining:{' '}
                                <span className="font-semibold">
                                  {formatCurrency(budget.total_remaining)}
                                </span>
                              </span>
                            </div>
                          </div>
                          <svg
                            className={`h-5 w-5 text-ems-green-600 transition-transform ${
                              expandedBudgets.has(budget.id) ? 'rotate-180' : ''
                            }`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </button>

                        {/* Budget Details (Main Categories) */}
                        {expandedBudgets.has(budget.id) && (
                          <div className="px-6 pb-5 bg-white">
                            <div className="space-y-2 pt-2">
                              {budget.categories.map((category, catIndex) => {
                                const categoryKey = `${budget.id}-cat-${catIndex}`;
                                return (
                                  <div
                                    key={categoryKey}
                                    className="border-2 border-gray-300 rounded-lg bg-gradient-to-r from-gray-50 to-gray-100 shadow-sm"
                                  >
                                    {/* Main Category Header */}
                                    <button
                                      onClick={() => toggleCategory(categoryKey)}
                                      className="w-full px-4 py-3 flex items-center justify-between hover:from-gray-100 hover:to-gray-200 transition-all"
                                    >
                                      <div className="flex-1 text-left">
                                        <div className="font-semibold text-gray-900 text-sm flex items-center gap-2">
                                          <span className="w-1.5 h-1.5 bg-gray-600 rounded-full"></span>
                                          {category.name}
                                        </div>
                                        <div className="flex items-center gap-3 mt-1 text-xs">
                                          <span className="text-gray-600">
                                            Total:{' '}
                                            {formatCurrency(category.allocated)}
                                          </span>
                                          <span
                                            className={getUtilizationColor(
                                              category.spent,
                                              category.allocated
                                            )}
                                          >
                                            Spent:{' '}
                                            {formatCurrency(category.spent)}
                                          </span>
                                          <span className="text-green-700">
                                            Remaining:{' '}
                                            {formatCurrency(category.remaining)}
                                          </span>
                                        </div>
                                      </div>
                                      <svg
                                        className={`h-4 w-4 text-gray-400 transition-transform ${
                                          expandedCategories.has(categoryKey)
                                            ? 'rotate-180'
                                            : ''
                                        }`}
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M19 9l-7 7-7-7"
                                        />
                                      </svg>
                                    </button>

                                    {/* Subcategories */}
                                    {expandedCategories.has(categoryKey) && (
                                      <div className="px-4 pb-3 space-y-2 bg-white">
                                        {category.subcategories.map(
                                          (subcategory, subIndex) => {
                                            const subcategoryKey = `${categoryKey}-sub-${subIndex}`;

                                            // If subcategory.name is null, it's direct codes under main category
                                            if (subcategory.name === null) {
                                              return (
                                                <div
                                                  key={subcategoryKey}
                                                  className="space-y-1"
                                                >
                                                  {subcategory.expense_codes.map(
                                                    (code, codeIndex) => (
                                                      <div
                                                        key={codeIndex}
                                                        className="flex items-center py-2 px-3 bg-gray-50 rounded text-xs border border-gray-100"
                                                      >
                                                        <div
                                                          className="font-medium text-gray-900"
                                                          style={{
                                                            width: '400px',
                                                          }}
                                                        >
                                                          {code.code} -{' '}
                                                          {code.description}
                                                        </div>
                                                        <div className="flex items-center gap-3 ml-4">
                                                          <span className="text-gray-600 w-24 text-right">
                                                            {formatCurrency(
                                                              code.allocated
                                                            )}
                                                          </span>
                                                          <span
                                                            className={`w-24 text-right ${getUtilizationColor(
                                                              code.spent,
                                                              code.allocated
                                                            )}`}
                                                          >
                                                            {formatCurrency(
                                                              code.spent
                                                            )}
                                                          </span>
                                                          <span className="text-green-700 font-medium w-24 text-right">
                                                            {formatCurrency(
                                                              code.remaining
                                                            )}
                                                          </span>
                                                          <button
                                                            onClick={() =>
                                                              handleViewExpenseCode(
                                                                code
                                                              )
                                                            }
                                                            className="ml-2 text-blue-600 hover:text-blue-800 font-medium underline w-12"
                                                          >
                                                            View
                                                          </button>
                                                        </div>
                                                      </div>
                                                    )
                                                  )}
                                                </div>
                                              );
                                            }

                                            return (
                                              <div
                                                key={subcategoryKey}
                                                className="border border-gray-200 rounded-md bg-gray-50"
                                              >
                                                {/* Subcategory Header */}
                                                <button
                                                  onClick={() =>
                                                    toggleSubcategory(
                                                      subcategoryKey
                                                    )
                                                  }
                                                  className="w-full px-3 py-2 flex items-center justify-between hover:bg-gray-100 transition-colors"
                                                >
                                                  <div className="flex-1 text-left">
                                                    <div className="font-semibold text-gray-800 text-xs flex items-center gap-2">
                                                      <span className="w-1 h-1 bg-gray-500 rounded-full"></span>
                                                      {subcategory.name}
                                                    </div>
                                                    <div className="flex items-center gap-2 mt-0.5 text-xs">
                                                      <span className="text-gray-600">
                                                        {formatCurrency(
                                                          subcategory.allocated
                                                        )}
                                                      </span>
                                                      <span
                                                        className={getUtilizationColor(
                                                          subcategory.spent,
                                                          subcategory.allocated
                                                        )}
                                                      >
                                                        {formatCurrency(
                                                          subcategory.spent
                                                        )}
                                                      </span>
                                                      <span className="text-green-600">
                                                        {formatCurrency(
                                                          subcategory.remaining
                                                        )}
                                                      </span>
                                                    </div>
                                                  </div>
                                                  <svg
                                                    className={`h-3 w-3 text-gray-400 transition-transform ${
                                                      expandedSubcategories.has(
                                                        subcategoryKey
                                                      )
                                                        ? 'rotate-180'
                                                        : ''
                                                    }`}
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                  >
                                                    <path
                                                      strokeLinecap="round"
                                                      strokeLinejoin="round"
                                                      strokeWidth={2}
                                                      d="M19 9l-7 7-7-7"
                                                    />
                                                  </svg>
                                                </button>

                                                {/* Expense Codes under Subcategory */}
                                                {expandedSubcategories.has(
                                                  subcategoryKey
                                                ) && (
                                                  <div className="px-3 pb-2 space-y-1">
                                                    {subcategory.expense_codes.map(
                                                      (code, codeIndex) => (
                                                        <div
                                                          key={codeIndex}
                                                          className="flex items-center py-1.5 px-2 bg-white rounded text-xs border border-gray-100"
                                                        >
                                                          <div
                                                            className="font-medium text-gray-900 text-xs"
                                                            style={{
                                                              width: '400px',
                                                            }}
                                                          >
                                                            {code.code} -{' '}
                                                            {code.description}
                                                          </div>
                                                          <div className="flex items-center gap-2 ml-4">
                                                            <span className="text-gray-600 w-24 text-right">
                                                              {formatCurrency(
                                                                code.allocated
                                                              )}
                                                            </span>
                                                            <span
                                                              className={`w-24 text-right ${getUtilizationColor(
                                                                code.spent,
                                                                code.allocated
                                                              )}`}
                                                            >
                                                              {formatCurrency(
                                                                code.spent
                                                              )}
                                                            </span>
                                                            <span className="text-green-600 font-medium w-24 text-right">
                                                              {formatCurrency(
                                                                code.remaining
                                                              )}
                                                            </span>
                                                            <button
                                                              onClick={() =>
                                                                handleViewExpenseCode(
                                                                  code
                                                                )
                                                              }
                                                              className="ml-2 text-blue-600 hover:text-blue-800 font-medium underline w-12"
                                                            >
                                                              View
                                                            </button>
                                                          </div>
                                                        </div>
                                                      )
                                                    )}
                                                  </div>
                                                )}
                                              </div>
                                            );
                                          }
                                        )}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />

      {/* Expense Code Detail Drawer */}
      {isDrawerOpen && (
        <>
          {/* Drawer - No backdrop, user can interact with parent */}
          <div className="fixed inset-y-0 right-0 z-50 w-full max-w-2xl bg-white shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col border-l-2 border-gray-300">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">
                  Expense Code Details
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {selectedExpenseCode?.code} -{' '}
                  {selectedExpenseCode?.description}
                </p>
              </div>
              <button
                onClick={closeDrawer}
                className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
                aria-label="Close drawer"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {selectedExpenseCode && (
                <div className="space-y-6">
                  {/* Summary Card */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Budget Summary
                    </h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Allocated</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {formatCurrency(selectedExpenseCode.allocated)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Spent</p>
                        <p
                          className={`text-2xl font-bold ${getUtilizationColor(
                            selectedExpenseCode.spent,
                            selectedExpenseCode.allocated
                          )}`}
                        >
                          {formatCurrency(selectedExpenseCode.spent)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">
                          Remaining
                        </p>
                        <p className="text-2xl font-bold text-green-700">
                          {formatCurrency(selectedExpenseCode.remaining)}
                        </p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-4">
                      <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <span>Utilization</span>
                        <span>
                          {selectedExpenseCode.allocated > 0
                            ? (
                                (selectedExpenseCode.spent /
                                  selectedExpenseCode.allocated) *
                                100
                              ).toFixed(1)
                            : 0}
                          %
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${
                            selectedExpenseCode.allocated > 0 &&
                            (selectedExpenseCode.spent /
                              selectedExpenseCode.allocated) *
                              100 >=
                              90
                              ? 'bg-red-600'
                              : selectedExpenseCode.allocated > 0 &&
                                (selectedExpenseCode.spent /
                                  selectedExpenseCode.allocated) *
                                  100 >=
                                  75
                              ? 'bg-yellow-500'
                              : 'bg-green-600'
                          }`}
                          style={{
                            width:
                              selectedExpenseCode.allocated > 0
                                ? `${Math.min(
                                    (selectedExpenseCode.spent /
                                      selectedExpenseCode.allocated) *
                                      100,
                                    100
                                  )}%`
                                : '0%',
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Dummy Content Sections */}
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Recent Transactions
                    </h3>

                    {transactionsLoading && (
                      <p className="text-sm text-gray-500">
                        Loading recent transactions...
                      </p>
                    )}

                    {transactionsError && (
                      <p className="text-sm text-red-600">
                        {transactionsError}
                      </p>
                    )}

                    {!transactionsLoading &&
                      !transactionsError &&
                      transactions.length === 0 && (
                        <p className="text-sm text-gray-500">
                          No transactions found for this budget line.
                        </p>
                      )}

                    {!transactionsLoading &&
                      !transactionsError &&
                      transactions.length > 0 && (
                        <div className="space-y-3">
                          {transactions.map((tx) => (
                            <div
                              key={tx.id}
                              className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0"
                            >
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  Requisition:{' '}
                                  <a
                                    href={`/requisitions/view/${tx.requisition_id}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800 underline"
                                  >
                                    {tx.requisition_number}
                                  </a>
                                </p>
                                <p className="text-xs text-gray-500">
                                  Total requisition:{' '}
                                  {formatCurrency(
                                    tx.requisition_total_amount
                                  )}{' '}
                                  · This budget line:{' '}
                                  {formatCurrency(tx.amount)}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-semibold text-gray-900">
                                  {formatCurrency(tx.amount)}
                                </p>
                                {tx.confirmed_at && (
                                  <p className="text-xs text-gray-500">
                                    Confirmed{' '}
                                    {new Date(
                                      tx.confirmed_at
                                    ).toLocaleDateString()}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                  </div>

                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={closeDrawer}
                className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </>
      )}
    </main>
  );
}