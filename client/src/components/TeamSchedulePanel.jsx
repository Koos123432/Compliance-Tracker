import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Team, TeamSchedule, TeamScheduleAssignment } from '@shared/schema';
import { 
  Users,
  Calendar,
  CheckCircle2,
  Clock,
  FileX,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  X
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

export default function TeamSchedulePanel() {
  const [isExpanded, setIsExpanded] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const userId = 1; // For now, hardcode to the first user

  // Add proper types and enable options
  const { data: teamsData, isLoading: isLoadingTeams } = useQuery({
    queryKey: ['/api/users', userId, 'teams'],
    queryFn: async () => {
      const response = await apiRequest(`/api/users/${userId}/teams`);
      return response as Team[];
    },
    enabled: true,
  });

  // The teams data properly typed
  const teams = Array.isArray(teamsData) ? teamsData : [];

  // Add proper types and enable options
  const { data: assignmentsData, isLoading: isLoadingAssignments } = useQuery({
    queryKey: ['/api/users', userId, 'assignments'],
    queryFn: async () => {
      const response = await apiRequest(`/api/users/${userId}/assignments`);
      return response as TeamScheduleAssignment[];
    },
    enabled: true,
  });

  // The assignments data properly typed
  const assignments = Array.isArray(assignmentsData) ? assignmentsData : [];

  // Track loaded team schedules
  const [teamSchedules, setTeamSchedules] = useState<Record<number, TeamSchedule[]>>({});

  const updateAssignmentMutation = useMutation({
    mutationFn: async ({ id, status, notes }: { id: number, status: string, notes?: string }) => 
      apiRequest(`/api/assignments/${id}/status`, {
        method: 'PATCH',
        body: { status, notes }
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users', userId, 'assignments'] });
      toast({
        title: "Schedule updated",
        description: "The schedule assignment has been updated"
      });
    }
  });

  const getScheduleDetails = (scheduleId: number) => {
    for (const teamId in teamSchedules) {
      const schedules = teamSchedules[Number(teamId)];
      if (schedules) {
        const schedule = schedules.find(s => s.id === scheduleId);
        if (schedule) return schedule;
      }
    }
    return null;
  };

  const handleAccept = (assignmentId: number) => {
    updateAssignmentMutation.mutate({ 
      id: assignmentId, 
      status: "accepted" 
    });
  };

  const handleDecline = (assignmentId: number) => {
    updateAssignmentMutation.mutate({ 
      id: assignmentId, 
      status: "declined",
      notes: "Unable to attend this schedule"
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'declined':
        return <FileX className="h-4 w-4 text-red-500" />;
      case 'pending':
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'accepted':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Accepted</Badge>;
      case 'declined':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Declined</Badge>;
      case 'pending':
      default:
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Pending</Badge>;
    }
  };

  // Fetch team schedules for each team the user belongs to
  useEffect(() => {
    const fetchTeamSchedules = async () => {
      if (teams && teams.length > 0) {
        const schedulesMap: Record<number, TeamSchedule[]> = {};
        
        for (const team of teams) {
          try {
            const response = await apiRequest(`/api/teams/${team.id}/schedules`);
            const schedules = Array.isArray(response) ? response : [];
            schedulesMap[team.id] = schedules;
          } catch (error) {
            console.error(`Failed to fetch schedules for team ${team.id}:`, error);
          }
        }
        
        setTeamSchedules(schedulesMap);
      }
    };
    
    if (teams.length > 0) {
      fetchTeamSchedules();
    }
  }, [teams]);

  const pendingAssignments = assignments.filter(assignment => 
    assignment.assignmentStatus === 'pending'
  );

  return (
    <Card className="mb-4">
      <CardHeader className="px-4 py-3 border-b border-gray-200 flex flex-row justify-between items-center cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex items-center">
          <Users className="mr-2 h-5 w-5 text-green-500" />
          <CardTitle className="text-base font-medium">Team Schedules</CardTitle>
          {pendingAssignments.length > 0 && (
            <Badge variant="secondary" className="ml-2 bg-yellow-100 text-yellow-800">
              {pendingAssignments.length} Pending
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
          {isLoadingAssignments || isLoadingTeams ? (
            <div className="p-4 text-center text-gray-500">Loading schedules...</div>
          ) : assignments.length > 0 ? (
            assignments.map((assignment) => {
              const schedule = getScheduleDetails(assignment.teamScheduleId);
              return (
                <div key={assignment.id} className="p-3">
                  <div className="flex items-start">
                    <div className="mr-3 mt-1">
                      <Calendar className="h-5 w-5 text-blue-500" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <h4 className="font-medium text-sm">{schedule?.title || 'Team Schedule'}</h4>
                        <div>
                          {getStatusBadge(assignment.assignmentStatus)}
                        </div>
                      </div>
                      
                      {schedule && (
                        <>
                          <p className="text-sm text-gray-600 mt-1">{schedule.description}</p>
                          <div className="flex items-center text-xs text-gray-500 mt-2">
                            <Calendar className="h-3 w-3 mr-1" />
                            <span className="mr-3">
                              {format(new Date(schedule.scheduledDate), 'MMM d, yyyy')}
                            </span>
                            <Clock className="h-3 w-3 mr-1" />
                            <span>
                              {format(new Date(schedule.scheduledDate), 'h:mm a')}
                            </span>
                          </div>
                        </>
                      )}
                      
                      {assignment.assignmentStatus === 'pending' && (
                        <div className="flex mt-3 space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="text-xs h-8 bg-green-100 text-green-800 hover:bg-green-200 border-green-200"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAccept(assignment.id);
                            }}
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Accept
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="text-xs h-8 bg-red-100 text-red-800 hover:bg-red-200 border-red-200"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDecline(assignment.id);
                            }}
                          >
                            <X className="h-3 w-3 mr-1" />
                            Decline
                          </Button>
                        </div>
                      )}
                      
                      {assignment.notes && (
                        <div className="mt-2 text-xs italic text-gray-500">
                          Note: {assignment.notes}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-4 text-center text-gray-500">No team schedules assigned</div>
          )}

          {/* Add Team List Section */}
          {teams.length > 0 && (
            <div className="p-4 border-t border-gray-200">
              <h4 className="font-medium text-sm mb-3">Your Teams</h4>
              <div className="space-y-2">
                {teams.map((team) => (
                  <div key={team.id} className="flex items-center p-2 bg-gray-50 rounded-md">
                    <Users className="h-4 w-4 text-blue-500 mr-2" />
                    <span className="text-sm">{team.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}