import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/shared/api/client";
import type {
  BudgetOption,
  ExpenseCategoryOption,
  ExpenseCodeAssignmentOption,
} from "./types";
import { formatCategoriesForDropdown } from "./types";

/**
 * Custom hook to fetch form dropdown data
 * Handles cascading dropdowns and data filtering
 */
export function useFormData(
  selectedProgram?: number | null,
  selectedCategory?: number | null
) {
  // ============================================================================
  // BUDGETS - Fetch budgets filtered by selected program
  // ============================================================================
  const {
    data: budgets,
    isLoading: isLoadingBudgets,
    error: budgetsError,
  } = useQuery<BudgetOption[]>({
    queryKey: ["budgets", selectedProgram],
    queryFn: async () => {
      if (!selectedProgram) return [];
      
      const response = await apiClient.get("/api/budget/active/", {
        params: { program: selectedProgram },
      });
      return response.data;
    },
    enabled: !!selectedProgram, // Only fetch if program is selected
    staleTime: 5 * 60 * 1000,
  });

  // ============================================================================
  // CATEGORIES - Fetch all expense categories (hierarchical)
  // ============================================================================
  const {
    data: rawCategories,
    isLoading: isLoadingCategories,
    error: categoriesError,
  } = useQuery<ExpenseCategoryOption[]>({
    queryKey: ["expense-categories"],
    queryFn: async () => {
      const response = await apiClient.get("/api/expense-tracking/form-data/expense-categories/");
      return response.data;
    },
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes (rarely changes)
  });

  // Format categories for hierarchical dropdown display
  const categories = rawCategories ? formatCategoriesForDropdown(rawCategories) : [];

  // ============================================================================
  // EXPENSE CODE ASSIGNMENTS - Fetch codes filtered by selected category
  // ============================================================================
  const {
    data: expenseCodeAssignments,
    isLoading: isLoadingExpenseCodes,
    error: expenseCodesError,
  } = useQuery<ExpenseCodeAssignmentOption[]>({
    queryKey: ["expense-code-assignments", selectedCategory],
    queryFn: async () => {
      if (!selectedCategory) return [];
      
      const response = await apiClient.get(
        `/api/expense-tracking/form-data/expense-codes-by-category/${selectedCategory}/`
      );
      return response.data;
    },
    enabled: !!selectedCategory, // Only fetch if category is selected
    staleTime: 5 * 60 * 1000,
  });

  // ============================================================================
  // RETURN ALL DATA AND STATES
  // ============================================================================
  return {
    // Data (with defensive array checks)
    budgets: Array.isArray(budgets) ? budgets : [],
    categories: Array.isArray(categories) ? categories : [],
    expenseCodeAssignments: Array.isArray(expenseCodeAssignments) ? expenseCodeAssignments : [],
    
    // Loading states
    isLoadingBudgets,
    isLoadingCategories,
    isLoadingExpenseCodes,
    
    // Error states
    budgetsError,
    categoriesError,
    expenseCodesError,
    
    // Helper flags
    hasBudgets: (budgets?.length || 0) > 0,
    hasCategories: (categories?.length || 0) > 0,
    hasExpenseCodes: (expenseCodeAssignments?.length || 0) > 0,
  };
}

// ============================================================================
// ADDITIONAL HOOKS FOR OTHER FORM SECTIONS
// ============================================================================

/**
 * Hook to fetch payee options based on payee type
 */
export function usePayeeOptions(payeeType?: string | null) {
  // Fetch staff
  const {
    data: staff,
    isLoading: isLoadingStaff,
  } = useQuery({
    queryKey: ["staff"],
    queryFn: async () => {
      const response = await apiClient.get("/api/accounts/form-data/active-staff/");
      return response.data;
    },
    enabled: payeeType === "staff",
    staleTime: 5 * 60 * 1000,
  });

  // Fetch vendors (for both vendor and contractor)
  const {
    data: vendors,
    isLoading: isLoadingVendors,
  } = useQuery({
    queryKey: ["vendors"],
    queryFn: async () => {
      const response = await apiClient.get("/api/accounts/form-data/active-vendors/");
      return response.data;
    },
    enabled: payeeType === "vendor" || payeeType === "contractor",
    staleTime: 5 * 60 * 1000,
  });

  // Fetch card holders
  const {
    data: cardHolders,
    isLoading: isLoadingCardHolders,
  } = useQuery({
    queryKey: ["card-holders"],
    queryFn: async () => {
      const response = await apiClient.get("/api/accounts/form-data/active-card-holders/");
      return response.data;
    },
    enabled: payeeType === "office_credit_card",
    staleTime: 5 * 60 * 1000,
  });

  return {
    staff: staff || [],
    vendors: vendors || [],
    cardHolders: cardHolders || [],
    isLoadingStaff,
    isLoadingVendors,
    isLoadingCardHolders,
  };
}

/**
 * Hook to fetch travel/per diem rates
 */
export function useRates() {
  const {
    data: rates,
    isLoading: isLoadingRates,
  } = useQuery({
    queryKey: ["current-rates"],
    queryFn: async () => {
      const response = await apiClient.get("/api/expense-tracking/form-data/current-rates/");
      return response.data;
    },
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
  });

  return {
    rates: rates || {},
    travelRate: rates?.travel_per_km || "0.00",
    breakfastRate: rates?.meal_breakfast || "0.00",
    lunchRate: rates?.meal_lunch || "0.00",
    dinnerRate: rates?.meal_dinner || "0.00",
    isLoadingRates,
  };
}