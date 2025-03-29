import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft, Plus, Clock, AlertTriangle, CheckCircle, FileText, Check, X, Calendar, User } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Header from "@/components/layout/Header";
import BottomNavigation from "@/components/layout/BottomNavigation";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

const trackingNoticeSchema = z.object({
  investigationId: z.number(),
  title: z.string().min(1, "Title is required"),
  noticeType: z.string().min(1, "Notice type is required"),
  recipientName: z.string().min(1, "Recipient name is required"),
  recipientEmail: z.string().email("Invalid email").nullish(),
  description: z.string().min(1, "Description is required"),
  status: z.string().min(1, "Status is required"),
  assignedOfficerId: z.number().default(1), // Default to first user
  dueDate: z.date().optional(),
});

const elementOfProofSchema = z.object({
  investigationId: z.number(),
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  category: z.string().min(1, "Category is required"),
  status: z.string().min(1, "Status is required"),
  source: z.string().nullish(),
  notes: z.string().nullish(),
  collectedBy: z.number().default(1), // Default to first user
  dueDate: z.date().optional(),
});

const officerNoteSchema = z.object({
  userId: z.number().default(1), // Default to first user
  entityId: z.number(),
  entityType: z.string().min(1, "Entity type is required"),
  content: z.string().min(1, "Content is required"),
  visibility: z.string().min(1, "Visibility is required"),
  tags: z.string().nullish(),
});

type TrackingNoticeFormValues = z.infer<typeof trackingNoticeSchema>;
type ElementOfProofFormValues = z.infer<typeof elementOfProofSchema>;
type OfficerNoteFormValues = z.infer<typeof officerNoteSchema>;

