import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { X, MapPin } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { generateInspectionNumber } from "@/lib/numberGenerator";
import useGeolocation from "@/hooks/useGeolocation";
import Header from "@/components/layout/Header";
import BottomNavigation from "@/components/layout/BottomNavigation";
import PhotoGallery from "@/components/PhotoGallery";

const inspectionFormSchema = z.object({
  inspectionNumber: z.string().optional(),
  inspectionDate: z.string().min(1, "Inspection date is required"),
  inspectionType: z.string().min(1, "Inspection type is required"),
  priority: z.string().min(1, "Priority is required"),
  status: z.string().min(1, "Status is required"),
  siteAddress: z.string().min(1, "Site address is required"),
  daNumber: z.string().optional(),
  principalContractor: z.string().optional(),
  licenseNumber: z.string().optional(),
  pca: z.string().optional(),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
  notes: z.string().optional(),
  assignedOfficerId: z.number().default(1), // Default to the first user for this demo
});

type InspectionFormValues = z.infer<typeof inspectionFormSchema>;

export default function CreateInspection() {
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { getLocation, loading: locationLoading } = useGeolocation({
    getAddress: true,
  });
  const [createdInspectionId, setCreatedInspectionId] = useState<number | null>(null);

  const form = useForm<InspectionFormValues>({
    resolver: zodResolver(inspectionFormSchema),
    defaultValues: {
      inspectionNumber: "",
      inspectionDate: format(new Date(), "yyyy-MM-dd"),
      inspectionType: "Routine Compliance Check",
      priority: "medium",
      status: "scheduled",
      siteAddress: "",
      daNumber: "",
      principalContractor: "",
      licenseNumber: "",
      pca: "",
      latitude: "",
      longitude: "",
      notes: "",
    },
  });

  const createInspectionMutation = useMutation({
    mutationFn: async (values: InspectionFormValues) => {
      // If inspection number is empty, auto-generate one
      if (!values.inspectionNumber) {
        values.inspectionNumber = generateInspectionNumber();
      }
      return apiRequest("POST", "/api/inspections", values);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/inspections"] });
      toast({
        title: "Inspection created",
        description: `Inspection ${data.inspectionNumber} has been created successfully`,
      });
      setCreatedInspectionId(data.id);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create inspection. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: InspectionFormValues) => {
    createInspectionMutation.mutate(values);
  };

  const handleGetLocation = async () => {
    const result = await getLocation();
    if (result.error) {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      });
      return;
    }

    if (result.coords) {
      form.setValue("latitude", result.coords.latitude.toString());
      form.setValue("longitude", result.coords.longitude.toString());
      
      if (result.address) {
        form.setValue("siteAddress", result.address);
      }
      
      toast({
        title: "Location captured",
        description: "Your current location has been captured successfully",
      });
    }
  };

  const handleSaveDraft = () => {
    const values = form.getValues();
    
    // Set status to draft
    values.status = "draft";
    
    // If inspection number is empty, auto-generate one
    if (!values.inspectionNumber) {
      values.inspectionNumber = generateInspectionNumber();
    }
    
    createInspectionMutation.mutate(values);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 container mx-auto p-4 pb-20 md:pb-4">
        <Card className="mb-4">
          <CardContent className="p-0">
            <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
              <h3 className="font-medium">New Inspection</h3>
              <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="p-4">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Inspection Details */}
                  <div className="mb-6">
                    <h4 className="text-sm font-medium uppercase text-gray-500 mb-3">
                      Inspection Details
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="inspectionNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Inspection Number</FormLabel>
                            <div className="flex">
                              <Input
                                value="INS-2023-"
                                readOnly
                                className="bg-gray-100 text-gray-500 rounded-l-md w-1/3"
                              />
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="Auto"
                                  className="rounded-l-none border-l-0 w-2/3"
                                />
                              </FormControl>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              Leave blank for auto-assignment
                            </p>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="inspectionDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Inspection Date</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="mt-4">
                      <FormField
                        control={form.control}
                        name="inspectionType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Inspection Type</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select inspection type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Routine Compliance Check">
                                  Routine Compliance Check
                                </SelectItem>
                                <SelectItem value="Response to Complaint">
                                  Response to Complaint
                                </SelectItem>
                                <SelectItem value="Follow-up Inspection">
                                  Follow-up Inspection
                                </SelectItem>
                                <SelectItem value="Safety Audit">
                                  Safety Audit
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="mt-4">
                      <FormField
                        control={form.control}
                        name="priority"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Priority</FormLabel>
                            <FormControl>
                              <RadioGroup
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                className="flex space-x-4"
                              >
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="low" id="low" />
                                  <Label htmlFor="low">Low</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="medium" id="medium" />
                                  <Label htmlFor="medium">Medium</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="high" id="high" />
                                  <Label htmlFor="high">High</Label>
                                </div>
                              </RadioGroup>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Site Information */}
                  <div className="mb-6">
                    <h4 className="text-sm font-medium uppercase text-gray-500 mb-3">
                      Site Information
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="siteAddress"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Site Address</FormLabel>
                            <div className="flex">
                              <FormControl>
                                <Input
                                  placeholder="Enter site address"
                                  {...field}
                                  className="rounded-r-none"
                                />
                              </FormControl>
                              <Button
                                type="button"
                                className="rounded-l-none"
                                onClick={handleGetLocation}
                                disabled={locationLoading}
                              >
                                <MapPin className="h-4 w-4" />
                              </Button>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              Or use GPS to capture current location
                            </p>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="daNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Development Application (DA) Number</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter DA number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <FormField
                        control={form.control}
                        name="principalContractor"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Principal Contractor</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter contractor name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="licenseNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>License Number</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter license number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="mt-4">
                      <FormField
                        control={form.control}
                        name="pca"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Principal Certifying Authority (PCA)</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter PCA details" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Site Photos section - Only shown after inspection creation */}
                  {createdInspectionId && (
                    <PhotoGallery inspectionId={createdInspectionId} title="Site Photos" />
                  )}

                  {/* People on Site - Button to navigate to people management */}
                  {createdInspectionId && (
                    <div className="mb-6">
                      <h4 className="text-sm font-medium uppercase text-gray-500 mb-3">
                        People on Site
                      </h4>
                      <Button
                        type="button"
                        onClick={() => navigate(`/inspections/${createdInspectionId}/people`)}
                      >
                        Manage People on Site
                      </Button>
                    </div>
                  )}

                  {/* Breaches - Button to add breaches, only shown after inspection creation */}
                  {createdInspectionId && (
                    <div className="mb-6">
                      <h4 className="text-sm font-medium uppercase text-gray-500 mb-3">
                        Breaches & Compliance Issues
                      </h4>
                      <Button
                        type="button"
                        variant="warning"
                        onClick={() => navigate(`/inspections/${createdInspectionId}/breaches/new`)}
                      >
                        Document New Breach
                      </Button>
                    </div>
                  )}

                  {/* Notes & Comments */}
                  <div className="mb-6">
                    <h4 className="text-sm font-medium uppercase text-gray-500 mb-3">
                      Notes & Comments
                    </h4>
                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Textarea
                              rows={4}
                              placeholder="Enter additional notes about the inspection"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex justify-end space-x-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleSaveDraft}
                      disabled={createInspectionMutation.isPending}
                    >
                      Save as Draft
                    </Button>
                    
                    {!createdInspectionId ? (
                      <Button
                        type="submit"
                        disabled={createInspectionMutation.isPending}
                      >
                        Create Inspection
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        variant="success"
                        onClick={() => navigate(`/inspections/${createdInspectionId}`)}
                      >
                        View Inspection
                      </Button>
                    )}
                  </div>
                </form>
              </Form>
            </div>
          </CardContent>
        </Card>
      </main>

      <BottomNavigation onCreateNew={() => {}} />
    </div>
  );
}
