import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";

// Department form schema
const departmentFormSchema = z.object({
  name: z.string().min(2, { message: "Department name must be at least 2 characters." }),
  description: z.string().nullable().optional(),
  isActive: z.boolean().default(true),
  parentDepartmentId: z.number().nullable().optional()
});

// Access level form schema
const accessLevelFormSchema = z.object({
  name: z.string().min(2, { message: "Access level name must be at least 2 characters." }),
  level: z.number().min(1).max(10),
  description: z.string().nullable().optional()
});

export default function OrganizationManager() {
  const [activeTab, setActiveTab] = useState("departments");
  const [showDepartmentDialog, setShowDepartmentDialog] = useState(false);
  const [showAccessLevelDialog, setShowAccessLevelDialog] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<number | null>(null);
  const [editingAccessLevel, setEditingAccessLevel] = useState<number | null>(null);
  const { toast } = useToast();

  // Fetch departments
  const { data: departments, isLoading: isDepartmentsLoading } = useQuery({
    queryKey: ['/api/departments'],
    queryFn: async () => {
      const response = await fetch('/api/departments');
      if (!response.ok) {
        throw new Error('Failed to fetch departments');
      }
      return response.json();
    }
  });

  // Fetch access levels
  const { data: accessLevels, isLoading: isAccessLevelsLoading } = useQuery({
    queryKey: ['/api/access-levels'],
    queryFn: async () => {
      const response = await fetch('/api/access-levels');
      if (!response.ok) {
        throw new Error('Failed to fetch access levels');
      }
      return response.json();
    }
  });

  // Department form
  const departmentForm = useForm<z.infer<typeof departmentFormSchema>>({
    resolver: zodResolver(departmentFormSchema),
    defaultValues: {
      name: "",
      description: "",
      isActive: true,
      parentDepartmentId: null
    }
  });

  // Access level form
  const accessLevelForm = useForm<z.infer<typeof accessLevelFormSchema>>({
    resolver: zodResolver(accessLevelFormSchema),
    defaultValues: {
      name: "",
      level: 1,
      description: ""
    }
  });

  // Handle department creation/update
  const handleDepartmentSubmit = (values: z.infer<typeof departmentFormSchema>) => {
    if (editingDepartment) {
      updateDepartment.mutate({
        id: editingDepartment,
        data: values
      });
    } else {
      createDepartment.mutate(values);
    }
  };

  // Handle access level creation/update
  const handleAccessLevelSubmit = (values: z.infer<typeof accessLevelFormSchema>) => {
    if (editingAccessLevel) {
      updateAccessLevel.mutate({
        id: editingAccessLevel,
        data: values
      });
    } else {
      createAccessLevel.mutate(values);
    }
  };

  // Create department mutation
  const createDepartment = useMutation({
    mutationFn: async (data: z.infer<typeof departmentFormSchema>) => {
      return apiRequest('/api/departments', {
        method: 'POST',
        body: data
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/departments'] });
      setShowDepartmentDialog(false);
      departmentForm.reset();
      toast({
        title: "Department created",
        description: "The department has been created successfully."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error creating department",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Update department mutation
  const updateDepartment = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: z.infer<typeof departmentFormSchema> }) => {
      return apiRequest(`/api/departments/${id}`, {
        method: 'PATCH',
        body: data
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/departments'] });
      setShowDepartmentDialog(false);
      setEditingDepartment(null);
      departmentForm.reset();
      toast({
        title: "Department updated",
        description: "The department has been updated successfully."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error updating department",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Delete department mutation
  const deleteDepartment = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/departments/${id}`, {
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/departments'] });
      toast({
        title: "Department deleted",
        description: "The department has been deleted successfully."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error deleting department",
        description: error.message || "Cannot delete department with assigned users",
        variant: "destructive"
      });
    }
  });

  // Create access level mutation
  const createAccessLevel = useMutation({
    mutationFn: async (data: z.infer<typeof accessLevelFormSchema>) => {
      return apiRequest('/api/access-levels', {
        method: 'POST',
        body: data
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/access-levels'] });
      setShowAccessLevelDialog(false);
      accessLevelForm.reset();
      toast({
        title: "Access level created",
        description: "The access level has been created successfully."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error creating access level",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Update access level mutation
  const updateAccessLevel = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: z.infer<typeof accessLevelFormSchema> }) => {
      return apiRequest(`/api/access-levels/${id}`, {
        method: 'PATCH',
        body: data
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/access-levels'] });
      setShowAccessLevelDialog(false);
      setEditingAccessLevel(null);
      accessLevelForm.reset();
      toast({
        title: "Access level updated",
        description: "The access level has been updated successfully."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error updating access level",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Delete access level mutation
  const deleteAccessLevel = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/access-levels/${id}`, {
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/access-levels'] });
      toast({
        title: "Access level deleted",
        description: "The access level has been deleted successfully."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error deleting access level",
        description: error.message || "Cannot delete access level with assigned users",
        variant: "destructive"
      });
    }
  });

  // Edit department
  const handleEditDepartment = (department: any) => {
    setEditingDepartment(department.id);
    departmentForm.reset({
      name: department.name,
      description: department.description || "",
      isActive: department.isActive,
      parentDepartmentId: department.parentDepartmentId
    });
    setShowDepartmentDialog(true);
  };

  // Edit access level
  const handleEditAccessLevel = (accessLevel: any) => {
    setEditingAccessLevel(accessLevel.id);
    accessLevelForm.reset({
      name: accessLevel.name,
      level: accessLevel.level,
      description: accessLevel.description || ""
    });
    setShowAccessLevelDialog(true);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Organization Structure</h2>
      <p className="text-muted-foreground">
        Manage departments and access levels for your organization.
      </p>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full md:w-[400px] grid-cols-2">
          <TabsTrigger value="departments">Departments</TabsTrigger>
          <TabsTrigger value="access-levels">Access Levels</TabsTrigger>
        </TabsList>
        
        {/* Departments Tab */}
        <TabsContent value="departments" className="space-y-4 mt-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold">Departments</h3>
            <Dialog open={showDepartmentDialog} onOpenChange={setShowDepartmentDialog}>
              <DialogTrigger asChild>
                <Button onClick={() => {
                  setEditingDepartment(null);
                  departmentForm.reset({
                    name: "",
                    description: "",
                    isActive: true,
                    parentDepartmentId: null
                  });
                }}>
                  Add Department
                </Button>
              </DialogTrigger>
              
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>{editingDepartment ? "Edit Department" : "Add Department"}</DialogTitle>
                  <DialogDescription>
                    {editingDepartment 
                      ? "Update the department details below."
                      : "Fill in the details to create a new department."}
                  </DialogDescription>
                </DialogHeader>
                
                <Form {...departmentForm}>
                  <form onSubmit={departmentForm.handleSubmit(handleDepartmentSubmit)} className="space-y-4">
                    <FormField
                      control={departmentForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter department name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={departmentForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Enter department description" {...field} value={field.value || ""} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={departmentForm.control}
                      name="isActive"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Active Status</FormLabel>
                            <FormDescription>
                              Set whether this department is active
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    {!isDepartmentsLoading && departments?.length > 0 && (
                      <FormField
                        control={departmentForm.control}
                        name="parentDepartmentId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Parent Department</FormLabel>
                            <select
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                              value={field.value || ""}
                              onChange={(e) => field.onChange(e.target.value === "" ? null : Number(e.target.value))}
                            >
                              <option value="">None</option>
                              {departments.map((dept: any) => (
                                editingDepartment !== dept.id && (
                                  <option key={dept.id} value={dept.id}>
                                    {dept.name}
                                  </option>
                                )
                              ))}
                            </select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                    
                    <DialogFooter>
                      <Button variant="outline" type="button" onClick={() => setShowDepartmentDialog(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={departmentForm.formState.isSubmitting}>
                        {editingDepartment ? "Update" : "Create"}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {isDepartmentsLoading ? (
              <p>Loading departments...</p>
            ) : departments?.length > 0 ? (
              departments.map((department: any) => (
                <Card key={department.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{department.name}</CardTitle>
                      {!department.isActive && (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </div>
                    {department.parentDepartmentId && (
                      <CardDescription>
                        Parent: {departments.find((d: any) => d.id === department.parentDepartmentId)?.name || 'Unknown'}
                      </CardDescription>
                    )}
                  </CardHeader>
                  
                  <CardContent className="pb-2">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {department.description || 'No description provided'}
                    </p>
                  </CardContent>
                  
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" size="sm" onClick={() => handleEditDepartment(department)}>
                      Edit
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={() => deleteDepartment.mutate(department.id)}
                    >
                      Delete
                    </Button>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <p>No departments found. Create your first department!</p>
            )}
          </div>
        </TabsContent>
        
        {/* Access Levels Tab */}
        <TabsContent value="access-levels" className="space-y-4 mt-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold">Access Levels</h3>
            <Dialog open={showAccessLevelDialog} onOpenChange={setShowAccessLevelDialog}>
              <DialogTrigger asChild>
                <Button onClick={() => {
                  setEditingAccessLevel(null);
                  accessLevelForm.reset({
                    name: "",
                    level: 1,
                    description: ""
                  });
                }}>
                  Add Access Level
                </Button>
              </DialogTrigger>
              
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>{editingAccessLevel ? "Edit Access Level" : "Add Access Level"}</DialogTitle>
                  <DialogDescription>
                    {editingAccessLevel 
                      ? "Update the access level details below."
                      : "Fill in the details to create a new access level."}
                  </DialogDescription>
                </DialogHeader>
                
                <Form {...accessLevelForm}>
                  <form onSubmit={accessLevelForm.handleSubmit(handleAccessLevelSubmit)} className="space-y-4">
                    <FormField
                      control={accessLevelForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter access level name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={accessLevelForm.control}
                      name="level"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Level (1-10)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="Enter level (1-10)" 
                              min={1}
                              max={10}
                              {...field} 
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormDescription>
                            Higher number indicates higher access level permissions (1-10)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={accessLevelForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Enter access level description" {...field} value={field.value || ""} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <DialogFooter>
                      <Button variant="outline" type="button" onClick={() => setShowAccessLevelDialog(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={accessLevelForm.formState.isSubmitting}>
                        {editingAccessLevel ? "Update" : "Create"}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {isAccessLevelsLoading ? (
              <p>Loading access levels...</p>
            ) : accessLevels?.length > 0 ? (
              [...accessLevels]
                .sort((a: any, b: any) => b.level - a.level)
                .map((accessLevel: any) => (
                <Card key={accessLevel.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{accessLevel.name}</CardTitle>
                      <Badge variant="outline" className="ml-2">
                        Level {accessLevel.level}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pb-2">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {accessLevel.description || 'No description provided'}
                    </p>
                  </CardContent>
                  
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" size="sm" onClick={() => handleEditAccessLevel(accessLevel)}>
                      Edit
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={() => deleteAccessLevel.mutate(accessLevel.id)}
                    >
                      Delete
                    </Button>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <p>No access levels found. Create your first access level!</p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}