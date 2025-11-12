// src/features/requisitions/ui/RequisitionDetails/sections/SupportingDocumentsDisplay.tsx
import type { RequisitionResponse } from '../../../api/types';
import { DocumentCard } from '../components/DocumentCard';

interface SupportingDocumentsDisplayProps {
  requisition: RequisitionResponse;
}

export function SupportingDocumentsDisplay({ requisition }: SupportingDocumentsDisplayProps) {
  // Get supporting documents from requisition
  const documents = requisition.supporting_documents || [];
  const hasDocuments = documents.length > 0;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        📎 Supporting Documents ({documents.length})
      </h3>
      
      {hasDocuments ? (
        <div className="space-y-3">
          {documents.map((document) => (
            <DocumentCard key={document.id} document={document} />
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="text-gray-400 text-4xl mb-2">📄</div>
          <p className="text-gray-600">No supporting documents uploaded</p>
          <p className="text-sm text-gray-500 mt-1">Documents will appear here once uploaded</p>
        </div>
      )}
    </div>
  );
}
