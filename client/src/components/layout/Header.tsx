import { useState } from 'react';
import { useLocation, Link } from 'wouter';
import { Menu, RefreshCw, User, LogOut, Settings, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from '@/hooks/use-toast';

interface HeaderProps {
  username?: string;
  onMenuToggle?: () => void;
}

export default function Header({ username = "J. Smith", onMenuToggle }: HeaderProps) {
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const [syncing, setSyncing] = useState(false);
  
  const handleSync = () => {
    setSyncing(true);
    
    // Simulate sync operation
    setTimeout(() => {
      setSyncing(false);
      toast({
        title: "Sync Complete",
        description: "All data has been synchronized",
      });
    }, 1500);
  };

  const getCurrentTab = () => {
    if (location.startsWith('/inspections')) return 'inspections';
    if (location.startsWith('/investigations')) return 'investigations';
    if (location.startsWith('/schedule')) return 'schedule';
    if (location.startsWith('/reports')) return 'reports';
    return 'inspections';
  };

  return (
    <header className="bg-primary text-white shadow-md z-10">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            className="md:hidden mr-2 text-white hover:bg-primary-dark hover:text-white p-1"
            onClick={onMenuToggle}
          >
            <Menu />
          </Button>
          <h1 className="text-xl font-medium">ComplianceWorks</h1>
        </div>
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            className="mr-3 text-white hover:bg-primary-dark hover:text-white"
            onClick={handleSync}
            disabled={syncing}
          >
            <RefreshCw className={`mr-1 h-5 w-5 ${syncing ? 'animate-spin' : ''}`} />
            <span className="ml-1 text-sm hidden md:inline">Sync</span>
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="text-white hover:bg-primary-dark hover:text-white">
                <User className="mr-1 h-5 w-5" />
                <span className="ml-1 text-sm hidden md:inline">{username}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      {/* Tab Navigation */}
      <div className="hidden md:block px-4 pt-2">
        <Tabs defaultValue={getCurrentTab()} className="w-full" onValueChange={(value) => navigate(`/${value}`)}>
          <TabsList className="bg-transparent">
            <TabsTrigger 
              value="inspections"
              className="data-[state=active]:bg-transparent data-[state=active]:text-white data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-white data-[state=active]:rounded-none data-[state=inactive]:text-white/70 data-[state=inactive]:bg-transparent px-4 py-2 text-white"
            >
              Inspections
            </TabsTrigger>
            <TabsTrigger 
              value="investigations"
              className="data-[state=active]:bg-transparent data-[state=active]:text-white data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-white data-[state=active]:rounded-none data-[state=inactive]:text-white/70 data-[state=inactive]:bg-transparent px-4 py-2 text-white"
            >
              Investigations
            </TabsTrigger>
            <TabsTrigger 
              value="schedule"
              className="data-[state=active]:bg-transparent data-[state=active]:text-white data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-white data-[state=active]:rounded-none data-[state=inactive]:text-white/70 data-[state=inactive]:bg-transparent px-4 py-2 text-white"
            >
              Schedule
            </TabsTrigger>
            <TabsTrigger 
              value="reports"
              className="data-[state=active]:bg-transparent data-[state=active]:text-white data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-white data-[state=active]:rounded-none data-[state=inactive]:text-white/70 data-[state=inactive]:bg-transparent px-4 py-2 text-white"
            >
              Reports
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </header>
  );
}
