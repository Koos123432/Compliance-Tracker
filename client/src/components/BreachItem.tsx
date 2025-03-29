import { useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';
import { format } from 'date-fns';

interface BreachItemProps {
  breach: {
    id: number;
    title: string;
    description: string;
    legislation?: string;
    daConditionNumber?: string;
    recommendedAction?: string;
    resolutionDeadline?: Date;
    severity: string;
    status: string;
    inspectionId: number;
    photoUrl?: string;
  };
}

export default function BreachItem({ breach }: BreachItemProps) {
  const [_, navigate] = useLocation();
  
  // Placeholder image if no photo is provided
  const photoUrl = breach.photoUrl || 'https://placehold.co/100x100?text=No+Photo';
  
  const getSeverityClass = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'minor':
        return 'text-green-600';
      case 'moderate':
        return 'text-amber-600';
      case 'major':
        return 'text-orange-600';
      case 'critical':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };
  
  const formatDate = (date?: Date) => {
    if (!date) return 'Not specified';
    return format(new Date(date), 'MMM d, yyyy');
  };
  
  return (
    <Card className="bg-gray-50 mb-3 border border-gray-200">
      <CardContent className="p-3">
        <div className="flex items-start">
          <div className="w-16 h-16 mr-3 flex-shrink-0">
            <img 
              src={photoUrl} 
              alt="Breach photo" 
              className="w-full h-full object-cover rounded-md"
            />
          </div>
          <div className="flex-1">
            <div className="flex justify-between">
              <p className="font-medium">{breach.title}</p>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => navigate(`/inspections/${breach.inspectionId}/breaches/${breach.id}`)}
              >
                <Edit className="h-4 w-4 text-gray-500" />
              </Button>
            </div>
            
            {breach.legislation && (
              <p className="text-sm text-gray-500">Legislation: {breach.legislation}</p>
            )}
            
            {breach.daConditionNumber && (
              <p className="text-sm text-gray-500">DA Condition: {breach.daConditionNumber}</p>
            )}
            
            <p className="text-sm mt-1">{breach.description}</p>
            
            {breach.resolutionDeadline && (
              <p className="text-sm mt-1">
                <span className="font-medium">Deadline:</span> {formatDate(breach.resolutionDeadline)}
              </p>
            )}
            
            <p className="text-sm mt-1">
              <span className="font-medium">Severity:</span> 
              <span className={getSeverityClass(breach.severity)}> {breach.severity}</span>
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
