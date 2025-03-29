import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Users, UserPlus, UserX, UserCheck, AlertCircle } from "lucide-react";

// Team form schema
const teamFormSchema = z.object({
  name: z.string().min(2, { message: "Team name must be at least 2 characters." }),
  description: z.string().nullable().optional(),
});

export default function TeamManager() {
  const [showTeamDialog, setShowTeamDialog] = useState(false);
  const [showAddMemberDialog, setShowAddMemberDialog] = useState(false);
  const [editingTeamId, setEditingTeamId] = useState<number | null>(null);
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
  const { toast } = useToast();

  // Fetch teams
  const { data: teams = [], isLoading: isTeamsLoading, refetch: refetchTeams } = useQuery({
    queryKey: ['/api/teams'],
    queryFn: async () => {
      const response = await fetch('/api/teams');
      if (!response.ok) {
        throw new Error('Failed to fetch teams');
      }
      return response.json();
    }
  });

  // Fetch users
  const { data: users = [], isLoading: isUsersLoading } = useQuery({
    queryKey: ['/api/users'],
    queryFn: async () => {
      const response = await fetch('/api/users');
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      return response.json();
    }
  });

  // Fetch team members if a team is selected
  const { data: teamMembers = [], isLoading: isTeamMembersLoading, refetch: refetchTeamMembers } = useQuery({
    queryKey: ['/api/teams', selectedTeamId, 'members'],
    queryFn: async () => {
      if (!selectedTeamId) return [];
      const response = await fetch(`/api/teams/${selectedTeamId}/members`);
      if (!response.ok) {
        throw new Error('Failed to fetch team members');
      }
      return response.json();
    },
    enabled: !!selectedTeamId
  });

  // Team form
  const teamForm = useForm<z.infer<typeof teamFormSchema>>({
    resolver: zodResolver(teamFormSchema),
    defaultValues: {
      name: "",
      description: "",
    }
  });

  // Handle team creation/update
  const handleTeamSubmit = (values: z.infer<typeof teamFormSchema>) => {
    if (editingTeamId) {
      updateTeam.mutate({
        id: editingTeamId,
        data: values
      });
    } else {
      createTeam.mutate(values);
    }
  };

  // Create team mutation
  const createTeam = useMutation({
    mutationFn: async (data: z.infer<typeof teamFormSchema>) => {
      return apiRequest('/api/teams', {
        method: 'POST',
        body: data
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/teams'] });
      setShowTeamDialog(false);
      teamForm.reset();
      toast({
        title: "Team created",
        description: "The team has been created successfully."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error creating team",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Update team mutation
  const updateTeam = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: z.infer<typeof teamFormSchema> }) => {
      return apiRequest(`/api/teams/${id}`, {
        method: 'PATCH',
        body: data
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/teams'] });
      setShowTeamDialog(false);
      setEditingTeamId(null);
      teamForm.reset();
      toast({
        title: "Team updated",
        description: "The team has been updated successfully."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error updating team",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Delete team mutation
  const deleteTeam = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/teams/${id}`, {
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/teams'] });
      if (selectedTeamId) {
        setSelectedTeamId(null);
      }
      toast({
        title: "Team deleted",
        description: "The team has been deleted successfully."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error deleting team",
        description: error.message || "Cannot delete team with assigned members",
        variant: "destructive"
      });
    }
  });

  // Add team member mutation
  const addTeamMember = useMutation({
    mutationFn: async ({ teamId, userId, isTeamLead }: { teamId: number; userId: number; isTeamLead: boolean }) => {
      return apiRequest(`/api/teams/${teamId}/members`, {
        method: 'POST',
        body: { userId, isTeamLead }
      });
    },
    onSuccess: () => {
      if (selectedTeamId) {
        queryClient.invalidateQueries({ queryKey: ['/api/teams', selectedTeamId, 'members'] });
      }
      setShowAddMemberDialog(false);
      toast({
        title: "Team member added",
        description: "The user has been added to the team successfully."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error adding team member",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Remove team member mutation
  const removeTeamMember = useMutation({
    mutationFn: async ({ teamId, userId }: { teamId: number; userId: number }) => {
      return apiRequest(`/api/teams/${teamId}/members/${userId}`, {
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      if (selectedTeamId) {
        queryClient.invalidateQueries({ queryKey: ['/api/teams', selectedTeamId, 'members'] });
      }
      toast({
        title: "Team member removed",
        description: "The user has been removed from the team successfully."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error removing team member",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Toggle team lead status mutation
  const toggleTeamLead = useMutation({
    mutationFn: async ({ teamId, userId, isTeamLead }: { teamId: number; userId: number; isTeamLead: boolean }) => {
      return apiRequest(`/api/teams/${teamId}/members/${userId}`, {
        method: 'PATCH',
        body: { isTeamLead }
      });
    },
    onSuccess: () => {
      if (selectedTeamId) {
        queryClient.invalidateQueries({ queryKey: ['/api/teams', selectedTeamId, 'members'] });
      }
      toast({
        title: "Team lead status updated",
        description: "The team member's lead status has been updated successfully."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error updating team lead status",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Edit team
  const handleEditTeam = (team: any) => {
    setEditingTeamId(team.id);
    teamForm.reset({
      name: team.name,
      description: team.description || "",
    });
    setShowTeamDialog(true);
  };

  // Select team to view its members
  const handleSelectTeam = (team: any) => {
    setSelectedTeamId(team.id);
  };

  // Find user details
  const getUserById = (userId: number) => {
    return users.find((user: any) => user.id === userId);
  };

  // Add team member handler
  const handleAddTeamMember = (userId: number, isTeamLead: boolean = false) => {
    if (!selectedTeamId) return;
    
    addTeamMember.mutate({
      teamId: selectedTeamId,
      userId,
      isTeamLead
    });
  };

  // Get non-members for a team
  const getNonMembers = () => {
    if (!selectedTeamId) return [];
    
    const memberUserIds = teamMembers.map((member: any) => member.userId);
    return users.filter((user: any) => !memberUserIds.includes(user.id));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold">Teams</h3>
        <Dialog open={showTeamDialog} onOpenChange={setShowTeamDialog}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingTeamId(null);
              teamForm.reset({
                name: "",
                description: "",
              });
            }}>
              Create New Team
            </Button>
          </DialogTrigger>
          
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{editingTeamId ? "Edit Team" : "Create New Team"}</DialogTitle>
              <DialogDescription>
                {editingTeamId 
                  ? "Update the team details below."
                  : "Fill in the details to create a new team."}
              </DialogDescription>
            </DialogHeader>
            
            <Form {...teamForm}>
              <form onSubmit={teamForm.handleSubmit(handleTeamSubmit)} className="space-y-4">
                <FormField
                  control={teamForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Team Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter team name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={teamForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter team description" 
                          {...field} 
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <DialogFooter>
                  <Button variant="outline" type="button" onClick={() => setShowTeamDialog(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={teamForm.formState.isSubmitting}>
                    {editingTeamId ? "Update" : "Create"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Teams List */}
        <div className="col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Team List</CardTitle>
              <CardDescription>Select a team to view and manage members</CardDescription>
            </CardHeader>
            <CardContent>
              {isTeamsLoading ? (
                <p>Loading teams...</p>
              ) : teams.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Users className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No teams created yet</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Create your first team to start managing team members
                  </p>
                </div>
              ) : (
                <ScrollArea className="h-[400px]">
                  <div className="space-y-2">
                    {teams.map((team: any) => (
                      <div 
                        key={team.id}
                        className={`
                          flex justify-between items-center p-3 rounded-md border cursor-pointer
                          ${selectedTeamId === team.id ? 'bg-primary/10 border-primary/20' : 'hover:bg-muted'}
                        `}
                        onClick={() => handleSelectTeam(team)}
                      >
                        <div>
                          <p className="font-medium">{team.name}</p>
                          {team.description && (
                            <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                              {team.description}
                            </p>
                          )}
                        </div>
                        <div className="flex space-x-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditTeam(team);
                            }}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteTeam.mutate(team.id);
                            }}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Team Members */}
        <div className="col-span-1 md:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>
                    {selectedTeamId 
                      ? `Team Members: ${teams.find((t: any) => t.id === selectedTeamId)?.name}` 
                      : 'Team Members'}
                  </CardTitle>
                  <CardDescription>
                    {selectedTeamId 
                      ? 'Manage the members of this team' 
                      : 'Select a team to view and manage its members'}
                  </CardDescription>
                </div>
                {selectedTeamId && (
                  <Dialog open={showAddMemberDialog} onOpenChange={setShowAddMemberDialog}>
                    <DialogTrigger asChild>
                      <Button size="sm" disabled={!selectedTeamId}>
                        <UserPlus className="mr-2 h-4 w-4" />
                        Add Member
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Team Member</DialogTitle>
                        <DialogDescription>
                          Add a user to this team and set their role.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="py-4">
                        <h4 className="mb-4 text-sm font-medium">Available Users</h4>
                        {isUsersLoading ? (
                          <p>Loading users...</p>
                        ) : getNonMembers().length === 0 ? (
                          <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>No available users</AlertTitle>
                            <AlertDescription>
                              All users are already members of this team.
                            </AlertDescription>
                          </Alert>
                        ) : (
                          <ScrollArea className="h-[200px]">
                            <div className="space-y-2">
                              {getNonMembers().map((user: any) => (
                                <div key={user.id} className="flex justify-between items-center p-2 rounded-md border">
                                  <div>
                                    <p className="font-medium">{user.fullName}</p>
                                    <p className="text-sm text-muted-foreground">{user.username}</p>
                                  </div>
                                  <div className="flex space-x-2">
                                    <Button 
                                      size="sm" 
                                      onClick={() => handleAddTeamMember(user.id, false)}
                                    >
                                      Add as Member
                                    </Button>
                                    <Button 
                                      size="sm" 
                                      variant="secondary"
                                      onClick={() => handleAddTeamMember(user.id, true)}
                                    >
                                      Add as Lead
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </ScrollArea>
                        )}
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setShowAddMemberDialog(false)}>
                          Close
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {!selectedTeamId ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Users className="h-16 w-16 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Select a team to view its members</p>
                </div>
              ) : isTeamMembersLoading ? (
                <p>Loading team members...</p>
              ) : teamMembers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <UserPlus className="h-16 w-16 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No members in this team yet</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Click "Add Member" to add users to this team
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Member</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {teamMembers.map((member: any) => {
                      const user = getUserById(member.userId);
                      return (
                        <TableRow key={`${member.teamId}-${member.userId}`}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{user?.fullName || `User #${member.userId}`}</p>
                              <p className="text-sm text-muted-foreground">{user?.username}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            {member.isTeamLead ? (
                              <Badge>Team Lead</Badge>
                            ) : (
                              <Badge variant="outline">Member</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {user?.isActive ? (
                              <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>
                            ) : (
                              <Badge variant="outline" className="bg-gray-100">Inactive</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => toggleTeamLead.mutate({
                                  teamId: selectedTeamId,
                                  userId: member.userId,
                                  isTeamLead: !member.isTeamLead
                                })}
                                title={member.isTeamLead ? "Remove as team lead" : "Make team lead"}
                              >
                                <UserCheck className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeTeamMember.mutate({
                                  teamId: selectedTeamId,
                                  userId: member.userId
                                })}
                                title="Remove from team"
                              >
                                <UserX className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}