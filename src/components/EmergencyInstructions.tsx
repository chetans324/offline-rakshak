
import React, { useState, useEffect } from 'react';
import { emergencyInstructions } from '@/utils/emergencyData';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, AlertTriangle, Shield } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface CategoryTab {
  id: string;
  label: string;
}

const EmergencyInstructions: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [isWarSituation, setIsWarSituation] = useState(false);
  const isMobile = useIsMobile();
  
  useEffect(() => {
    // Check if we previously detected war situation
    const warStatus = localStorage.getItem('warSituation');
    if (warStatus === 'true') {
      setIsWarSituation(true);
    }
  }, []);
  
  const toggleWarSituation = () => {
    const newStatus = !isWarSituation;
    setIsWarSituation(newStatus);
    localStorage.setItem('warSituation', newStatus.toString());
  };
  
  const categoryTabs: CategoryTab[] = [
    { id: 'all', label: 'All' },
    { id: 'natural', label: 'Natural Disasters' },
    { id: 'disaster', label: 'Man-made Disasters' },
    { id: 'health', label: 'Health Emergencies' },
  ];
  
  if (isWarSituation) {
    categoryTabs.push({ id: 'war', label: 'War Situations' });
  }
  
  const filteredInstructions = activeCategory === 'all' 
    ? (isWarSituation ? emergencyInstructions : emergencyInstructions.filter(ins => !ins.warRelated))
    : activeCategory === 'war'
      ? emergencyInstructions.filter(ins => ins.warRelated)
      : emergencyInstructions.filter(ins => ins.category === activeCategory && (!ins.warRelated || isWarSituation));
  
  return (
    <div className="emergency-card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Calendar className="h-5 w-5 text-emergency" />
          Emergency Instructions
        </h2>
        
        <Button
          onClick={toggleWarSituation}
          variant={isWarSituation ? "destructive" : "outline"}
          size="sm"
          className="flex-none"
        >
          <Shield className="mr-1 h-4 w-4" />
          {isWarSituation ? 'Exit War Mode' : 'War Mode'}
        </Button>
      </div>
      
      {isWarSituation && (
        <div className="mb-4 p-3 border-2 border-emergency bg-emergency/10 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-5 w-5 text-emergency mt-0.5" />
            <div>
              <h3 className="font-bold text-emergency">WAR SITUATION INSTRUCTIONS ACTIVE</h3>
              <p className="text-sm mt-1">
                Special emergency protocols for conflict zones are now visible.
              </p>
            </div>
          </div>
        </div>
      )}
      
      <Tabs defaultValue="all" value={activeCategory} onValueChange={setActiveCategory}>
        <TabsList className={`w-full mb-4 ${isMobile ? 'flex flex-wrap gap-1' : ''}`}>
          {categoryTabs.map(tab => (
            <TabsTrigger 
              key={tab.id} 
              value={tab.id}
              className={isMobile ? "flex-none text-xs py-1 px-2" : "flex-1"}
            >
              {isMobile && tab.label === 'Natural Disasters' 
                ? 'Natural' 
                : isMobile && tab.label === 'Man-made Disasters'
                  ? 'Man-made'
                  : isMobile && tab.label === 'Health Emergencies'
                    ? 'Health'
                    : tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
        
        <TabsContent value={activeCategory} className="mt-0">
          <div className="grid gap-4 md:grid-cols-2">
            {filteredInstructions.map(instruction => (
              <Card key={instruction.id} className={`overflow-hidden ${instruction.warRelated ? 'border-emergency/40' : ''}`}>
                <CardHeader className={`p-4 ${instruction.warRelated ? 'bg-emergency/10' : 'bg-accent'}`}>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{instruction.title}</CardTitle>
                    {instruction.warRelated && (
                      <Badge variant="outline" className="bg-emergency/20 text-emergency border-emergency">
                        War Protocol
                      </Badge>
                    )}
                  </div>
                  <CardDescription>Emergency Protocol</CardDescription>
                </CardHeader>
                
                <CardContent className="p-4">
                  <ol className="list-decimal pl-5 space-y-2">
                    {instruction.steps.map((step, index) => (
                      <li key={index}>{step}</li>
                    ))}
                  </ol>
                </CardContent>
                
                <CardFooter className="bg-muted/50 p-4 text-xs text-muted-foreground">
                  Available offline. Save or print for emergency use.
                </CardFooter>
              </Card>
            ))}
          </div>
          
          {filteredInstructions.length === 0 && (
            <div className="text-center p-8 bg-muted rounded-lg">
              <p>No instructions available for this category.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EmergencyInstructions;
