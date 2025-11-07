// src/features/requisitions/model/types.ts

// ============================================================================
// PAYEE & EXPENSE TYPES
// ============================================================================

export type PayeeType = 'staff' | 'vendor' | 'contractor' | 'office_credit_card' | 'other';
export type ExpenseType = 'general' | 'travel' | 'per_diem';
export type DocumentType = 'invoice' | 'receipt' | 'quote' | 'other';

// ============================================================================
// FORM DATA TYPES (for React Hook Form)
// ============================================================================

/**
 * General Expense Line Item Form Data
 * Maps to backend GeneralExpenseLineItem model
 */
export interface GeneralExpenseFormData {
  // Program and budget
  program: number | null;
  budget: number | null; // Optional - BudgetLineItem FK
  
  // Category selection (single dropdown - can be parent OR child)
  category: number | null; // ExpenseCategory ID (parent or subcategory)
  expenseCode: number | null; // ExpenseCode ID (actual expense code to send to backend)
  
  // Expense details
  amount: string; // Base amount before GST
  gstRate: string; // GST rate (0-100), default 0
  description: string;
  
  // Calculated fields (read-only, for display only)
  gstAmount?: string; // Calculated: amount × (gstRate/100)
  totalAmount?: string; // Calculated: amount + gstAmount
}

/**
 * Travel Expense Line Item Form Data
 * Maps to backend TravelExpenseLineItem model
 */
export interface TravelExpenseFormData {
  // Program tracking
  program: number | null;
  
  // Category and expense code
  category: number | null; // ExpenseCategory ID
  expenseCode: number | null; // ExpenseCode ID (actual expense code to send to backend)
  
  // Travel details
  travelDate: string; // ISO date string (YYYY-MM-DD)
  startAddress: string; // Starting location
  endAddress: string; // Destination
  description: string; // Purpose of travel
  totalKm: string; // Distance in kilometers
  
  // Rate and amounts (auto-populated from backend)
  ratePerKm: string; // Rate per kilometer
  amount: string; // Calculated: totalKm × ratePerKm
  gstRate: string; // GST percentage (0-100), default 0
  gstAmount: string; // Calculated: amount × (gstRate/100)
  totalAmount: string; // Calculated: amount + gstAmount
}

/**
 * Per Diem Expense Line Item Form Data
 * Maps to backend PerDiemExpenseLineItem model
 */
export interface PerDiemExpenseFormData {
  // Program tracking
  program: number | null;
  
  // Category and expense code
  category: number | null; // ExpenseCategory ID
  expenseCode: number | null; // ExpenseCode ID (actual expense code to send to backend)
  
  // Per diem details
  mealDate: string; // Single date (YYYY-MM-DD) - backend has meal_date field
  includeBreakfast: boolean; // Checkbox for breakfast
  includeLunch: boolean; // Checkbox for lunch
  includeDinner: boolean; // Checkbox for dinner
  description: string; // Purpose of per diem claim
  
  // Meal rates (auto-populated from backend based on date)
  breakfastRate: string; // Rate for breakfast (e.g., "28.40")
  lunchRate: string; // Rate for lunch (e.g., "27.40")
  dinnerRate: string; // Rate for dinner (e.g., "57.70")
  
  // Calculated fields
  amount: string; // Sum of selected meals: (breakfast ? breakfastRate : 0) + (lunch ? lunchRate : 0) + (dinner ? dinnerRate : 0)
  gstRate: string; // GST percentage (0-100), default 0
  gstAmount: string; // Calculated: amount × (gstRate/100)
  totalAmount: string; // Calculated: amount + gstAmount
}

/**
 * Supporting Document Form Data
 * Maps to backend SupportingDocument model
 */
export interface DocumentFormData {
  file: File | null;
  documentType: DocumentType;
  description: string;
}
export interface SupportingDocumentFormData {
  id?: number; // For existing documents when editing
  documentType: 'receipt' | 'invoice' | 'quote' | 'contract' | 'other';
  file: File | null;
  fileName?: string;
  fileSize?: number;
  fileUrl?: string; // URL to the uploaded file
  uploadedDocumentId?: number;  // Document ID after upload
  uploadedAt?: string; // Upload timestamp
  description: string;
}

/**
 * Complete Requisition Form Data
 * Main form structure for creating/editing requisitions
 */
export interface RequisitionFormData {
  // Section 1: General Expenses (optional, show if checkbox checked, default: true)
  includeGeneralExpenses: boolean;
  generalExpenses: GeneralExpenseFormData[];
  
  // Section 2: Travel Expenses (optional, show if checkbox checked)
  includeTravelExpenses: boolean;
  travelExpenses: TravelExpenseFormData[];
  
  // Section 3: Per Diem Expenses (optional, show if Travel is checked AND per diem checkbox is checked)
  includePerDiemExpenses: boolean;
  perDiemExpenses: PerDiemExpenseFormData[];
  
