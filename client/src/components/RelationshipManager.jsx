import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Trash2, Edit, Plus, Link } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Person, PersonRelationship } from "@shared/schema";

const relationshipSchema = z.object({
  personId: z.number({
    required_error: "Please select a person",
  }),
  relatedPersonId: z.number({
    required_error: "Please select a related person",
  }),
  relationshipType: z.string({
    required_error: "Please select a relationship type",
  }),
  strength: z.string().optional(),
  description: z.string().optional(),
  isVerified: z.boolean().default(false),
});

type RelationshipFormValues = z.infer<typeof relationshipSchema>;

interface RelationshipManagerProps {
  investigationId: number;
}

export default function RelationshipManager({ investigationId }: RelationshipManagerProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editRelationship, setEditRelationship] = useState<PersonRelationship | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const form = useForm<RelationshipFormValues>({
    resolver: zodResolver(relationshipSchema),
    defaultValues: {
      personId: 0,
      relatedPersonId: 0,
      relationshipType: "",
      strength: "medium",
      description: "",
      isVerified: false,
    },
  });

  // Query people
  const { data: people = [] } = useQuery({
    queryKey: ["/api/people"],
    queryFn: async () => {
      const response = await fetch("/api/people");
      if (!response.ok) throw new Error("Failed to fetch people");
      return response.json();
    },
  });

  // Query relationship
  const { data: relationships = [], isLoading } = useQuery({
    queryKey: ["/api/person-relationships", investigationId],
    queryFn: async () => {
      // Fetch all relationships for this investigation
      const personIds = people.map((p: Person) => p.id);
      
      // For each person, fetch their relationships
      const relationshipPromises = personIds.map(async (personId: number) => {
        const response = await fetch(`/api/people/${personId}/relationships?investigationId=${investigationId}`);
        if (!response.ok) throw new Error(`Failed to fetch relationships for person ${personId}`);
        return response.json();
      });
      
      const allRelationships = await Promise.all(relationshipPromises);
      // Flatten array of arrays
      return allRelationships.flat();
    },
    enabled: people.length > 0,
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: RelationshipFormValues) => {
      return apiRequest(`/api/person-relationships`, {
        method: "POST",
        body: { ...data, investigationId },
      });
    },
    onSuccess: () => {
      toast({
        title: "Relationship created",
        description: "The relationship has been successfully created.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/person-relationships", investigationId] });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create relationship: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (data: RelationshipFormValues & { id: number }) => {
      const { id, ...rest } = data;
      return apiRequest(`/api/person-relationships/${id}`, {
        method: "PATCH",
        body: rest,
      });
    },
    onSuccess: () => {
      toast({
        title: "Relationship updated",
        description: "The relationship has been successfully updated.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/person-relationships", investigationId] });
      setIsDialogOpen(false);
      setEditRelationship(null);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update relationship: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/person-relationships/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      toast({
        title: "Relationship deleted",
        description: "The relationship has been successfully deleted.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/person-relationships", investigationId] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete relationship: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: RelationshipFormValues) => {
    if (editRelationship) {
      updateMutation.mutate({ ...data, id: editRelationship.id });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (relationship: PersonRelationship) => {
    setEditRelationship(relationship);
    form.reset({
      personId: relationship.personId,
      relatedPersonId: relationship.relatedPersonId,
      relationshipType: relationship.relationshipType,
      strength: relationship.strength || "medium",
      description: relationship.description || "",
      isVerified: relationship.isVerified || false,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this relationship?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleAddNew = () => {
    setEditRelationship(null);
    form.reset({
      personId: 0,
      relatedPersonId: 0,
      relationshipType: "",
      strength: "medium",
      description: "",
      isVerified: false,
    });
    setIsDialogOpen(true);
  };

  const getPersonName = (id: number) => {
    const person = people.find((p: Person) => p.id === id);
    return person ? person.name : "Unknown Person";
  };

  const getRelationshipColor = (strength: string | null) => {
    switch (strength) {
      case "strong":
        return "bg-green-100 text-green-800";
      case "medium":
        return "bg-blue-100 text-blue-800";
      case "weak":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Person Relationships</h3>
        <Button onClick={handleAddNew} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Relationship
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-4">Loading relationships...</div>
      ) : relationships.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No relationships have been added yet.
          <br />
          <Button variant="outline" onClick={handleAddNew} className="mt-2">
            <Plus className="h-4 w-4 mr-2" />
            Add Relationship
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
          {relationships.map((relationship: PersonRelationship) => (
            <Card key={relationship.id}>
              <CardHeader className="p-4 pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-md font-medium">
                    {getPersonName(relationship.personId)}
                    <span className="mx-2">→</span>
                    {getPersonName(relationship.relatedPersonId)}
                  </CardTitle>
                  <div className="flex space-x-1">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(relationship)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(relationship.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
                <div className="flex gap-2 mt-1">
                  <Badge>{relationship.relationshipType}</Badge>
                  {relationship.strength && (
                    <Badge variant="outline" className={getRelationshipColor(relationship.strength)}>
                      {relationship.strength}
                    </Badge>
                  )}
                  {relationship.isVerified && <Badge variant="outline" className="bg-green-50 text-green-700">Verified</Badge>}
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                {relationship.description && <p className="text-sm">{relationship.description}</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editRelationship ? "Edit Relationship" : "Add Relationship"}</DialogTitle>
            <DialogDescription>
              Define relationships between people involved in this investigation.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="personId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Primary Person</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      value={field.value.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a person" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {people.map((person: Person) => (
                          <SelectItem
                            key={person.id}
                            value={person.id.toString()}
                          >
                            {person.name} - {person.role || "Unknown role"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="relationshipType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Relationship Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="supervisor">Supervisor</SelectItem>
                        <SelectItem value="employee">Employee</SelectItem>
                        <SelectItem value="contractor">Contractor</SelectItem>
                        <SelectItem value="client">Client</SelectItem>
                        <SelectItem value="witness">Witness</SelectItem>
                        <SelectItem value="relative">Relative</SelectItem>
                        <SelectItem value="business_partner">Business Partner</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="relatedPersonId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Related Person</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      value={field.value.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select related person" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {people
                          .filter((person: Person) => person.id !== form.getValues("personId"))
                          .map((person: Person) => (
                            <SelectItem
                              key={person.id}
                              value={person.id.toString()}
                            >
                              {person.name} - {person.role || "Unknown role"}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="strength"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Relationship Strength</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || "medium"}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select strength" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="strong">Strong</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="weak">Weak</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      How strong is this relationship in the context of the investigation?
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
                        placeholder="Additional notes about this relationship"
                        className="resize-none"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isVerified"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Verified Relationship</FormLabel>
                      <FormDescription>
                        Confirm this relationship has been verified through official sources
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

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
                    : editRelationship
                    ? "Update Relationship"
                    : "Create Relationship"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}