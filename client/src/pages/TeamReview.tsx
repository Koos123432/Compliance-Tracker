import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, CheckCircle, FileText, User, Users, MessageCircle, Clipboard } from 'lucide-react';
import Header from '@/components/layout/Header';
import BottomNavigation from '@/components/layout/BottomNavigation';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import RiskVisualization from '@/components/RiskVisualization';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { generateRiskItems } from '@/components/analytics/analyticsUtils';

export default function TeamReview() {
  const { id } = useParams();
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [reviewComment, setReviewComment] = useState('');
  const [selectedTab, setSelectedTab] = useState('details');
  
  // Fetch inspection details
  const { data: inspection, isLoading: inspectionLoading } = useQuery({
    queryKey: [`/api/inspections/${id}`],
    enabled: !!id,
  });
  
  // Fetch breaches for this inspection
  const { data: breaches, isLoading: breachesLoading } = useQuery({
    queryKey: [`/api/inspections/${id}/breaches`],
    enabled: !!id,
  });
  
  // Fetch people related to this inspection
  const { data: people, isLoading: peopleLoading } = useQuery({
    queryKey: [`/api/inspections/${id}/people`],
    enabled: !!id,
  });
  
  // Fetch existing review comments
  const { data: reviewComments, isLoading: reviewCommentsLoading } = useQuery({
    queryKey: [`/api/inspections/${id}/reviews`],
    enabled: !!id,
  });
  
  // Mutation for submitting review
  const submitReviewMutation = useMutation({
    mutationFn: async (data: { inspectionId: string; comment: string; status: string }) => {
      const response = await fetch(`/api/inspections/${id}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reviewerId: 1, // Default to first user - would be logged-in user in real app
          comment: data.comment,
          status: data.status
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit review');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/inspections/${id}/reviews`] });
      queryClient.invalidateQueries({ queryKey: [`/api/inspections/${id}`] });
      
      toast({
        title: 'Review Submitted',
        description: 'Your review has been submitted successfully.',
      });
      
      setReviewComment('');
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to submit review. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Submit review
  const handleSubmitReview = (status: 'approved' | 'rejected' | 'needs-changes') => {
    if (!id) return;
    
    submitReviewMutation.mutate({
      inspectionId: id,
      comment: reviewComment,
      status,
    });
  };
  
  // Generate risk assessment items
  const riskItems = inspection && breaches ? generateRiskItems(inspection, breaches) : [];
  
  const isLoading = inspectionLoading || breachesLoading || peopleLoading || reviewCommentsLoading;
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1 container mx-auto p-4 pb-20 md:pb-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold flex items-center">
              Team Leader Review
              {inspection && (
                <Badge variant="outline" className="ml-2">
                  {inspection.inspectionNumber}
                </Badge>
              )}
            </h1>
            {inspection && (
              <p className="text-gray-500">{inspection.siteAddress}</p>
            )}
          </div>
          
          <Button variant="outline" onClick={() => navigate(`/inspections/${id}`)}>
            <FileText className="h-4 w-4 mr-2" />
            Back to Inspection
          </Button>
        </div>
        
        {isLoading ? (
          <div className="grid gap-6">
            <Skeleton className="h-[200px] w-full" />
            <Skeleton className="h-[400px] w-full" />
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-1 space-y-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Risk Assessment</CardTitle>
                </CardHeader>
                <CardContent>
                  <RiskVisualization
                    title="Site Risk Assessment"
                    items={riskItems}
                  />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Key Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Inspection Type</h3>
                    <p>{inspection?.inspectionType || 'N/A'}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Inspection Date</h3>
                    <p>{inspection?.inspectionDate ? format(new Date(inspection.inspectionDate), 'PPP') : 'N/A'}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Status</h3>
                    <Badge className={
                      inspection?.status === 'completed' ? 'bg-green-100 text-green-800 hover:bg-green-100' :
                      inspection?.status === 'pending' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100' :
                      'bg-blue-100 text-blue-800 hover:bg-blue-100'
                    }>
                      {inspection?.status || 'N/A'}
                    </Badge>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Priority</h3>
                    <Badge variant="outline" className={
                      inspection?.priority === 'high' ? 'border-red-500 text-red-500' :
                      inspection?.priority === 'medium' ? 'border-yellow-500 text-yellow-500' :
                      'border-blue-500 text-blue-500'
                    }>
                      {inspection?.priority || 'N/A'}
                    </Badge>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Assigned Officer</h3>
                    <div className="flex items-center">
                      <Avatar className="h-6 w-6 mr-2">
                        <AvatarFallback>AO</AvatarFallback>
                      </Avatar>
                      <span>
                        {inspection?.assignedOfficerName || 'Unassigned'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Submit Review
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="Enter your review comments here..."
                    className="min-h-[120px]"
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                  />
                </CardContent>
                <CardFooter className="flex justify-between border-t pt-4">
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => handleSubmitReview('rejected')}
                    disabled={!reviewComment || submitReviewMutation.isPending}
                  >
                    Reject
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleSubmitReview('needs-changes')}
                    disabled={!reviewComment || submitReviewMutation.isPending}
                  >
                    Request Changes
                  </Button>
                  <Button 
                    variant="default" 
                    size="sm"
                    onClick={() => handleSubmitReview('approved')}
                    disabled={submitReviewMutation.isPending}
                  >
                    Approve
                  </Button>
                </CardFooter>
              </Card>
            </div>
            
            <div className="md:col-span-2">
              <Tabs value={selectedTab} onValueChange={setSelectedTab}>
                <TabsList className="mb-4">
                  <TabsTrigger value="details">
                    <Clipboard className="h-4 w-4 mr-2" />
                    Inspection Details
                  </TabsTrigger>
                  <TabsTrigger value="breaches">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    Breaches ({breaches?.length || 0})
                  </TabsTrigger>
                  <TabsTrigger value="people">
                    <Users className="h-4 w-4 mr-2" />
                    People ({people?.length || 0})
                  </TabsTrigger>
                  <TabsTrigger value="reviews">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Review History
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="details">
                  <Card>
                    <CardHeader>
                      <CardTitle>Inspection Details</CardTitle>
                      <CardDescription>
                        Complete information about this inspection
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h3 className="text-sm font-medium">Site Address</h3>
                        <p className="text-gray-700">{inspection?.siteAddress}</p>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium">Principal Contractor</h3>
                        <p className="text-gray-700">{inspection?.principalContractor || 'N/A'}</p>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium">DA Number</h3>
                        <p className="text-gray-700">{inspection?.daNumber || 'N/A'}</p>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium">Notes</h3>
                        <p className="text-gray-700 whitespace-pre-line">{inspection?.notes || 'No notes available'}</p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="breaches">
                  <Card>
                    <CardHeader>
                      <CardTitle>Breach Records</CardTitle>
                      <CardDescription>
                        Breaches found during this inspection
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {breaches && breaches.length > 0 ? (
                        <div className="space-y-4">
                          {breaches.map((breach) => (
                            <div key={breach.id} className="border rounded-md p-4">
                              <div className="flex justify-between items-start">
                                <h3 className="font-medium">{breach.title}</h3>
                                <Badge className={
                                  breach.severity === 'critical' ? 'bg-red-100 text-red-800 hover:bg-red-100' :
                                  breach.severity === 'high' ? 'bg-orange-100 text-orange-800 hover:bg-orange-100' :
                                  breach.severity === 'medium' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100' :
                                  'bg-blue-100 text-blue-800 hover:bg-blue-100'
                                }>
                                  {breach.severity}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-700 mt-2">{breach.description}</p>
                              
                              {breach.legislation && (
                                <div className="mt-2">
                                  <span className="text-xs font-medium text-gray-500">Legislation:</span>
                                  <span className="text-sm ml-1">{breach.legislation}</span>
                                </div>
                              )}
                              
                              {breach.recommendedAction && (
                                <div className="mt-1">
                                  <span className="text-xs font-medium text-gray-500">Recommended Action:</span>
                                  <span className="text-sm ml-1">{breach.recommendedAction}</span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          No breaches have been recorded for this inspection
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="people">
                  <Card>
                    <CardHeader>
                      <CardTitle>People on Site</CardTitle>
                      <CardDescription>
                        Individuals present during the inspection
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {people && people.length > 0 ? (
                        <div className="space-y-4">
                          {people.map((person) => (
                            <div key={person.id} className="flex items-start border rounded-md p-4">
                              <Avatar className="h-10 w-10 mr-4">
                                <AvatarFallback>{person.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <h3 className="font-medium">{person.name}</h3>
                                {person.role && (
                                  <p className="text-sm text-gray-700">{person.role}</p>
                                )}
                                <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2">
                                  {person.licenseNumber && (
                                    <div>
                                      <span className="text-xs font-medium text-gray-500">License:</span>
                                      <span className="text-sm ml-1">{person.licenseNumber}</span>
                                    </div>
                                  )}
                                  {person.contactNumber && (
                                    <div>
                                      <span className="text-xs font-medium text-gray-500">Contact:</span>
                                      <span className="text-sm ml-1">{person.contactNumber}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          No people have been recorded for this inspection
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="reviews">
                  <Card>
                    <CardHeader>
                      <CardTitle>Review History</CardTitle>
                      <CardDescription>
                        Previous review comments and decisions
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {reviewComments && reviewComments.length > 0 ? (
                        <div className="space-y-4">
                          {reviewComments.map((comment) => (
                            <div key={comment.id} className="border rounded-md p-4">
                              <div className="flex justify-between">
                                <div className="flex items-center">
                                  <Avatar className="h-6 w-6 mr-2">
                                    <AvatarFallback>{comment.reviewerName?.charAt(0) || 'U'}</AvatarFallback>
                                  </Avatar>
                                  <span className="font-medium">{comment.reviewerName || 'Unknown'}</span>
                                </div>
                                <Badge className={
                                  comment.status === 'approved' ? 'bg-green-100 text-green-800 hover:bg-green-100' :
                                  comment.status === 'rejected' ? 'bg-red-100 text-red-800 hover:bg-red-100' :
                                  'bg-yellow-100 text-yellow-800 hover:bg-yellow-100'
                                }>
                                  {comment.status === 'approved' ? 'Approved' :
                                   comment.status === 'rejected' ? 'Rejected' : 
                                   'Needs Changes'}
                                </Badge>
                              </div>
                              <div className="mt-2">
                                <p className="text-sm text-gray-700 whitespace-pre-line">{comment.comment}</p>
                              </div>
                              <div className="mt-2 text-xs text-gray-500">
                                {comment.createdAt && format(new Date(comment.createdAt), 'PPp')}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          No review history available for this inspection
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        )}
      </main>
      
      <BottomNavigation onCreateNew={() => navigate('/inspections/new')} />
    </div>
  );
}