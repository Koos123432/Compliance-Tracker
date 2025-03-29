import { useLocation } from 'wouter';
import { Home, FileText, Search, Calendar, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BottomNavigationProps {
  onCreateNew: () => void;
}

export default function BottomNavigation({ onCreateNew }: BottomNavigationProps) {
  const [location, navigate] = useLocation();

  return (
    <nav className="md:hidden bg-white border-t border-neutral-200 flex justify-around items-center py-2 elevation-1 fixed bottom-0 left-0 right-0 z-10">
      <Button
        variant="ghost"
        className={`flex flex-col items-center py-1 px-3 ${
          location === "/" ? "text-primary" : "text-secondary"
        }`}
        onClick={() => navigate("/")}
      >
        <Home size={20} />
        <span className="text-xs mt-1">Home</span>
      </Button>
      
      <Button
        variant="ghost"
        className={`flex flex-col items-center py-1 px-3 ${
          location.startsWith("/reports") ? "text-primary" : "text-secondary"
        }`}
        onClick={() => navigate("/reports")}
      >
        <FileText size={20} />
        <span className="text-xs mt-1">Reports</span>
      </Button>
      
      <Button
        variant="primary"
        onClick={onCreateNew}
        className="flex items-center justify-center p-0 w-12 h-12 rounded-full bg-primary text-white elevation-1"
      >
        <PlusCircle size={24} />
      </Button>
      
      <Button
        variant="ghost"
        className={`flex flex-col items-center py-1 px-3 ${
          location === "/search" ? "text-primary" : "text-secondary"
        }`}
        onClick={() => navigate("/search")}
      >
        <Search size={20} />
        <span className="text-xs mt-1">Search</span>
      </Button>
      
      <Button
        variant="ghost"
        className={`flex flex-col items-center py-1 px-3 ${
          location === "/schedule" ? "text-primary" : "text-secondary"
        }`}
        onClick={() => navigate("/schedule")}
      >
        <Calendar size={20} />
        <span className="text-xs mt-1">Schedule</span>
      </Button>
    </nav>
  );
}
