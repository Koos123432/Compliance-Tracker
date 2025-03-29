
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import Header from '../components/layout/Header';
import StatusBar from '../components/StatusBar';
import NotificationPanel from '../components/NotificationPanel';
import TeamSchedulePanel from '../components/TeamSchedulePanel';
import QuickActions from '../components/QuickActions';
import ActivityFeed from '../components/ActivityFeed';

function Dashboard() {
  const { data: stats } = useQuery({
    queryKey: ['stats'],
    queryFn: async () => {
      const response = await fetch('/api/stats');
      return response.json();
    }
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto p-4 space-y-6">
        <StatusBar stats={stats} />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <NotificationPanel />
          <TeamSchedulePanel />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <QuickActions />
          <div className="md:col-span-2">
            <ActivityFeed />
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
