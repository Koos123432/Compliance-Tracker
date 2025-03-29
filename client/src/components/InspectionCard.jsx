import { useLocation } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Flag } from 'lucide-react';
import { Inspection } from '@shared/schema';
import { format } from 'date-fns';

interface InspectionCardProps {
  inspection: Inspection;
}

export default function InspectionCard({ inspection }: InspectionCardProps) {
  const [_, navigate] = useLocation();
  
  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'bg-amber-100 text-amber-800';
      case 'medium':
        return 'bg-blue-100 text-blue-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getPriorityIcon = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return <Flag className="text-sm text-amber-500 mr-1 h-4 w-4" />;
      case 'medium':
        return <Flag className="text-sm text-blue-500 mr-1 h-4 w-4" />;
      case 'low':
        return <Flag className="text-sm text-green-500 mr-1 h-4 w-4" />;
      default:
        return <Flag className="text-sm text-gray-500 mr-1 h-4 w-4" />;
    }
  };
  
  const formatTime = (date: Date) => {
    return format(new Date(date), 'h:mm a');
  };
  
  return (
    <Card className="border-b border-neutral-200 hover:bg-neutral-50 cursor-pointer mb-2" onClick={() => navigate(`/inspections/${inspection.id}`)}>
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center">
              {getPriorityIcon(inspection.priority)}
              <span className="text-sm font-medium">{inspection.inspectionNumber}</span>
            </div>
            <h4 className="font-medium mt-1">{inspection.siteAddress}</h4>
            <p className="text-sm text-gray-500 mt-1">
              Scheduled for {formatTime(inspection.inspectionDate)}
            </p>
          </div>
          <div className="flex flex-col items-end">
            <Badge className={`${getPriorityColor(inspection.priority)} capitalize`}>
              {inspection.priority} Priority
            </Badge>
            <Button 
              variant="link" 
              className="mt-2 text-primary text-sm p-0 h-auto" 
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/inspections/${inspection.id}`);
              }}
            >
              View Details
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
