// src/features/requisitions/utils/transformers.ts
import type { RequisitionFormData } from '../model/types';
import type {
  CreateRequisitionRequest,
  GeneralExpenseLineItemRequest,
  TravelExpenseLineItemRequest,
  PerDiemExpenseLineItemRequest,
  RequisitionResponse,
} from '../api/types';

/**
 * Check if an expense row is completely empty
 */
function isEmptyGeneralExpense(expense: RequisitionFormData['generalExpenses'][0]): boolean {
  return (
    !expense.program &&
    !expense.category &&
    !expense.expenseCode &&
    !expense.amount &&
    !expense.description
  );
}

function isEmptyTravelExpense(expense: RequisitionFormData['travelExpenses'][0]): boolean {
  return (
    !expense.program &&
    !expense.expenseCode &&
    !expense.travelDate &&
    !expense.startAddress &&
    !expense.endAddress &&
    !expense.totalKm &&
    !expense.description
  );
}

function isEmptyPerDiemExpense(expense: RequisitionFormData['perDiemExpenses'][0]): boolean {
  return (
    !expense.program &&
    !expense.expenseCode &&
    !expense.mealDate &&
    !expense.includeBreakfast &&
    !expense.includeLunch &&
    !expense.includeDinner &&
    !expense.description
  );
}

/**
 * Transform form data to API request format for saving draft
 */
