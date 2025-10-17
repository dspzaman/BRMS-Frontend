// Payee Types
export type PayeeType = 'staff' | 'vendor' | 'contractor' | 'other';

// Expense Types
export type ExpenseType = 'general' | 'travel' | 'per_diem';

// Base Expense (common fields)
export interface BaseExpense {
  id?: string; // For React key and tracking
  expense_type: ExpenseType;
  program: number | null;
  budget: number | null;
  expense_code: number | null;
  description: string;
  amount: number;
}

// General Expense
export interface GeneralExpense extends BaseExpense {
  expense_type: 'general';
}

// Travel Expense
export interface TravelExpense extends BaseExpense {
  expense_type: 'travel';
  travel_date: string;
  from_location: string;
  to_location: string;
  distance_km: number;
  rate_per_km: number;
}

// Per Diem Expense
export interface PerDiemExpense extends BaseExpense {
  expense_type: 'per_diem';
  per_diem_date: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner';
  rate: number;
}

// Union type for all expenses
export type Expense = GeneralExpense | TravelExpense | PerDiemExpense;

// Main Requisition Form Data
export interface RequisitionFormData {
  // Basic Info
  payee_type: PayeeType;
  payee_staff?: number | null;
  payee_vendor?: number | null;
  payee_contractor?: number | null;
  payee_other?: string;
  
  // Expenses
  expenses: Expense[];
  
  // Supporting Documents
  supporting_documents: File[];
  
  // Notes
  notes?: string;
}

// Dropdown Options
export interface ProgramOption {
  id: number;
  name: string;
  code: string;
}

export interface BudgetOption {
  id: number;
  name: string;
  funder_name: string;
  available_amount: number;
}

export interface ExpenseCodeOption {
  id: number;
  code: string;
  description: string;
  category_name: string;
}

export interface StaffOption {
  id: number;
  first_name: string;
  last_name: string;
  employee_id: string;
}

export interface VendorOption {
  id: number;
  name: string;
  vendor_type: string;
}