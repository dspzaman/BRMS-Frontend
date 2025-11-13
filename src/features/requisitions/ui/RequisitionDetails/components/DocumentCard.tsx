// src/features/requisitions/ui/RequisitionDetails/components/DocumentCard.tsx
import type { SupportingDocumentResponse } from '../../../api/types';

interface DocumentCardProps {
  document: SupportingDocumentResponse;
}

export function DocumentCard({ document }: DocumentCardProps) {
  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return '📄';
    if (['jpg', 'jpeg', 'png', 'gif'].includes(ext || '')) return '🖼️';
    if (['doc', 'docx'].includes(ext || '')) return '📝';
    if (['xls', 'xlsx'].includes(ext || '')) return '📊';
    return '📎';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };


  // Get document type display
  const documentTypeDisplay = {
    'invoice': 'Invoice',
    'receipt': 'Receipt',
    'quote': 'Quote',
    'other': 'Other'
  }[document.document_type] || document.document_type;

  return (
    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
      <div className="flex items-center gap-3">
        <div className="text-2xl">{getFileIcon(document.file_name || '')}</div>
        <div>
          <p className="font-medium text-gray-900">{document.file_name}</p>
          <p className="text-sm text-gray-500">
            {documentTypeDisplay} • {formatFileSize(document.file_size || 0)} • Uploaded {formatDate(document.uploaded_at)}
          </p>
          {document.description && (
            <p className="text-xs text-gray-500 mt-1">{document.description}</p>
          )}
        </div>
      </div>
      {document.file_url ? (
        <a 
          href={document.file_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-ems-green-600 hover:text-ems-green-700 transition-colors"
        >
          Download
        </a>
      ) : (
        <span className="text-sm font-medium text-gray-400 cursor-not-allowed">
          Download
        </span>
      )}
    </div>
  );
}
