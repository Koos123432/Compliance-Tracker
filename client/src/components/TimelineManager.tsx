import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Trash2, Edit, Plus, Calendar, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { TimelineEvent, Inspection, Breach, Person } from "@shared/schema";

const timelineEventSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  eventDate: z.string().min(1, "Event date is required"),
  eventType: z.string().min(1, "Event type is required"),
  importance: z.string().default("medium"),
  relatedEntityType: z.string().optional(),
  relatedEntityId: z.number().optional(),
  position: z.number().optional(),
});

type TimelineEventFormValues = z.infer<typeof timelineEventSchema>;

interface TimelineManagerProps {
  investigationId: number;
}

export default function TimelineManager({ investigationId }: TimelineManagerProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editEvent, setEditEvent] = useState<TimelineEvent | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const form = useForm<TimelineEventFormValues>({
    resolver: zodResolver(timelineEventSchema),
    defaultValues: {
      title: "",
      description: "",
      eventDate: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
      eventType: "general",
      importance: "medium",
      relatedEntityType: "",
      relatedEntityId: 0,
      position: 0,
    },
  });

  // Query timeline events
  const { data: events = [], isLoading } = useQuery({
    queryKey: ["/api/investigations", investigationId, "timeline-events"],
    queryFn: async () => {
      const response = await fetch(`/api/investigations/${investigationId}/timeline-events`);
      if (!response.ok) throw new Error("Failed to fetch timeline events");
      return response.json();
    },
  });

  // Query inspections for related entities
  const { data: inspections = [] } = useQuery({
    queryKey: ["/api/inspections"],
    queryFn: async () => {
      const response = await fetch("/api/inspections");
      if (!response.ok) throw new Error("Failed to fetch inspections");
      return response.json();
    },
  });

  // Query breaches for related entities
  const { data: breaches = [] } = useQuery({
    queryKey: ["/api/breaches"],
    queryFn: async () => {
      let allBreaches: Breach[] = [];
      
      // For each inspection, fetch breaches
      for (const inspection of inspections) {
        const response = await fetch(`/api/inspections/${inspection.id}/breaches`);
        if (response.ok) {
          const data = await response.json();
          allBreaches = [...allBreaches, ...data];
        }
      }
      
      return allBreaches;
    },
    enabled: inspections.length > 0,
  });

  // Query people for related entities
  const { data: people = [] } = useQuery({
    queryKey: ["/api/people"],
    queryFn: async () => {
      let allPeople: Person[] = [];
      
      // For each inspection, fetch people
      for (const inspection of inspections) {
        const response = await fetch(`/api/inspections/${inspection.id}/people`);
        if (response.ok) {
          const data = await response.json();
          allPeople = [...allPeople, ...data];
        }
      }
      
      return allPeople;
    },
    enabled: inspections.length > 0,
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: TimelineEventFormValues) => {
      const payload = {
        ...data,
        investigationId,
        // Convert string date to Date object
        eventDate: new Date(data.eventDate),
        // If position is not provided, use the number of events + 1
        position: data.position || events.length + 1,
        // Set addedBy to 1 (default user)
        addedBy: 1,
      };
      
      return apiRequest("/api/timeline-events", {
        method: "POST",
        body: payload,
      });
    },
    onSuccess: () => {
      toast({
        title: "Event created",
        description: "The timeline event has been successfully created.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/investigations", investigationId, "timeline-events"] });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create timeline event: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (data: TimelineEventFormValues & { id: number }) => {
      const { id, ...rest } = data;
      
      const payload = {
        ...rest,
        // Convert string date to Date object
        eventDate: new Date(rest.eventDate),
      };
      
      return apiRequest(`/api/timeline-events/${id}`, {
        method: "PATCH",
        body: payload,
      });
    },
    onSuccess: () => {
      toast({
        title: "Event updated",
        description: "The timeline event has been successfully updated.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/investigations", investigationId, "timeline-events"] });
      setIsDialogOpen(false);
      setEditEvent(null);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update timeline event: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/timeline-events/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      toast({
        title: "Event deleted",
        description: "The timeline event has been successfully deleted.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/investigations", investigationId, "timeline-events"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete timeline event: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: TimelineEventFormValues) => {
    if (editEvent) {
      updateMutation.mutate({ ...data, id: editEvent.id });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (event: TimelineEvent) => {
    setEditEvent(event);
    form.reset({
      title: event.title,
      description: event.description || "",
      eventDate: format(new Date(event.eventDate), "yyyy-MM-dd'T'HH:mm"),
      eventType: event.eventType,
      importance: event.importance || "medium",
      relatedEntityType: event.relatedEntityType || "",
      relatedEntityId: event.relatedEntityId || 0,
      position: event.position || 0,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this timeline event?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleAddNew = () => {
    setEditEvent(null);
    form.reset({
      title: "",
      description: "",
      eventDate: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
      eventType: "general",
      importance: "medium",
      relatedEntityType: "",
      relatedEntityId: 0,
      position: events.length + 1,
    });
    setIsDialogOpen(true);
  };

  const getEventTypeLabel = (eventType: string) => {
    const types: Record<string, string> = {
      general: "General Event",
      inspection: "Inspection",
      breach: "Breach",
      complaint: "Complaint",
      interview: "Interview",
      notice: "Notice Issued",
      evidence: "Evidence Collected",
      meeting: "Meeting",
      legal: "Legal Proceeding",
    };
    return types[eventType] || eventType;
  };

  const getEventTypeColor = (eventType: string) => {
    const colors: Record<string, string> = {
      general: "bg-gray-100 text-gray-800",
      inspection: "bg-blue-100 text-blue-800",
      breach: "bg-red-100 text-red-800",
      complaint: "bg-yellow-100 text-yellow-800",
      interview: "bg-purple-100 text-purple-800",
      notice: "bg-orange-100 text-orange-800",
      evidence: "bg-green-100 text-green-800",
      meeting: "bg-indigo-100 text-indigo-800",
      legal: "bg-pink-100 text-pink-800",
    };
    return colors[eventType] || "bg-gray-100 text-gray-800";
  };

  const getImportanceColor = (importance: string | null) => {
    const colors: Record<string, string> = {
      high: "bg-red-50 text-red-700 border-red-300",
      medium: "bg-yellow-50 text-yellow-700 border-yellow-300",
      low: "bg-green-50 text-green-700 border-green-300",
    };
    return importance ? colors[importance] : "bg-gray-50 text-gray-700 border-gray-300";
  };

  const getRelatedEntityName = (type: string | null, id: number | null) => {
    if (!type || !id) return null;

    switch (type) {
      case "inspection":
        const inspection = inspections.find((insp: Inspection) => insp.id === id);
        return inspection ? inspection.inspectionNumber : "Unknown Inspection";
      case "breach":
        const breach = breaches.find((b: Breach) => b.id === id);
        return breach ? breach.title : "Unknown Breach";
      case "person":
        const person = people.find((p: Person) => p.id === id);
        return person ? person.name : "Unknown Person";
      default:
        return `${type} #${id}`;
    }
  };

  // Sort events by eventDate
  const sortedEvents = [...events].sort((a, b) => {
    return new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime();
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Investigation Timeline</h3>
        <Button onClick={handleAddNew} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Event
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-4">Loading timeline...</div>
      ) : sortedEvents.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No timeline events have been added yet.
          <br />
          <Button variant="outline" onClick={handleAddNew} className="mt-2">
            <Plus className="h-4 w-4 mr-2" />
            Add First Event
          </Button>
        </div>
      ) : (
        <div className="relative border-l border-gray-200 pl-6 ml-6 space-y-10">
          {sortedEvents.map((event, index) => (
            <div key={event.id} className="relative">
              {/* Date circle */}
              <div className="absolute -left-10 flex items-center justify-center w-7 h-7 bg-blue-100 rounded-full ring-8 ring-white">
                <Clock className="w-3.5 h-3.5 text-blue-800" />
              </div>
              
              {/* Event card */}
              <Card>
                <CardHeader className="p-4 pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-xs text-gray-500 mb-1">
                        {format(new Date(event.eventDate), "MMM d, yyyy 'at' h:mm a")}
                      </div>
                      <CardTitle className="text-md font-medium">{event.title}</CardTitle>
                    </div>
                    <div className="flex space-x-1">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(event)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(event.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-1">
                    <Badge className={getEventTypeColor(event.eventType)}>
                      {getEventTypeLabel(event.eventType)}
                    </Badge>
                    {event.importance && (
                      <Badge variant="outline" className={getImportanceColor(event.importance)}>
                        {event.importance} priority
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  {event.description && <p className="text-sm mb-2">{event.description}</p>}
                  {event.relatedEntityType && event.relatedEntityId && (
                    <div className="text-xs text-gray-500 mt-2">
                      Related to: {getRelatedEntityName(event.relatedEntityType, event.relatedEntityId)}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editEvent ? "Edit Timeline Event" : "Add Timeline Event"}</DialogTitle>
            <DialogDescription>
              Record key events in the chronology of this investigation.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter event title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="eventDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event Date & Time</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="eventType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select event type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="general">General Event</SelectItem>
                        <SelectItem value="inspection">Inspection</SelectItem>
                        <SelectItem value="breach">Breach</SelectItem>
                        <SelectItem value="complaint">Complaint</SelectItem>
                        <SelectItem value="interview">Interview</SelectItem>
                        <SelectItem value="notice">Notice Issued</SelectItem>
                        <SelectItem value="evidence">Evidence Collected</SelectItem>
                        <SelectItem value="meeting">Meeting</SelectItem>
                        <SelectItem value="legal">Legal Proceeding</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="importance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Importance</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || "medium"}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select importance" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      How significant is this event to the investigation?
                    </FormDescription>
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
                        placeholder="Describe the event details"
                        className="resize-none"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="relatedEntityType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Related Entity Type</FormLabel>
                      <Select 
                        onValueChange={field.onChange}
                        value={field.value || ""}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">None</SelectItem>
                          <SelectItem value="inspection">Inspection</SelectItem>
                          <SelectItem value="breach">Breach</SelectItem>
                          <SelectItem value="person">Person</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="relatedEntityId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Related Entity</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        value={field.value ? field.value.toString() : "0"}
                        disabled={!form.watch("relatedEntityType")}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select entity" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {form.watch("relatedEntityType") === "inspection" && inspections.map((inspection: Inspection) => (
                            <SelectItem key={inspection.id} value={inspection.id.toString()}>
                              {inspection.inspectionNumber}
                            </SelectItem>
                          ))}
                          {form.watch("relatedEntityType") === "breach" && breaches.map((breach: Breach) => (
                            <SelectItem key={breach.id} value={breach.id.toString()}>
                              {breach.title}
                            </SelectItem>
                          ))}
                          {form.watch("relatedEntityType") === "person" && people.map((person: Person) => (
                            <SelectItem key={person.id} value={person.id.toString()}>
                              {person.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {createMutation.isPending || updateMutation.isPending
                    ? "Saving..."
                    : editEvent
                    ? "Update Event"
                    : "Create Event"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}