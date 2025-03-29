import { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/layout/Header";
import BottomNavigation from "@/components/layout/BottomNavigation";
import PhotoGallery from "@/components/PhotoGallery";

const breachFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  legislation: z.string().optional(),
  daConditionNumber: z.string().optional(),
  recommendedAction: z.string().optional(),
  resolutionDeadline: z.string().optional(),
  severity: z.string().min(1, "Severity is required"),
  status: z.string().min(1, "Status is required"),
});

type BreachFormValues = z.infer<typeof breachFormSchema>;

export default function DocumentBreach() {
  const { id, breachId } = useParams();
  const inspectionId = parseInt(id, 10);
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [createdBreachId, setCreatedBreachId] = useState<number | null>(
    breachId ? parseInt(breachId, 10) : null
  );

  const { data: breach, isLoading } = useQuery({
    queryKey: [`/api/breaches/${breachId}`],
    enabled: !!breachId,
  });

  const form = useForm<BreachFormValues>({
    resolver: zodResolver(breachFormSchema),
    defaultValues: {
      title: "",
      description: "",
      legislation: "",
      daConditionNumber: "",
      recommendedAction: "",
      resolutionDeadline: "",
      severity: "moderate",
      status: "open",
    },
  });

  useEffect(() => {
    if (breach && !isLoading) {
      form.reset({
        title: breach.title,
        description: breach.description,
        legislation: breach.legislation || "",
        daConditionNumber: breach.daConditionNumber || "",
        recommendedAction: breach.recommendedAction || "",
        resolutionDeadline: breach.resolutionDeadline
          ? new Date(breach.resolutionDeadline).toISOString().split("T")[0]
          : "",
        severity: breach.severity,
        status: breach.status,
      });
    }
  }, [breach, isLoading, form]);

  const createBreachMutation = useMutation({
    mutationFn: async (values: BreachFormValues) => {
      return apiRequest("POST", "/api/breaches", {
        ...values,
        inspectionId,
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: [`/api/inspections/${inspectionId}/breaches`],
      });
      toast({
        title: "Breach documented",
        description: "The breach has been documented successfully",
      });
      setCreatedBreachId(data.id);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to document breach. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateBreachMutation = useMutation({
    mutationFn: async (values: BreachFormValues) => {
      return apiRequest("PATCH", `/api/breaches/${createdBreachId}`, values);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [`/api/inspections/${inspectionId}/breaches`],
      });
      toast({
        title: "Breach updated",
        description: "The breach has been updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update breach. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: BreachFormValues) => {
    if (createdBreachId) {
      updateBreachMutation.mutate(values);
    } else {
      createBreachMutation.mutate(values);
    }
  };

  const isLoaded = !breachId || !isLoading;

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 container mx-auto p-4 pb-20 md:pb-4">
        <Card className="mb-4">
          <CardContent className="p-0">
            <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
              <h3 className="font-medium">
                {createdBreachId ? "Edit Breach" : "Document Breach"}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(`/inspections/${inspectionId}`)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {isLoaded && (
              <div className="p-4">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Breach Title</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter a descriptive title"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Breach Photos section */}
                    {createdBreachId && (
                      <PhotoGallery
                        inspectionId={inspectionId}
                        breachId={createdBreachId}
                        title="Breach Photos"
                      />
                    )}

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea
                              rows={3}
                              placeholder="Describe the breach in detail"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="legislation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Legislation Reference</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter applicable legislation"
                              {...field}
                            />
                          </FormControl>
                          <p className="text-xs text-gray-500 mt-1">
                            E.g., Work Health and Safety Regulation 2017, Section 78
                          </p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="daConditionNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>DA Condition Number</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter DA condition if applicable"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="recommendedAction"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Recommended Action</FormLabel>
                          <FormControl>
                            <Textarea
                              rows={2}
                              placeholder="Describe what needs to be done to resolve this breach"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="resolutionDeadline"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Resolution Deadline</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="severity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Severity</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="flex flex-wrap space-x-4"
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="minor" id="minor" />
                                <Label htmlFor="minor">Minor</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="moderate" id="moderate" />
                                <Label htmlFor="moderate">Moderate</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="major" id="major" />
                                <Label htmlFor="major">Major</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="critical" id="critical" />
                                <Label htmlFor="critical">Critical</Label>
                              </div>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end space-x-3 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => navigate(`/inspections/${inspectionId}`)}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        variant="warning"
                        disabled={
                          createBreachMutation.isPending ||
                          updateBreachMutation.isPending
                        }
                      >
                        {createdBreachId ? "Update Breach" : "Save Breach"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <BottomNavigation onCreateNew={() => {}} />
    </div>
  );
}
