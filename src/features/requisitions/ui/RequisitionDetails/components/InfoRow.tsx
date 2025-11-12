// src/features/requisitions/ui/RequisitionDetails/components/InfoRow.tsx

interface InfoRowProps {
  label: string;
  value: string | number | null | undefined;
  highlight?: boolean;
}

export function InfoRow({ label, value, highlight = false }: InfoRowProps) {
  return (
    <div className="flex justify-between py-2 border-b border-gray-100 last:border-0">
      <span className="text-gray-600 font-medium">{label}:</span>
      <span className={highlight ? 'font-bold text-ems-green-700' : 'text-gray-900'}>
        {value || 'N/A'}
      </span>
    </div>
  );
}
