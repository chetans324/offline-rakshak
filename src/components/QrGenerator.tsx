
import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { emergencyInstructions, shelterLocations } from '@/utils/emergencyData';
import { saveGeneratedQrCodes } from '@/utils/offlineStorage';
import { QrCode, Download } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface QrCodeData {
  type: string;
  title: string;
  content: string;
}

const QrGenerator: React.FC = () => {
  const [qrType, setQrType] = useState<string>('custom');
  const [title, setTitle] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [selectedPreset, setSelectedPreset] = useState<string>('');
  const [generatedQr, setGeneratedQr] = useState<QrCodeData | null>(null);
  const { toast } = useToast();

  const handleTypeChange = (value: string) => {
    setQrType(value);
    setSelectedPreset('');
    setTitle('');
    setContent('');
    setGeneratedQr(null);
  };

  const handlePresetChange = (value: string) => {
    setSelectedPreset(value);
    
    if (qrType === 'instruction') {
      const instruction = emergencyInstructions.find(ins => ins.id === value);
      if (instruction) {
        setTitle(instruction.title);
        setContent(JSON.stringify(instruction.steps));
      }
    } else if (qrType === 'location') {
      const location = shelterLocations.find(loc => loc.id === value);
      if (location) {
        setTitle(location.name);
        setContent(JSON.stringify({
          name: location.name,
          address: location.address,
          coordinates: location.coordinates,
          type: location.type,
          contact: location.contact
        }));
      }
    }
  };

  const generateQrCode = () => {
    if (!title || !content) return;
    
    const qrData: QrCodeData = {
      type: qrType,
      title: title,
      content: content
    };
    
    setGeneratedQr(qrData);
    
    // Save to offline storage
    const existingCodes = getGeneratedQrCodes();
    saveGeneratedQrCodes([
      {
        ...qrData,
        timestamp: Date.now(),
        id: `gen-${Date.now()}`
      },
      ...existingCodes
    ]);
  };

  // Modified download function to avoid DOM manipulation issues
  const downloadQrCode = () => {
    const svgElement = document.getElementById('qr-code-svg');
    
    if (svgElement) {
      try {
        // Create a canvas element
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const svgData = new XMLSerializer().serializeToString(svgElement);
        const img = new Image();
        
        // Set the canvas dimensions
        canvas.width = 250;
        canvas.height = 250;
        
        // Create a data URL from the SVG
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);
        
        img.onload = function() {
          // Draw the image on the canvas
          if (ctx) {
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            
            // Convert canvas to PNG
            const pngUrl = canvas.toDataURL('image/png');
            
            // Create download link
            const downloadLink = document.createElement('a');
            downloadLink.href = pngUrl;
            downloadLink.download = `emergency-qr-${qrType}-${Date.now()}.png`;
            
            // Trigger download without appending to DOM
            downloadLink.click();
            
            // Clean up
            URL.revokeObjectURL(url);
          }
        };
        
        img.src = url;
        
        toast({
          title: "QR Code Downloaded",
          description: "The QR code has been saved to your device.",
        });
      } catch (e) {
        console.error('Error downloading QR code:', e);
        toast({
          title: "Download Failed",
          description: "Could not download QR code. Please try again.",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Download Failed",
        description: "QR code element not found.",
        variant: "destructive",
      });
    }
  };
  
  const getQrContent = () => {
    try {
      return JSON.stringify({
        type: qrType,
        title: title,
        content: content,
        timestamp: Date.now()
      });
    } catch (e) {
      return 'Invalid data for QR code';
    }
  };
  
  const getGeneratedQrCodes = () => {
    try {
      const stored = localStorage.getItem('generated-qr-codes');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  };

  return (
    <div className="emergency-card">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <QrCode className="h-5 w-5 text-emergency" />
        QR Code Generator
      </h2>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">QR Code Type</label>
        <Select value={qrType} onValueChange={handleTypeChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="custom">Custom Message</SelectItem>
            <SelectItem value="instruction">Emergency Instruction</SelectItem>
            <SelectItem value="location">Shelter Location</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {qrType !== 'custom' && (
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Select Preset</label>
          <Select value={selectedPreset} onValueChange={handlePresetChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select a preset" />
            </SelectTrigger>
            <SelectContent>
              {qrType === 'instruction' && emergencyInstructions.map(instruction => (
                <SelectItem key={instruction.id} value={instruction.id}>
                  {instruction.title}
                </SelectItem>
              ))}
              {qrType === 'location' && shelterLocations.map(location => (
                <SelectItem key={location.id} value={location.id}>
                  {location.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Title</label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter QR code title"
        />
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Content</label>
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Enter QR code content"
          rows={4}
        />
      </div>
      
      <div className="flex gap-3 mb-4">
        <Button onClick={generateQrCode} className="emergency-primary w-full">
          Generate QR Code
        </Button>
      </div>
      
      {generatedQr && (
        <div className="mt-6 p-4 bg-accent rounded-lg flex flex-col items-center">
          <h3 className="font-medium mb-3 text-center">{generatedQr.title}</h3>
          <div className="bg-white p-3 rounded-lg mb-3">
            <QRCodeSVG
              id="qr-code-svg"
              value={getQrContent()}
              size={200}
              level="H"
              includeMargin
            />
          </div>
          <Button
            onClick={downloadQrCode}
            className="emergency-secondary"
            size="sm"
          >
            <Download className="mr-1 h-4 w-4" /> Download QR Code
          </Button>
        </div>
      )}
    </div>
  );
};

export default QrGenerator;
