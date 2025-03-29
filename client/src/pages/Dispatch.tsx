import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { CalendarIcon, MapPinIcon, UserIcon, Users, ArrowRight, Send, Clock, AlertTriangle, Check, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { toast } from '@/hooks/use-toast';
import { useWebSocketContext } from '@/context/WebSocketContext';

// Define the job form schema
const jobFormSchema = z.object({
  title: z.string().min(3, 'Job title must be at least 3 characters'),
  description: z.string().optional(),
  scheduledDate: z.date(),
  teamId: z.coerce.number().positive('Please select a team'),
  priority: z.enum(['low', 'medium', 'high'], {
    required_error: 'Please select a priority',
  }),
  assignedMembers: z.array(z.string()).optional(),
  location: z.string().optional(),
});

type JobFormValues = z.infer<typeof jobFormSchema>;

export default function Dispatch() {
  const [tab, setTab] = useState('pending');
  const [createJobDialogOpen, setCreateJobDialogOpen] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
  const [confirmDispatchDialogOpen, setConfirmDispatchDialogOpen] = useState(false);
  const { connectionState, sendMessage } = useWebSocketContext();

  // Form setup
  const form = useForm<JobFormValues>({
    resolver: zodResolver(jobFormSchema),
    defaultValues: {
      title: '',
      description: '',
      scheduledDate: new Date(),
      teamId: 0,
      priority: 'medium',
      assignedMembers: [],
      location: '',
    },
  });
  
  // Get teams
  const { data: teams = [] } = useQuery({
    queryKey: ['/api/teams'],
    queryFn: () => fetch('/api/teams').then(res => res.json())
  });

  // Get users
  const { data: users = [] } = useQuery({
    queryKey: ['/api/users'],
    queryFn: () => fetch('/api/users').then(res => res.json())
  });

  // Get schedules
  const { data: schedules = [], isLoading: schedulesLoading, refetch: refetchSchedules } = useQuery({
    queryKey: ['/api/schedules'],
    queryFn: () => fetch('/api/schedules').then(res => res.json())
  });

  // Load team members for selected team
  const { data: teamMembers = [], isLoading: teamMembersLoading } = useQuery({
    queryKey: ['/api/teams', form.watch('teamId'), 'members'],
    queryFn: () => {
      const teamId = form.watch('teamId');
      if (!teamId) return [];
      return fetch(`/api/teams/${teamId}/members`).then(res => res.json());
    },
    enabled: !!form.watch('teamId')
  });
  
  // Create job mutation
  const createJobMutation = useMutation({
    mutationFn: (values: JobFormValues) => 
      apiRequest('/api/teamSchedules', { 
        method: 'POST',
        body: {
          ...values,
          status: 'pending',
          createdBy: 1, // Hardcoded for demo, should be current user
        }
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/schedules'] });
      toast({
        title: 'Success',
        description: 'Job created successfully',
      });
      setCreateJobDialogOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: 'Error creating job',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Update job status mutation
  const updateJobStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number, status: string }) => 
      apiRequest(`/api/schedules/${id}`, {
        method: 'PATCH',
        body: { status }
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/schedules'] });
      toast({
        title: 'Status updated',
        description: `Job status set to ${data.status}`,
      });
      
      // Notify through WebSocket
      if (connectionState === 'open') {
        sendMessage({
          type: 'broadcast',
          entity: 'team_schedule',
          entityId: data.id,
          action: 'status_change',
          data: {
            status: data.status,
            title: data.title,
            id: data.id
          }
        });
      }
      
      setConfirmDispatchDialogOpen(false);
      setSelectedJobId(null);
    },
    onError: (error: any) => {
      toast({
        title: 'Error updating status',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  const onSubmit = (data: JobFormValues) => {
    createJobMutation.mutate(data);
  };

  const handleDispatchJob = (jobId: number) => {
    setSelectedJobId(jobId);
    setConfirmDispatchDialogOpen(true);
  };
  
  const confirmDispatch = () => {
    if (selectedJobId) {
      updateJobStatusMutation.mutate({ id: selectedJobId, status: 'active' });
    }
  };
  
  const handleCancelJob = (jobId: number) => {
    updateJobStatusMutation.mutate({ id: jobId, status: 'cancelled' });
  };
  
  const handleCompleteJob = (jobId: number) => {
    updateJobStatusMutation.mutate({ id: jobId, status: 'completed' });
  };

  // Filter schedules based on current tab
  const filteredSchedules = Array.isArray(schedules) 
    ? schedules.filter(schedule => schedule.status === tab)
    : [];

  // Helper to get team name
  const getTeamName = (teamId: number) => {
    const team = teams.find((t: any) => t.id === teamId);
    return team ? team.name : `Team ${teamId}`;
  };
  
  // Helper to get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-gray-100">Pending</Badge>;
      case 'active':
        return <Badge variant="default" className="bg-green-500">Active</Badge>;
      case 'completed':
        return <Badge variant="secondary">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };
  
  // Helper to get priority badge
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive">High</Badge>;
      case 'medium':
        return <Badge variant="default">Medium</Badge>;
      case 'low':
        return <Badge variant="outline">Low</Badge>;
      default:
        return <Badge>{priority}</Badge>;
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Dispatch Center</h1>
        <Dialog open={createJobDialogOpen} onOpenChange={setCreateJobDialogOpen}>
          <DialogTrigger asChild>
            <Button>Create New Job</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create New Job</DialogTitle>
              <DialogDescription>
                Create a new job to be assigned to a team or specific officers.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter job title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter job details and instructions" 
                          className="min-h-[100px]"
                          {...field} 
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="scheduledDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) => date < new Date()}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Priority</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select priority" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="teamId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Team</FormLabel>
                      <Select 
                        onValueChange={(value) => field.onChange(parseInt(value))} 
                        value={field.value ? field.value.toString() : ""}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a team" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {teams.map((team: any) => (
                            <SelectItem key={team.id} value={team.id.toString()}>
                              {team.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {form.watch('teamId') > 0 && (
                  <FormField
                    control={form.control}
                    name="assignedMembers"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Assigned Team Members (Optional)</FormLabel>
                        <div className="space-y-2">
                          {teamMembersLoading ? (
                            <div className="text-sm text-muted-foreground">Loading team members...</div>
                          ) : teamMembers.length === 0 ? (
                            <div className="text-sm text-muted-foreground">No team members found</div>
                          ) : (
                            teamMembers.map((member: any) => (
                              <div key={member.userId} className="flex items-center space-x-2">
                                <Checkbox 
                                  id={`member-${member.userId}`} 
                                  checked={field.value?.includes(member.userId.toString())}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      field.onChange([...(field.value || []), member.userId.toString()]);
                                    } else {
                                      field.onChange(
                                        field.value?.filter((value) => value !== member.userId.toString()) || []
                                      );
                                    }
                                  }}
                                />
                                <Label htmlFor={`member-${member.userId}`} className="flex items-center">
                                  <UserIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                                  {users.find((u: any) => u.id === member.userId)?.fullName || `User ${member.userId}`}
                                  {member.isTeamLead && <Badge className="ml-2" variant="outline">Lead</Badge>}
                                </Label>
                              </div>
                            ))
                          )}
                        </div>
                        <FormDescription>
                          If no members are selected, the job will be visible to all team members.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location (Optional)</FormLabel>
                      <FormControl>
                        <div className="flex">
                          <Input placeholder="Enter location" {...field} value={field.value || ''} />
                          <Button 
                            type="button" 
                            variant="outline" 
                            className="ml-2"
                            onClick={() => {
                              // Get current location - in a real app, use proper geolocation API
                              field.onChange("Sample Address, 123 City, State");
                            }}
                          >
                            <MapPinIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      </FormControl>
                      <FormDescription>
                        Enter a location or use the pin button to use current location.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <DialogFooter>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setCreateJobDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    disabled={createJobMutation.isPending}
                  >
                    {createJobMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Create Job
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="pending" value={tab} onValueChange={setTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">Pending Jobs</TabsTrigger>
          <TabsTrigger value="active">Active Jobs</TabsTrigger>
          <TabsTrigger value="completed">Completed Jobs</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled Jobs</TabsTrigger>
        </TabsList>
        
        <TabsContent value={tab} className="space-y-4">
          {schedulesLoading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Loading jobs...</span>
            </div>
          ) : filteredSchedules.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed">
              <div className="flex justify-center mb-2">
                {tab === 'pending' && <Clock className="h-12 w-12 text-gray-400" />}
                {tab === 'active' && <Send className="h-12 w-12 text-gray-400" />}
                {tab === 'completed' && <Check className="h-12 w-12 text-gray-400" />}
                {tab === 'cancelled' && <X className="h-12 w-12 text-gray-400" />}
              </div>
              <h3 className="text-lg font-medium mb-1">No {tab} jobs</h3>
              <p className="text-sm text-gray-500">
                {tab === 'pending' && 'No jobs awaiting dispatch at this time.'}
                {tab === 'active' && 'No active jobs currently in progress.'}
                {tab === 'completed' && 'No completed jobs found.'}
                {tab === 'cancelled' && 'No cancelled jobs found.'}
              </p>
              {tab === 'pending' && (
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => setCreateJobDialogOpen(true)}
                >
                  Create New Job
                </Button>
              )}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredSchedules.map((job: any) => (
                <Card key={job.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg flex-1">{job.title}</CardTitle>
                      <div className="flex space-x-1">
                        {getPriorityBadge(job.priority || 'medium')}
                        {getStatusBadge(job.status)}
                      </div>
                    </div>
                    <CardDescription className="flex items-center">
                      <Users className="h-4 w-4 mr-1 text-muted-foreground" />
                      {getTeamName(job.teamId)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {job.description && (
                        <p className="text-sm">{job.description}</p>
                      )}
                      <div className="flex items-center text-sm text-muted-foreground">
                        <CalendarIcon className="h-4 w-4 mr-1" />
                        {new Date(job.scheduledDate).toLocaleDateString()}
                      </div>
                      {job.location && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <MapPinIcon className="h-4 w-4 mr-1" />
                          {job.location}
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="border-t bg-muted/10 flex justify-between pt-3">
                    {tab === 'pending' && (
                      <>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleCancelJob(job.id)}
                          disabled={updateJobStatusMutation.isPending}
                        >
                          Cancel
                        </Button>
                        <Button 
                          size="sm" 
                          onClick={() => handleDispatchJob(job.id)}
                          disabled={updateJobStatusMutation.isPending}
                        >
                          <Send className="h-4 w-4 mr-1" />
                          Dispatch
                        </Button>
                      </>
                    )}
                    
                    {tab === 'active' && (
                      <>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleCancelJob(job.id)}
                          disabled={updateJobStatusMutation.isPending}
                        >
                          Cancel
                        </Button>
                        <Button 
                          size="sm" 
                          onClick={() => handleCompleteJob(job.id)}
                          disabled={updateJobStatusMutation.isPending}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Complete
                        </Button>
                      </>
                    )}
                    
                    {tab === 'completed' && (
                      <div className="text-sm text-muted-foreground w-full text-center">
                        Completed on {new Date(job.updatedAt || job.createdAt).toLocaleDateString()}
                      </div>
                    )}
                    
                    {tab === 'cancelled' && (
                      <div className="text-sm text-muted-foreground w-full text-center">
                        Cancelled on {new Date(job.updatedAt || job.createdAt).toLocaleDateString()}
                      </div>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      {/* Confirm Dispatch Dialog */}
      <AlertDialog open={confirmDispatchDialogOpen} onOpenChange={setConfirmDispatchDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Dispatch</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to dispatch this job? All assigned team members 
              will be notified immediately.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDispatch}
              disabled={updateJobStatusMutation.isPending}
            >
              {updateJobStatusMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Dispatch Now
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Helper component for Checkbox
function Checkbox({ id, checked, onCheckedChange }: any) {
  return (
    <div className="flex items-center space-x-2">
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={(e) => onCheckedChange(e.target.checked)}
        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
      />
    </div>
  );
}