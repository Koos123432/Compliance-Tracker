import { useState } from "react";
import { useLocation, useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { 
  ChevronLeft, 
  Plus, 
  User, 
  Camera, 
  AlertTriangle, 
  Mail, 
  Edit, 
  Download, 
  Calendar,
  CheckSquare 
} from "lucide-react";
import { format } from "date-fns";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/layout/Header";
import BottomNavigation from "@/components/layout/BottomNavigation";
import PhotoGallery from "@/components/PhotoGallery";
import BreachItem from "@/components/BreachItem";
import PersonItem from "@/components/PersonItem";
import { generateInspectionReport, downloadReport, emailReport } from "@/lib/pdfGenerator";
import { Skeleton } from "@/components/ui/skeleton";

export default function InspectionDetails() {
  const { id } = useParams();
  const inspectionId = parseInt(id, 10);
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showSendReportDialog, setShowSendReportDialog] = useState(false);
  const [emailTo, setEmailTo] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [sendingEmail, setSendingEmail] = useState(false);
  
  // Get inspection details
  const { data: inspection, isLoading: inspectionLoading } = useQuery({
    queryKey: [`/api/inspections/${inspectionId}`],
  });
  
  // Get breaches for this inspection
  const { data: breaches, isLoading: breachesLoading } = useQuery({
    queryKey: [`/api/inspections/${inspectionId}/breaches`],
  });
  
  // Get people for this inspection
  const { data: people, isLoading: peopleLoading } = useQuery({
    queryKey: [`/api/inspections/${inspectionId}/people`],
  });
  
  // Get photos for this inspection
  const { data: photos, isLoading: photosLoading } = useQuery({
    queryKey: [`/api/inspections/${inspectionId}/photos`],
  });
  
  // Complete inspection mutation
  const completeInspectionMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("PATCH", `/api/inspections/${inspectionId}`, {
        status: "completed"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [`/api/inspections/${inspectionId}`],
      });
      queryClient.invalidateQueries({
        queryKey: ["/api/inspections"],
      });
      toast({
        title: "Inspection Completed",
        description: "The inspection has been marked as completed",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to complete inspection. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  // Create report mutation
  const createReportMutation = useMutation({
    mutationFn: async (reportUrl: string) => {
      return apiRequest("POST", "/api/reports", {
        inspectionId,
        reportUrl,
        sentToEmail: emailTo,
        sentAt: new Date(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/activities"],
      });
      toast({
        title: "Report Created",
        description: "The inspection report has been created successfully",
      });
    },
  });
  
  const handleCompleteInspection = () => {
    completeInspectionMutation.mutate();
  };
  
  const isLoading = inspectionLoading || breachesLoading || peopleLoading || photosLoading;
  
  const handleDeletePerson = async (personId: number) => {
    try {
      await apiRequest("DELETE", `/api/people/${personId}`);
      queryClient.invalidateQueries({
        queryKey: [`/api/inspections/${inspectionId}/people`],
      });
      toast({
        title: "Person Removed",
        description: "The person has been removed from the inspection",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove person. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const handleDownloadReport = async () => {
    if (!inspection || !breaches || !people || !photos) {
      toast({
        title: "Error",
        description: "Cannot generate report. Missing data.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const report = await generateInspectionReport(
        inspection,
        breaches,
        people,
        photos
      );
      
      // Create report in the database
      createReportMutation.mutate(report.filename);
      
      // Download the report
      downloadReport(report.blob, report.filename);
      
      toast({
        title: "Report Downloaded",
        description: "The inspection report has been downloaded",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate report. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const initiateSendReport = () => {
    if (!inspection) return;
    
    // Pre-fill the email form
    setEmailTo("");
    setEmailSubject(`Compliance Inspection Report: ${inspection.inspectionNumber}`);
    setEmailBody(`Dear Sir/Madam,\n\nPlease find attached the compliance inspection report for ${inspection.siteAddress} conducted on ${format(new Date(inspection.inspectionDate), "MMMM d, yyyy")}.\n\nPlease address any identified breaches by the specified deadlines.\n\nRegards,\nCompliance Officer`);
    
    setShowSendReportDialog(true);
  };
  
  const handleSendReport = async () => {
    if (!inspection || !breaches || !people || !photos || !emailTo) {
      toast({
        title: "Error",
        description: "Cannot send report. Missing data or recipient email.",
        variant: "destructive",
      });
      return;
    }
    
    setSendingEmail(true);
    
    try {
      const report = await generateInspectionReport(
        inspection,
        breaches,
        people,
        photos
      );
      
      // Create report in the database
      createReportMutation.mutate(report.filename);
      
      // Send the report via email
      await emailReport(
        report.blob,
        emailTo,
        emailSubject,
        emailBody
      );
      
      setShowSendReportDialog(false);
      
      toast({
        title: "Report Sent",
        description: `The inspection report has been sent to ${emailTo}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSendingEmail(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 container mx-auto p-4 pb-20 md:pb-4">
          <Button variant="ghost" className="mb-4" onClick={() => navigate("/")}>
            <ChevronLeft className="mr-1 h-4 w-4" />
            <span>Back</span>
          </Button>
          
          <Card className="mb-4">
            <CardContent className="p-6">
              <Skeleton className="h-7 w-64 mb-3" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Skeleton className="h-5 w-full mb-2" />
                <Skeleton className="h-5 w-full mb-2" />
                <Skeleton className="h-5 w-full mb-2" />
                <Skeleton className="h-5 w-full mb-2" />
              </div>
            </CardContent>
          </Card>
          
          <Skeleton className="h-40 w-full mb-4" />
          <Skeleton className="h-40 w-full mb-4" />
          <Skeleton className="h-40 w-full mb-4" />
        </main>
        <BottomNavigation onCreateNew={() => {}} />
      </div>
    );
  }
  
  if (!inspection) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 container mx-auto p-4 pb-20 md:pb-4">
          <Button variant="ghost" className="mb-4" onClick={() => navigate("/")}>
            <ChevronLeft className="mr-1 h-4 w-4" />
            <span>Back</span>
          </Button>
          
          <Card className="mb-4">
            <CardContent className="p-6 text-center">
              <h2 className="text-xl font-bold mb-2">Inspection Not Found</h2>
              <p className="text-gray-500 mb-4">The inspection you're looking for doesn't exist or has been removed.</p>
              <Button onClick={() => navigate("/")}>Return to Dashboard</Button>
            </CardContent>
          </Card>
        </main>
        <BottomNavigation onCreateNew={() => {}} />
      </div>
    );
  }
  
  const isCompleted = inspection.status === "completed";
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1 container mx-auto p-4 pb-20 md:pb-4">
        <Button variant="ghost" className="mb-4" onClick={() => navigate("/")}>
          <ChevronLeft className="mr-1 h-4 w-4" />
          <span>Back</span>
        </Button>
        
        <Card className="mb-4">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-4">
              <div>
                <h2 className="text-xl font-bold">{inspection.inspectionNumber}</h2>
                <p className="text-gray-500">
                  {format(new Date(inspection.inspectionDate), "MMMM d, yyyy 'at' h:mm a")}
                </p>
              </div>
              <div className="mt-2 md:mt-0">
                <div className={`inline-block px-2 py-1 rounded-full text-xs ${
                  inspection.status === "completed" 
                    ? "bg-green-100 text-green-800" 
                    : "bg-blue-100 text-blue-800"
                }`}>
                  {inspection.status === "completed" ? "Completed" : "Scheduled"}
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <h3 className="font-medium text-sm text-gray-500">Site Address</h3>
                <p>{inspection.siteAddress}</p>
              </div>
              <div>
                <h3 className="font-medium text-sm text-gray-500">DA Number</h3>
                <p>{inspection.daNumber || "Not specified"}</p>
              </div>
              <div>
                <h3 className="font-medium text-sm text-gray-500">Principal Contractor</h3>
                <p>{inspection.principalContractor || "Not specified"}</p>
              </div>
              <div>
                <h3 className="font-medium text-sm text-gray-500">License Number</h3>
                <p>{inspection.licenseNumber || "Not specified"}</p>
              </div>
              <div>
                <h3 className="font-medium text-sm text-gray-500">PCA</h3>
                <p>{inspection.pca || "Not specified"}</p>
              </div>
              <div>
                <h3 className="font-medium text-sm text-gray-500">Priority</h3>
                <p className="capitalize">{inspection.priority}</p>
              </div>
            </div>
            
            {inspection.notes && (
              <div className="mb-4">
                <h3 className="font-medium text-sm text-gray-500">Notes</h3>
                <p className="whitespace-pre-line">{inspection.notes}</p>
              </div>
            )}
            
            <div className="flex flex-wrap gap-2 mt-4">
              {!isCompleted && (
                <Button onClick={handleCompleteInspection}>
                  <CheckSquare className="mr-2 h-4 w-4" />
                  Complete Inspection
                </Button>
              )}
              
              <Button variant="outline" onClick={handleDownloadReport}>
                <Download className="mr-2 h-4 w-4" />
                Download Report
              </Button>
              
              <Button variant="outline" onClick={initiateSendReport}>
                <Mail className="mr-2 h-4 w-4" />
                Email Report
              </Button>
              
              <Button variant="outline" onClick={() => navigate(`/schedule?inspection=${inspectionId}`)}>
                <Calendar className="mr-2 h-4 w-4" />
                Schedule Follow-up
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card className="mb-4">
          <CardHeader className="px-6 py-4">
            <div className="flex justify-between items-center">
              <CardTitle className="text-base font-medium">Site Photos</CardTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate(`/inspections/${inspectionId}/edit`)}
                disabled={isCompleted}
              >
                <Edit className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <PhotoGallery inspectionId={inspectionId} />
          </CardContent>
        </Card>
        
        <Card className="mb-4">
          <CardHeader className="px-6 py-4">
            <div className="flex justify-between items-center">
              <CardTitle className="text-base font-medium">People on Site</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(`/inspections/${inspectionId}/people`)}
                disabled={isCompleted}
              >
                <Edit className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            {people && people.length > 0 ? (
              <div className="space-y-3">
                {people.map((person) => (
                  <PersonItem
                    key={person.id}
                    person={person}
                    onDelete={handleDeletePerson}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center p-4">
                <User className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <h3 className="text-sm font-medium mb-1">No People Added</h3>
                <p className="text-xs text-gray-500 mb-3">
                  Add people who were present during the inspection
                </p>
                {!isCompleted && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/inspections/${inspectionId}/people`)}
                  >
                    <User className="mr-2 h-4 w-4" />
                    Manage People
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card className="mb-4">
          <CardHeader className="px-6 py-4">
            <div className="flex justify-between items-center">
              <CardTitle className="text-base font-medium">Breaches & Compliance Issues</CardTitle>
              {!isCompleted && (
                <Button
                  variant="warning"
                  size="sm"
                  onClick={() => navigate(`/inspections/${inspectionId}/breaches/new`)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Breach
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            {breaches && breaches.length > 0 ? (
              <div className="space-y-3">
                {breaches.map((breach) => (
                  <BreachItem key={breach.id} breach={breach} />
                ))}
              </div>
            ) : (
              <div className="text-center p-4">
                <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <h3 className="text-sm font-medium mb-1">No Breaches Documented</h3>
                <p className="text-xs text-gray-500 mb-3">
                  No compliance issues were found during this inspection
                </p>
                {!isCompleted && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/inspections/${inspectionId}/breaches/new`)}
                  >
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    Document Breach
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      
      {/* Email Report Dialog */}
      <Dialog open={showSendReportDialog} onOpenChange={setShowSendReportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Inspection Report</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="emailTo" className="text-sm font-medium">
                Recipient Email
              </label>
              <Input
                id="emailTo"
                value={emailTo}
                onChange={(e) => setEmailTo(e.target.value)}
                placeholder="Enter recipient email"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="emailSubject" className="text-sm font-medium">
                Subject
              </label>
              <Input
                id="emailSubject"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="emailBody" className="text-sm font-medium">
                Message
              </label>
              <Textarea
                id="emailBody"
                value={emailBody}
                onChange={(e) => setEmailBody(e.target.value)}
                rows={5}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowSendReportDialog(false)}
              disabled={sendingEmail}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSendReport}
              disabled={sendingEmail || !emailTo}
            >
              {sendingEmail ? "Sending..." : "Send Report"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <BottomNavigation onCreateNew={() => {}} />
    </div>
  );
}
