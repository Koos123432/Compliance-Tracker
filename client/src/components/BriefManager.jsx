import React, { useState } from 'react';
import { 
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Dialog, DialogContent, DialogDescription, DialogFooter, 
  DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import { 
  Table, TableBody, TableCaption, TableCell, 
  TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { 
  AlertCircle, CheckCircle, Edit, Trash, Plus, ArrowRight, Download, FileDown, 
  Save, FileText, ArrowDown, ArrowUp
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useQuery, useMutation } from "@tanstack/react-query";

interface BriefManagerProps {
  investigationId: number;
}

// Helper function to format dates
const formatDate = (date: Date | null | string) => {
  if (!date) return '-';
  if (typeof date === 'string') {
    return new Date(date).toLocaleDateString();
  }
  return date.toLocaleDateString();
};

const statusColors = {
  draft: "bg-gray-100 text-gray-800",
  review: "bg-blue-100 text-blue-800",
  approved: "bg-green-100 text-green-800",
  final: "bg-purple-100 text-purple-800",
  submitted: "bg-teal-100 text-teal-800"
};

export default function BriefManager({ investigationId }: BriefManagerProps) {
  const [isNewBriefDialogOpen, setIsNewBriefDialogOpen] = useState(false);
  const [isNewSectionDialogOpen, setIsNewSectionDialogOpen] = useState(false);
  const [isEditSectionDialogOpen, setIsEditSectionDialogOpen] = useState(false);
  const [currentBrief, setCurrentBrief] = useState<any>(null);
  const [currentSection, setCurrentSection] = useState<any>(null);
  
  // Form state for new brief
  const [newBrief, setNewBrief] = useState({
    title: '',
    version: '1.0',
    status: 'draft',
    notes: '',
    investigationId: investigationId,
    createdBy: 1 // Default to first user
  });
  
  // Form state for new section
  const [newSection, setNewSection] = useState({
    title: '',
    content: '',
    sectionType: 'intro',
    sectionOrder: 1,
    status: 'draft',
    tags: null,
    investigationId: investigationId,
    createdBy: 1 // Default to first user
  });
  
  // Form state for editing a section
  const [editSection, setEditSection] = useState<any>({
    title: '',
    content: '',
    sectionType: '',
    status: '',
    lastEditedBy: 1 // Default to first user
  });
  
  // Query to get briefs for this investigation
  const { 
    data: briefs = [], 
    isLoading: isLoadingBriefs,
    error: briefsError
  } = useQuery({ 
    queryKey: ['/api/investigations', investigationId, 'briefs']
  });
  
  // Query to get brief sections for this investigation
  const {
    data: briefSections = [],
    isLoading: isLoadingBriefSections,
    error: briefSectionsError
  } = useQuery({
    queryKey: ['/api/investigations', investigationId, 'brief-sections']
  });
  
  // Create a new brief
  const createBriefMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/briefs', { method: 'POST', body: data }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/investigations', investigationId, 'briefs'] });
      setIsNewBriefDialogOpen(false);
      setCurrentBrief(data);
      setNewBrief({
        title: '',
        version: '1.0',
        status: 'draft',
        notes: '',
        investigationId: investigationId,
        createdBy: 1
      });
      toast({
        title: "Brief created",
        description: "The brief has been successfully created."
      });
    },
    onError: (error) => {
      toast({
        title: "Error creating brief",
        description: "There was an error creating the brief. Please try again.",
        variant: "destructive"
      });
    }
  });
  
  // Create a new brief section
  const createBriefSectionMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/brief-sections', { method: 'POST', body: data }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/investigations', investigationId, 'brief-sections'] });
      setIsNewSectionDialogOpen(false);
      setNewSection({
        title: '',
        content: '',
        sectionType: 'intro',
        sectionOrder: 1,
        status: 'draft',
        tags: null,
        investigationId: investigationId,
        createdBy: 1
      });
      toast({
        title: "Section created",
        description: "The brief section has been successfully created."
      });
    },
    onError: (error) => {
      toast({
        title: "Error creating section",
        description: "There was an error creating the brief section. Please try again.",
        variant: "destructive"
      });
    }
  });
  
  // Update a brief section
  const updateBriefSectionMutation = useMutation({
    mutationFn: ({ id, data }: { id: number, data: any }) => 
      apiRequest(`/api/brief-sections/${id}`, { method: 'PATCH', body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/investigations', investigationId, 'brief-sections'] });
      setIsEditSectionDialogOpen(false);
      toast({
        title: "Section updated",
        description: "The brief section has been successfully updated."
      });
    },
    onError: (error) => {
      toast({
        title: "Error updating section",
        description: "There was an error updating the brief section. Please try again.",
        variant: "destructive"
      });
    }
  });
  
  // Update a brief
  const updateBriefMutation = useMutation({
    mutationFn: ({ id, data }: { id: number, data: any }) => 
      apiRequest(`/api/briefs/${id}`, { method: 'PATCH', body: data }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/investigations', investigationId, 'briefs'] });
      setCurrentBrief(data);
      toast({
        title: "Brief updated",
        description: "The brief has been successfully updated."
      });
    },
    onError: (error) => {
      toast({
        title: "Error updating brief",
        description: "There was an error updating the brief. Please try again.",
        variant: "destructive"
      });
    }
  });
  
  // Delete a brief
  const deleteBriefMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/briefs/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/investigations', investigationId, 'briefs'] });
      setCurrentBrief(null);
      toast({
        title: "Brief deleted",
        description: "The brief has been successfully deleted."
      });
    },
    onError: (error) => {
      toast({
        title: "Error deleting brief",
        description: "There was an error deleting the brief. Please try again.",
        variant: "destructive"
      });
    }
  });
  
  // Delete a brief section
  const deleteBriefSectionMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/brief-sections/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/investigations', investigationId, 'brief-sections'] });
      toast({
        title: "Section deleted",
        description: "The brief section has been successfully deleted."
      });
    },
    onError: (error) => {
      toast({
        title: "Error deleting section",
        description: "There was an error deleting the brief section. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleCreateBrief = () => {
    createBriefMutation.mutate(newBrief);
  };

  const handleCreateSection = () => {
    createBriefSectionMutation.mutate(newSection);
  };

  const handleUpdateSection = () => {
    if (currentSection) {
      updateBriefSectionMutation.mutate({ 
        id: currentSection.id, 
        data: editSection 
      });
    }
  };

  const handleSelectBrief = (brief: any) => {
    setCurrentBrief(brief);
  };

  const handleEditSection = (section: any) => {
    setCurrentSection(section);
    setEditSection({
      title: section.title,
      content: section.content,
      sectionType: section.sectionType,
      status: section.status,
      lastEditedBy: 1
    });
    setIsEditSectionDialogOpen(true);
  };

  const handleDeleteBrief = (id: number) => {
    if (window.confirm('Are you sure you want to delete this brief?')) {
      deleteBriefMutation.mutate(id);
    }
  };

  const handleDeleteSection = (id: number) => {
    if (window.confirm('Are you sure you want to delete this brief section?')) {
      deleteBriefSectionMutation.mutate(id);
    }
  };

  const handleChangeBriefStatus = (status: string) => {
    if (currentBrief) {
      let updateData: any = { status };
      
      // Add additional fields based on status
      if (status === 'approved') {
        updateData.approvedBy = 1; // Default to first user
      } else if (status === 'submitted') {
        updateData.submittedTo = 'Prosecutor'; // Default value
      }
      
      updateBriefMutation.mutate({
        id: currentBrief.id,
        data: updateData
      });
    }
  };

  const moveSectionOrder = (section: any, direction: 'up' | 'down') => {
    if (!briefSections) return;
    
    const sections = [...briefSections];
    const currentIndex = sections.findIndex(s => s.id === section.id);
    
    if (direction === 'up' && currentIndex > 0) {
      const newOrder = sections[currentIndex - 1].sectionOrder;
      const updateData = { sectionOrder: newOrder };
      updateBriefSectionMutation.mutate({ id: section.id, data: updateData });
    } else if (direction === 'down' && currentIndex < sections.length - 1) {
      const newOrder = sections[currentIndex + 1].sectionOrder;
      const updateData = { sectionOrder: newOrder };
      updateBriefSectionMutation.mutate({ id: section.id, data: updateData });
    }
  };

  const generateNewBrief = () => {
    if (!briefSections || briefSections.length === 0) {
      toast({
        title: "No sections available",
        description: "Please create at least one brief section before generating a brief.",
        variant: "destructive"
      });
      return;
    }
    
    setIsNewBriefDialogOpen(true);
    setNewBrief(prev => ({
      ...prev,
      title: `Investigation ${investigationId} Brief`,
    }));
  };

  if (isLoadingBriefs) {
    return <div className="flex justify-center my-4">Loading briefs...</div>;
  }

  if (briefsError) {
    return <div className="text-red-500 my-4">Error loading briefs: {String(briefsError)}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Brief Management</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={generateNewBrief}>
            <FileText className="h-4 w-4 mr-2" />
            Generate New Brief
          </Button>
          <Button onClick={() => setIsNewSectionDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Section
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Briefs Column */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Briefs</CardTitle>
            <CardDescription>
              Generated briefs for this investigation
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-[300px] overflow-y-auto">
              {briefs && briefs.length > 0 ? (
                <ul className="divide-y">
                  {briefs.map((brief: any) => (
                    <li 
                      key={brief.id} 
                      className={`p-3 hover:bg-gray-50 cursor-pointer ${currentBrief?.id === brief.id ? 'bg-blue-50' : ''}`}
                      onClick={() => handleSelectBrief(brief)}
                    >
                      <div className="flex justify-between">
                        <div>
                          <h3 className="font-medium">{brief.title}</h3>
                          <div className="text-sm text-gray-500">
                            <span>Version: {brief.version}</span>
                            <span className="ml-3">Created: {formatDate(brief.createdAt)}</span>
                          </div>
                          <div className="mt-1">
                            <Badge className={statusColors[brief.status as keyof typeof statusColors] || "bg-gray-100"}>
                              {brief.status}
                            </Badge>
                          </div>
                        </div>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteBrief(brief.id);
                          }}
                          className="text-red-500 hover:bg-red-50 p-1 rounded"
                        >
                          <Trash className="h-4 w-4" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-4 text-center text-gray-500">
                  No briefs found. Generate a new brief to get started.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Sections Column */}
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle>Brief Sections</CardTitle>
            <CardDescription>
              Content sections that make up the brief
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-[400px] overflow-y-auto">
              {isLoadingBriefSections ? (
                <div className="flex justify-center p-4">Loading sections...</div>
              ) : briefSectionsError ? (
                <div className="text-red-500 p-4">{String(briefSectionsError)}</div>
              ) : briefSections && briefSections.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">Order</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {briefSections
                      .sort((a: any, b: any) => a.sectionOrder - b.sectionOrder)
                      .map((section: any) => (
                        <TableRow key={section.id}>
                          <TableCell className="font-medium">
                            <div className="flex flex-col">
                              <button
                                onClick={() => moveSectionOrder(section, 'up')}
                                className="text-gray-500 hover:text-gray-700"
                              >
                                <ArrowUp className="h-3 w-3" />
                              </button>
                              {section.sectionOrder}
                              <button
                                onClick={() => moveSectionOrder(section, 'down')}
                                className="text-gray-500 hover:text-gray-700"
                              >
                                <ArrowDown className="h-3 w-3" />
                              </button>
                            </div>
                          </TableCell>
                          <TableCell>{section.title}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{section.sectionType}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={statusColors[section.status as keyof typeof statusColors] || "bg-gray-100"}>
                              {section.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditSection(section)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteSection(section.id)}
                                className="text-red-500"
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="p-4 text-center text-gray-500">
                  No brief sections found. Click "Add Section" to create one.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Brief Preview */}
      {currentBrief && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>{currentBrief.title} (v{currentBrief.version})</CardTitle>
                <CardDescription>
                  Status: <Badge className={statusColors[currentBrief.status as keyof typeof statusColors] || "bg-gray-100"}>
                    {currentBrief.status}
                  </Badge>
                </CardDescription>
              </div>
              <div className="flex gap-2">
                {currentBrief.status === 'draft' && (
                  <Button
                    variant="outline"
                    onClick={() => handleChangeBriefStatus('review')}
                  >
                    Submit for Review
                  </Button>
                )}
                {currentBrief.status === 'review' && (
                  <Button
                    variant="outline"
                    onClick={() => handleChangeBriefStatus('approved')}
                  >
                    Approve Brief
                  </Button>
                )}
                {currentBrief.status === 'approved' && (
                  <Button
                    variant="outline"
                    onClick={() => handleChangeBriefStatus('submitted')}
                  >
                    Submit to Prosecutor
                  </Button>
                )}
                <Button
                  variant="outline"
                  disabled={!currentBrief.briefUrl}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {briefSections && briefSections.length > 0 ? (
              <div className="space-y-6">
                {briefSections
                  .sort((a: any, b: any) => a.sectionOrder - b.sectionOrder)
                  .map((section: any) => (
                    <div key={section.id} className="border p-4 rounded-md">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="text-lg font-bold">{section.title}</h3>
                        <Badge variant="outline">{section.sectionType}</Badge>
                      </div>
                      <div className="prose max-w-none">
                        {section.content.split('\n').map((paragraph: string, idx: number) => (
                          <p key={idx}>{paragraph}</p>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 p-8">
                No sections available for this brief. Add sections to build your brief.
              </div>
            )}
          </CardContent>
          <CardFooter className="border-t pt-4">
            <div className="w-full">
              {currentBrief.notes && (
                <div className="text-sm text-gray-600 mb-2">
                  <span className="font-semibold">Notes:</span> {currentBrief.notes}
                </div>
              )}
              <div className="text-sm text-gray-500 flex justify-between">
                <span>Created: {formatDate(currentBrief.createdAt)}</span>
                {currentBrief.updatedAt && <span>Last updated: {formatDate(currentBrief.updatedAt)}</span>}
                {currentBrief.approvedAt && <span>Approved: {formatDate(currentBrief.approvedAt)}</span>}
                {currentBrief.submittedAt && <span>Submitted: {formatDate(currentBrief.submittedAt)}</span>}
              </div>
            </div>
          </CardFooter>
        </Card>
      )}
      
      {/* New Brief Dialog */}
      <Dialog open={isNewBriefDialogOpen} onOpenChange={setIsNewBriefDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate New Brief</DialogTitle>
            <DialogDescription>
              Create a new brief document for this investigation
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="briefTitle">Brief Title</Label>
              <Input 
                id="briefTitle" 
                value={newBrief.title} 
                onChange={(e) => setNewBrief({...newBrief, title: e.target.value})}
                placeholder="e.g. Investigation 123 Prosecution Brief"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="version">Version</Label>
                <Input 
                  id="version" 
                  value={newBrief.version} 
                  onChange={(e) => setNewBrief({...newBrief, version: e.target.value})}
                  placeholder="e.g. 1.0"
                />
              </div>
              
              <div>
                <Label htmlFor="briefStatus">Status</Label>
                <Select 
                  value={newBrief.status} 
                  onValueChange={(value) => setNewBrief({...newBrief, status: value})}
                >
                  <SelectTrigger id="briefStatus">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="review">Under Review</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="final">Final</SelectItem>
                    <SelectItem value="submitted">Submitted</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="briefNotes">Notes</Label>
              <Textarea 
                id="briefNotes" 
                value={newBrief.notes || ''} 
                onChange={(e) => setNewBrief({...newBrief, notes: e.target.value})}
                placeholder="Additional notes or context for this brief"
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsNewBriefDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateBrief} disabled={createBriefMutation.isPending}>
              {createBriefMutation.isPending ? 'Creating...' : 'Generate Brief'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* New Section Dialog */}
      <Dialog open={isNewSectionDialogOpen} onOpenChange={setIsNewSectionDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Add New Brief Section</DialogTitle>
            <DialogDescription>
              Create a new section for briefs
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="sectionTitle">Section Title</Label>
              <Input 
                id="sectionTitle" 
                value={newSection.title} 
                onChange={(e) => setNewSection({...newSection, title: e.target.value})}
                placeholder="e.g. Executive Summary"
              />
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="sectionType">Section Type</Label>
                <Select 
                  value={newSection.sectionType} 
                  onValueChange={(value) => setNewSection({...newSection, sectionType: value})}
                >
                  <SelectTrigger id="sectionType">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="intro">Introduction</SelectItem>
                    <SelectItem value="facts">Facts</SelectItem>
                    <SelectItem value="evidence">Evidence</SelectItem>
                    <SelectItem value="argument">Legal Argument</SelectItem>
                    <SelectItem value="conclusion">Conclusion</SelectItem>
                    <SelectItem value="recommendation">Recommendation</SelectItem>
                    <SelectItem value="appendix">Appendix</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="sectionOrder">Order</Label>
                <Input 
                  id="sectionOrder" 
                  type="number"
                  min={1}
                  value={newSection.sectionOrder} 
                  onChange={(e) => setNewSection({...newSection, sectionOrder: parseInt(e.target.value)})}
                />
              </div>
              
              <div>
                <Label htmlFor="sectionStatus">Status</Label>
                <Select 
                  value={newSection.status} 
                  onValueChange={(value) => setNewSection({...newSection, status: value})}
                >
                  <SelectTrigger id="sectionStatus">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="review">Under Review</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="final">Final</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="sectionContent">Content</Label>
              <Textarea 
                id="sectionContent" 
                value={newSection.content} 
                onChange={(e) => setNewSection({...newSection, content: e.target.value})}
                placeholder="Enter the content for this section..."
                rows={10}
                className="font-mono"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsNewSectionDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateSection} disabled={createBriefSectionMutation.isPending}>
              {createBriefSectionMutation.isPending ? 'Creating...' : 'Create Section'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Section Dialog */}
      <Dialog open={isEditSectionDialogOpen} onOpenChange={setIsEditSectionDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Edit Brief Section</DialogTitle>
            <DialogDescription>
              Update an existing brief section
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="editSectionTitle">Section Title</Label>
              <Input 
                id="editSectionTitle" 
                value={editSection.title} 
                onChange={(e) => setEditSection({...editSection, title: e.target.value})}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="editSectionType">Section Type</Label>
                <Select 
                  value={editSection.sectionType} 
                  onValueChange={(value) => setEditSection({...editSection, sectionType: value})}
                >
                  <SelectTrigger id="editSectionType">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="intro">Introduction</SelectItem>
                    <SelectItem value="facts">Facts</SelectItem>
                    <SelectItem value="evidence">Evidence</SelectItem>
                    <SelectItem value="argument">Legal Argument</SelectItem>
                    <SelectItem value="conclusion">Conclusion</SelectItem>
                    <SelectItem value="recommendation">Recommendation</SelectItem>
                    <SelectItem value="appendix">Appendix</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="editSectionStatus">Status</Label>
                <Select 
                  value={editSection.status} 
                  onValueChange={(value) => setEditSection({...editSection, status: value})}
                >
                  <SelectTrigger id="editSectionStatus">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="review">Under Review</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="final">Final</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="editSectionContent">Content</Label>
              <Textarea 
                id="editSectionContent" 
                value={editSection.content} 
                onChange={(e) => setEditSection({...editSection, content: e.target.value})}
                rows={10}
                className="font-mono"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsEditSectionDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateSection} disabled={updateBriefSectionMutation.isPending}>
              {updateBriefSectionMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}