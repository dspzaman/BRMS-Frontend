// src/features/requisitions/ui/sections/SupportingDocumentsSection.tsx

export function SupportingDocumentsSection() {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Supporting Documents
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Upload invoices, receipts, or other supporting documents
          </p>
        </div>
      </div>

      {/* Placeholder Content */}
      <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <p className="text-gray-500">Supporting documents section - Coming soon</p>
      </div>
    </div>
  );
}