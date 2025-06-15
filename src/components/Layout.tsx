
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Phone, QrCode, Compass, Map, Calendar } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const isMobile = useIsMobile();
  
  return (
    <div className="min-h-screen bg-background">
      <header className="bg-emergency text-white p-4 shadow-md">
        <div className="container flex items-center justify-between">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Phone className="h-6 w-6" />
            <span>Offline Rakshak</span>
          </h1>
          <div className="text-sm">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white text-emergency">
              Offline Ready
            </span>
          </div>
        </div>
      </header>
      
      <main className="container py-6">
        {children}
      </main>
      
      <footer className="bg-muted py-4 border-t">
        <div className="container text-center text-sm text-muted-foreground">
          <p>Offline Rakshak - Offline Emergency System</p>
          <p className="mt-1">Available for all devices, works offline</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
