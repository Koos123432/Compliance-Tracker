import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Notification } from '@shared/schema';
import { 
  Bell,
  AlertTriangle,
  Calendar,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  X
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

export default function NotificationPanel() {
  const [isExpanded, setIsExpanded] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const userId = 1; // For now, hardcode to the first user

  const { data: notifications, isLoading } = useQuery<Notification[]>({
    queryKey: ['/api/users', userId, 'notifications'],
    queryFn: () => apiRequest(`/api/users/${userId}/notifications`),
  });

  const { data: unreadNotifications, isLoading: isLoadingUnread } = useQuery<Notification[]>({
    queryKey: ['/api/users', userId, 'notifications', 'unread'],
    queryFn: () => apiRequest(`/api/users/${userId}/notifications/unread`),
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: number) => 
      apiRequest(`/api/notifications/${notificationId}/read`, {
        method: 'PATCH'
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users', userId, 'notifications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/users', userId, 'notifications', 'unread'] });
    }
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: async (notificationId: number) => 
      apiRequest(`/api/notifications/${notificationId}`, {
        method: 'DELETE'
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users', userId, 'notifications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/users', userId, 'notifications', 'unread'] });
      toast({
        title: "Notification deleted",
        description: "The notification has been removed"
      });
    }
  });

  const handleMarkAsRead = (notificationId: number) => {
    markAsReadMutation.mutate(notificationId);
  };

  const handleDelete = (notificationId: number) => {
    deleteNotificationMutation.mutate(notificationId);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'dispatch':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'schedule':
        return <Calendar className="h-5 w-5 text-blue-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 hover:bg-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  return (
    <Card className="mb-4">
      <CardHeader className="px-4 py-3 border-b border-gray-200 flex flex-row justify-between items-center cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex items-center">
          <Bell className="mr-2 h-5 w-5 text-blue-500" />
          <CardTitle className="text-base font-medium">Notifications</CardTitle>
          {!isLoadingUnread && unreadNotifications && unreadNotifications.length > 0 && (
            <Badge variant="secondary" className="ml-2 bg-red-100 text-red-800">
              {unreadNotifications.length} New
            </Badge>
          )}
        </div>
        <Button variant="ghost" size="sm" className="p-0 h-8 w-8">
          {isExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="p-0 divide-y divide-gray-100">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">Loading notifications...</div>
          ) : notifications && notifications.length > 0 ? (
            notifications.map((notification: Notification) => (
              <div key={notification.id} 
                className={cn("p-3 flex items-start", 
                  !notification.isRead ? "bg-blue-50" : ""
                )}>
                <div className="mr-3 mt-1">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <h4 className="font-medium text-sm">{notification.title}</h4>
                    <div className="flex">
                      {!notification.isRead && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6 text-blue-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkAsRead(notification.id);
                          }}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      )}
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 text-gray-400 hover:text-gray-500"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(notification.id);
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">{notification.message}</p>
                  <div className="flex items-center text-xs text-gray-500 mt-1">
                    <span className="mr-2">
                      {format(new Date(notification.createdAt), 'MMM d, h:mm a')}
                    </span>
                    {notification.priority && (
                      <Badge variant="outline" className={cn("text-xs font-normal", getPriorityColor(notification.priority))}>
                        {notification.priority}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-4 text-center text-gray-500">No notifications found</div>
          )}
        </CardContent>
      )}
    </Card>
  );
}