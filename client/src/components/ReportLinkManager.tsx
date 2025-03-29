import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
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
import { Trash2, Plus, FileText, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Report, ReportInvestigationLink } from "@shared/schema";

const reportLinkSchema = z.object({
  reportId: z.number({
    required_error: "Please select a report",
  }),
  linkType: z.string().min(1, "Link type is required"),
  notes: z.string().optional(),
});

type ReportLinkFormValues = z.infer<typeof reportLinkSchema>;

interface ReportLinkManagerProps {
  investigationId: number;
}

export default function ReportLinkManager({ investigationId }: ReportLinkManagerProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const form = useForm<ReportLinkFormValues>({
    resolver: zodResolver(reportLinkSchema),
    defaultValues: {
      reportId: 0,
      linkType: "evidence",
      notes: "",
    },
  });

  // Query all reports
  const { data: reports = [] } = useQuery({
    queryKey: ["/api/reports"],
    queryFn: async () => {
      let allReports: Report[] = [];
      
      try {
        // Get all inspections first
        const inspectionsResponse = await fetch("/api/inspections");
        if (inspectionsResponse.ok) {
          const inspections = await inspectionsResponse.json();
          
          // For each inspection, get the reports
          for (const inspection of inspections) {
            const reportsResponse = await fetch(`/api/inspections/${inspection.id}/reports`);
            if (reportsResponse.ok) {
              const inspectionReports = await reportsResponse.json();
              allReports = [...allReports, ...inspectionReports];
            }
          }
        }
      } catch (error) {
        console.error("Failed to fetch reports:", error);
      }
      
      return allReports;
    },
  });

  // Query report-investigation links
  const { data: reportLinks = [], isLoading } = useQuery({
    queryKey: ["/api/report-investigation-links", investigationId],
    queryFn: async () => {
      const response = await fetch(`/api/report-investigation-links?investigationId=${investigationId}`);
      if (!response.ok) throw new Error("Failed to fetch report links");
      return response.json();
    },
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: ReportLinkFormValues) => {
      return apiRequest("/api/report-investigation-links", {
        method: "POST",
        body: {
          ...data,
          investigationId,
          createdBy: 1, // Default user ID
        },
      });
    },
    onSuccess: () => {
      toast({
        title: "Report linked",
        description: "The report has been successfully linked to this investigation.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/report-investigation-links", investigationId] });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to link report: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/report-investigation-links/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      toast({
        title: "Link removed",
        description: "The report link has been successfully removed.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/report-investigation-links", investigationId] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to remove report link: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ReportLinkFormValues) => {
    createMutation.mutate(data);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to remove this report link?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleAddNew = () => {
    form.reset({
      reportId: 0,
      linkType: "evidence",
      notes: "",
    });
    setIsDialogOpen(true);
  };

  const getReportDetails = (reportId: number) => {
    const report = reports.find((r: Report) => r.id === reportId);
    return report || null;
  };

  const getLinkTypeLabel = (linkType: string) => {
    const types: Record<string, string> = {
      evidence: "Evidence",
      reference: "Reference",
      attachment: "Attachment",
      background: "Background",
      analysis: "Analysis",
    };
    return types[linkType] || linkType;
  };

  const getLinkTypeColor = (linkType: string) => {
    const colors: Record<string, string> = {
      evidence: "bg-green-100 text-green-800",
      reference: "bg-blue-100 text-blue-800",
      attachment: "bg-purple-100 text-purple-800",
      background: "bg-yellow-100 text-yellow-800",
      analysis: "bg-orange-100 text-orange-800",
    };
    return colors[linkType] || "bg-gray-100 text-gray-800";
  };

  // Filter out reports that are already linked
  const availableReports = reports.filter(
    (report: Report) => !reportLinks.some((link: ReportInvestigationLink) => link.reportId === report.id)
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Linked Reports</h3>
        <Button 
          onClick={handleAddNew} 
          size="sm"
          disabled={availableReports.length === 0}
        >
          <Plus className="h-4 w-4 mr-2" />
          Link Report
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-4">Loading linked reports...</div>
      ) : reportLinks.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No reports have been linked to this investigation yet.
          <br />
          {availableReports.length > 0 ? (
            <Button variant="outline" onClick={handleAddNew} className="mt-2">
              <Plus className="h-4 w-4 mr-2" />
              Link a Report
            </Button>
          ) : (
            <span className="block text-sm mt-2">
              Create inspection reports first before linking them to this investigation.
            </span>
          )}
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
          {reportLinks.map((link: ReportInvestigationLink) => {
            const report = getReportDetails(link.reportId);
            if (!report) return null;
            
            return (
              <Card key={link.id}>
                <CardHeader className="p-4 pb-2">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 mr-2 text-blue-500" />
                      <CardTitle className="text-md font-medium">Report #{report.id}</CardTitle>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(link.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                  <Badge className={getLinkTypeColor(link.linkType)}>
                    {getLinkTypeLabel(link.linkType)}
                  </Badge>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  {link.notes && <p className="text-sm">{link.notes}</p>}
                  <div className="text-xs text-gray-500 mt-2">
                    Created on: {format(new Date(link.createdAt), "MMM d, yyyy")}
                  </div>
                </CardContent>
                <CardFooter className="p-4 pt-0">
                  <Button variant="outline" size="sm" className="ml-auto" asChild>
                    <a href={report.reportUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Open Report
                    </a>
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Link Report to Investigation</DialogTitle>
            <DialogDescription>
              Connect existing reports to this investigation for reference and evidence.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="reportId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Report</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      value={field.value.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a report" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availableReports.map((report: Report) => (
                          <SelectItem
                            key={report.id}
                            value={report.id.toString()}
                          >
                            Report #{report.id} - Inspection #{report.inspectionId}
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
                name="linkType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Link Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select link type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="evidence">Evidence</SelectItem>
                        <SelectItem value="reference">Reference</SelectItem>
                        <SelectItem value="attachment">Attachment</SelectItem>
                        <SelectItem value="background">Background</SelectItem>
                        <SelectItem value="analysis">Analysis</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Categorize how this report relates to the investigation
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Additional notes about this report link"
                        className="resize-none"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
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
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Linking..." : "Link Report"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}