export default function InvestigationDetails() {
  const params = useParams<{ id: string }>();
  const id = parseInt(params.id);
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [activeTab, setActiveTab] = useState("overview");
  const [showAddNoticeDialog, setShowAddNoticeDialog] = useState(false);
  const [showAddProofDialog, setShowAddProofDialog] = useState(false);
  const [showAddNoteDialog, setShowAddNoteDialog] = useState(false);
  
  const { data: investigation, isLoading } = useQuery<any>({
    queryKey: [`/api/investigations/${id}`],
  });
  
  const { data: trackingNotices = [], isLoading: isLoadingNotices } = useQuery<any[]>({
    queryKey: [`/api/investigations/${id}/tracking-notices`],
    enabled: !isLoading && !!investigation,
  });
  
  const { data: elementsOfProof = [], isLoading: isLoadingProofs } = useQuery<any[]>({
    queryKey: [`/api/investigations/${id}/elements-of-proof`],
    enabled: !isLoading && !!investigation,
  });
  
  const { data: officerNotes = [], isLoading: isLoadingNotes } = useQuery<any[]>({
    queryKey: [`/api/entity/investigation/${id}/notes`],
    enabled: !isLoading && !!investigation,
  });
  
  const trackingNoticeForm = useForm<TrackingNoticeFormValues>({
    resolver: zodResolver(trackingNoticeSchema),
    defaultValues: {
      investigationId: id,
      title: "",
      noticeType: "warning",
      recipientName: "",
      recipientEmail: null,
      description: "",
      status: "draft",
      assignedOfficerId: 1,
      dueDate: new Date(Date.now() + 7 * 86400000), // 7 days from now
    },
  });
  
  const elementOfProofForm = useForm<ElementOfProofFormValues>({
    resolver: zodResolver(elementOfProofSchema),
    defaultValues: {
      investigationId: id,
      title: "",
      description: "",
      category: "photographic",
      status: "pending",
      source: null,
      notes: null,
      collectedBy: 1,
      dueDate: new Date(Date.now() + 7 * 86400000), // 7 days from now
    },
  });
  
  const officerNoteForm = useForm<OfficerNoteFormValues>({
    resolver: zodResolver(officerNoteSchema),
    defaultValues: {
      userId: 1,
      entityId: id,
      entityType: "investigation",
      content: "",
      visibility: "team",
      tags: null,
    },
  });
  
  const createTrackingNoticeMutation = useMutation({
    mutationFn: async (values: TrackingNoticeFormValues) => {
      return apiRequest("POST", "/api/tracking-notices", values);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/investigations/${id}/tracking-notices`] });
      toast({
        title: "Notice created",
        description: "The tracking notice has been created successfully",
      });
      setShowAddNoticeDialog(false);
      trackingNoticeForm.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create tracking notice. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  const createElementOfProofMutation = useMutation({
    mutationFn: async (values: ElementOfProofFormValues) => {
      return apiRequest("POST", "/api/elements-of-proof", values);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/investigations/${id}/elements-of-proof`] });
      toast({
        title: "Element added",
        description: "The element of proof has been added successfully",
      });
      setShowAddProofDialog(false);
      elementOfProofForm.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add element of proof. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  const createOfficerNoteMutation = useMutation({
    mutationFn: async (values: OfficerNoteFormValues) => {
      return apiRequest("POST", "/api/officer-notes", values);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/entity/investigation/${id}/notes`] });
      toast({
        title: "Note added",
        description: "The officer note has been added successfully",
      });
      setShowAddNoteDialog(false);
      officerNoteForm.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add officer note. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  const onSubmitTrackingNotice = (values: TrackingNoticeFormValues) => {
    createTrackingNoticeMutation.mutate(values);
  };
  
  const onSubmitElementOfProof = (values: ElementOfProofFormValues) => {
    createElementOfProofMutation.mutate(values);
  };
  
  const onSubmitOfficerNote = (values: OfficerNoteFormValues) => {
    createOfficerNoteMutation.mutate(values);
  };
  
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "open":
      case "pending":
      case "draft":
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">{status}</Badge>;
      case "in_progress":
      case "collected":
      case "review":
        return <Badge variant="outline" className="bg-amber-100 text-amber-800 hover:bg-amber-100">{status}</Badge>;
      case "complete":
      case "closed":
      case "verified":
      case "sent":
        return <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">{status}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 container mx-auto p-4 pb-20 md:pb-4">
          <Button variant="ghost" className="mb-4" onClick={() => navigate("/investigations")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Investigations
          </Button>
          
          <div className="space-y-4">
            <Skeleton className="h-8 w-64" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
            </div>
          </div>
        </main>
        <BottomNavigation onCreateNew={() => setShowAddNoteDialog(true)} />
      </div>
    );
  }
  
  if (!investigation) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 container mx-auto p-4 pb-20 md:pb-4">
          <Button variant="ghost" className="mb-4" onClick={() => navigate("/investigations")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Investigations
          </Button>
          
          <Card className="p-8 text-center">
            <AlertTriangle className="mx-auto h-10 w-10 text-amber-500 mb-3" />
            <h2 className="text-xl font-semibold mb-2">Investigation Not Found</h2>
            <p className="text-gray-500 mb-4">
              The investigation you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => navigate("/investigations")}>Return to Investigations</Button>
          </Card>
        </main>
        <BottomNavigation onCreateNew={() => setShowAddNoteDialog(true)} />
      </div>
    );
  }
  
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "PPP");
    } catch (e) {
      return "Invalid date";
    }
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1 container mx-auto p-4 pb-20 md:pb-4">
        <div className="flex items-center gap-2 mb-4">
          <Button variant="ghost" onClick={() => navigate("/investigations")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">{investigation.title}</h1>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <Card className="flex-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Investigation Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Case Number</p>
                  <p>{investigation.caseNumber}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <p>{getStatusBadge(investigation.status)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Priority</p>
                  <p className="capitalize">{investigation.priority}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">Created</p>
                  <p>{formatDate(investigation.createdAt)}</p>
                </div>
              </div>
              <Separator className="my-4" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-500">Description</p>
                <p className="text-sm">{investigation.description}</p>
              </div>
              
              {investigation.offence && (
                <>
                  <Separator className="my-4" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-500">Offence</p>
                    <p className="text-sm">{investigation.offence}</p>
                  </div>
                </>
              )}
              
              {(investigation.legislation || investigation.legislationSection || investigation.lawCode) && (
                <>
                  <Separator className="my-4" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {investigation.legislation && (
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-500">Legislation</p>
                        <p className="text-sm">{investigation.legislation}</p>
                      </div>
                    )}
                    {investigation.legislationSection && (
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-500">Section</p>
                        <p className="text-sm">{investigation.legislationSection}</p>
                      </div>
                    )}
                    {investigation.lawCode && (
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-500">Law Code</p>
                        <p className="text-sm">{investigation.lawCode}</p>
                      </div>
                    )}
                    {investigation.offenceCategory && (
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-500">Category</p>
                        <p className="text-sm capitalize">{investigation.offenceCategory}</p>
                      </div>
                    )}
                  </div>
                </>
              )}
              
              {investigation.penalty && (
                <>
                  <Separator className="my-4" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-500">Penalty</p>
                    <p className="text-sm">{investigation.penalty}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
          
          <Card className="w-full md:w-80">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Tracking Notices</span>
                  <span className="font-medium">{isLoadingNotices ? "..." : trackingNotices.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Elements of Proof</span>
                  <span className="font-medium">{isLoadingProofs ? "..." : elementsOfProof.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Officer Notes</span>
                  <span className="font-medium">{isLoadingNotes ? "..." : officerNotes.length}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="tracking">Tracking Notices</TabsTrigger>
            <TabsTrigger value="evidence">Elements of Proof</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Officer Notes</h2>
              <Button onClick={() => setShowAddNoteDialog(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Note
              </Button>
            </div>
            {isLoadingNotes ? (
              <div className="space-y-2">
                <Skeleton className="h-24" />
                <Skeleton className="h-24" />
              </div>
            ) : officerNotes.length > 0 ? (
              <div className="space-y-4">
                {officerNotes.map((note: any) => (
                  <Card key={note.id}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-500" />
                          <CardTitle className="text-base">Officer {note.userId}</CardTitle>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{note.visibility}</Badge>
                          <span className="text-xs text-gray-500">{formatDate(note.createdAt)}</span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">{note.content}</p>
                      {note.tags && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {note.tags.split(',').map((tag: string) => (
                            <Badge key={tag} variant="secondary" className="text-xs">{tag.trim()}</Badge>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <FileText className="mx-auto h-10 w-10 text-gray-400 mb-3" />
                  <h3 className="text-lg font-medium mb-1">No Notes Yet</h3>
                  <p className="text-gray-500 mb-4">
                    Add officer notes to document important information about this investigation.
                  </p>
                  <Button onClick={() => setShowAddNoteDialog(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add First Note
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="tracking" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Tracking Notices</h2>
              <Button onClick={() => setShowAddNoticeDialog(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Notice
              </Button>
            </div>
            {isLoadingNotices ? (
              <Skeleton className="h-64" />
            ) : trackingNotices.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Recipient</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Due Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {trackingNotices.map((notice: any) => (
                    <TableRow key={notice.id}>
                      <TableCell className="font-medium">{notice.title}</TableCell>
                      <TableCell className="capitalize">{notice.noticeType}</TableCell>
                      <TableCell>{notice.recipientName}</TableCell>
                      <TableCell>{getStatusBadge(notice.status)}</TableCell>
                      <TableCell>{notice.dueDate ? formatDate(notice.dueDate) : "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <FileText className="mx-auto h-10 w-10 text-gray-400 mb-3" />
                  <h3 className="text-lg font-medium mb-1">No Tracking Notices</h3>
                  <p className="text-gray-500 mb-4">
                    Add tracking notices to monitor communication with related parties.
                  </p>
                  <Button onClick={() => setShowAddNoticeDialog(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create First Notice
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="evidence" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Elements of Proof</h2>
              <Button onClick={() => setShowAddProofDialog(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Element
              </Button>
            </div>
            {isLoadingProofs ? (
              <Skeleton className="h-64" />
            ) : elementsOfProof.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {elementsOfProof.map((element: any) => (
                  <Card key={element.id}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between">
                        <CardTitle className="text-base">{element.title}</CardTitle>
                        {getStatusBadge(element.status)}
                      </div>
                      <CardDescription className="capitalize text-xs">{element.category}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm mb-2">{element.description}</p>
                      {element.notes && (
                        <div className="text-xs text-gray-500 mb-2">
                          <span className="font-medium">Notes:</span> {element.notes}
                        </div>
                      )}
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center">
                          <User className="h-3 w-3 mr-1" />
                          <span>Officer {element.collectedBy}</span>
                        </div>
                        {element.dueDate && (
                          <div className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            <span>Due: {formatDate(element.dueDate)}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <FileText className="mx-auto h-10 w-10 text-gray-400 mb-3" />
                  <h3 className="text-lg font-medium mb-1">No Elements of Proof</h3>
                  <p className="text-gray-500 mb-4">
                    Add elements of proof to track evidence for this investigation.
                  </p>
                  <Button onClick={() => setShowAddProofDialog(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add First Element
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>
      
      {/* Add Tracking Notice Dialog */}
      <Dialog open={showAddNoticeDialog} onOpenChange={setShowAddNoticeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Tracking Notice</DialogTitle>
          </DialogHeader>
          
          <Form {...trackingNoticeForm}>
            <form onSubmit={trackingNoticeForm.handleSubmit(onSubmitTrackingNotice)} className="space-y-4">
              <FormField
                control={trackingNoticeForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter notice title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={trackingNoticeForm.control}
                  name="noticeType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notice Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="warning">Warning</SelectItem>
                          <SelectItem value="formal">Formal Notice</SelectItem>
                          <SelectItem value="infringement">Infringement</SelectItem>
                          <SelectItem value="compliance">Compliance Order</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={trackingNoticeForm.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="review">Review</SelectItem>
                          <SelectItem value="sent">Sent</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={trackingNoticeForm.control}
                name="recipientName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Recipient Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter recipient's name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={trackingNoticeForm.control}
                name="recipientEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Recipient Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter recipient's email (optional)" {...field} value={field.value || ""} onChange={(e) => field.onChange(e.target.value || null)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={trackingNoticeForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe the notice"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter className="mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddNoticeDialog(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createTrackingNoticeMutation.isPending}>
                  Create Notice
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Add Element of Proof Dialog */}
      <Dialog open={showAddProofDialog} onOpenChange={setShowAddProofDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Element of Proof</DialogTitle>
          </DialogHeader>
          
          <Form {...elementOfProofForm}>
            <form onSubmit={elementOfProofForm.handleSubmit(onSubmitElementOfProof)} className="space-y-4">
              <FormField
                control={elementOfProofForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter element title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={elementOfProofForm.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="photographic">Photographic</SelectItem>
                          <SelectItem value="testimony">Testimony</SelectItem>
                          <SelectItem value="document">Document</SelectItem>
                          <SelectItem value="physical">Physical Evidence</SelectItem>
                          <SelectItem value="expert">Expert Report</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={elementOfProofForm.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="collected">Collected</SelectItem>
                          <SelectItem value="verified">Verified</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={elementOfProofForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe the element of proof"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={elementOfProofForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Additional notes (optional)"
                        rows={2}
                        {...field}
                        value={field.value || ""}
                        onChange={(e) => field.onChange(e.target.value || null)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter className="mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddProofDialog(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createElementOfProofMutation.isPending}>
                  Add Element
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Add Officer Note Dialog */}
      <Dialog open={showAddNoteDialog} onOpenChange={setShowAddNoteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Officer Note</DialogTitle>
          </DialogHeader>
          
          <Form {...officerNoteForm}>
            <form onSubmit={officerNoteForm.handleSubmit(onSubmitOfficerNote)} className="space-y-4">
              <FormField
                control={officerNoteForm.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Note Content</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter your note"
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={officerNoteForm.control}
                name="visibility"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Visibility</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select visibility" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="private">Private</SelectItem>
                        <SelectItem value="team">Team</SelectItem>
                        <SelectItem value="public">Public</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={officerNoteForm.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tags</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="E.g. interview, site visit (comma separated)"
                        {...field}
                        value={field.value || ""}
                        onChange={(e) => field.onChange(e.target.value || null)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter className="mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddNoteDialog(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createOfficerNoteMutation.isPending}>
                  Add Note
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      <BottomNavigation onCreateNew={() => setShowAddNoteDialog(true)} />
    </div>
  );
}