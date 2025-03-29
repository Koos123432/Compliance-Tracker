import { useState, useEffect } from "react";
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
  TableCaption,
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Cross2Icon, PlusIcon } from "@radix-ui/react-icons";

const UserManagement = () => {
  const [addUserDialogOpen, setAddUserDialogOpen] = useState(false);
  const [addRoleDialogOpen, setAddRoleDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedTab, setSelectedTab] = useState("users");

  // Fetch users and roles
  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ['/api/users'],
    queryFn: () => fetch('/api/users').then(res => res.json())
  });

  const { data: roles = [], isLoading: rolesLoading } = useQuery({
    queryKey: ['/api/roles'],
    queryFn: () => fetch('/api/roles').then(res => res.json())
  });

  const { data: permissions = [], isLoading: permissionsLoading } = useQuery({
    queryKey: ['/api/permissions'],
    queryFn: () => fetch('/api/permissions').then(res => res.json())
  });

  // Form schemas
  const userFormSchema = z.object({
    username: z.string().min(3, "Username must be at least 3 characters"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    fullName: z.string().min(2, "Full name is required"),
    email: z.string().email("Invalid email address").optional().nullable(),
    phoneNumber: z.string().optional().nullable(),
    roleId: z.string().optional().nullable(),
  });

  const roleFormSchema = z.object({
    name: z.string().min(2, "Role name is required"),
    description: z.string().optional(),
    permissionLevel: z.number().min(1).max(100),
    selectedPermissions: z.array(z.number()).optional(),
  });

  // Form setup
  const userForm = useForm<z.infer<typeof userFormSchema>>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      username: "",
      password: "",
      fullName: "",
      email: "",
      phoneNumber: "",
      roleId: "",
    },
  });

  const roleForm = useForm<z.infer<typeof roleFormSchema>>({
    resolver: zodResolver(roleFormSchema),
    defaultValues: {
      name: "",
      description: "",
      permissionLevel: 10,
      selectedPermissions: [],
    },
  });

  // Mutations
  const createUserMutation = useMutation({
    mutationFn: (userData: any) => 
      apiRequest('/api/users', {
        method: 'POST',
        body: userData
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      toast({
        title: "User created successfully",
        variant: "success",
      });
      setAddUserDialogOpen(false);
      userForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error creating user",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const createRoleMutation = useMutation({
    mutationFn: async (roleData: any) => {
      // First create the role
      const role = await apiRequest('/api/roles', {
        method: 'POST',
        body: {
          name: roleData.name,
          description: roleData.description,
          permissionLevel: roleData.permissionLevel
        }
      });
      
      // Then add the permissions for this role if any are selected
      if (roleData.selectedPermissions && roleData.selectedPermissions.length > 0) {
        await Promise.all(roleData.selectedPermissions.map((permissionId: number) => 
          apiRequest('/api/role-permissions', {
            method: 'POST', 
            body: { roleId: role.id, permissionId }
          })
        ));
      }
      
      return role;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/roles'] });
      toast({
        title: "Role created successfully",
        variant: "success",
      });
      setAddRoleDialogOpen(false);
      roleForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error creating role",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const onSubmitUser = (data: z.infer<typeof userFormSchema>) => {
    createUserMutation.mutate({
      ...data,
      roleId: data.roleId ? parseInt(data.roleId) : null,
    });
  };

  const onSubmitRole = (data: z.infer<typeof roleFormSchema>) => {
    createRoleMutation.mutate(data);
  };

  const getRoleName = (roleId: number | null) => {
    if (!roleId) return "No role assigned";
    const role = roles.find((r: any) => r.id === roleId);
    return role ? role.name : "Unknown role";
  };

  const getPermissionCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      "admin": "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
      "inspection": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      "investigation": "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
      "report": "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      "default": "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
    };
    
    return colors[category] || colors.default;
  };

  // Group permissions by category
  const permissionsByCategory = permissions.reduce((acc: any, permission: any) => {
    if (!acc[permission.category]) {
      acc[permission.category] = [];
    }
    acc[permission.category].push(permission);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid grid-cols-2 w-[400px]">
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="roles">Roles & Permissions</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">User Management</h2>
            <Dialog open={addUserDialogOpen} onOpenChange={setAddUserDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <PlusIcon className="mr-2 h-4 w-4" />
                  Add User
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New User</DialogTitle>
                  <DialogDescription>
                    Create a new user account with role assignment.
                  </DialogDescription>
                </DialogHeader>
                <Form {...userForm}>
                  <form onSubmit={userForm.handleSubmit(onSubmitUser)} className="space-y-4">
                    <FormField
                      control={userForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input placeholder="username" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={userForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={userForm.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={userForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input placeholder="user@example.com" {...field} value={field.value || ''} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={userForm.control}
                        name="phoneNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input placeholder="+1 (555) 000-0000" {...field} value={field.value || ''} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={userForm.control}
                      name="roleId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Role</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value?.toString() || ""}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a role" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="">No Role</SelectItem>
                              {roles.map((role: any) => (
                                <SelectItem key={role.id} value={role.id.toString()}>
                                  {role.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <DialogFooter>
                      <Button 
                        type="submit"
                        disabled={createUserMutation.isPending}
                      >
                        {createUserMutation.isPending ? "Creating..." : "Create User"}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Username</TableHead>
                    <TableHead>Full Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usersLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center">Loading users...</TableCell>
                    </TableRow>
                  ) : users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center">No users found</TableCell>
                    </TableRow>
                  ) : (
                    users.map((user: any) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.username}</TableCell>
                        <TableCell>{user.fullName}</TableCell>
                        <TableCell>{user.email || "—"}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{getRoleName(user.roleId)}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline">Edit</Button>
                            <Button size="sm" variant="outline" className="text-red-500">
                              Deactivate
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Roles & Permissions</h2>
            <Dialog open={addRoleDialogOpen} onOpenChange={setAddRoleDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <PlusIcon className="mr-2 h-4 w-4" />
                  Add Role
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle>Add New Role</DialogTitle>
                  <DialogDescription>
                    Create a new role with specific permissions.
                  </DialogDescription>
                </DialogHeader>
                <Form {...roleForm}>
                  <form onSubmit={roleForm.handleSubmit(onSubmitRole)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={roleForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Role Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Senior Officer" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={roleForm.control}
                        name="permissionLevel"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Permission Level (1-100)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                min={1} 
                                max={100} 
                                placeholder="50" 
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={roleForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Input placeholder="Role description" {...field} value={field.value || ''} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="space-y-2">
                      <FormLabel>Permissions</FormLabel>
                      <div className="border rounded-md p-4 max-h-60 overflow-y-auto space-y-4">
                        {permissionsLoading ? (
                          <div className="text-center py-4">Loading permissions...</div>
                        ) : Object.entries(permissionsByCategory).length === 0 ? (
                          <div className="text-center py-4">No permissions found</div>
                        ) : (
                          Object.entries(permissionsByCategory).map(([category, perms]: [string, any]) => (
                            <div key={category} className="space-y-2">
                              <h4 className="font-medium first-letter:uppercase">
                                {category} Permissions
                              </h4>
                              <div className="grid grid-cols-2 gap-2">
                                {perms.map((permission: any) => (
                                  <FormField
                                    key={permission.id}
                                    control={roleForm.control}
                                    name="selectedPermissions"
                                    render={({ field }) => (
                                      <FormItem key={permission.id} className="flex space-x-2 space-y-0 items-center">
                                        <FormControl>
                                          <Checkbox
                                            checked={field.value?.includes(permission.id)}
                                            onCheckedChange={(checked) => {
                                              const current = [...(field.value || [])];
                                              if (checked) {
                                                field.onChange([...current, permission.id]);
                                              } else {
                                                field.onChange(current.filter(id => id !== permission.id));
                                              }
                                            }}
                                          />
                                        </FormControl>
                                        <FormLabel className="text-sm font-normal cursor-pointer">
                                          {permission.name}
                                        </FormLabel>
                                      </FormItem>
                                    )}
                                  />
                                ))}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                    
                    <DialogFooter>
                      <Button 
                        type="submit"
                        disabled={createRoleMutation.isPending}
                      >
                        {createRoleMutation.isPending ? "Creating..." : "Create Role"}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Role Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Permission Level</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rolesLoading ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center">Loading roles...</TableCell>
                    </TableRow>
                  ) : roles.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center">No roles found</TableCell>
                    </TableRow>
                  ) : (
                    roles.map((role: any) => (
                      <TableRow key={role.id}>
                        <TableCell className="font-medium">{role.name}</TableCell>
                        <TableCell>{role.description || "—"}</TableCell>
                        <TableCell>{role.permissionLevel}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline">Edit</Button>
                            <Button size="sm" variant="outline" className="text-red-500">
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <div className="mt-6">
            <h3 className="text-xl font-bold mb-4">Available Permissions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {permissionsLoading ? (
                <Card>
                  <CardContent className="p-6">Loading permissions...</CardContent>
                </Card>
              ) : Object.entries(permissionsByCategory).length === 0 ? (
                <Card>
                  <CardContent className="p-6">No permissions found</CardContent>
                </Card>
              ) : (
                Object.entries(permissionsByCategory).map(([category, permissions]: [string, any]) => (
                  <Card key={category}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg capitalize">{category}</CardTitle>
                      <CardDescription>
                        {permissions.length} permission{permissions.length !== 1 ? 's' : ''}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-4">
                      <div className="flex flex-wrap gap-2">
                        {permissions.map((permission: any) => (
                          <Badge key={permission.id} variant="outline" className={getPermissionCategoryColor(category)}>
                            {permission.name}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserManagement;