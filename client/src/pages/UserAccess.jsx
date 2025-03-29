import { useState } from "react";
import UserManagement from "@/components/UserManagement";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Shield, Users, Lock, ShieldAlert, FileText } from "lucide-react";

const UserAccess = () => {
  const [activeTab, setActiveTab] = useState("users");

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold">User Rights & Access Management</h1>
        <p className="text-muted-foreground">
          Manage user accounts, roles, permissions, and access control across the system
        </p>
      </div>

      <Separator />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Access Control</CardTitle>
              <CardDescription>
                Manage all aspects of user access and permissions
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                orientation="vertical"
                className="w-full"
              >
                <TabsList className="flex flex-col h-auto w-full rounded-none items-start">
                  <TabsTrigger
                    value="users"
                    className="w-full justify-start py-3 px-4 gap-2 font-normal text-base"
                  >
                    <Users className="h-5 w-5" />
                    <span>Users & Roles</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="access"
                    className="w-full justify-start py-3 px-4 gap-2 font-normal text-base"
                  >
                    <Lock className="h-5 w-5" />
                    <span>Access Rights</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="permissions"
                    className="w-full justify-start py-3 px-4 gap-2 font-normal text-base"
                  >
                    <Shield className="h-5 w-5" />
                    <span>Permission Groups</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="audit"
                    className="w-full justify-start py-3 px-4 gap-2 font-normal text-base"
                  >
                    <FileText className="h-5 w-5" />
                    <span>Audit Log</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="security"
                    className="w-full justify-start py-3 px-4 gap-2 font-normal text-base"
                  >
                    <ShieldAlert className="h-5 w-5" />
                    <span>Security Settings</span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader className="pb-3">
              <CardTitle>Access Level Key</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-green-500"></div>
                    <span className="text-sm">Admin (Level 90-100)</span>
                  </div>
                  <span className="text-sm font-medium">Full Access</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                    <span className="text-sm">Manager (Level 70-89)</span>
                  </div>
                  <span className="text-sm font-medium">High Access</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                    <span className="text-sm">Senior Officer (Level 40-69)</span>
                  </div>
                  <span className="text-sm font-medium">Medium Access</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-orange-500"></div>
                    <span className="text-sm">Officer (Level 20-39)</span>
                  </div>
                  <span className="text-sm font-medium">Limited Access</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-gray-500"></div>
                    <span className="text-sm">Junior (Level 1-19)</span>
                  </div>
                  <span className="text-sm font-medium">Minimal Access</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3">
          <TabsContent value="users" className="m-0">
            <UserManagement />
          </TabsContent>
          
          <TabsContent value="access" className="m-0">
            <Card>
              <CardHeader>
                <CardTitle>Access Rights Management</CardTitle>
                <CardDescription>
                  Configure access rights for different modules and operations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  This section is under development. Access rights management allows 
                  fine-grained control over which roles can access specific features.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="permissions" className="m-0">
            <Card>
              <CardHeader>
                <CardTitle>Permission Groups</CardTitle>
                <CardDescription>
                  Group related permissions for easier role assignment
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  This section is under development. Permission groups simplify rights 
                  management by bundling permissions into logical groups.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="audit" className="m-0">
            <Card>
              <CardHeader>
                <CardTitle>Audit Log</CardTitle>
                <CardDescription>
                  Track all permission changes and user access activities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  This section is under development. The audit log will provide 
                  a chronological record of all changes to user rights and permissions.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="security" className="m-0">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>
                  Configure global security policies for user access
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  This section is under development. Security settings will include 
                  password policies, account lockout settings, and other security controls.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </div>
    </div>
  );
};

export default UserAccess;