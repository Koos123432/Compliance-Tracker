import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Calendar, FileText, RefreshCw } from 'lucide-react';

interface QuickActionsProps {
  onSyncData?: () => void;
}

export default function QuickActions({ onSyncData }: QuickActionsProps) {
  const [_, navigate] = useLocation();
  
  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Button
            variant="outline"
            className="flex flex-col items-center justify-center p-3 h-auto border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            onClick={() => navigate('/inspections/new')}
          >
            <PlusCircle className="h-6 w-6 text-primary mb-2" />
            <span className="text-sm">New Inspection</span>
          </Button>
          
          <Button
            variant="outline"
            className="flex flex-col items-center justify-center p-3 h-auto border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            onClick={() => navigate('/schedule')}
          >
            <Calendar className="h-6 w-6 text-primary mb-2" />
            <span className="text-sm">Schedule</span>
          </Button>
          
          <Button
            variant="outline"
            className="flex flex-col items-center justify-center p-3 h-auto border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            onClick={() => navigate('/reports')}
          >
            <FileText className="h-6 w-6 text-primary mb-2" />
            <span className="text-sm">Reports</span>
          </Button>
          
          <Button
            variant="outline"
            className="flex flex-col items-center justify-center p-3 h-auto border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            onClick={onSyncData}
          >
            <RefreshCw className="h-6 w-6 text-primary mb-2" />
            <span className="text-sm">Sync Data</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
