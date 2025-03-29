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
    // More robust parsing to extract driver's license info
    console.log("OCR Raw Text:", text); // Log for debugging
    
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    const joinedText = lines.join(' '); // Create a joined version to search across line breaks
    
    let name = '';
    let licenseNumber = '';
    
    // Common patterns for driver's license numbers
    // Look for license numbers - various formats supported
    const licensePatterns = [
      /\b([A-Z0-9]{1,3}[\s-]?[0-9]{2,7}[\s-]?[0-9]{3,7})\b/i, // Format like "D123456789" or "DL 12345678"
      /\b(LICENSE|LIC|DL)[\s#:]*([A-Z0-9]{5,})\b/i, // Format with "LICENSE" label
      /\b([A-Z0-9]{7,13})\b/i, // Just a sequence of letters and numbers (at least 7 chars)
      /\b([0-9]{5,13})\b/ // Just a sequence of numbers (at least 5 digits)
    ];
    
    for (const pattern of licensePatterns) {
      const match = joinedText.match(pattern);
      if (match) {
        licenseNumber = match[1] || match[2] || "";
        licenseNumber = licenseNumber.replace(/\s+/g, ''); // Remove any spaces
        break;
      }
    }
    
    // Name detection - look for common name patterns in driver's licenses
    // Patterns for name detection
    const namePatterns = [
      /\b(NAME|NM)[:\s]+([A-Z\s,.-]+)\b/i, // Format with "NAME" label
      /\b(LAST|LST|SURNAME)[:\s]+([A-Z\s]+)[,\s]+(FIRST|FST)[:\s]+([A-Z\s]+)\b/i, // Format with LAST/FIRST labels
      /\b([A-Z]+)[,\s]+([A-Z]+\s*[A-Z]*)\b/ // Format like "SMITH, JOHN DAVID"
    ];
    
    for (const pattern of namePatterns) {
      const match = joinedText.match(pattern);
      if (match) {
        if (match[2] && match[4]) { // LAST, FIRST format
          name = `${match[2].trim()}, ${match[4].trim()}`;
        } else if (match[2] && !match[4]) { // Just name after label
          name = match[2].trim();
        } else if (match[1] && match[2]) { // LAST, FIRST in another format
          name = `${match[1].trim()}, ${match[2].trim()}`;
        }
        break;
      }
    }
    
    // If no structured name was found, try to find a name based on positioning and formatting
    if (!name) {
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].toUpperCase();
        // Look for lines that look like names (all caps, no numbers, reasonable length)
        if (/^[A-Z.\s,'-]{5,30}$/.test(line) && 
            !line.includes("LICENSE") && 
            !line.includes("DRIVER") && 
            !line.includes("STATE") &&
            !line.includes("EXPIRES")) {
          name = line;
          break;
        }
      }
    }
    
    // If we still don't have a license number, try to find sequences that match typical license patterns
    if (!licenseNumber) {
      for (const line of lines) {
        const numbers = line.match(/\b\d{6,12}\b/);
        if (numbers && numbers[0].length >= 6) {
          licenseNumber = numbers[0];
          break;
        }
      }
    }
    
    // Manual cleanup for name (very common OCR errors)
    if (name) {
      name = name
        .replace(/\b0\b/g, 'O') // Replace standalone "0" with "O"
        .replace(/1/g, 'I') // Replace "1" with "I" in names
        .replace(/\s{2,}/g, ' ') // Replace multiple spaces with single space
        .trim();
    }
    
    console.log("Extracted data:", { name, licenseNumber }); // Log extracted data
    
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
