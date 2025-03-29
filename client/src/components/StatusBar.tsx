import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

export default function StatusBar() {
  const { data: inspections, isLoading } = useQuery({
    queryKey: ['/api/inspections'],
  });
  
  const today = format(new Date(), 'MMMM d, yyyy');
  
  // Count inspections by status if data is available
  const assignedCount = inspections?.filter(i => i.status === 'scheduled').length || 0;
  const completedCount = inspections?.filter(i => i.status === 'completed').length || 0;
  const pendingCount = inspections?.filter(i => i.status === 'pending').length || 0;
  
  if (isLoading) {
    return (
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="flex justify-between items-center">
            <div>
              <Skeleton className="h-6 w-40 mb-1" />
              <Skeleton className="h-4 w-28" />
            </div>
            <div className="flex space-x-3">
              <Skeleton className="h-16 w-16" />
              <Skeleton className="h-16 w-16" />
              <Skeleton className="h-16 w-16" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-medium">Today's Inspections</h2>
            <p className="text-sm text-gray-500">{today}</p>
          </div>
          <div className="flex space-x-3">
            <div className="text-center">
              <span className="text-lg font-medium text-blue-500">{assignedCount}</span>
              <p className="text-xs text-gray-500">Assigned</p>
            </div>
            <div className="text-center">
              <span className="text-lg font-medium text-green-500">{completedCount}</span>
              <p className="text-xs text-gray-500">Completed</p>
            </div>
            <div className="text-center">
              <span className="text-lg font-medium text-amber-500">{pendingCount}</span>
              <p className="text-xs text-gray-500">Pending</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
