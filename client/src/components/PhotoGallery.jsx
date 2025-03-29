import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Camera, ImagePlus, Trash2 } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import CameraCapture from './CameraCapture';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

interface PhotoGalleryProps {
  inspectionId: number;
  breachId?: number;
  title?: string;
}

export default function PhotoGallery({ inspectionId, breachId, title = "Photos" }: PhotoGalleryProps) {
  const [showCamera, setShowCamera] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<number | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const queryKey = breachId 
    ? [`/api/inspections/${inspectionId}/photos?breachId=${breachId}`]
    : [`/api/inspections/${inspectionId}/photos`];
  
  const { data: photos, isLoading } = useQuery({
    queryKey,
  });
  
  const addPhotoMutation = useMutation({
    mutationFn: async (photoUrl: string) => {
      return apiRequest('POST', '/api/photos', {
        inspectionId,
        breachId,
        photoUrl,
        description: '',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast({
        title: "Photo added",
        description: "The photo has been successfully added",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to upload photo. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  const deletePhotoMutation = useMutation({
    mutationFn: async (photoId: number) => {
      return apiRequest('DELETE', `/api/photos/${photoId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast({
        title: "Photo deleted",
        description: "The photo has been successfully removed",
      });
      setSelectedPhoto(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete photo. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  const handleCapture = (dataUrl) => {
    addPhotoMutation.mutate(dataUrl);
    setShowCamera(false);
  };
  
  if (isLoading) {
    return (
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-medium uppercase text-gray-500">{title}</h3>
            <Skeleton className="h-9 w-28" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32 w-full rounded-md" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <>
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-medium uppercase text-gray-500">{title}</h3>
            <Button 
              variant="primary" 
              onClick={() => setShowCamera(true)}
              disabled={addPhotoMutation.isPending}
            >
              <Camera className="mr-2 h-4 w-4" />
              <span>Take Photos</span>
            </Button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {photos?.map((photo: any) => (
              <div key={photo.id} className="relative">
                <img 
                  src={photo.photoUrl} 
                  alt="Site photo" 
                  className="rounded-md w-full h-32 object-cover"
                  onClick={() => setSelectedPhoto(photo.id)}
                />
                <button 
                  type="button" 
                  className="absolute top-1 right-1 bg-white rounded-full p-1 shadow"
                  onClick={() => setSelectedPhoto(photo.id)}
                >
                  <Trash2 className="text-gray-600 h-4 w-4" />
                </button>
              </div>
            ))}
            
            <div 
              className="border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center h-32 cursor-pointer"
              onClick={() => setShowCamera(true)}
            >
              <ImagePlus className="text-gray-400 h-6 w-6" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      {showCamera && (
        <CameraCapture 
          onCapture={handleCapture} 
          onClose={() => setShowCamera(false)} 
        />
      )}
      
      <AlertDialog open={selectedPhoto !== null} onOpenChange={(open) => {
        if (!open) setSelectedPhoto(null);
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Photo</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this photo? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (selectedPhoto !== null) {
                  deletePhotoMutation.mutate(selectedPhoto);
                }
              }}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
