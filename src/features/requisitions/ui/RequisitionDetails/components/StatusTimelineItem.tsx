// src/features/requisitions/ui/RequisitionDetails/components/StatusTimelineItem.tsx

interface StatusTimelineItemProps {
  status: string;
  date: string;
  user: string;
  comments?: string;
  isLast?: boolean;
}

export function StatusTimelineItem({ status, date, user, comments, isLast = false }: StatusTimelineItemProps) {
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div className="w-3 h-3 bg-ems-green-600 rounded-full"></div>
        {!isLast && <div className="w-0.5 h-full bg-gray-300"></div>}
      </div>
      <div className="flex-1 pb-4">
        <p className="font-medium text-gray-900">{status}</p>
        <p className="text-sm text-gray-600">{date} by {user}</p>
        {comments && (
          <p className="text-sm text-gray-500 italic mt-1">"{comments}"</p>
        )}
      </div>
    </div>
  );
}
