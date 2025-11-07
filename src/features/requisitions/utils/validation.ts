// src/features/requisitions/utils/validation.ts
import type { RequisitionFormData } from '../model/types';

// Validate general expenses
export const validateGeneralExpenses = (
  includeGeneralExpenses: boolean,
  getValues: () => RequisitionFormData
): string | null => {
  if (!includeGeneralExpenses) return null;
  
  const expenses = getValues().generalExpenses || [];
  
  if (expenses.length === 0) {
    return "At least one general expense is required";
  }
  
  for (let i = 0; i < expenses.length; i++) {
    const expense = expenses[i];
    
    if (!expense.program) return `General Expense #${i + 1}: Program is required`;
    if (!expense.category) return `General Expense #${i + 1}: Category is required`;
    if (!expense.expenseCode) return `General Expense #${i + 1}: Expense code is required`;
    if (!expense.description || expense.description.trim() === '') return `General Expense #${i + 1}: Description is required`;
    if (!expense.amount || parseFloat(String(expense.amount)) <= 0) return `General Expense #${i + 1}: Amount is required and must be greater than 0`;
  }
  
  return null;
};

// Validate travel expenses
export const validateTravelExpenses = (
  includeTravelExpenses: boolean,
  getValues: () => RequisitionFormData
): string | null => {
  if (!includeTravelExpenses) return null;
  
  const expenses = getValues().travelExpenses || [];
  
  if (expenses.length === 0) {
    return "At least one travel expense is required";
  }
  
  for (let i = 0; i < expenses.length; i++) {
    const expense = expenses[i];
    
    if (!expense.program) return `Travel Expense #${i + 1}: Program is required`;
    if (!expense.expenseCode) return `Travel Expense #${i + 1}: Expense code is required`;
    if (!expense.travelDate) return `Travel Expense #${i + 1}: Travel date is required`;
    if (!expense.startAddress || expense.startAddress.trim() === '') return `Travel Expense #${i + 1}: From address is required`;
    if (!expense.endAddress || expense.endAddress.trim() === '') return `Travel Expense #${i + 1}: To address is required`;
    if (!expense.totalKm || parseFloat(String(expense.totalKm)) <= 0) return `Travel Expense #${i + 1}: Total KM is required and must be greater than 0`;
    if (!expense.description || expense.description.trim() === '') return `Travel Expense #${i + 1}: Description is required`;
  }
  
  return null;
};

// Validate per diem expenses
export const validatePerDiemExpenses = (
  includePerDiemExpenses: boolean,
  getValues: () => RequisitionFormData
): string | null => {
  if (!includePerDiemExpenses) return null;
  
  const expenses = getValues().perDiemExpenses || [];
  
  if (expenses.length === 0) {
    return "At least one per diem expense is required";
  }
  
  for (let i = 0; i < expenses.length; i++) {
    const expense = expenses[i];
    
    if (!expense.program) return `Per Diem Expense #${i + 1}: Program is required`;
    if (!expense.expenseCode) return `Per Diem Expense #${i + 1}: Expense code is required`;
    if (!expense.mealDate) return `Per Diem Expense #${i + 1}: Meal date is required`;
    if (!expense.includeBreakfast && !expense.includeLunch && !expense.includeDinner) return `Per Diem Expense #${i + 1}: At least one meal type must be selected`;
    if (!expense.description || expense.description.trim() === '') return `Per Diem Expense #${i + 1}: Description is required`;
  }
  
  return null;
};

// Validate basic information
export const validateBasicInfo = (
  getValues: () => RequisitionFormData
): string | null => {
  const { requisitionDate, payeeType, payeeId, payeeOther } = getValues();
  
  if (!requisitionDate) return "Requisition date is required";
  if (!payeeType) return "Payee type is required";
  
  if (payeeType === 'other') {
    if (!payeeOther || payeeOther.trim() === '') return "Payee name is required for 'Other' payee type";
  } else {
    if (!payeeId) {
      const label = payeeType === 'staff' ? 'staff member' :
                    payeeType === 'vendor' ? 'vendor' :
                    payeeType === 'contractor' ? 'contractor' :
                    payeeType === 'office_credit_card' ? 'card holder' : 'payee';
      return `Please select a ${label}`;
    }
  }
  
  return null;
};

// Validate supporting documents
export const validateSupportingDocuments = (
  getValues: () => RequisitionFormData
): string | null => {
  const documents = getValues().supportingDocuments || [];
  
  if (documents.length === 0) return null;
  
  for (let i = 0; i < documents.length; i++) {
    const doc = documents[i];
    if (!doc.documentType) return `Document #${i + 1}: Document type is required`;
    
    // Check if document has either a new file OR is an existing document
    const hasNewFile = doc.file instanceof File;
    const hasExistingDocument = doc.id || doc.fileUrl || doc.uploadedDocumentId;
    
    if (!hasNewFile && !hasExistingDocument) {
      return `Document #${i + 1}: File must be uploaded`;
    }
  }
  
  return null;
};

/**
 * Runs multiple validation functions and returns the first error found.
 * This eliminates repetitive error handling code.
 * 
 * @param validations - Array of validation functions that return string | null
 * @returns The first error message found, or null if all validations pass
 * 
 * @example
 * const error = runValidations([
 *   () => validateGeneralExpenses(includeGeneral, getValues),
 *   () => validateTravelExpenses(includeTravel, getValues),
 *   () => validateBasicInfo(getValues),
 * ]);
 * 
 * if (error) {
 *   alert(error);
 *   return;
 * }
 */
export const runValidations = (
  validations: Array<() => string | null>
): string | null => {
  for (const validate of validations) {
    const error = validate();
    if (error) {
      return error;
    }
  }
  return null;
};