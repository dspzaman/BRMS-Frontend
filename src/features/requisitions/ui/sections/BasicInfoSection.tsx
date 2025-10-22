// src/features/requisitions/ui/sections/BasicInfoSection.tsx

export function BasicInfoSection() {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Basic Information
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Requisition date and payee information
          </p>
        </div>
      </div>

      {/* Placeholder Content */}
      <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <p className="text-gray-500">Basic information section - Coming soon</p>
      </div>
    </div>
  );
}