  // Section 4: Basic Information
  requisitionDate: string; // ISO date string (YYYY-MM-DD)
  payeeType: PayeeType | null;
  payeeId: number | null; // FK to staff/vendor/card holder (depending on payeeType)
  payeeOther: string; // Free text if payeeType = "other"
  
  // Section 5: Supporting Documents
  //documents: DocumentFormData[];
  includeSupportingDocuments: boolean;
  supportingDocuments: SupportingDocumentFormData[];
  
  // Section 6: Comments (optional - for Submit/Forward actions)
  comments?: string; // Optional comments for status changes
  
  // Financial Summary (auto-calculated, read-only)
  totalAmount: number; // Sum of all expense amounts (before GST)
  gstAmount: number; // Sum of all GST amounts
  totalWithTax: number; // Grand total (totalAmount + gstAmount)
}

// ============================================================================
// DROPDOWN OPTION TYPES (from backend APIs)
// ============================================================================

/**
 * Generic Dropdown Option
 */
export interface DropdownOption {
  id: number;
  name: string;
  code?: string;
  description?: string;
}

/**
 * Budget Dropdown Option
 */
export interface BudgetOption {
  id: number;
  name: string;
  fiscal_year: string;
  program: number;
  funder: number;
  total_amount: string;
  allocated_amount: string;
  available_amount: string;
}

/**
 * Expense Category Option
 * Used for single dropdown with parent and child categories
 */
export interface ExpenseCategoryOption {
  id: number;
  name: string;
  code: string;
  parent_id: number | null; // null if parent category, number if subcategory
  parent_name: string | null;
  is_main_category: boolean;
  is_subcategory: boolean;
  full_name: string;
  description?: string;
  display_name?: string; // Formatted name with indentation (e.g., "  ├─ Office Supplies")
}

/**
 * Expense Code Assignment Option
 * Backend returns expense codes with their category associations
 */
export interface ExpenseCodeAssignmentOption {
  id: number;
  code: string;
  description: string;
  categories_display: string; // e.g., "Admin | Program Delivery > Overhead Cost"
  category_ids: number[];
}

/**
 * Staff Option
 */
export interface StaffOption {
  id: number;
  first_name: string;
  last_name: string;
  full_name?: string;
  employee_id?: string;
  email?: string;
}

/**
 * Vendor Option
 */
export interface VendorOption {
  id: number;
  name: string;
  vendor_type?: string;
  email?: string;
  phone?: string;
}

/**
 * Card Holder Option
 */
export interface CardHolderOption {
  id: number;
  name: string;
  card_number?: string;
}

/**
 * Generic Payee Option (union of all payee types)
 */
export type PayeeOption = StaffOption | VendorOption | CardHolderOption;

/**
 * Rate Option (for travel/per diem)
 */
export interface RateOption {
  id: number;
  rate_type: string;
  rate: string;
  effective_date: string;
  is_current: boolean;
}

// ============================================================================
// HELPER FUNCTIONS (Type Guards & Formatters)
// ============================================================================

/**
 * Format categories for hierarchical dropdown display
 * Adds indentation to subcategories for visual hierarchy
 */
export function formatCategoriesForDropdown(
  categories: ExpenseCategoryOption[]
): ExpenseCategoryOption[] {
  // Guard against non-array input
  if (!categories || !Array.isArray(categories)) {
    return [];
  }
  
  // Separate parents and children
  const parents = categories.filter(c => c.is_main_category);
  const children = categories.filter(c => c.is_subcategory);
  
  const formatted: ExpenseCategoryOption[] = [];
  
  // Build hierarchical list
  parents.forEach(parent => {
    // Add parent category
    formatted.push({
      ...parent,
      display_name: parent.name // No indentation for parent
    });
    
    // Add children of this parent
    const parentChildren = children.filter(c => c.parent_id === parent.id);
    parentChildren.forEach((child, index) => {
      const isLast = index === parentChildren.length - 1;
      const prefix = isLast ? '└─' : '├─';
      
      formatted.push({
        ...child,
        display_name: `  ${prefix} ${child.name}` // Add indentation
      });
    });
  });
  
  return formatted;
}

/**
 * Check if a category is a parent category
 */
export function isParentCategory(category: ExpenseCategoryOption): boolean {
  return category.is_main_category && category.parent_id === null;
}

/**
 * Check if a category is a subcategory
 */
export function isSubcategory(category: ExpenseCategoryOption): boolean {
  return category.is_subcategory && category.parent_id !== null;
}

/**
 * Get parent category ID from a subcategory
 */
export function getParentCategoryId(
  category: ExpenseCategoryOption
): number | null {
  return category.parent_id;
}

// ============================================================================
// NOTE: API Request/Response types have been moved to api/types.ts
// Import from there if needed: import type { RequisitionResponse } from '../api/types'
// ============================================================================