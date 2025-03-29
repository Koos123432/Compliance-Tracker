import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { format, isToday, isTomorrow, addDays } from "date-fns";
import { Calendar as CalendarIcon, Clock, MapPin, Flag, Plus } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/layout/Header";
import BottomNavigation from "@/components/layout/BottomNavigation";
import { Skeleton } from "@/components/ui/skeleton";

const scheduleFormSchema = z.object({
  userId: z.number().default(1), // Default to first user for demo
  entityId: z.number().optional(),
  entityType: z.string().min(1, "Entity type is required"),
  scheduledDate: z.date({
    required_error: "A date is required",
  }),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  status: z.string().min(1, "Status is required"),
});

type ScheduleFormValues = z.infer<typeof scheduleFormSchema>;

export default function Schedule() {
  const [location] = useLocation();
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showAddDialog, setShowAddDialog] = useState(false);
  
  // Extract inspection ID from URL query if it exists
  const params = new URLSearchParams(location.split("?")[1]);
  const inspectionId = params.get("inspection");
  
  const { data: schedules, isLoading } = useQuery({
    queryKey: ["/api/schedules"],
  });
  
  const { data: inspections } = useQuery({
    queryKey: ["/api/inspections"],
  });
  
  const form = useForm<ScheduleFormValues>({
    resolver: zodResolver(scheduleFormSchema),
    defaultValues: {
      userId: 1,
      entityId: inspectionId ? parseInt(inspectionId, 10) : undefined,
      entityType: "inspection",
      scheduledDate: new Date(),
      title: "",
      description: "",
      status: "scheduled",
    },
  });
  
  const createScheduleMutation = useMutation({
    mutationFn: async (values: ScheduleFormValues) => {
      return apiRequest("POST", "/api/schedules", values);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/schedules"] });
      toast({
        title: "Schedule created",
        description: "The schedule has been created successfully",
      });
      setShowAddDialog(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create schedule. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  const onSubmit = (values: ScheduleFormValues) => {
    createScheduleMutation.mutate(values);
  };
  
  const getScheduledDateString = (date: Date) => {
    if (isToday(date)) {
      return `Today at ${format(date, "h:mm a")}`;
    } else if (isTomorrow(date)) {
      return `Tomorrow at ${format(date, "h:mm a")}`;
    } else {
      return format(date, "MMM d, yyyy 'at' h:mm a");
    }
  };
  
  const groupSchedulesByDate = () => {
    if (!schedules) return {};
    
    const groups: { [key: string]: any[] } = {};
    const today = new Date();
    const tomorrow = addDays(today, 1);
    
    // Group schedules by date
    schedules.forEach((schedule: any) => {
      const scheduleDate = new Date(schedule.scheduledDate);
      let dateKey;
      
      if (isToday(scheduleDate)) {
        dateKey = "Today";
      } else if (isTomorrow(scheduleDate)) {
        dateKey = "Tomorrow";
      } else {
        dateKey = format(scheduleDate, "EEEE, MMMM d, yyyy");
      }
      
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      
      groups[dateKey].push(schedule);
    });
    
    return groups;
  };
  
  const handleOpenAddDialog = () => {
    // If inspection ID is provided in URL, pre-select it
    if (inspectionId) {
      form.setValue("entityId", parseInt(inspectionId, 10));
      form.setValue("entityType", "inspection");
      
      // Find inspection to pre-fill title
      const inspection = inspections?.find((i: any) => i.id === parseInt(inspectionId, 10));
      if (inspection) {
        form.setValue("title", `Follow-up: ${inspection.inspectionNumber}`);
        form.setValue("description", `Follow-up inspection for ${inspection.siteAddress}`);
      }
    }
    
    setShowAddDialog(true);
  };
  
  const groupedSchedules = groupSchedulesByDate();
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1 container mx-auto p-4 pb-20 md:pb-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Schedule</h1>
          <Button onClick={handleOpenAddDialog}>
            <Plus className="mr-2 h-4 w-4" />
            New Schedule
          </Button>
        </div>
        
        {isLoading ? (
          <>
            {[1, 2, 3].map((i) => (
              <Card key={i} className="mb-4">
                <CardHeader className="pb-2">
                  <Skeleton className="h-5 w-32" />
                </CardHeader>
                <CardContent>
                  {[1, 2].map((j) => (
                    <div key={j} className="mb-3 pb-3 border-b last:border-0">
                      <Skeleton className="h-4 w-48 mb-2" />
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </>
        ) : (
          Object.keys(groupedSchedules).length > 0 ? (
            Object.entries(groupedSchedules).map(([date, dateSchedules]) => (
              <Card key={date} className="mb-4">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium">{date}</CardTitle>
                </CardHeader>
                <CardContent>
                  {dateSchedules.map((schedule: any) => (
                    <div
                      key={schedule.id}
                      className="mb-3 pb-3 border-b last:border-0"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{schedule.title}</h3>
                          <div className="flex items-center text-sm text-gray-500 mt-1">
                            <Clock className="h-3 w-3 mr-1" />
                            <span>
                              {format(
                                new Date(schedule.scheduledDate),
                                "h:mm a"
                              )}
                            </span>
                          </div>
                          {schedule.description && (
                            <p className="text-sm mt-1">{schedule.description}</p>
                          )}
                        </div>
                        <div>
                          <span
                            className={`inline-block px-2 py-1 rounded-full text-xs ${
                              schedule.status === "completed"
                                ? "bg-green-100 text-green-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {schedule.status === "completed" ? "Completed" : "Scheduled"}
                          </span>
                        </div>
                      </div>
                      {schedule.entityType === "inspection" && (
                        <Button
                          variant="link"
                          className="text-sm p-0 h-auto mt-1"
                          onClick={() =>
                            navigate(`/inspections/${schedule.entityId}`)
                          }
                        >
                          View Inspection
                        </Button>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <CalendarIcon className="mx-auto h-10 w-10 text-gray-400 mb-3" />
                <h2 className="text-lg font-medium mb-1">No Schedules</h2>
                <p className="text-gray-500 mb-4">
                  You don't have any scheduled activities.
                </p>
                <Button onClick={handleOpenAddDialog}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Schedule
                </Button>
              </CardContent>
            </Card>
          )
        )}
      </main>
      
      {/* Add Schedule Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Schedule</DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter title" {...field} />
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
                        placeholder="Enter description"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="scheduledDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date & Time</FormLabel>
                    <FormControl>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <p className="text-sm text-gray-500">Date</p>
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={(date) => date && field.onChange(date)}
                            className="border rounded-md p-3"
                          />
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-gray-500">Time</p>
                          <Input
                            type="time"
                            value={format(field.value, "HH:mm")}
                            onChange={(e) => {
                              const [hours, minutes] = e.target.value.split(":");
                              const newDate = new Date(field.value);
                              newDate.setHours(parseInt(hours));
                              newDate.setMinutes(parseInt(minutes));
                              field.onChange(newDate);
                            }}
                          />
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {inspections && (
                <FormField
                  control={form.control}
                  name="entityId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Related Inspection</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(parseInt(value, 10))}
                        value={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select an inspection" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="0">None</SelectItem>
                          {inspections.map((inspection: any) => (
                            <SelectItem
                              key={inspection.id}
                              value={inspection.id.toString()}
                            >
                              {inspection.inspectionNumber} - {inspection.siteAddress}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="scheduled">Scheduled</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter className="mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddDialog(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createScheduleMutation.isPending}>
                  Create Schedule
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      <BottomNavigation onCreateNew={handleOpenAddDialog} />
    </div>
  );
}