export function transformFormDataToAPI(
  formData: RequisitionFormData
): CreateRequisitionRequest {
  // Use requisition date as title (temporary for drafts)
  const title = formData.requisitionDate || 'Draft Requisition';

  // Determine payee field based on payee type
  let payeeField: {
    payee_staff?: number | null;
    payee_vendor?: number | null;
    payee_card_holder?: number | null;
    payee_other?: string | null;
  } = {};

  // Only set the relevant payee field based on type
  if (formData.payeeType) {
    switch (formData.payeeType) {
      case 'staff':
        payeeField.payee_staff = formData.payeeId;
        break;
      case 'vendor':
      case 'contractor':
        payeeField.payee_vendor = formData.payeeId;
        break;
      case 'office_credit_card':
        payeeField.payee_card_holder = formData.payeeId;
        break;
      case 'other':
        // For 'other', send the text value from payeeOther field
        payeeField.payee_other = formData.payeeOther || null;
        break;
    }
  }

  // Transform General Expenses (filter out empty rows)
  const general_expense_items: GeneralExpenseLineItemRequest[] = formData.includeGeneralExpenses
    ? formData.generalExpenses
        .filter((exp) => !isEmptyGeneralExpense(exp))
        .map((exp, index) => {
          const amount = parseFloat(exp.amount || '0');
          const gstAmount = parseFloat(exp.gstRate || '0'); // gstRate is actually the GST amount in general expenses
          const totalAmount = amount + gstAmount;

          return {
            program: exp.program!,
            expense_category: exp.category!,
            expense_code: exp.expenseCode!,
            budget_line_item: null, // Budget assigned during approval
            description: exp.description || '',
            amount: amount,
            gst_rate: gstAmount, // This is the GST amount, not a percentage
            gst_amount: gstAmount,
            total_amount: totalAmount,
            line_order: index + 1,
          };
        })
    : [];

  // Transform Travel Expenses (filter out empty rows)
  const travel_expense_items: TravelExpenseLineItemRequest[] = formData.includeTravelExpenses
    ? formData.travelExpenses
        .filter((exp) => !isEmptyTravelExpense(exp))
        .map((exp, index) => ({
          program: exp.program!,
          expense_category: exp.category!,
          expense_code: exp.expenseCode!,
          budget_line_item: null,
          travel_date: exp.travelDate || '',
          start_address: exp.startAddress || '',
          end_address: exp.endAddress || '',
          description: exp.description || '',
          total_km: parseFloat(exp.totalKm || '0'),
          rate_per_km: parseFloat(exp.ratePerKm || '0'),
          amount: parseFloat(exp.amount || '0'),
          gst_rate: parseFloat(exp.gstRate || '0'),
          gst_amount: parseFloat(exp.gstAmount || '0'),
          total_amount: parseFloat(exp.totalAmount || '0'),
          line_order: index + 1,
        }))
    : [];

  // Transform Per Diem Expenses (filter out empty rows)
  const per_diem_expense_items: PerDiemExpenseLineItemRequest[] = formData.includePerDiemExpenses
    ? formData.perDiemExpenses
        .filter((exp) => !isEmptyPerDiemExpense(exp))
        .flatMap((exp, baseIndex) => {
          const items: PerDiemExpenseLineItemRequest[] = [];
          let lineOrder = baseIndex * 3 + 1; // Reserve 3 slots per date

          // Create separate line items for each meal type
          if (exp.includeBreakfast) {
            items.push({
              program: exp.program!,
              expense_category: exp.category!,
              expense_code: exp.expenseCode!,
              budget_line_item: null,
              meal_date: exp.mealDate || '',
              meal_type: 'breakfast',
              description: exp.description || '',
              rate_amount: parseFloat(exp.breakfastRate || '0'),
              amount: parseFloat(exp.breakfastRate || '0'),
              gst_rate: 0, // Per diem has no GST
              gst_amount: 0,
              total_amount: parseFloat(exp.breakfastRate || '0'),
              line_order: lineOrder++,
            });
          }

          if (exp.includeLunch) {
            items.push({
              program: exp.program!,
              expense_category: exp.category!,
              expense_code: exp.expenseCode!,
              budget_line_item: null,
              meal_date: exp.mealDate || '',
              meal_type: 'lunch',
              description: exp.description || '',
              rate_amount: parseFloat(exp.lunchRate || '0'),
              amount: parseFloat(exp.lunchRate || '0'),
              gst_rate: 0, // Per diem has no GST
              gst_amount: 0,
              total_amount: parseFloat(exp.lunchRate || '0'),
              line_order: lineOrder++,
            });
          }

          if (exp.includeDinner) {
            items.push({
              program: exp.program!,
              expense_category: exp.category!,
              expense_code: exp.expenseCode!,
              budget_line_item: null,
              meal_date: exp.mealDate || '',
              meal_type: 'dinner',
              description: exp.description || '',
              rate_amount: parseFloat(exp.dinnerRate || '0'),
              amount: parseFloat(exp.dinnerRate || '0'),
              gst_rate: 0, // Per diem has no GST
              gst_amount: 0,
              total_amount: parseFloat(exp.dinnerRate || '0'),
              line_order: lineOrder++,
            });
          }

          return items;
        })
    : [];

  // Build the API request
  const apiRequest: CreateRequisitionRequest = {
    title,
    payee_type: formData.payeeType || 'staff',
    ...payeeField,
  };

  // Only include expense items if they exist
  if (general_expense_items.length > 0) {
    apiRequest.general_expense_items = general_expense_items;
  }
  if (travel_expense_items.length > 0) {
    apiRequest.travel_expense_items = travel_expense_items;
  }
  if (per_diem_expense_items.length > 0) {
    apiRequest.per_diem_expense_items = per_diem_expense_items;
  }

  return apiRequest;
}

/**
 * Transform API response data to form data structure
 * Used when editing an existing requisition
 */
