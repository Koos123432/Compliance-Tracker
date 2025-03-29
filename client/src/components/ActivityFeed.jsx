import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckSquare, AlertTriangle, Mail } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';

interface ActivityItem {
  id: number;
  userId: number;
  activityType: string;
  description: string;
  entityId?: number;
  entityType?: string;
  createdAt: Date;
}

export default function ActivityFeed() {
  const { data: activities, isLoading } = useQuery<ActivityItem[]>({ 
    queryKey: ['/api/activities'] 
  });
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-start mb-4">
              <Skeleton className="h-10 w-10 rounded-full mr-3" />
              <div className="flex-1">
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }
  
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'complete_inspection':
      case 'create_inspection':
      case 'update_inspection':
        return (
          <div className="bg-primary rounded-full p-2 mr-3">
            <CheckSquare className="text-white h-4 w-4" />
          </div>
        );
      case 'document_breach':
      case 'create_breach':
      case 'update_breach':
        return (
          <div className="bg-amber-500 rounded-full p-2 mr-3">
            <AlertTriangle className="text-white h-4 w-4" />
          </div>
        );
      case 'send_report':
      case 'create_report':
        return (
          <div className="bg-blue-500 rounded-full p-2 mr-3">
            <Mail className="text-white h-4 w-4" />
          </div>
        );
      default:
        return (
          <div className="bg-gray-500 rounded-full p-2 mr-3">
            <CheckSquare className="text-white h-4 w-4" />
          </div>
        );
    }
  };
  
  const formatDate = (date: Date) => {
    const today = new Date();
    const activityDate = new Date(date);
    
    if (activityDate.toDateString() === today.toDateString()) {
      return `Today, ${format(activityDate, 'h:mm a')}`;
    }
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (activityDate.toDateString() === yesterday.toDateString()) {
      return `Yesterday, ${format(activityDate, 'h:mm a')}`;
    }
    
    return format(activityDate, 'MMM d, h:mm a');
  };
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {activities?.slice(0, 5).map((activity) => (
          <div key={activity.id} className="flex items-start mb-4 last:mb-0">
            {getActivityIcon(activity.activityType)}
            <div>
              <p className="text-sm">{activity.description}</p>
              <p className="text-xs text-gray-500">{formatDate(activity.createdAt)}</p>
            </div>
          </div>
        ))}
        
        {activities?.length === 0 && (
          <p className="text-sm text-gray-500 text-center py-4">No recent activities</p>
        )}
      </CardContent>
    </Card>
  );
}
