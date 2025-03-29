import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line } from 'recharts';

// Analytics data types
interface InspectionsByStatus {
  name: string;
  value: number;
  color: string;
}

interface InspectionTrend {
  month: string;
  inspections: number;
  breaches: number;
}

interface InspectionsByType {
  name: string;
  count: number;
}

interface BreachSeverity {
  severity: string;
  count: number;
  color: string;
}

interface AnalyticsDashboardProps {
  inspectionsByStatus?: InspectionsByStatus[];
  inspectionTrends?: InspectionTrend[];
  inspectionsByType?: InspectionsByType[];
  breachSeverity?: BreachSeverity[];
}

export default function AnalyticsDashboard({
  inspectionsByStatus = [],
  inspectionTrends = [],
  inspectionsByType = [],
  breachSeverity = []
}: AnalyticsDashboardProps) {
  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="mb-4">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="inspections">Inspections</TabsTrigger>
        <TabsTrigger value="breaches">Breaches</TabsTrigger>
        <TabsTrigger value="compliance">Compliance</TabsTrigger>
      </TabsList>
      
      <TabsContent value="overview" className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Inspections by Status */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium">Inspections by Status</CardTitle>
              <CardDescription>Distribution of inspections by current status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={inspectionsByStatus}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {inspectionsByStatus.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          {/* Inspection Trends */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium">Inspection & Breach Trends</CardTitle>
              <CardDescription>Monthly trends over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={inspectionTrends}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="inspections" stroke="#8884d8" activeDot={{ r: 8 }} />
                    <Line type="monotone" dataKey="breaches" stroke="#ff7300" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>
      
      <TabsContent value="inspections" className="space-y-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Inspections by Type</CardTitle>
            <CardDescription>Number of inspections categorized by type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={inspectionsByType}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="breaches" className="space-y-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Breach Severity Distribution</CardTitle>
            <CardDescription>Number of breaches by severity level</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={breachSeverity}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="severity" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count">
                    {breachSeverity.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="compliance" className="space-y-4">
        <Card className="col-span-full">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Compliance Rate Over Time</CardTitle>
            <CardDescription>Percentage of inspections without breaches</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={inspectionTrends}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    name="Compliance Rate (%)"
                    // Calculate compliance as percentage of inspections without breaches
                    dataKey={(data) => data.breaches === 0 ? 100 : 
                      Math.round((1 - data.breaches / data.inspections) * 100)}
                    stroke="#4CAF50" 
                    activeDot={{ r: 8 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}