export function transformAPIToFormData(apiData: RequisitionResponse): RequisitionFormData {

  
  // Use the payee_type field from API response
  const payeeType: RequisitionFormData['payeeType'] = apiData.payee_type || null;
  
  // Determine payee ID based on type
  let payeeId: number | null = null;
  if (payeeType === 'staff') {
    payeeId = apiData.payee_staff;
  } else if (payeeType === 'vendor' || payeeType === 'contractor') {
    payeeId = apiData.payee_vendor; // Both vendor and contractor use payee_vendor field
  } else if (payeeType === 'office_credit_card') {
    payeeId = apiData.payee_card_holder;
  }

  return {
    // Expense type toggles
    includeGeneralExpenses: (apiData.general_expense_items?.length || 0) > 0,
    includeTravelExpenses: (apiData.travel_expense_items?.length || 0) > 0,
    includePerDiemExpenses: (apiData.per_diem_expense_items?.length || 0) > 0,
    includeSupportingDocuments: (apiData.supporting_documents?.length || 0) > 0,

    // General expenses
    generalExpenses: apiData.general_expense_items?.map((exp) => {
      // Handle expense_code as either number or object
      const expenseCodeId = typeof exp.expense_code === 'number' 
        ? exp.expense_code 
        : exp.expense_code?.id || null;
      
      return {
        program: exp.program,
        budget: exp.budget_line_item,
        category: exp.expense_category || null, // Use the saved category ID
        expenseCode: expenseCodeId,
        amount: exp.amount.toString(),
        gstRate: exp.gst_amount.toString(), // This is GST amount, not rate
        description: exp.description || '',
      };
    }) || [],

    // Travel expenses
    travelExpenses: apiData.travel_expense_items?.map(exp => {
      const expenseCodeId = typeof exp.expense_code === 'number' 
        ? exp.expense_code 
        : exp.expense_code?.id || null;
      
      return {
        program: exp.program,
        category: exp.expense_category || null, // Use the saved category ID
        expenseCode: expenseCodeId,
        travelDate: exp.travel_date,
        startAddress: exp.start_address,
        endAddress: exp.end_address,
        totalKm: exp.total_km?.toString() || '',
        ratePerKm: exp.rate_per_km?.toString() || '',
        amount: exp.amount.toString(),
        gstRate: exp.gst_rate?.toString() || '',
        gstAmount: exp.gst_amount?.toString() || '',
        totalAmount: exp.total_amount.toString(),
        description: exp.description || '',
      };
    }) || [],

    // Per diem expenses - group by date
    perDiemExpenses: (() => {
      const perDiemMap = new Map<string, any>();

      apiData.per_diem_expense_items?.forEach(exp => {
        const key = exp.meal_date;
        if (!perDiemMap.has(key)) {
          const expenseCodeId = typeof exp.expense_code === 'number' 
            ? exp.expense_code 
            : exp.expense_code?.id || null;
          
          perDiemMap.set(key, {
            program: exp.program,
            category: exp.expense_category || null, // Use the saved category ID
            expenseCode: expenseCodeId,
            mealDate: exp.meal_date,
            includeBreakfast: false,
            includeLunch: false,
            includeDinner: false,
            breakfastRate: '',
            lunchRate: '',
            dinnerRate: '',
            amount: '',
            description: exp.description || '',
          });
        }

        const item = perDiemMap.get(key);
        if (exp.meal_type === 'breakfast') {
          item.includeBreakfast = true;
          item.breakfastRate = exp.rate_amount.toString();
        } else if (exp.meal_type === 'lunch') {
          item.includeLunch = true;
          item.lunchRate = exp.rate_amount.toString();
        } else if (exp.meal_type === 'dinner') {
          item.includeDinner = true;
          item.dinnerRate = exp.rate_amount.toString();
        }
      });

      return Array.from(perDiemMap.values());
    })(),

    // Supporting documents
    supportingDocuments: apiData.supporting_documents?.map(doc => ({
      id: doc.id,
      documentType: doc.document_type as 'receipt' | 'invoice' | 'quote' | 'contract' | 'other',
      file: null, // File objects can't be reconstructed from server
      fileName: doc.file_name,
      fileSize: doc.file_size,
      fileUrl: doc.file_url, // Use file_url which is the absolute URL from serializer
      description: doc.description || '',
      uploadedDocumentId: doc.id,
      uploadedAt: doc.uploaded_at,
    })) || [],

    // Basic info - use created_at date since requisition_date doesn't exist in response
    requisitionDate: apiData.created_at ? new Date(apiData.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    payeeType,
    payeeId,
    payeeOther: typeof apiData.payee_other === 'string' ? apiData.payee_other : '',

    // Financial summary
    totalAmount: parseFloat(apiData.total_amount),
    gstAmount: parseFloat(apiData.gst_amount),
    totalWithTax: parseFloat(apiData.total_with_tax),
  };
}