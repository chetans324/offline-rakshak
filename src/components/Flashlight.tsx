
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Flashlight as FlashlightIcon } from 'lucide-react';

const Flashlight: React.FC = () => {
  const [isFlashlightOn, setIsFlashlightOn] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const { toast } = useToast();
  
  useEffect(() => {
    // Check if the browser supports the camera API
    const checkFlashlightSupport = async () => {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setIsSupported(false);
        return;
      }
      
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const hasCamera = devices.some(device => device.kind === 'videoinput');
        setIsSupported(hasCamera);
      } catch (error) {
        console.error('Error checking flashlight support:', error);
        setIsSupported(false);
      }
    };
    
    checkFlashlightSupport();
    
    // Clean up on unmount
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);
  
  const toggleFlashlight = async () => {
    if (!isSupported) {
      toast({
        title: "Flashlight Unavailable",
        description: "Your device doesn't support flashlight access via browser.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      if (!isFlashlightOn) {
        // Turn on flashlight
        const newStream = await navigator.mediaDevices.getUserMedia({
          video: { 
            facingMode: 'environment',
            advanced: [{ torch: true }] as any
          }
        });
        
        setStream(newStream);
        setIsFlashlightOn(true);
        
        toast({
          title: "Flashlight On",
          description: "The flashlight has been turned on.",
        });
      } else {
        // Turn off flashlight
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
          setStream(null);
        }
        
        setIsFlashlightOn(false);
        
        toast({
          title: "Flashlight Off",
          description: "The flashlight has been turned off.",
        });
      }
    } catch (error) {
      console.error('Error toggling flashlight:', error);
      toast({
        title: "Flashlight Error",
        description: "Could not access flashlight. Please check permissions.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className="flex flex-col items-center p-4 border rounded-lg bg-card">
      <FlashlightIcon 
        className={`h-12 w-12 mb-4 ${isFlashlightOn ? 'text-yellow-400' : 'text-muted-foreground'}`}
      />
      
      <Button
        onClick={toggleFlashlight}
        className={isFlashlightOn ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-emergency hover:bg-emergency-dark'}
      >
        {isFlashlightOn ? 'Turn Off Flashlight' : 'Turn On Flashlight'}
      </Button>
      
      {!isSupported && (
        <p className="text-xs mt-2 text-muted-foreground text-center">
          Flashlight functionality requires camera permission and may not work on all devices.
        </p>
      )}
    </div>
  );
};

export default Flashlight;
