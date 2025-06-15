
import React, { useState, useEffect } from 'react';
import { firstAidGuides } from '@/utils/emergencyData';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Phone, Shield, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

const FirstAidGuide: React.FC = () => {
  const [isWarSituation, setIsWarSituation] = useState(false);
  
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
  
  // Filter guides based on war situation
  const displayGuides = isWarSituation 
    ? firstAidGuides
    : firstAidGuides.filter(guide => !guide.warRelated);
  
  // Sort guides by priority: high, medium, then low
  const sortedGuides = [...displayGuides].sort((a, b) => {
    const priorityOrder = { high: 1, medium: 2, low: 3 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
  
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-emergency border-emergency';
      case 'medium':
        return 'text-orange-500 border-orange-500';
      case 'low':
        return 'text-green-600 border-green-600';
      default:
        return '';
    }
  };
  
  return (
    <div className="emergency-card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Phone className="h-5 w-5 text-emergency" />
          First Aid Guides
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
              <h3 className="font-bold text-emergency">CONFLICT ZONE FIRST AID ACTIVATED</h3>
              <p className="text-sm mt-1">
                Additional combat injury first aid guides are now available below.
              </p>
            </div>
          </div>
        </div>
      )}
      
      <div className="mb-4 p-3 border border-emergency bg-emergency/5 rounded-lg">
        <h3 className="font-medium text-emergency flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>Emergency First Aid Information</span>
        </h3>
        <p className="text-sm mt-1">
          These guides are for emergency situations only. Always seek professional medical help when possible.
        </p>
      </div>
      
      <Accordion type="multiple" defaultValue={["fa-001"]}>
        {sortedGuides.map((guide) => (
          <AccordionItem key={guide.id} value={guide.id} className={guide.warRelated ? "border-emergency/30" : ""}>
            <AccordionTrigger className="py-4 px-1 hover:no-underline">
              <div className="flex items-center gap-2">
                <span>{guide.title}</span>
                <div className="flex gap-1">
                  <Badge className={`ml-2 ${getPriorityColor(guide.priority)} bg-transparent`}>
                    {guide.priority}
                  </Badge>
                  {guide.warRelated && (
                    <Badge variant="outline" className="bg-emergency/10 text-emergency border-emergency">
                      Combat
                    </Badge>
                  )}
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-1">
              <ol className="space-y-4 list-decimal pl-5">
                {guide.steps.map((step, index) => (
                  <li key={index} className="pl-1">
                    <p>{step.text}</p>
                    {step.imageUrl && (
                      <div className="mt-2 mb-2">
                        <img
                          src={step.imageUrl}
                          alt={`Step ${index + 1}`}
                          className="max-w-full h-auto max-h-40 rounded border border-border"
                        />
                      </div>
                    )}
                  </li>
                ))}
              </ol>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};

export default FirstAidGuide;
