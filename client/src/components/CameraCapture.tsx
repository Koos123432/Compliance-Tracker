import { useState, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Camera, X, Save, RotateCw } from 'lucide-react';

interface CameraCaptureProps {
  onCapture: (dataUrl: string) => void;
  onClose: () => void;
}

export default function CameraCapture({ onCapture, onClose }: CameraCaptureProps) {
  const [image, setImage] = useState<string | null>(null);
  const webcamRef = useRef<Webcam>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment");
  
  const videoConstraints = {
    width: 720,
    height: 1280,
    facingMode: facingMode
  };
  
  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setImage(imageSrc);
    }
  }, [webcamRef]);
  
  const retake = () => {
    setImage(null);
  };
  
  const saveImage = () => {
    if (image) {
      onCapture(image);
      onClose();
    }
  };
  
  const toggleCamera = () => {
    setFacingMode(facingMode === "user" ? "environment" : "user");
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium">Take Photo</h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          <div className="relative rounded-md overflow-hidden">
            {image ? (
              <img src={image} alt="Captured" className="w-full h-auto" />
            ) : (
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                videoConstraints={videoConstraints}
                className="w-full h-auto"
              />
            )}
          </div>
          
          <div className="flex justify-center mt-4 space-x-2">
            {image ? (
              <>
                <Button variant="outline" onClick={retake}>
                  <RotateCw className="h-4 w-4 mr-2" />
                  Retake
                </Button>
                <Button onClick={saveImage}>
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={toggleCamera}>
                  <RotateCw className="h-4 w-4 mr-2" />
                  Switch Camera
                </Button>
                <Button onClick={capture}>
                  <Camera className="h-4 w-4 mr-2" />
                  Capture
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
