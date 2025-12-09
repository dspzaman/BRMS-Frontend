import { useForm, useWatch, type FieldPath } from 'react-hook-form';
import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import type { RequisitionFormData } from '../model/types';
import { useAuth } from '@/shared/contexts/AuthContext';
import { getDefaultProgram } from '../utils/programUtils';
import { transformFormDataToAPI } from '../utils/transformers';
import { useSaveAsDraft, useUpdateDraft, useSubmitRequisition, useForwardRequisition } from '../api/useRequisitions';
import {
  validateGeneralExpenses,
  validateTravelExpenses,
  validatePerDiemExpenses,
  validateBasicInfo,
  validateSupportingDocuments,
  runValidations,
} from '../utils/validation';

interface UseRequisitionFormProps {
  mode: 'create' | 'edit';
  requisitionId?: number;
  initialData?: RequisitionFormData;
  onSuccess?: () => void;
}

export function useRequisitionForm({
  mode,
  requisitionId,
  initialData,
  onSuccess,
}: UseRequisitionFormProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const programs = user?.programs || [];
  const defaultProgram = getDefaultProgram(programs);

  // React Query mutations for save/update/submit/forward with cache invalidation
  const saveAsDraftMutation = useSaveAsDraft();
  const updateDraftMutation = useUpdateDraft();
  const submitRequisitionMutation = useSubmitRequisition();
  const forwardRequisitionMutation = useForwardRequisition();

  // Loading state for save operations
  const isSaving =
    saveAsDraftMutation.isPending ||
    updateDraftMutation.isPending ||
    submitRequisitionMutation.isPending ||
    forwardRequisitionMutation.isPending;

  // Initialize React Hook Form with default values or initial data
  const methods = useForm<RequisitionFormData>({
    defaultValues: initialData || {
      // Expense type toggles
      includeGeneralExpenses: true,
      includeTravelExpenses: false,
      includePerDiemExpenses: false,
      includeSupportingDocuments: false,

      // General expenses start with 1 empty row
      generalExpenses: [
        {
          program: defaultProgram,
          category: null,
          expenseCode: null,
          amount: '',
          gstRate: '',
          description: '',
          budget: null,
        },
      ],
      // Other expense types start empty
      travelExpenses: [],
      perDiemExpenses: [],
      supportingDocuments: [],

      // Basic info
      requisitionDate: new Date().toISOString().split('T')[0],
      payeeType: null,
      payeeId: null,
      payeeOther: '',

      // Comments (optional)
      comments: '',

      // Financial Summary (auto-calculated)
      totalAmount: 0,
      gstAmount: 0,
      totalWithTax: 0,
    },
    shouldUnregister: true,
  });

  // Reset form with initialData when it changes (for edit mode)
  useEffect(() => {
    if (initialData) {
      methods.reset(initialData);
    }
  }, [initialData, methods]);

  // Watch all expenses to auto-calculate totals
  const generalExpenses = useWatch({
    control: methods.control,
    name: 'generalExpenses',
    defaultValue: [],
  });
  const travelExpenses = useWatch({
    control: methods.control,
    name: 'travelExpenses',
    defaultValue: [],
  });
  const perDiemExpenses = useWatch({
    control: methods.control,
    name: 'perDiemExpenses',
    defaultValue: [],
  });

  // Auto-calculate financial totals (memoized for performance)
  const financialTotals = useMemo(() => {
    const generalExpensesValue = generalExpenses || [];
    const travelExpensesValue = travelExpenses || [];
    const perDiemExpensesValue = perDiemExpenses || [];

    // Calculate General Expenses
    const generalAmount = generalExpensesValue.reduce((sum, exp) => {
      const amount = parseFloat(String(exp.amount || 0));
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0);

    const generalGST = generalExpensesValue.reduce((sum, exp) => {
      const gst = parseFloat(String(exp.gstRate || 0));
      return sum + (isNaN(gst) ? 0 : gst);
    }, 0);

    // Calculate Travel Expenses
    const travelAmount = travelExpensesValue.reduce((sum, exp) => {
      const km = parseFloat(String(exp.totalKm || 0));
      const rate = parseFloat(String(exp.ratePerKm || 0));
      return sum + (isNaN(km) || isNaN(rate) ? 0 : km * rate);
    }, 0);

    const travelGST = travelExpensesValue.reduce((sum, exp) => {
      const gst = parseFloat(String(exp.gstAmount || 0));
      return sum + (isNaN(gst) ? 0 : gst);
    }, 0);

    // Calculate Per Diem Expenses
    const perDiemAmount = perDiemExpensesValue.reduce((sum, exp) => {
      let mealTotal = 0;

      if (exp.includeBreakfast) {
        const breakfastRate = parseFloat(String(exp.breakfastRate || 0));
        mealTotal += isNaN(breakfastRate) ? 0 : breakfastRate;
      }

      if (exp.includeLunch) {
        const lunchRate = parseFloat(String(exp.lunchRate || 0));
        mealTotal += isNaN(lunchRate) ? 0 : lunchRate;
      }

      if (exp.includeDinner) {
        const dinnerRate = parseFloat(String(exp.dinnerRate || 0));
        mealTotal += isNaN(dinnerRate) ? 0 : dinnerRate;
      }

      return sum + mealTotal;
    }, 0);

    // Per Diem has no GST
    const perDiemGST = 0;

    // Calculate Grand Totals
    const totalAmount = generalAmount + travelAmount + perDiemAmount;
    const gstAmount = generalGST + travelGST + perDiemGST;
    const totalWithTax = totalAmount + gstAmount;

    return { totalAmount, gstAmount, totalWithTax };
  }, [generalExpenses, travelExpenses, perDiemExpenses]);

  // Update form state when totals change
  useEffect(() => {
    methods.setValue('totalAmount', financialTotals.totalAmount);
    methods.setValue('gstAmount', financialTotals.gstAmount);
    methods.setValue('totalWithTax', financialTotals.totalWithTax);
  }, [financialTotals, methods]);

  // Watch expense type checkboxes
  const includeGeneralExpenses = methods.watch('includeGeneralExpenses');
  const includeTravelExpenses = methods.watch('includeTravelExpenses');
  const includePerDiemExpenses = methods.watch('includePerDiemExpenses');
  const includeSupportingDocuments = methods.watch('includeSupportingDocuments');

  // Clear expense arrays when checkboxes are unchecked to prevent validation errors
  useEffect(() => {
    if (!includeGeneralExpenses && generalExpenses && generalExpenses.length > 0) {
      methods.setValue('generalExpenses', []);
    }
  }, [includeGeneralExpenses, generalExpenses, methods]);

  useEffect(() => {
    if (includeTravelExpenses === false && travelExpenses && travelExpenses.length > 0) {
      methods.setValue('travelExpenses', []);
    }
  }, [includeTravelExpenses, travelExpenses, methods]);

  useEffect(() => {
    if (includePerDiemExpenses === false && perDiemExpenses && perDiemExpenses.length > 0) {
      methods.setValue('perDiemExpenses', []);
    }
  }, [includePerDiemExpenses, perDiemExpenses, methods]);

  // Determine if we should show financial summary
  const showFinancialSummary =
    (includeGeneralExpenses && includeTravelExpenses) ||
    (includeTravelExpenses && includePerDiemExpenses);

  // Shared validation used by Submit and Forward
  const validateBeforeAction = async (): Promise<{
    ok: boolean;
    formData?: RequisitionFormData;
  }> => {
    // 1) Build the list of fields to validate
    const fieldsToValidate: FieldPath<RequisitionFormData>[] = [
      'requisitionDate',
      'payeeType',
      'payeeId',
      'payeeOther',
      'comments',
    ];

    if (includeGeneralExpenses) {
      fieldsToValidate.push('generalExpenses');
    }
    if (includeTravelExpenses) {
      fieldsToValidate.push('travelExpenses');
    }
    if (includePerDiemExpenses) {
      fieldsToValidate.push('perDiemExpenses');
    }
    if (includeSupportingDocuments) {
      fieldsToValidate.push('supportingDocuments');
    }

    const isValid = await methods.trigger(fieldsToValidate);

    if (!isValid) {
      toast.error('Please fix all validation errors before continuing');
      return { ok: false };
    }

    // 2) Run custom validations
    const validationError = runValidations([
      () => validateGeneralExpenses(includeGeneralExpenses, methods.getValues),
      () => validateTravelExpenses(includeTravelExpenses, methods.getValues),
      () => validatePerDiemExpenses(includePerDiemExpenses, methods.getValues),
      () => validateBasicInfo(methods.getValues),
      () => validateSupportingDocuments(methods.getValues),
    ]);

    if (validationError) {
      toast.error(validationError);
      return { ok: false };
    }

    // 3) Check minimum amount ($20)
    const formData = methods.getValues();
    if (formData.totalWithTax < 20) {
      toast.error(
        `Requisition total must be at least $20.00. Current total: $${formData.totalWithTax.toFixed(
          2,
        )}`,
      );
      return { ok: false };
    }

    return { ok: true, formData };
  };

  // Handle save as draft (no validation required)
  const handleSaveAsDraft = async () => {
    try {
      const formData = methods.getValues();
      const apiData = transformFormDataToAPI(formData);

      // Collect files and existing document IDs from supporting documents
      const files: { index: number; file: File; documentType: string; description: string }[] = [];
      const existingDocumentIds: number[] = [];

      if (formData.supportingDocuments && formData.supportingDocuments.length > 0) {
        formData.supportingDocuments.forEach((doc, index) => {
          if (doc.file && doc.file instanceof File) {
            // New file to upload
            files.push({
              index,
              file: doc.file,
              documentType: doc.documentType || 'other',
              description: doc.description || '',
            });
          } else if (doc.id || doc.uploadedDocumentId) {
            // Existing document to preserve
            const docId = doc.id || doc.uploadedDocumentId;
            if (docId) {
              existingDocumentIds.push(docId);
            }
          }
        });
      }

      if (mode === 'edit' && requisitionId) {
        // Use React Query mutation for update
        await updateDraftMutation.mutateAsync({
          id: requisitionId,
          data: apiData,
          files: files.length > 0 ? files : undefined,
          existingDocumentIds,
        });
      } else {
        // Use React Query mutation for create
        await saveAsDraftMutation.mutateAsync({
          data: apiData,
          files: files.length > 0 ? files : undefined,
        });
      }

      // Call success callback or navigate
      if (onSuccess) {
        onSuccess();
      } else {
        navigate('/requisitions/my-requisitions');
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        (mode === 'edit' ? 'Failed to update requisition' : 'Failed to save draft');
      toast.error(`Error: ${errorMessage}`);
    }
  };

  // Handle submit (with validation)
  const handleSubmit = async () => {
    try {
      const { ok, formData } = await validateBeforeAction();
      if (!ok || !formData) return;

      // Transform form data to API format
      const apiData = transformFormDataToAPI(formData);

      // Collect files and existing document IDs from supporting documents
      const files: { index: number; file: File; documentType: string; description: string }[] = [];
      const existingDocumentIds: number[] = [];

      if (formData.supportingDocuments && formData.supportingDocuments.length > 0) {
        formData.supportingDocuments.forEach((doc, index) => {
          if (doc.file && doc.file instanceof File) {
            // New file to upload
            files.push({
              index,
              file: doc.file,
              documentType: doc.documentType || 'other',
              description: doc.description || '',
            });
          } else if (doc.id || doc.uploadedDocumentId) {
            // Existing document to preserve
            const docId = doc.id || doc.uploadedDocumentId;
            if (docId) {
              existingDocumentIds.push(docId);
            }
          }
        });
      }

      let requisitionToSubmit: number;

      // Step 1: Save/Update as draft first
      if (mode === 'edit' && requisitionId) {
        // Update existing draft
        const updated = await updateDraftMutation.mutateAsync({
          id: requisitionId,
          data: apiData,
          files: files.length > 0 ? files : undefined,
          existingDocumentIds,
        });
        requisitionToSubmit = updated.id;
      } else {
        // Create new draft
        const created = await saveAsDraftMutation.mutateAsync({
          data: apiData,
          files: files.length > 0 ? files : undefined,
        });
        requisitionToSubmit = created.id;
      }

      // Step 2: Submit the requisition with comments
      await submitRequisitionMutation.mutateAsync({
        id: requisitionToSubmit,
        comments: formData.comments || undefined,
      });

      // Success! Navigate to requisitions list
      toast.success('Requisition submitted successfully!');
      if (onSuccess) {
        onSuccess();
      } else {
        navigate('/requisitions/my-requisitions');
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.details ||
        error.response?.data?.message ||
        error.message ||
        'Failed to submit requisition';
      toast.error(`Error: ${errorMessage}`);
    }
  };

  // Handle forward (with validation)
  const handleForward = async () => {
    try {
      const { ok, formData } = await validateBeforeAction();
      if (!ok || !formData) return;

      // Transform form data to API format
      const apiData = transformFormDataToAPI(formData);

      // Collect files and existing document IDs from supporting documents
      const files: { index: number; file: File; documentType: string; description: string }[] = [];
      const existingDocumentIds: number[] = [];

      if (formData.supportingDocuments && formData.supportingDocuments.length > 0) {
        formData.supportingDocuments.forEach((doc, index) => {
          if (doc.file && doc.file instanceof File) {
            // New file to upload
            files.push({
              index,
              file: doc.file,
              documentType: doc.documentType || 'other',
              description: doc.description || '',
            });
          } else if (doc.id || doc.uploadedDocumentId) {
            // Existing document to preserve
            const docId = doc.id || doc.uploadedDocumentId;
            if (docId) {
              existingDocumentIds.push(docId);
            }
          }
        });
      }

      let requisitionToForward: number;

      // Step 1: Save/Update as draft first
      if (mode === 'edit' && requisitionId) {
        // Update existing draft
        const updated = await updateDraftMutation.mutateAsync({
          id: requisitionId,
          data: apiData,
          files: files.length > 0 ? files : undefined,
          existingDocumentIds,
        });
        requisitionToForward = updated.id;
      } else {
        // Create new draft
        const created = await saveAsDraftMutation.mutateAsync({
          data: apiData,
          files: files.length > 0 ? files : undefined,
        });
        requisitionToForward = created.id;
      }

      // Step 2: Forward the requisition with comments
      const forwardedRequisition = await forwardRequisitionMutation.mutateAsync({
        id: requisitionToForward,
        comments:
          formData.comments ||
          'Forwarded for submission - amount exceeds my submission threshold',
      });

      // Success! Show who it was forwarded to
      const assigneeName = forwardedRequisition.current_assignee_name || 'your supervisor';
      toast.success(`Requisition forwarded successfully to ${assigneeName} for submission!`);

      if (onSuccess) {
        onSuccess();
      } else {
        navigate('/requisitions/my-requisitions');
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.details ||
        error.response?.data?.message ||
        error.message ||
        'Failed to forward requisition';
      toast.error(`Error: ${errorMessage}`);
    }
  };

  // Initialize or clear expense arrays when toggling checkboxes
  useEffect(() => {
    const currentGeneralExpenses = methods.getValues('generalExpenses') || [];

    if (includeGeneralExpenses && currentGeneralExpenses.length === 0) {
      // Initialize with one empty row when checking
      methods.setValue('generalExpenses', [
        {
          program: defaultProgram,
          category: null,
          expenseCode: null,
          amount: '',
          gstRate: '',
          description: '',
          budget: null,
        },
      ]);
    } else if (!includeGeneralExpenses) {
      // Clear when unchecking
      methods.setValue('generalExpenses', []);
      methods.clearErrors('generalExpenses');
      methods.unregister('generalExpenses');
    }
  }, [includeGeneralExpenses, methods, defaultProgram]);

  useEffect(() => {
    if (includeTravelExpenses === false) {

      methods.setValue('travelExpenses', []);
      methods.setValue('includePerDiemExpenses', false);
      methods.setValue('perDiemExpenses', []);
    }
  }, [includeTravelExpenses, methods]);

  useEffect(() => {
    if (includePerDiemExpenses === false && includeTravelExpenses) {
      methods.setValue('perDiemExpenses', []);
    }
  }, [includePerDiemExpenses, includeTravelExpenses, methods]);

  useEffect(() => {
    if (!includeSupportingDocuments) {
      methods.setValue('supportingDocuments', []);
    }
  }, [includeSupportingDocuments, methods]);

  // Ensure at least one expense type is selected
  const isOnlyGeneralSelected = includeGeneralExpenses && !includeTravelExpenses;
  const isOnlyTravelSelected = !includeGeneralExpenses && includeTravelExpenses;

  return {
    methods,
    isSaving,
    includeGeneralExpenses,
    includeTravelExpenses,
    includePerDiemExpenses,
    includeSupportingDocuments,
    showFinancialSummary,
    isOnlyGeneralSelected,
    isOnlyTravelSelected,
    handleSaveAsDraft,
    handleSubmit,
    handleForward,
  };
}