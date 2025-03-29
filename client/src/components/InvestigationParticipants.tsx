import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { PlusIcon, X as CrossIcon, UserIcon, UserPlusIcon, UserXIcon } from "lucide-react";

interface InvestigationParticipantsProps {
  investigationId: number;
}

const InvestigationParticipants: React.FC<InvestigationParticipantsProps> = ({ investigationId }) => {
  const [addParticipantDialogOpen, setAddParticipantDialogOpen] = useState(false);

  // Fetch participants for this investigation
  const { data: participantsData, isLoading: participantsLoading } = useQuery({
    queryKey: [`/api/investigations/${investigationId}/participants`],
    queryFn: async () => {
      try {
        const response = await fetch(`/api/investigations/${investigationId}/participants`);
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        const data = await response.json();
        console.log("Fetched participants data:", data);
        
        // Ensure we're always working with an array, even if the API returns something else
        if (!Array.isArray(data)) {
          console.warn("API didn't return an array for participants, using empty array instead:", data);
          return [];
        }
        
        return data;
      } catch (error) {
        console.error("Error fetching participants:", error);
        return [];
      }
    },
    enabled: !!investigationId,
  });
  
  // Ensure participants is always an array with proper type checking
  const participants = Array.isArray(participantsData) ? participantsData : [];
  // Log for debugging
  console.log('Participants data type:', typeof participantsData, Array.isArray(participantsData));

  // Fetch all users
  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ['/api/users'],
    queryFn: () => fetch('/api/users').then(res => res.json())
  });

  // Form schema for adding a participant
  const participantFormSchema = z.object({
    userId: z.coerce.number().positive("User is required"),
    role: z.string().min(1, "Role is required"),
    permissions: z.array(z.string()).optional(),
    notes: z.string().optional(),
  });

  // Form setup
  const participantForm = useForm<z.infer<typeof participantFormSchema>>({
    resolver: zodResolver(participantFormSchema),
    defaultValues: {
      userId: 0,
      role: "observer",
      permissions: [],
      notes: "",
    },
  });

  // Mutations
  const addParticipantMutation = useMutation({
    mutationFn: (participantData: any) => 
      apiRequest('/api/investigation-participants', {
        method: 'POST',
        body: {
          investigationId,
          userId: participantData.userId,
          role: participantData.role,
          permissions: participantData.permissions,
          notes: participantData.notes,
          addedBy: 1, // Hardcoded for demo, should be current user
          isActive: true,
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/investigations/${investigationId}/participants`] });
      toast({
        title: "Participant added successfully",
      });
      setAddParticipantDialogOpen(false);
      participantForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error adding participant",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const removeParticipantMutation = useMutation({
    mutationFn: (participantId: number) => 
      apiRequest(`/api/investigation-participants/${participantId}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/investigations/${investigationId}/participants`] });
      toast({
        title: "Participant removed successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error removing participant",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const updateParticipantMutation = useMutation({
    mutationFn: ({ id, data }: { id: number, data: any }) => 
      apiRequest(`/api/investigation-participants/${id}`, {
        method: 'PATCH',
        body: data,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/investigations/${investigationId}/participants`] });
      toast({
        title: "Participant updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error updating participant",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const onSubmitParticipant = (data: z.infer<typeof participantFormSchema>) => {
    // Check if this user is already a participant
    const existingParticipant = participants.find((p: any) => p.userId === data.userId);
    if (existingParticipant) {
      toast({
        title: "User already added",
        description: "This user is already a participant in this investigation.",
        variant: "destructive",
      });
      return;
    }
    
    addParticipantMutation.mutate(data);
  };

  const getUserName = (userId: number) => {
    const user = users.find((u: any) => u.id === userId);
    return user ? user.fullName : `User #${userId}`;
  };

  const getRoleBadgeVariant = (role: string) => {
    const variants: Record<string, string> = {
      "lead": "destructive",
      "support": "default",
      "observer": "outline",
      "advisor": "secondary",
      "legal": "warning",
      "supervisor": "purple",
      "default": "outline"
    };
    
    return variants[role] || variants.default;
  };

  const availableRoles = [
    { value: "lead", label: "Lead Investigator" },
    { value: "support", label: "Support Officer" },
    { value: "observer", label: "Observer" },
    { value: "advisor", label: "Technical Advisor" },
    { value: "legal", label: "Legal Counsel" },
    { value: "supervisor", label: "Supervisor" },
  ];

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex justify-between items-center">
          <span>Investigation Team</span>
          <Dialog open={addParticipantDialogOpen} onOpenChange={setAddParticipantDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <UserPlusIcon className="mr-2 h-4 w-4" />
                Add Team Member
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Team Member</DialogTitle>
                <DialogDescription>
                  Tag a user to participate in this investigation.
                </DialogDescription>
              </DialogHeader>
              <Form {...participantForm}>
                <form onSubmit={participantForm.handleSubmit(onSubmitParticipant)} className="space-y-4">
                  <FormField
                    control={participantForm.control}
                    name="userId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>User</FormLabel>
                        <Select 
                          onValueChange={(value) => field.onChange(parseInt(value))}
                          defaultValue={field.value ? field.value.toString() : ""}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a user" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {users.map((user: any) => (
                              <SelectItem 
                                key={user.id} 
                                value={user.id.toString()}
                                disabled={participants.some((p: any) => p.userId === user.id)}
                              >
                                {user.fullName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={participantForm.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Role</FormLabel>
                        <Select 
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a role" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {availableRoles.map((role) => (
                              <SelectItem key={role.value} value={role.value}>
                                {role.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={participantForm.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Add any notes about this team member's responsibilities"
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button 
                      type="submit"
                      disabled={addParticipantMutation.isPending}
                    >
                      {addParticipantMutation.isPending ? "Adding..." : "Add to Team"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </CardTitle>
        <CardDescription>
          Manage the team members assigned to this investigation
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Team Member</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Added By</TableHead>
              <TableHead>Added On</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {participantsLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4">
                  Loading team members...
                </TableCell>
              </TableRow>
            ) : participants.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4">
                  No team members assigned to this investigation yet.
                </TableCell>
              </TableRow>
            ) : (
              participants.map((participant: any) => (
                <TableRow key={participant.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center">
                      <UserIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                      {getUserName(participant.userId)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getRoleBadgeVariant(participant.role) as any}>
                      {participant.role}
                    </Badge>
                  </TableCell>
                  <TableCell>{getUserName(participant.addedBy)}</TableCell>
                  <TableCell>
                    {new Date(participant.addedAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeParticipantMutation.mutate(participant.id)}
                      disabled={removeParticipantMutation.isPending}
                    >
                      <UserXIcon className="h-4 w-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default InvestigationParticipants;