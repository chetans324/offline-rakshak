
import React, { useState, useEffect, useRef } from 'react';
import { Compass, Map, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import CustomFlashlight from './Flashlight';
import MediaPlayer from './MediaPlayer';

interface Coordinates {
  latitude: number | null;
  longitude: number | null;
}

const EmergencyTools: React.FC = () => {
  const [compassHeading, setCompassHeading] = useState<number | null>(null);
  const [coordinates, setCoordinates] = useState<Coordinates>({
    latitude: null,
    longitude: null,
  });
  const [isSosActive, setIsSosActive] = useState(false);
  const { toast } = useToast();
  
  // Create stable references for event handlers and timers
  const compassEventListener = useRef<((event: DeviceOrientationEvent) => void) | null>(null);
  const colorIntervalRef = useRef<number | null>(null);
  const sosIntervalRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  
  // Store body styles for restoration
  const bodyStylesRef = useRef({
    backgroundColor: document.body.style.backgroundColor || '',
    transition: document.body.style.transition || ''
  });
  
  // Initialize everything on component mount
  useEffect(() => {
    // Store initial body styles for later restoration
    bodyStylesRef.current = {
      backgroundColor: document.body.style.backgroundColor || '',
      transition: document.body.style.transition || ''
    };
    
    console.log("EmergencyTools component mounted");
    
    // Create compass event handler
    compassEventListener.current = (event: DeviceOrientationEvent) => {
      // For iOS devices
      if ((event as any).webkitCompassHeading !== undefined) {
        setCompassHeading((event as any).webkitCompassHeading);
      } 
      // For Android/other devices
      else if (event.alpha !== null) {
        setCompassHeading(360 - event.alpha);
      }
    };
    
    // Audio context cleanup
    try {
      if (audioContextRef.current && 
          typeof audioContextRef.current.close === 'function') {
        audioContextRef.current.close();
      }
    } catch (e) {
      console.error("Error closing AudioContext:", e);
    }
    
    // Return cleanup function to stop everything when component unmounts
    return () => {
      console.log("Emergency tools component unmounting - cleaning up");
      stopSosSignal();
      
      // Remove compass listener if exists
      if (compassEventListener.current) {
        window.removeEventListener('deviceorientation', compassEventListener.current);
        compassEventListener.current = null;
      }
      
      try {
        // Reset body styles to original
        document.body.style.backgroundColor = bodyStylesRef.current.backgroundColor;
        document.body.style.transition = bodyStylesRef.current.transition;
        
        // Close audio context if exists
        if (audioContextRef.current && 
            typeof audioContextRef.current.close === 'function') {
          audioContextRef.current.close().catch(e => console.error("Error closing audio context:", e));
        }
      } catch (e) {
        console.error("Error during cleanup:", e);
      }
    };
  }, []);
  
  // Handle device orientation event for compass
  const requestCompassPermission = () => {
    if (typeof DeviceOrientationEvent !== 'undefined') {
      try {
        // For iOS 13+ which requires permission
        if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
          (DeviceOrientationEvent as any).requestPermission()
            .then((response: string) => {
              if (response === 'granted') {
                // Add the compass event listener stored in ref
                if (compassEventListener.current) {
                  window.addEventListener('deviceorientation', compassEventListener.current, true);
                }
                
                toast({
                  title: "Compass Activated",
                  description: "Your device compass is now active",
                });
              } else {
                toast({
                  title: "Permission denied",
                  description: "Compass requires orientation permission",
                  variant: "destructive",
                });
              }
            })
            .catch((e: Error) => {
              console.error('Error requesting orientation permission:', e);
              toast({
                title: "Compass Error",
                description: "Could not access device orientation",
                variant: "destructive",
              });
            });
        } else {
          // For non iOS 13+ devices
          if (compassEventListener.current) {
            window.addEventListener('deviceorientation', compassEventListener.current, true);
          }
          
          toast({
            title: "Compass Activated",
            description: "Your device compass is now active",
          });
        }
      } catch (error) {
        console.error("Error setting up compass:", error);
        toast({
          title: "Compass Error",
          description: "Could not initialize compass",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Compass Unavailable",
        description: "Your device doesn't support orientation detection",
        variant: "destructive",
      });
    }
  };
  
  // Get current GPS location
  const getLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Geolocation Unavailable",
        description: "Geolocation is not supported by your browser",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Getting Location",
      description: "Please wait while we find your location...",
    });
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoordinates({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        
        toast({
          title: "Location Found",
          description: "Your current location has been determined",
        });
      },
      (error) => {
        console.error("Error getting location:", error);
        toast({
          title: "Location Error",
          description: error.message,
          variant: "destructive",
        });
      }
    );
  };
  
  // Handle SOS signal toggle
  const toggleSOSSignal = () => {
    if (isSosActive) {
      stopSosSignal();
    } else {
      startSosSignal();
    }
  };

  // Start SOS signal with safer DOM and audio handling
  const startSosSignal = () => {
    try {
      // Clean up any existing intervals first
      stopSosSignal();
      
      // Store original body styles
      bodyStylesRef.current = {
        backgroundColor: document.body.style.backgroundColor || '',
        transition: document.body.style.transition || ''
      };
      
      // Set up transition for smoother color changes
      document.body.style.transition = 'background-color 0.5s';
      
      // Create beep sound using AudioContext API with proper reference management
      try {
        // Create new AudioContext
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        audioContextRef.current = new AudioContextClass();
        
        const createAndPlayBeep = () => {
          if (!audioContextRef.current) return;
          
          const oscillator = audioContextRef.current.createOscillator();
          const gainNode = audioContextRef.current.createGain();
          
          oscillator.type = 'square';
          oscillator.frequency.setValueAtTime(800, audioContextRef.current.currentTime);
          
          gainNode.gain.setValueAtTime(0.5, audioContextRef.current.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + 0.5);
          
          oscillator.connect(gainNode);
          gainNode.connect(audioContextRef.current.destination);
          
          oscillator.start();
          oscillator.stop(audioContextRef.current.currentTime + 0.5);
        };
        
        // Play initial beep
        createAndPlayBeep();
        
        // Set up interval for beeps - store reference for cleanup
        const beepInterval = window.setInterval(() => {
          createAndPlayBeep();
        }, 1000);
        
        sosIntervalRef.current = beepInterval;
      } catch (audioErr) {
        console.error("Audio API error:", audioErr);
        
        // Fallback to vibration if available
        try {
          if ('vibrate' in navigator) {
            const vibrateInterval = window.setInterval(() => {
              navigator.vibrate([200, 100, 200]);
            }, 1000);
            sosIntervalRef.current = vibrateInterval;
          }
        } catch (vibErr) {
          console.error("Vibration API error:", vibErr);
        }
      }
      
      // Create flashing effect with interval - store reference for cleanup
      let isRed = false;
      const colorInterval = window.setInterval(() => {
        isRed = !isRed;
        document.body.style.backgroundColor = isRed ? 'red' : 'white';
      }, 500);
      
      colorIntervalRef.current = colorInterval;
      
      // Auto-stop after 10 seconds
      const autoStopTimeout = window.setTimeout(() => {
        stopSosSignal();
      }, 10000);
      
      setIsSosActive(true);
      
      toast({
        title: "SOS Activated",
        description: "Emergency signal is now active",
        variant: "destructive",
      });
      
    } catch (error) {
      console.error("Error activating SOS signal:", error);
      stopSosSignal(); // Clean up anything that might have started
      toast({
        title: "SOS Error",
        description: "Could not activate emergency signal",
        variant: "destructive",
      });
    }
  };
  
  // Stop SOS signal with comprehensive cleanup
  const stopSosSignal = () => {
    console.log("Stopping SOS signal, cleaning up resources");
    
    // Clear color flashing interval
    if (colorIntervalRef.current !== null) {
      window.clearInterval(colorIntervalRef.current);
      colorIntervalRef.current = null;
    }
    
    // Clear SOS interval (beeps or vibration)
    if (sosIntervalRef.current !== null) {
      window.clearInterval(sosIntervalRef.current);
      sosIntervalRef.current = null;
    }
    
    // Try to close AudioContext if it exists
    try {
      if (audioContextRef.current && 
          audioContextRef.current.state !== 'closed' && 
          typeof audioContextRef.current.close === 'function') {
        audioContextRef.current.close().catch(e => console.error("Error closing AudioContext:", e));
      }
    } catch (e) {
      console.error("Error closing audio context:", e);
    }
    
    // Reset body background safely
    try {
      document.body.style.backgroundColor = bodyStylesRef.current.backgroundColor;
      document.body.style.transition = bodyStylesRef.current.transition;
    } catch (e) {
      console.error("Error resetting body styles:", e);
    }
    
    setIsSosActive(false);
    
    toast({
      title: "SOS Deactivated",
      description: "Emergency signal has been turned off",
    });
  };
  
  return (
    <div className="emergency-card space-y-6">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <Compass className="h-5 w-5 text-emergency" />
        Emergency Tools
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Compass */}
        <div className="p-4 border rounded-lg bg-card flex flex-col items-center">
          <div className="relative w-32 h-32 flex items-center justify-center">
            <div 
              className="bg-gray-100 rounded-full w-full h-full flex items-center justify-center"
              style={{ position: 'relative' }}
            >
              <Compass 
                className="h-24 w-24 absolute"
                style={{ transform: compassHeading !== null ? `rotate(${compassHeading}deg)` : 'none' }}
              />
              {compassHeading !== null && (
                <div className="absolute text-emergency text-2xl font-extrabold">N</div>
              )}
            </div>
          </div>
          <h3 className="font-medium mb-1 mt-2">Compass</h3>
          <p className="text-xl font-bold">{compassHeading !== null ? Math.round(compassHeading) + '°' : '--°'}</p>
          {compassHeading === null && (
            <Button 
              onClick={requestCompassPermission} 
              className="mt-2" 
              size="sm" 
              variant="outline"
            >
              Enable Compass
            </Button>
          )}
          <p className="text-xs mt-2 text-center text-muted-foreground">
            {compassHeading !== null
              ? 'Compass is active'
              : 'Click to activate compass'}
          </p>
        </div>
        
        {/* GPS Location */}
        <div className="p-4 border rounded-lg bg-card">
          <div className="flex flex-col items-center">
            <Map className="h-16 w-16 mb-2" />
            <h3 className="font-medium mb-1">Current Location</h3>
            {coordinates.latitude !== null && coordinates.longitude !== null ? (
              <div className="text-center">
                <p className="font-mono text-sm">Lat: {coordinates.latitude.toFixed(6)}</p>
                <p className="font-mono text-sm">Long: {coordinates.longitude.toFixed(6)}</p>
              </div>
            ) : (
              <Button onClick={getLocation} size="sm" className="mt-2">
                Get Location
              </Button>
            )}
          </div>
        </div>
        
        {/* Flashlight */}
        <CustomFlashlight />
        
        {/* SOS Signal */}
        <div className="p-4 border rounded-lg bg-card flex flex-col items-center">
          <div className={`w-16 h-16 ${isSosActive ? 'bg-red-500 animate-pulse' : 'bg-emergency'} rounded-full flex items-center justify-center mb-2`}>
            <AlertTriangle className="h-8 w-8 text-white" />
          </div>
          <h3 className="font-medium mb-1">Emergency Signal</h3>
          <Button 
            onClick={toggleSOSSignal} 
            className={`mt-2 ${isSosActive ? 'bg-red-600 hover:bg-red-700' : 'bg-emergency'}`}
          >
            {isSosActive ? 'Deactivate SOS Signal' : 'Activate SOS Signal'}
          </Button>
          <p className="text-xs mt-2 text-center text-muted-foreground">
            Flashes screen and plays sound
          </p>
        </div>
      </div>
      
      {/* Media Player */}
      <MediaPlayer />
    </div>
  );
};

export default EmergencyTools;
