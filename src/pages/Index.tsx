
import React, { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QrCode, Phone, Map, Calendar, Compass } from "lucide-react";
import Layout from '../components/Layout';
import QrScanner from '../components/QrScanner';
import QrGenerator from '../components/QrGenerator';
import EmergencyInstructions from '../components/EmergencyInstructions';
import FirstAidGuide from '../components/FirstAidGuide';
import OfflineMap from '../components/OfflineMap';
import EmergencyTools from '../components/EmergencyTools';
import { 
  emergencyInstructions, 
  firstAidGuides, 
  shelterLocations 
} from '../utils/emergencyData';
import { 
  initializeOfflineData, 
  isOnline 
} from '../utils/offlineStorage';
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [activeTab, setActiveTab] = useState('instructions');
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const { toast } = useToast();
  const [tabsReady, setTabsReady] = useState(false);

  // Initialize offline data and set up online/offline listeners
  useEffect(() => {
    // Initialize offline data
    initializeOfflineData(
      emergencyInstructions,
      firstAidGuides,
      shelterLocations
    );

    // Set up online/offline event listeners
    const handleOnline = () => {
      setIsOffline(false);
      toast({
        title: "You're online",
        description: "You now have internet access",
      });
    };

    const handleOffline = () => {
      setIsOffline(true);
      toast({
        title: "You're offline",
        description: "App is now in offline mode",
        variant: "destructive",
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Set tabs ready immediately to avoid delayed mounting
    setTabsReady(true);

    // Clean up event listeners on component unmount
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [toast]);

  return (
    <Layout>
      <div className="emergency-container">
        {isOffline && (
          <div className="mb-6 p-4 border border-emergency bg-emergency/10 rounded-lg">
            <h3 className="font-bold text-emergency flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Offline Mode Active</span>
            </h3>
            <p className="text-sm mt-1">
              You're currently offline. All emergency resources are available without internet.
            </p>
          </div>
        )}

        <h1 className="emergency-title">Offline Rakshak</h1>
        <h2 className="emergency-subtitle">Offline Emergency Response System</h2>
        
        {tabsReady ? (
          <Tabs defaultValue="instructions" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full mb-6 grid grid-cols-5">
              <TabsTrigger value="instructions" className="flex flex-col items-center gap-1 py-3">
                <Calendar className="h-5 w-5" />
                <span className="text-xs">Instructions</span>
              </TabsTrigger>
              <TabsTrigger value="firstaid" className="flex flex-col items-center gap-1 py-3">
                <Phone className="h-5 w-5" />
                <span className="text-xs">First Aid</span>
              </TabsTrigger>
              <TabsTrigger value="scanner" className="flex flex-col items-center gap-1 py-3">
                <QrCode className="h-5 w-5" />
                <span className="text-xs">QR Scan</span>
              </TabsTrigger>
              <TabsTrigger value="generator" className="flex flex-col items-center gap-1 py-3">
                <QrCode className="h-5 w-5" />
                <span className="text-xs">QR Create</span>
              </TabsTrigger>
              <TabsTrigger value="tools" className="flex flex-col items-center gap-1 py-3">
                <Compass className="h-5 w-5" />
                <span className="text-xs">Tools</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="instructions" className="mt-0 space-y-6">
              <EmergencyInstructions />
              <OfflineMap />
            </TabsContent>
            
            <TabsContent value="firstaid" className="mt-0">
              <FirstAidGuide />
            </TabsContent>
            
            <TabsContent value="scanner" className="mt-0">
              <QrScanner />
            </TabsContent>
            
            <TabsContent value="generator" className="mt-0">
              <QrGenerator />
            </TabsContent>
            
            <TabsContent value="tools" className="mt-0">
              <EmergencyTools />
            </TabsContent>
          </Tabs>
        ) : (
          <div className="p-4 text-center">
            <p>Loading emergency resources...</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Index;
