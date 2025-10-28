import { useFormContext } from "react-hook-form";
import type { RequisitionFormData } from "../../model/types";
import { useState } from "react";

interface SupportingDocumentRowProps {
  index: number;
  onRemove: () => void;
  canRemove: boolean;
  requisitionId?: number;  // For upload after draft save
}

export function SupportingDocumentRow({ 
  index, 
  onRemove, 
  canRemove,
  requisitionId 
}: SupportingDocumentRowProps) {
  const { register, watch, setValue, formState: { errors } } = useFormContext<RequisitionFormData>();
  const [filePreview, setFilePreview] = useState<string | null>(null);
  
  // Watch the file to show preview
  const selectedFile = watch(`supportingDocuments.${index}.file`);
  const fileName = watch(`supportingDocuments.${index}.fileName`);
  
  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setValue(`supportingDocuments.${index}.file`, file);
      setValue(`supportingDocuments.${index}.fileName`, file.name);
      setValue(`supportingDocuments.${index}.fileSize`, file.size);
      
      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFilePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setFilePreview(null);
      }
    }
  };
  
  // Format file size
  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="border border-gray-300 rounded-lg p-4 bg-white shadow-sm">
      {/* Row Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700">
          Document #{index + 1}
        </h3>
        {canRemove && (
          <button 
            type="button" 
            onClick={onRemove}
            className="text-red-600 hover:text-red-800 text-sm font-medium"
          >
            Remove
          </button>
        )}
      </div>

      {/* Form Fields */}
      <div className="space-y-3">
        {/* Row 1: Document Type, File Upload, and Description */}
        <div className="grid grid-cols-3 gap-3">
          {/* Document Type */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Document Type <span className="text-red-500">*</span>
            </label>
            <select 
              {...register(`supportingDocuments.${index}.documentType`, {
                required: "Document type is required",
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ems-green-500 focus:border-ems-green-500"
            >
              <option value="receipt">Receipt</option>
              <option value="invoice">Invoice</option>
              <option value="quote">Quote</option>
              <option value="contract">Contract</option>
              <option value="other">Other</option>
            </select>
            {errors.supportingDocuments?.[index]?.documentType && (
              <p className="mt-1 text-xs text-red-600">
                {errors.supportingDocuments[index]?.documentType?.message}
              </p>
            )}
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              File <span className="text-red-500">*</span>
            </label>
            <input 
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
              onChange={handleFileChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ems-green-500 focus:border-ems-green-500"
            />
            {errors.supportingDocuments?.[index]?.file && (
              <p className="mt-1 text-xs text-red-600">
                {errors.supportingDocuments[index]?.file?.message}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Description (Optional)
            </label>
            <input 
              type="text"
              {...register(`supportingDocuments.${index}.description`)}
              placeholder="Brief description"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ems-green-500 focus:border-ems-green-500"
            />
          </div>
        </div>

        {/* File Preview/Info */}
        {fileName && (
          <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
            <div className="flex items-start gap-3">
              {/* File Icon/Preview */}
              <div className="flex-shrink-0">
                {filePreview ? (
                  <img 
                    src={filePreview} 
                    alt="Preview" 
                    className="w-16 h-16 object-cover rounded border border-gray-300"
                  />
                ) : (
                  <div className="w-16 h-16 bg-gray-200 rounded border border-gray-300 flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>
              
              {/* File Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {fileName}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {formatFileSize(watch(`supportingDocuments.${index}.fileSize`))}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}