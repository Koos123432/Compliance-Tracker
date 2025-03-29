import { useState } from "react";
import { useLocation, useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { X, Plus, Camera } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/layout/Header";
import BottomNavigation from "@/components/layout/BottomNavigation";
import PersonItem from "@/components/PersonItem";
import OCRScanner from "@/components/OCRScanner";
import { Skeleton } from "@/components/ui/skeleton";

const personFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  licenseNumber: z.string().optional(),
  role: z.string().optional(),
  contactNumber: z.string().optional(),
});

type PersonFormValues = z.infer<typeof personFormSchema>;

export default function PersonList() {
  const { id } = useParams();
  const inspectionId = parseInt(id, 10);
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [addPersonOpen, setAddPersonOpen] = useState(false);
  const [showOCRScanner, setShowOCRScanner] = useState(false);
  const [personToDelete, setPersonToDelete] = useState<number | null>(null);

  const { data: people, isLoading } = useQuery({
    queryKey: [`/api/inspections/${inspectionId}/people`],
  });

  const form = useForm<PersonFormValues>({
    resolver: zodResolver(personFormSchema),
    defaultValues: {
      name: "",
      licenseNumber: "",
      role: "",
      contactNumber: "",
    },
  });

  const createPersonMutation = useMutation({
    mutationFn: async (values: PersonFormValues) => {
      return apiRequest("POST", "/api/people", {
        ...values,
        inspectionId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [`/api/inspections/${inspectionId}/people`],
      });
      toast({
        title: "Person added",
        description: "The person has been added successfully",
      });
      setAddPersonOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add person. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deletePersonMutation = useMutation({
    mutationFn: async (personId: number) => {
      return apiRequest("DELETE", `/api/people/${personId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [`/api/inspections/${inspectionId}/people`],
      });
      toast({
        title: "Person removed",
        description: "The person has been removed successfully",
      });
      setPersonToDelete(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to remove person. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: PersonFormValues) => {
    createPersonMutation.mutate(values);
  };

  const handleDeletePerson = (personId: number) => {
    setPersonToDelete(personId);
  };

  const confirmDeletePerson = () => {
    if (personToDelete !== null) {
      deletePersonMutation.mutate(personToDelete);
    }
  };

  const handleOCRScanComplete = (data: any) => {
    if (data.name || data.licenseNumber) {
      form.setValue("name", data.name || "");
      form.setValue("licenseNumber", data.licenseNumber || "");
      setAddPersonOpen(true);
    } else {
      toast({
        title: "Scan Results",
        description: "No valid information could be extracted. Please enter details manually.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 container mx-auto p-4 pb-20 md:pb-4">
        <Card className="mb-4">
          <CardContent className="p-0">
            <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
              <h3 className="font-medium">People on Site</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(`/inspections/${inspectionId}`)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="p-4">
              <div className="mb-4 flex flex-col sm:flex-row sm:justify-between gap-3">
                <Button 
                  onClick={() => setShowOCRScanner(true)} 
                  className="flex items-center"
                >
                  <Camera className="mr-2 h-4 w-4" />
                  <span>Scan License</span>
                </Button>
                <p className="text-xs text-gray-500 sm:self-end">
                  Use OCR to scan driver's license or ID
                </p>
              </div>

              {isLoading ? (
                <>
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-gray-50 p-3 rounded-md mb-3 border border-gray-200">
                      <Skeleton className="h-5 w-40 mb-1" />
                      <Skeleton className="h-4 w-32 mb-1" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  ))}
                </>
              ) : people && people.length > 0 ? (
                people.map((person) => (
                  <PersonItem
                    key={person.id}
                    person={person}
                    onDelete={handleDeletePerson}
                  />
                ))
              ) : (
                <div className="text-center p-6 text-gray-500">
                  No people added yet. Add people using the buttons above.
                </div>
              )}

              <Button
                variant="link"
                onClick={() => setAddPersonOpen(true)}
                className="flex items-center text-primary p-0 mt-3"
              >
                <Plus className="h-4 w-4 mr-1" />
                <span>Add Person Manually</span>
              </Button>

              <div className="flex justify-end mt-6">
                <Button onClick={() => navigate(`/inspections/${inspectionId}`)}>
                  Back to Inspection
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Add Person Dialog */}
      <Dialog open={addPersonOpen} onOpenChange={setAddPersonOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Person</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter name" {...field} />
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

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter role (e.g., Site Manager)" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contactNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter contact number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setAddPersonOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createPersonMutation.isPending}>
                  Add Person
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={personToDelete !== null}
        onOpenChange={(open) => {
          if (!open) setPersonToDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Person</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this person from the inspection?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeletePerson}
              className="bg-red-500 hover:bg-red-600"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* OCR Scanner */}
      {showOCRScanner && (
        <OCRScanner
          onScanComplete={handleOCRScanComplete}
          onClose={() => setShowOCRScanner(false)}
        />
      )}

      <BottomNavigation onCreateNew={() => {}} />
    </div>
  );
}
