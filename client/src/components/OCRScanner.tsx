import { useState, useEffect } from 'react';
import Tesseract from 'tesseract.js';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Camera, X, Save } from 'lucide-react';
import CameraCapture from './CameraCapture';
import { Progress } from '@/components/ui/progress';

interface OCRScannerProps {
  onScanComplete: (data: any) => void;
  onClose: () => void;
}

export default function OCRScanner({ onScanComplete, onClose }: OCRScannerProps) {
  const [showCamera, setShowCamera] = useState(false);
  const [scanningImage, setScanningImage] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<any>(null);
  const [scanning, setScanning] = useState(false);
  
  useEffect(() => {
    if (scanningImage && !scanning && !result) {
      scanImage();
    }
  }, [scanningImage]);
  
  const handleCapture = (dataUrl: string) => {
    setScanningImage(dataUrl);
    setShowCamera(false);
  };
  
  const scanImage = async () => {
    setScanning(true);
    
    try {
      const { data } = await Tesseract.recognize(
        scanningImage!,
        'eng',
        {
          logger: (m) => {
            if (m.status === 'recognizing text') {
              setProgress(m.progress * 100);
            }
          }
        }
      );
      
      // Parse the OCR result to try to extract driver's license info
      const extractedData = parseOCRData(data.text);
      setResult(extractedData);
    } catch (error) {
      console.error('OCR scan failed:', error);
    } finally {
      setScanning(false);
    }
  };
  
  const parseOCRData = (text: string) => {
    // Basic parsing to extract name and license number
    // This is a simplified implementation - in a real app, this would need to be more robust
    // and handle different license formats
    const lines = text.split('\n').filter(line => line.trim().length > 0);
    
    const nameRegex = /^([A-Z]+,?\s+[A-Z\s]+)$/; // Simple regex for name
    const licenseRegex = /(\d{7,})$/; // Simple regex for license number - sequence of 7+ digits
    
    let name = '';
    let licenseNumber = '';
    
    for (const line of lines) {
      // Try to find name
      const nameMatch = line.match(nameRegex);
      if (nameMatch && !name) {
        name = nameMatch[1].trim();
        continue;
      }
      
      // Try to find license number
      const licenseMatch = line.match(licenseRegex);
      if (licenseMatch && !licenseNumber) {
        licenseNumber = licenseMatch[1].trim();
      }
    }
    
    return {
      name,
      licenseNumber,
      rawText: text
    };
  };
  
  const handleSave = () => {
    if (result) {
      onScanComplete(result);
      onClose();
    }
  };
  
  const restart = () => {
    setScanningImage(null);
    setResult(null);
    setProgress(0);
    setShowCamera(true);
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
      {showCamera ? (
        <CameraCapture onCapture={handleCapture} onClose={onClose} />
      ) : (
        <Card className="w-full max-w-md mx-4">
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium">License Scanner</h2>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            {scanningImage && (
              <div className="mb-4">
                <img src={scanningImage} alt="Scanned document" className="w-full h-auto rounded-md mb-2" />
                
                {scanning && (
                  <div className="mt-2">
                    <p className="text-sm mb-1">Scanning document...</p>
                    <Progress value={progress} className="h-2" />
                  </div>
                )}
              </div>
            )}
            
            {result && (
              <div className="mb-4 p-3 bg-gray-50 rounded-md">
                <h3 className="font-medium mb-2">Extracted Information</h3>
                <div className="text-sm space-y-1">
                  <p><span className="font-medium">Name:</span> {result.name || 'Not detected'}</p>
                  <p><span className="font-medium">License Number:</span> {result.licenseNumber || 'Not detected'}</p>
                </div>
              </div>
            )}
            
            <div className="flex justify-end space-x-2 mt-4">
              {!scanningImage ? (
                <Button onClick={() => setShowCamera(true)}>
                  <Camera className="h-4 w-4 mr-2" />
                  Scan License
                </Button>
              ) : result ? (
                <>
                  <Button variant="outline" onClick={restart}>
                    Scan Again
                  </Button>
                  <Button onClick={handleSave}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Information
                  </Button>
                </>
              ) : (
                <Button variant="outline" onClick={restart} disabled={scanning}>
                  Retake
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
