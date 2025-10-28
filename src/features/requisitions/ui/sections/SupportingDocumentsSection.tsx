import { useFormContext, useFieldArray } from "react-hook-form";
import type { RequisitionFormData } from "../../model/types";
import { SupportingDocumentRow } from "../fields/SupportingDocumentRow";
import { EmptyState } from "../shared/EmptyState";

export function SupportingDocumentsSection() {
  const { control, watch } = useFormContext<RequisitionFormData>();
  
  // Manage array of supporting documents
  const { fields, append, remove } = useFieldArray({
    control,
    name: "supportingDocuments",
  });
  
  // Watch all documents to show count
  const supportingDocuments = watch("supportingDocuments");
  
  // Add new document row
  const handleAddDocument = () => {
    append({
      documentType: 'receipt',
      file: null,
      fileName: '',
      fileSize: 0,
      description: '',
    });
  };
  
  // Calculate total file size
  const calculateTotalSize = () => {
    if (!supportingDocuments || supportingDocuments.length === 0) {
      return '0 MB';
    }
    
    const totalBytes = supportingDocuments.reduce((sum, doc) => {
      return sum + (doc.fileSize || 0);
    }, 0);
    
    if (totalBytes < 1024 * 1024) {
      return (totalBytes / 1024).toFixed(1) + ' KB';
    }
    return (totalBytes / (1024 * 1024)).toFixed(1) + ' MB';
  };
  
  // Count uploaded files
  const uploadedCount = supportingDocuments?.filter(doc => doc.file !== null).length || 0;
  
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Supporting Documents
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Upload receipts, invoices, quotes, or other supporting documents
          </p>
        </div>
      </div>

      {/* Empty State */}
      {fields.length === 0 ? (
        <EmptyState
          title="No documents added yet"
          description="Add supporting documents like receipts, invoices, or quotes to support your requisition."
          buttonText="Add First Document"
          onAddClick={handleAddDocument}
          icon="document"
        />
      ) : (
        <>
          {/* Document Rows */}
          <div className="space-y-4 mb-4">
            {fields.map((field, index) => (
              <SupportingDocumentRow
                key={field.id}
                index={index}
                onRemove={() => remove(index)}
                canRemove={true} // Always allow removal for documents
              />
            ))}
          </div>

          {/* Summary Card */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex justify-between items-start">
              <div className="text-sm text-gray-600">
                Total Documents: <span className="font-medium text-gray-900">{fields.length}</span>
              </div>
              
              {/* Right side: Add link + Stats */}
              <div className="min-w-[400px]">
                <div className="flex justify-end mb-2">
                  <button
                    type="button"
                    onClick={handleAddDocument}
                    className="text-sm text-ems-green-600 hover:text-ems-green-700 font-medium"
                  >
                    + Add Another Document
                  </button>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-around gap-6">
                    <div className="text-center">
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Total</p>
                      <p className="text-2xl font-bold text-gray-900">{fields.length}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Uploaded</p>
                      <p className="text-2xl font-bold text-ems-green-600">{uploadedCount}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Total Size</p>
                      <p className="text-2xl font-bold text-gray-900">{calculateTotalSize()}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}