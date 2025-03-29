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
import { AlertCircle, CheckCircle, Edit, Trash, Plus, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useQuery, useMutation } from "@tanstack/react-query";

interface OffenceManagerProps {
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

const severityColors = {
  low: "bg-blue-100 text-blue-800",
  medium: "bg-yellow-100 text-yellow-800",
  high: "bg-orange-100 text-orange-800",
  severe: "bg-red-100 text-red-800"
};

const statusColors = {
  draft: "bg-gray-100 text-gray-800",
  review: "bg-blue-100 text-blue-800",
  filed: "bg-green-100 text-green-800",
  prosecuting: "bg-purple-100 text-purple-800",
  completed: "bg-teal-100 text-teal-800"
};

export default function OffenceManager({ investigationId }: OffenceManagerProps) {
  const [isNewOffenceDialogOpen, setIsNewOffenceDialogOpen] = useState(false);
  const [isNewBurdenDialogOpen, setIsNewBurdenDialogOpen] = useState(false);
  const [isNewProofDialogOpen, setIsNewProofDialogOpen] = useState(false);
  const [currentOffence, setCurrentOffence] = useState<any>(null);
  const [currentBurden, setCurrentBurden] = useState<any>(null);
  
  // Form state for new offence
  const [newOffence, setNewOffence] = useState({
    title: '',
    description: '',
    offenceAct: '',
    offenceSection: '',
    offenceClause: '',
    offenceSeverity: 'medium',
    offenceCode: '',
    status: 'draft',
    maxPenalty: '',
    investigationId: investigationId,
    createdBy: 1 // Default to first user
  });
  
  // Form state for new burden of proof
  const [newBurden, setNewBurden] = useState({
    title: '',
    description: '',
    legalBasis: '',
    standardOfProof: 'balance of probabilities',
    status: 'required',
    notes: '',
    offenceId: 0,
    createdBy: 1 // Default to first user
  });
  
  // Form state for new proof
  const [newProof, setNewProof] = useState({
    title: '',
    description: '',
    proofType: 'document',
    status: 'pending',
    confidentiality: 'normal',
    source: '',
    sourceContact: '',
    notes: '',
    burdenId: 0,
    collectedBy: 1, // Default to first user
    evidenceUrl: ''
  });
  
  // Query to get offences for this investigation
  const { 
    data: offences, 
    isLoading: isLoadingOffences,
    error: offencesError
  } = useQuery({ 
    queryKey: ['/api/investigations', investigationId, 'offences'],
    queryFn: () => apiRequest(`/api/investigations/${investigationId}/offences`)
  });
  
  // Query to get burdens of proof if an offence is selected
  const {
    data: burdens,
    isLoading: isLoadingBurdens,
    error: burdensError
  } = useQuery({
    queryKey: ['/api/offences', currentOffence?.id, 'burdens'],
    queryFn: () => currentOffence ? apiRequest(`/api/offences/${currentOffence.id}/burdens`) : null,
    enabled: !!currentOffence
  });
  
  // Query to get proofs if a burden is selected
  const {
    data: proofs,
    isLoading: isLoadingProofs,
    error: proofsError 
  } = useQuery({
    queryKey: ['/api/burdens', currentBurden?.id, 'proofs'],
    queryFn: () => currentBurden ? apiRequest(`/api/burdens/${currentBurden.id}/proofs`) : null,
    enabled: !!currentBurden
  });
  
  // Create a new offence
  const createOffenceMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/offences', 'POST', data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/investigations', investigationId, 'offences'] });
      setIsNewOffenceDialogOpen(false);
      setNewOffence({
        title: '',
        description: '',
        offenceAct: '',
        offenceSection: '',
        offenceClause: '',
        offenceSeverity: 'medium',
        offenceCode: '',
        status: 'draft',
        maxPenalty: '',
        investigationId: investigationId,
        createdBy: 1
      });
      toast({
        title: "Offence created",
        description: "The offence has been successfully created."
      });
    },
    onError: (error) => {
      toast({
        title: "Error creating offence",
        description: "There was an error creating the offence. Please try again.",
        variant: "destructive"
      });
    }
  });
  
  // Create a new burden of proof
  const createBurdenMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/burdens', 'POST', data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/offences', currentOffence?.id, 'burdens'] });
      setIsNewBurdenDialogOpen(false);
      setNewBurden({
        title: '',
        description: '',
        legalBasis: '',
        standardOfProof: 'balance of probabilities',
        status: 'required',
        notes: '',
        offenceId: 0,
        createdBy: 1
      });
      toast({
        title: "Burden of proof created",
        description: "The burden of proof has been successfully created."
      });
    },
    onError: (error) => {
      toast({
        title: "Error creating burden of proof",
        description: "There was an error creating the burden of proof. Please try again.",
        variant: "destructive"
      });
    }
  });
  
  // Create a new proof
  const createProofMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/proofs', 'POST', data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/burdens', currentBurden?.id, 'proofs'] });
      setIsNewProofDialogOpen(false);
      setNewProof({
        title: '',
        description: '',
        proofType: 'document',
        status: 'pending',
        confidentiality: 'normal',
        source: '',
        sourceContact: '',
        notes: '',
        burdenId: 0,
        collectedBy: 1,
        evidenceUrl: ''
      });
      toast({
        title: "Proof created",
        description: "The proof has been successfully created."
      });
    },
    onError: (error) => {
      toast({
        title: "Error creating proof",
        description: "There was an error creating the proof. Please try again.",
        variant: "destructive"
      });
    }
  });
  
  // Delete an offence
  const deleteOffenceMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/offences/${id}`, 'DELETE'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/investigations', investigationId, 'offences'] });
      setCurrentOffence(null);
      toast({
        title: "Offence deleted",
        description: "The offence has been successfully deleted."
      });
    },
    onError: (error) => {
      toast({
        title: "Error deleting offence",
        description: "There was an error deleting the offence. Please try again.",
        variant: "destructive"
      });
    }
  });
  
  // Delete a burden of proof
  const deleteBurdenMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/burdens/${id}`, 'DELETE'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/offences', currentOffence?.id, 'burdens'] });
      setCurrentBurden(null);
      toast({
        title: "Burden of proof deleted",
        description: "The burden of proof has been successfully deleted."
      });
    },
    onError: (error) => {
      toast({
        title: "Error deleting burden of proof",
        description: "There was an error deleting the burden of proof. Please try again.",
        variant: "destructive"
      });
    }
  });
  
  // Delete a proof
  const deleteProofMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/proofs/${id}`, 'DELETE'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/burdens', currentBurden?.id, 'proofs'] });
      toast({
        title: "Proof deleted",
        description: "The proof has been successfully deleted."
      });
    },
    onError: (error) => {
      toast({
        title: "Error deleting proof",
        description: "There was an error deleting the proof. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleCreateOffence = () => {
    createOffenceMutation.mutate(newOffence);
  };

  const handleCreateBurden = () => {
    if (currentOffence) {
      const burden = {...newBurden, offenceId: currentOffence.id};
      createBurdenMutation.mutate(burden);
    }
  };

  const handleCreateProof = () => {
    if (currentBurden) {
      const proof = {...newProof, burdenId: currentBurden.id};
      createProofMutation.mutate(proof);
    }
  };

  const handleSelectOffence = (offence: any) => {
    setCurrentOffence(offence);
    setCurrentBurden(null);
  };

  const handleSelectBurden = (burden: any) => {
    setCurrentBurden(burden);
  };

  const handleDeleteOffence = (id: number) => {
    if (window.confirm('Are you sure you want to delete this offence? This will also delete all burdens of proof and proofs associated with it.')) {
      deleteOffenceMutation.mutate(id);
    }
  };

  const handleDeleteBurden = (id: number) => {
    if (window.confirm('Are you sure you want to delete this burden of proof? This will also delete all proofs associated with it.')) {
      deleteBurdenMutation.mutate(id);
    }
  };

  const handleDeleteProof = (id: number) => {
    if (window.confirm('Are you sure you want to delete this proof?')) {
      deleteProofMutation.mutate(id);
    }
  };

  if (isLoadingOffences) {
    return <div className="flex justify-center my-4">Loading offences...</div>;
  }

  if (offencesError) {
    return <div className="text-red-500 my-4">Error loading offences: {String(offencesError)}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Offences & Evidence</h2>
        <Button onClick={() => setIsNewOffenceDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Offence
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Offences Column */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Offences</CardTitle>
            <CardDescription>
              Alleged offences related to this investigation
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-[400px] overflow-y-auto">
              {offences && offences.length > 0 ? (
                <ul className="divide-y">
                  {offences.map((offence: any) => (
                    <li 
                      key={offence.id} 
                      className={`p-3 hover:bg-gray-50 cursor-pointer flex justify-between ${currentOffence?.id === offence.id ? 'bg-blue-50' : ''}`}
                      onClick={() => handleSelectOffence(offence)}
                    >
                      <div>
                        <h3 className="font-medium">{offence.title}</h3>
                        <div className="text-sm text-gray-500">
                          <span className="block">{offence.offenceAct} {offence.offenceSection && `§${offence.offenceSection}`}</span>
                        </div>
                        <div className="mt-1 flex gap-2">
                          <Badge className={statusColors[offence.status as keyof typeof statusColors] || "bg-gray-100"}>
                            {offence.status}
                          </Badge>
                          <Badge className={severityColors[offence.offenceSeverity as keyof typeof severityColors] || "bg-gray-100"}>
                            {offence.offenceSeverity}
                          </Badge>
                        </div>
                      </div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteOffence(offence.id);
                        }}
                        className="text-red-500 hover:bg-red-50 p-1 rounded"
                      >
                        <Trash className="h-4 w-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-4 text-center text-gray-500">
                  No offences found. Click "Add Offence" to create one.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Burdens of Proof Column */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Burdens of Proof</CardTitle>
            <CardDescription>
              Elements that must be proven for the selected offence
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-[400px] overflow-y-auto">
              {!currentOffence ? (
                <div className="p-4 text-center text-gray-500">
                  Select an offence to view its burdens of proof
                </div>
              ) : isLoadingBurdens ? (
                <div className="p-4 text-center">Loading burdens...</div>
              ) : burdensError ? (
                <div className="p-4 text-center text-red-500">Error loading burdens: {String(burdensError)}</div>
              ) : burdens && burdens.length > 0 ? (
                <ul className="divide-y">
                  {burdens.map((burden: any) => (
                    <li 
                      key={burden.id} 
                      className={`p-3 hover:bg-gray-50 cursor-pointer flex justify-between ${currentBurden?.id === burden.id ? 'bg-blue-50' : ''}`}
                      onClick={() => handleSelectBurden(burden)}
                    >
                      <div>
                        <h3 className="font-medium">{burden.title}</h3>
                        <div className="text-sm text-gray-500">
                          <span>Standard: {burden.standardOfProof}</span>
                        </div>
                        <div className="mt-1">
                          <Badge className={
                            burden.status === 'required' ? 'bg-gray-100 text-gray-800' : 
                            burden.status === 'in progress' ? 'bg-blue-100 text-blue-800' :
                            burden.status === 'satisfied' ? 'bg-green-100 text-green-800' :
                            burden.status === 'failed' ? 'bg-red-100 text-red-800' : 'bg-gray-100'
                          }>
                            {burden.status}
                          </Badge>
                        </div>
                      </div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteBurden(burden.id);
                        }}
                        className="text-red-500 hover:bg-red-50 p-1 rounded"
                      >
                        <Trash className="h-4 w-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="flex flex-col items-center justify-center p-4 text-center text-gray-500">
                  <p>No burdens of proof found for this offence.</p>
                  <Button 
                    variant="outline" 
                    className="mt-2"
                    onClick={() => setIsNewBurdenDialogOpen(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Burden of Proof
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
          {currentOffence && (
            <CardFooter>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setIsNewBurdenDialogOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Burden of Proof
              </Button>
            </CardFooter>
          )}
        </Card>
        
        {/* Proofs Column */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Proofs</CardTitle>
            <CardDescription>
              Evidence satisfying the selected burden of proof
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-[400px] overflow-y-auto">
              {!currentBurden ? (
                <div className="p-4 text-center text-gray-500">
                  Select a burden of proof to view its evidence
                </div>
              ) : isLoadingProofs ? (
                <div className="p-4 text-center">Loading proofs...</div>
              ) : proofsError ? (
                <div className="p-4 text-center text-red-500">Error loading proofs: {String(proofsError)}</div>
              ) : proofs && proofs.length > 0 ? (
                <ul className="divide-y">
                  {proofs.map((proof: any) => (
                    <li 
                      key={proof.id}
                      className="p-3 hover:bg-gray-50 flex justify-between"
                    >
                      <div>
                        <h3 className="font-medium">{proof.title}</h3>
                        <div className="text-sm text-gray-500">
                          <span>Type: {proof.proofType}</span>
                          {proof.source && (
                            <span className="block">Source: {proof.source}</span>
                          )}
                        </div>
                        <div className="mt-1 flex gap-2">
                          <Badge className={
                            proof.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                            proof.status === 'collected' ? 'bg-blue-100 text-blue-800' :
                            proof.status === 'verified' ? 'bg-green-100 text-green-800' :
                            proof.status === 'admissible' ? 'bg-teal-100 text-teal-800' :
                            proof.status === 'inadmissible' ? 'bg-red-100 text-red-800' : 'bg-gray-100'
                          }>
                            {proof.status}
                          </Badge>
                          <Badge className={
                            proof.confidentiality === 'public' ? 'bg-green-100 text-green-800' : 
                            proof.confidentiality === 'normal' ? 'bg-blue-100 text-blue-800' :
                            proof.confidentiality === 'sensitive' ? 'bg-orange-100 text-orange-800' :
                            proof.confidentiality === 'classified' ? 'bg-red-100 text-red-800' : 'bg-gray-100'
                          }>
                            {proof.confidentiality}
                          </Badge>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleDeleteProof(proof.id)}
                        className="text-red-500 hover:bg-red-50 p-1 rounded"
                      >
                        <Trash className="h-4 w-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="flex flex-col items-center justify-center p-4 text-center text-gray-500">
                  <p>No proofs found for this burden.</p>
                  <Button 
                    variant="outline" 
                    className="mt-2"
                    onClick={() => setIsNewProofDialogOpen(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Proof
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
          {currentBurden && (
            <CardFooter>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setIsNewProofDialogOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Proof
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>
      
      {/* New Offence Dialog */}
      <Dialog open={isNewOffenceDialogOpen} onOpenChange={setIsNewOffenceDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Offence</DialogTitle>
            <DialogDescription>
              Create a new offence for this investigation
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="title">Offence Title</Label>
                <Input 
                  id="title" 
                  value={newOffence.title} 
                  onChange={(e) => setNewOffence({...newOffence, title: e.target.value})}
                  placeholder="e.g. Illegal Dumping"
                />
              </div>
              
              <div className="col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  value={newOffence.description} 
                  onChange={(e) => setNewOffence({...newOffence, description: e.target.value})}
                  placeholder="Detailed description of the offence"
                  rows={3}
                />
              </div>
              
              <div className="col-span-1">
                <Label htmlFor="offenceAct">Act/Regulation</Label>
                <Input 
                  id="offenceAct" 
                  value={newOffence.offenceAct} 
                  onChange={(e) => setNewOffence({...newOffence, offenceAct: e.target.value})}
                  placeholder="e.g. Environmental Protection Act"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-2 col-span-1">
                <div>
                  <Label htmlFor="offenceSection">Section</Label>
                  <Input 
                    id="offenceSection" 
                    value={newOffence.offenceSection} 
                    onChange={(e) => setNewOffence({...newOffence, offenceSection: e.target.value})}
                    placeholder="e.g. 123"
                  />
                </div>
                <div>
                  <Label htmlFor="offenceClause">Clause</Label>
                  <Input 
                    id="offenceClause" 
                    value={newOffence.offenceClause} 
                    onChange={(e) => setNewOffence({...newOffence, offenceClause: e.target.value})}
                    placeholder="e.g. 4(a)"
                  />
                </div>
              </div>
              
              <div className="col-span-1">
                <Label htmlFor="offenceCode">Offence Code</Label>
                <Input 
                  id="offenceCode" 
                  value={newOffence.offenceCode} 
                  onChange={(e) => setNewOffence({...newOffence, offenceCode: e.target.value})}
                  placeholder="Internal or external code (if applicable)"
                />
              </div>
              
              <div className="col-span-1">
                <Label htmlFor="maxPenalty">Maximum Penalty</Label>
                <Input 
                  id="maxPenalty" 
                  value={newOffence.maxPenalty} 
                  onChange={(e) => setNewOffence({...newOffence, maxPenalty: e.target.value})}
                  placeholder="e.g. $250,000 or 2 years imprisonment"
                />
              </div>
              
              <div className="col-span-1">
                <Label htmlFor="offenceSeverity">Severity</Label>
                <Select 
                  value={newOffence.offenceSeverity} 
                  onValueChange={(value) => setNewOffence({...newOffence, offenceSeverity: value})}
                >
                  <SelectTrigger id="offenceSeverity">
                    <SelectValue placeholder="Select severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="severe">Severe</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="col-span-1">
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={newOffence.status} 
                  onValueChange={(value) => setNewOffence({...newOffence, status: value})}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="review">Under Review</SelectItem>
                    <SelectItem value="filed">Filed</SelectItem>
                    <SelectItem value="prosecuting">Prosecuting</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsNewOffenceDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateOffence} disabled={createOffenceMutation.isPending}>
              {createOffenceMutation.isPending ? 'Creating...' : 'Create Offence'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* New Burden of Proof Dialog */}
      <Dialog open={isNewBurdenDialogOpen} onOpenChange={setIsNewBurdenDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Burden of Proof</DialogTitle>
            <DialogDescription>
              Define what needs to be proven for this offence
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="burdenTitle">Title</Label>
              <Input 
                id="burdenTitle" 
                value={newBurden.title} 
                onChange={(e) => setNewBurden({...newBurden, title: e.target.value})}
                placeholder="e.g. Prove intent to dump illegally"
              />
            </div>
            
            <div>
              <Label htmlFor="burdenDescription">Description</Label>
              <Textarea 
                id="burdenDescription" 
                value={newBurden.description} 
                onChange={(e) => setNewBurden({...newBurden, description: e.target.value})}
                placeholder="Detailed description of what needs to be proven"
                rows={3}
              />
            </div>
            
            <div>
              <Label htmlFor="legalBasis">Legal Basis</Label>
              <Input 
                id="legalBasis" 
                value={newBurden.legalBasis} 
                onChange={(e) => setNewBurden({...newBurden, legalBasis: e.target.value})}
                placeholder="Legal foundation requiring this proof"
              />
            </div>
            
            <div>
              <Label htmlFor="standardOfProof">Standard of Proof</Label>
              <Select 
                value={newBurden.standardOfProof} 
                onValueChange={(value) => setNewBurden({...newBurden, standardOfProof: value})}
              >
                <SelectTrigger id="standardOfProof">
                  <SelectValue placeholder="Select standard" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beyond reasonable doubt">Beyond Reasonable Doubt</SelectItem>
                  <SelectItem value="balance of probabilities">Balance of Probabilities</SelectItem>
                  <SelectItem value="reasonable suspicion">Reasonable Suspicion</SelectItem>
                  <SelectItem value="prima facie">Prima Facie</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="burdenStatus">Status</Label>
              <Select 
                value={newBurden.status} 
                onValueChange={(value) => setNewBurden({...newBurden, status: value})}
              >
                <SelectTrigger id="burdenStatus">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="required">Required</SelectItem>
                  <SelectItem value="in progress">In Progress</SelectItem>
                  <SelectItem value="satisfied">Satisfied</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="burdenNotes">Notes</Label>
              <Textarea 
                id="burdenNotes" 
                value={newBurden.notes || ''} 
                onChange={(e) => setNewBurden({...newBurden, notes: e.target.value})}
                placeholder="Additional notes or context"
                rows={2}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsNewBurdenDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateBurden} disabled={createBurdenMutation.isPending}>
              {createBurdenMutation.isPending ? 'Creating...' : 'Create Burden of Proof'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* New Proof Dialog */}
      <Dialog open={isNewProofDialogOpen} onOpenChange={setIsNewProofDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Proof</DialogTitle>
            <DialogDescription>
              Document evidence that satisfies the burden of proof
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="proofTitle">Title</Label>
              <Input 
                id="proofTitle" 
                value={newProof.title} 
                onChange={(e) => setNewProof({...newProof, title: e.target.value})}
                placeholder="e.g. Photos of illegal dumping activity"
              />
            </div>
            
            <div>
              <Label htmlFor="proofDescription">Description</Label>
              <Textarea 
                id="proofDescription" 
                value={newProof.description} 
                onChange={(e) => setNewProof({...newProof, description: e.target.value})}
                placeholder="Detailed description of the evidence"
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="proofType">Type</Label>
                <Select 
                  value={newProof.proofType} 
                  onValueChange={(value) => setNewProof({...newProof, proofType: value})}
                >
                  <SelectTrigger id="proofType">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="photo">Photo</SelectItem>
                    <SelectItem value="document">Document</SelectItem>
                    <SelectItem value="testimony">Testimony</SelectItem>
                    <SelectItem value="expert_witness">Expert Witness</SelectItem>
                    <SelectItem value="physical_evidence">Physical Evidence</SelectItem>
                    <SelectItem value="digital_evidence">Digital Evidence</SelectItem>
                    <SelectItem value="admission">Admission</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="confidentiality">Confidentiality</Label>
                <Select 
                  value={newProof.confidentiality} 
                  onValueChange={(value) => setNewProof({...newProof, confidentiality: value})}
                >
                  <SelectTrigger id="confidentiality">
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="sensitive">Sensitive</SelectItem>
                    <SelectItem value="classified">Classified</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="proofStatus">Status</Label>
              <Select 
                value={newProof.status} 
                onValueChange={(value) => setNewProof({...newProof, status: value})}
              >
                <SelectTrigger id="proofStatus">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="collected">Collected</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="admissible">Admissible</SelectItem>
                  <SelectItem value="inadmissible">Inadmissible</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="source">Source</Label>
                <Input 
                  id="source" 
                  value={newProof.source || ''} 
                  onChange={(e) => setNewProof({...newProof, source: e.target.value})}
                  placeholder="Where the evidence came from"
                />
              </div>
              
              <div>
                <Label htmlFor="sourceContact">Source Contact</Label>
                <Input 
                  id="sourceContact" 
                  value={newProof.sourceContact || ''} 
                  onChange={(e) => setNewProof({...newProof, sourceContact: e.target.value})}
                  placeholder="Contact information for the source"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="evidenceUrl">Evidence URL</Label>
              <Input 
                id="evidenceUrl" 
                value={newProof.evidenceUrl || ''} 
                onChange={(e) => setNewProof({...newProof, evidenceUrl: e.target.value})}
                placeholder="URL to the evidence file"
              />
            </div>
            
            <div>
              <Label htmlFor="proofNotes">Notes</Label>
              <Textarea 
                id="proofNotes" 
                value={newProof.notes || ''} 
                onChange={(e) => setNewProof({...newProof, notes: e.target.value})}
                placeholder="Additional notes about this evidence"
                rows={2}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsNewProofDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateProof} disabled={createProofMutation.isPending}>
              {createProofMutation.isPending ? 'Creating...' : 'Create Proof'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}