import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { AlertTriangle, Clock, MapPin, Check, X } from 'lucide-react';
import { useWebSocketContext } from '@/context/WebSocketContext';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';

const InCarModeLayout = () => {
  const [audioEnabled, setAudioEnabled] = useState(true);
  const { toast } = useToast();
  const { connectionState, sendMessage, lastMessage } = useWebSocketContext();

  // Fetch active jobs for the current user (hardcoded to 1 for demo)
  const { data: activeJobs = [], refetch: refetchJobs } = useQuery({
    queryKey: ['/api/users/1/assignments'],
    queryFn: () => fetch('/api/users/1/assignments').then(res => res.json()),
  });

  // Play sound based on priority
  const playSoundAlert = (priority: string) => {
    if (!audioEnabled) return;
    
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    // Set properties based on priority
    switch (priority) {
      case 'high':
        // High priority: Higher pitch, urgent pattern
        oscillator.type = 'square';
        oscillator.frequency.value = 800;
        gainNode.gain.value = 0.5;
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.start();
        
        // Create an urgent pattern
        setTimeout(() => {
          oscillator.frequency.value = 1000;
          setTimeout(() => {
            oscillator.frequency.value = 800;
            setTimeout(() => {
              oscillator.frequency.value = 1000;
              setTimeout(() => {
                oscillator.stop();
              }, 200);
            }, 200);
          }, 200);
        }, 200);
        break;
        
      case 'medium':
        // Medium priority: Medium pitch, double beep
        oscillator.type = 'sine';
        oscillator.frequency.value = 600;
        gainNode.gain.value = 0.3;
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.start();
        
        // Create a double beep
        setTimeout(() => {
          oscillator.stop();
          
          // Second beep after a short pause
          setTimeout(() => {
            const osc2 = audioContext.createOscillator();
            osc2.type = 'sine';
            osc2.frequency.value = 600;
            osc2.connect(gainNode);
            osc2.start();
            setTimeout(() => {
              osc2.stop();
            }, 200);
          }, 100);
        }, 200);
        break;
        
      case 'low':
        // Low priority: Lower pitch, single beep
        oscillator.type = 'sine';
        oscillator.frequency.value = 400;
        gainNode.gain.value = 0.2;
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.start();
        
        // Single beep
        setTimeout(() => {
          oscillator.stop();
        }, 300);
        break;
        
      default:
        // Default notification sound
        oscillator.type = 'sine';
        oscillator.frequency.value = 500;
        gainNode.gain.value = 0.2;
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.start();
        setTimeout(() => {
          oscillator.stop();
        }, 200);
    }
  };

  // Listen for WebSocket messages about new assignments
  useEffect(() => {
    if (connectionState === 'open') {
      // Subscribe to assignments channel
      sendMessage({
        type: 'subscribe',
        entity: 'assignments',
        entityId: 1 // Hardcoded user ID for demo
      });
      
      console.log('Subscribed to assignments updates in car mode');
      
      return () => {
        // Unsubscribe when component unmounts
        sendMessage({
          type: 'unsubscribe',
          entity: 'assignments',
          entityId: 1
        });
        console.log('Unsubscribed from assignments in car mode');
      };
    }
  }, [connectionState, sendMessage]);
  
  // Handle incoming WebSocket messages
  useEffect(() => {
    if (lastMessage && lastMessage.type === 'assignment' && lastMessage.action === 'new') {
      console.log('Received new assignment in car mode:', lastMessage);
      playSoundAlert(lastMessage.data?.priority || 'medium');
      refetchJobs();
    }
  }, [lastMessage, refetchJobs]);
  
  // Handler to mark job complete
  const handleJobComplete = async (jobId: number) => {
    try {
      const response = await fetch(`/api/assignments/${jobId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'completed' }),
      });
      
      if (response.ok) {
        refetchJobs();
        toast({
          title: 'Job marked as completed',
          description: 'Job status has been updated',
        });
      } else {
        throw new Error('Failed to update job status');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Could not update job status',
        variant: 'destructive',
      });
    }
  };

  // Handler to decline job
  const handleJobDecline = async (jobId: number) => {
    try {
      const response = await fetch(`/api/assignments/${jobId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'declined' }),
      });
      
      if (response.ok) {
        refetchJobs();
        toast({
          title: 'Job declined',
          description: 'Job has been declined and will be reassigned',
        });
      } else {
        throw new Error('Failed to decline job');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Could not decline job',
        variant: 'destructive',
      });
    }
  };

  // Get the priority badge with appropriate styling
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive" className="text-xs">High Priority</Badge>;
      case 'medium':
        return <Badge variant="default" className="text-xs">Medium Priority</Badge>;
      case 'low':
        return <Badge variant="outline" className="text-xs">Low Priority</Badge>;
      default:
        return <Badge className="text-xs">{priority}</Badge>;
    }
  };

  return (
    <div className="bg-black text-white p-3 max-w-full h-full">
      <div className="flex justify-between items-center mb-3">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-green-500 bg-clip-text text-transparent">In-Car Mode</h1>
        
        <div className="flex items-center space-x-2">
          <Switch
            id="audio-toggle"
            checked={audioEnabled}
            onCheckedChange={setAudioEnabled}
          />
          <Label htmlFor="audio-toggle" className="text-xs">Audio Alerts</Label>
        </div>
      </div>
      
      <div className="grid gap-3">
        {Array.isArray(activeJobs) && activeJobs.length > 0 ? (
          activeJobs.map((job: any) => (
            <Card key={job.id} className="bg-gray-900 border-gray-800">
              <CardHeader className="pb-2 pt-3 px-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg text-white">{job.title}</CardTitle>
                  {getPriorityBadge(job.priority)}
                </div>
              </CardHeader>
              <CardContent className="pt-0 px-3 pb-3">
                <div className="grid gap-1 text-gray-300 text-xs">
                  <div className="flex items-center">
                    <Clock className="h-3 w-3 mr-1 text-gray-500" />
                    {format(new Date(job.scheduledDate), 'MMM d, h:mm a')}
                  </div>
                  
                  {job.location && (
                    <div className="flex items-center">
                      <MapPin className="h-3 w-3 mr-1 text-gray-500" />
                      {job.location}
                    </div>
                  )}
                  
                  {job.description && (
                    <p className="mt-1 text-gray-400 text-xs line-clamp-2">
                      {job.description}
                    </p>
                  )}
                </div>
                
                <div className="flex justify-between mt-3">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs border-gray-700 bg-gray-800 hover:bg-gray-700"
                    onClick={() => handleJobDecline(job.id)}
                  >
                    <X className="h-3 w-3 mr-1" /> Decline
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="default"
                    className="h-8 text-xs"
                    onClick={() => handleJobComplete(job.id)}
                  >
                    <Check className="h-3 w-3 mr-1" /> Complete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center bg-gray-900 rounded-md p-5 text-center">
            <AlertTriangle className="h-10 w-10 text-gray-500 mb-2" />
            <p className="text-gray-400">No active jobs assigned to you</p>
            <p className="text-xs text-gray-500 mt-1">
              New jobs will appear here when assigned
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InCarModeLayout;