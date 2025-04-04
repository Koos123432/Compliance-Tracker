import { useState } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Filter, Car } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import Header from '@/components/layout/Header';
import BottomNavigation from '@/components/layout/BottomNavigation';
import StatusBar from '@/components/StatusBar';
import InspectionCard from '@/components/InspectionCard';
import QuickActions from '@/components/QuickActions';
import ActivityFeed from '@/components/ActivityFeed';
import NotificationPanel from '@/components/NotificationPanel';
import TeamSchedulePanel from '@/components/TeamSchedulePanel';
import CompactLayout from '@/components/CompactLayout';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

export default function Dashboard() {
  const [_, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [inCarMode, setInCarMode] = useState(false);
  const { toast } = useToast();
  
  const { data: inspections, isLoading } = useQuery({
    queryKey: ['/api/inspections'],
  });
  
  const handleSync = () => {
    toast({
      title: "Syncing Data",
      description: "Synchronizing with the server...",
    });
    
    // Refresh the queries
    window.location.reload();
  };
  
  const filteredInspections = inspections
    ? inspections.filter(
        (inspection) =>
          inspection.inspectionNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
          inspection.siteAddress.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];
  
  // Toggle for in-car mode
  const toggleInCarMode = () => {
    setInCarMode(prevState => !prevState);
    toast({
      title: inCarMode ? "Standard Mode Activated" : "In-Car Mode Activated",
      description: inCarMode 
        ? "Returning to standard interface" 
        : "Interface optimized for in-car use with audio alerts",
    });
  };

  // Render the compact in-car mode layout
  if (inCarMode) {
    return (
      <div className="flex flex-col min-h-screen">
        <div className="bg-black p-2 flex justify-between items-center">
          <h1 className="text-white font-bold">Compliance Officer</h1>
          <div className="flex items-center space-x-2">
            <Label htmlFor="car-mode-toggle" className="text-white text-xs">
              In-Car Mode
            </Label>
            <Switch
              id="car-mode-toggle"
              checked={inCarMode}
              onCheckedChange={toggleInCarMode}
            />
          </div>
        </div>
        
        <div className="flex-1 bg-black">
          <CompactLayout />
        </div>
      </div>
    );
  }

  // Render the standard layout
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1 container mx-auto p-4 pb-20 md:pb-4">
        <StatusBar />
        
        {/* In-car mode toggle */}
        <div className="flex justify-end mb-2">
          <div className="flex items-center space-x-2">
            <Car className="h-4 w-4 text-gray-500" />
            <Label htmlFor="car-mode-toggle" className="text-sm text-gray-700">
              In-Car Mode
            </Label>
            <Switch
              id="car-mode-toggle"
              checked={inCarMode}
              onCheckedChange={toggleInCarMode}
            />
          </div>
        </div>
        
        {/* Notification Panel */}
        <NotificationPanel />
        
        {/* Team Schedule Panel */}
        <TeamSchedulePanel />
        
        <Card className="mb-4">
          <CardHeader className="px-4 py-3 border-b border-gray-200 flex flex-row justify-between items-center">
            <CardTitle className="text-base font-medium">Upcoming Inspections</CardTitle>
            <div className="flex items-center">
              <div className="relative mr-2">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search"
                  className="pl-8 pr-2 py-1 h-9 text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-700">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="p-0">
            {isLoading ? (
              <>
                {[1, 2, 3].map((i) => (
                  <div key={i} className="border-b border-gray-200 p-4">
                    <Skeleton className="h-4 w-32 mb-2" />
                    <Skeleton className="h-5 w-64 mb-2" />
                    <Skeleton className="h-4 w-40" />
                  </div>
                ))}
              </>
            ) : filteredInspections.length > 0 ? (
              filteredInspections.map((inspection) => (
                <InspectionCard key={inspection.id} inspection={inspection} />
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">
                {searchQuery
                  ? "No inspections match your search"
                  : "No upcoming inspections found"}
              </div>
            )}
          </CardContent>
        </Card>
        
        <QuickActions onSyncData={handleSync} />
        
        <ActivityFeed />
      </main>
      
      <BottomNavigation onCreateNew={() => navigate('/inspections/new')} />
    </div>
  );
}
