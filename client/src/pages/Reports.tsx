import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Download, Mail, Search, ArrowUpDown, FileText } from "lucide-react";
import { format } from "date-fns";
import Header from "@/components/layout/Header";
import BottomNavigation from "@/components/layout/BottomNavigation";
import { Skeleton } from "@/components/ui/skeleton";
import { generateInspectionReport, downloadReport } from "@/lib/pdfGenerator";
import { useToast } from "@/hooks/use-toast";

export default function Reports() {
  const [_, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<string>("createdAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const { toast } = useToast();
  
  // Get all inspections
  const { data: inspections, isLoading: inspectionsLoading } = useQuery({
    queryKey: ["/api/inspections"],
  });
  
  // Get all reports
  const { data: reports, isLoading: reportsLoading } = useQuery({
    queryKey: ["/api/reports"],
  });
  
  const isLoading = inspectionsLoading || reportsLoading;
  
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };
  
  const handleDownloadReport = async (inspectionId: number) => {
    try {
      // Fetch all the data needed for the report
      const inspectionResponse = await fetch(`/api/inspections/${inspectionId}`);
      if (!inspectionResponse.ok) throw new Error("Failed to fetch inspection");
      const inspection = await inspectionResponse.json();
      
      const breachesResponse = await fetch(`/api/inspections/${inspectionId}/breaches`);
      if (!breachesResponse.ok) throw new Error("Failed to fetch breaches");
      const breaches = await breachesResponse.json();
      
      const peopleResponse = await fetch(`/api/inspections/${inspectionId}/people`);
      if (!peopleResponse.ok) throw new Error("Failed to fetch people");
      const people = await peopleResponse.json();
      
      const photosResponse = await fetch(`/api/inspections/${inspectionId}/photos`);
      if (!photosResponse.ok) throw new Error("Failed to fetch photos");
      const photos = await photosResponse.json();
      
      // Generate and download the report
      const report = await generateInspectionReport(
        inspection,
        breaches,
        people,
        photos
      );
      
      downloadReport(report.blob, report.filename);
      
      toast({
        title: "Report Downloaded",
        description: "The inspection report has been downloaded",
      });
    } catch (error) {
      console.error("Error downloading report:", error);
      toast({
        title: "Error",
        description: "Failed to download report. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const sortedInspections = inspections
    ? [...inspections].sort((a, b) => {
        const aValue = a[sortField];
        const bValue = b[sortField];
        
        if (sortDirection === "asc") {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      })
    : [];
  
  const filteredInspections = sortedInspections.filter(inspection => 
    inspection.inspectionNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    inspection.siteAddress.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1 container mx-auto p-4 pb-20 md:pb-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold">Reports</h1>
          
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
            <Input
              placeholder="Search by number or address"
              className="pl-8 w-full md:w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Inspection Reports</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-8 w-full" />
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : filteredInspections.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[150px]">
                        <Button
                          variant="ghost"
                          className="p-0 h-auto font-medium"
                          onClick={() => handleSort("inspectionNumber")}
                        >
                          Inspection #
                          <ArrowUpDown className="ml-2 h-3 w-3" />
                        </Button>
                      </TableHead>
                      <TableHead>
                        <Button
                          variant="ghost"
                          className="p-0 h-auto font-medium"
                          onClick={() => handleSort("siteAddress")}
                        >
                          Site Address
                          <ArrowUpDown className="ml-2 h-3 w-3" />
                        </Button>
                      </TableHead>
                      <TableHead className="w-[140px]">
                        <Button
                          variant="ghost"
                          className="p-0 h-auto font-medium"
                          onClick={() => handleSort("inspectionDate")}
                        >
                          Date
                          <ArrowUpDown className="ml-2 h-3 w-3" />
                        </Button>
                      </TableHead>
                      <TableHead className="w-[100px]">
                        <Button
                          variant="ghost"
                          className="p-0 h-auto font-medium"
                          onClick={() => handleSort("status")}
                        >
                          Status
                          <ArrowUpDown className="ml-2 h-3 w-3" />
                        </Button>
                      </TableHead>
                      <TableHead className="w-[150px] text-right">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInspections.map((inspection) => (
                      <TableRow key={inspection.id}>
                        <TableCell className="font-medium">
                          {inspection.inspectionNumber}
                        </TableCell>
                        <TableCell>{inspection.siteAddress}</TableCell>
                        <TableCell>
                          {format(new Date(inspection.inspectionDate), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`inline-block px-2 py-1 rounded-full text-xs ${
                              inspection.status === "completed"
                                ? "bg-green-100 text-green-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {inspection.status === "completed" ? "Completed" : "Scheduled"}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDownloadReport(inspection.id)}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(`/inspections/${inspection.id}`)}
                            >
                              <FileText className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center p-8">
                <FileText className="mx-auto h-10 w-10 text-gray-400 mb-3" />
                <h2 className="text-lg font-medium mb-1">No Reports Found</h2>
                <p className="text-gray-500 mb-4">
                  {searchQuery
                    ? "No inspections match your search criteria."
                    : "There are no inspection reports available."}
                </p>
                <Button onClick={() => navigate("/inspections/new")}>
                  Create New Inspection
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      
      <BottomNavigation onCreateNew={() => navigate("/inspections/new")} />
    </div>
  );
}
