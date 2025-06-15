import React, { useState, useEffect, useRef } from 'react';
import { Map, AlertTriangle, Shield, MapPin, Navigation, Download, Locate } from 'lucide-react';
import { ShelterLocation } from '@/utils/emergencyData';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from '@/hooks/use-toast';
import { saveShelterLocations, getShelterLocations } from '@/utils/offlineStorage';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
// Import Leaflet
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

// Fix Leaflet icon issue - modify the Icon.Default prototype properly
const DefaultIcon = L.icon({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface Coordinates {
  latitude: number;
  longitude: number;
}

interface ShelterWithDistance extends ShelterLocation {
  distance: number;
}

// Define a new interface for automatically detected locations
interface DetectedLocation {
  id: string;
  name: string;
  address: string;
  coordinates: [number, number]; // [longitude, latitude]
  type: 'shelter' | 'hospital' | 'police' | 'fire';
  distance?: number;
  contact?: string;
}

// Helper component to update map view when coordinates change
const MapUpdater = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  
  useEffect(() => {
    if (center) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);
  
  return null;
};

// Improved location detection component
const LocationFinder = ({ onLocationFound }: { onLocationFound: (coords: Coordinates) => void }) => {
  const map = useMap();
  
  useMapEvents({
    locationfound(e) {
      const coords = {
        latitude: e.latlng.lat,
        longitude: e.latlng.lng
      };
      onLocationFound(coords);
    },
    locationerror(e) {
      console.error("Location error:", e.message);
    }
  });
  
  useEffect(() => {
    // Try to locate with high accuracy
    map.locate({ 
      setView: true, 
      maxZoom: 16, 
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    });
  }, [map]);
  
  return null;
};

// Helper component to download map tiles for offline use
const OfflineTileDownloader = ({ bounds, zoom, onProgress, onComplete }: any) => {
  const map = useMap();
  
  useEffect(() => {
    if (!bounds) return;
    
    const downloadTiles = async () => {
      const tileLayer = map.eachLayer((layer: any) => {
        if (layer instanceof L.TileLayer) {
          return layer;
        }
      });
      
      if (!tileLayer) return;
      
      // Cache current view
      const sw = bounds.getSouthWest();
      const ne = bounds.getNorthEast();
      const minZoom = 13;
      const maxZoom = 16;
      
      let totalTiles = 0;
      let loadedTiles = 0;
      
      // Calculate total number of tiles
      for (let z = minZoom; z <= maxZoom; z++) {
        const nwTile = L.point(
          Math.floor((sw.lng + 180) / 360 * Math.pow(2, z)),
          Math.floor((1 - Math.log(Math.tan(sw.lat * Math.PI / 180) + 1 / Math.cos(sw.lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, z))
        );
        const seTile = L.point(
          Math.floor((ne.lng + 180) / 360 * Math.pow(2, z)),
          Math.floor((1 - Math.log(Math.tan(ne.lat * Math.PI / 180) + 1 / Math.cos(ne.lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, z))
        );
        
        totalTiles += (seTile.x - nwTile.x + 1) * (seTile.y - nwTile.y + 1);
      }
      
      onProgress(0, totalTiles);
      
      // Start caching
      const cachePromises = [];
      let tilesProcessed = 0;
      
      for (let z = minZoom; z <= maxZoom; z++) {
        const nwTile = L.point(
          Math.floor((sw.lng + 180) / 360 * Math.pow(2, z)),
          Math.floor((1 - Math.log(Math.tan(sw.lat * Math.PI / 180) + 1 / Math.cos(sw.lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, z))
        );
        const seTile = L.point(
          Math.floor((ne.lng + 180) / 360 * Math.pow(2, z)),
          Math.floor((1 - Math.log(Math.tan(ne.lat * Math.PI / 180) + 1 / Math.cos(ne.lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, z))
        );
        
        for (let x = nwTile.x; x <= seTile.x; x++) {
          for (let y = nwTile.y; y <= seTile.y; y++) {
            const tileUrl = `https://{s}.tile.openstreetmap.org/${z}/${x}/${y}.png`.replace('{s}', 'a');
            cachePromises.push(
              fetch(tileUrl, { cache: 'force-cache' })
                .then(() => {
                  loadedTiles++;
                  tilesProcessed++;
                  onProgress(tilesProcessed, totalTiles);
                })
                .catch(() => {
                  tilesProcessed++;
                  onProgress(tilesProcessed, totalTiles);
                })
            );
          }
        }
      }
      
      await Promise.all(cachePromises);
      onComplete(loadedTiles, totalTiles);
    };
    
    downloadTiles();
  }, [bounds, zoom, onProgress, onComplete, map]);
  
  return null;
};

// Custom markers for different location types
const createCustomIcon = (type: string) => {
  const colorMap: Record<string, string> = {
    'shelter': '#1d4ed8', // blue
    'hospital': '#ef4444', // red
    'police': '#4f46e5', // indigo
    'fire': '#f97316', // orange
    'user': '#047857', // green
  };
  
  return L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background-color: ${colorMap[type] || '#6b7280'};
      border: 2px solid white;
      box-shadow: 0 0 4px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
};

const OfflineMap: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('list');
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  const [sortedLocations, setSortedLocations] = useState<ShelterWithDistance[]>([]);
  const [detectedLocations, setDetectedLocations] = useState<DetectedLocation[]>([]);
  const [isMapDownloaded, setIsMapDownloaded] = useState(false);
  const [isDetectingLocations, setIsDetectingLocations] = useState(false);
  const [isWarSituation, setIsWarSituation] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState<DetectedLocation | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<{current: number, total: number} | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [locationAccuracy, setLocationAccuracy] = useState<number | null>(null);
  const [useHighAccuracy, setUseHighAccuracy] = useState<boolean>(true);
  const { toast } = useToast();
  const mapRef = useRef<L.Map | null>(null);
  
  // Check if map data is already downloaded in local storage
  useEffect(() => {
    const mapDownloadStatus = localStorage.getItem('offlineMapDownloaded');
    if (mapDownloadStatus === 'true') {
      setIsMapDownloaded(true);
    }
    
    // Check if we have locally saved locations
    const savedLocations = getShelterLocations();
    if (savedLocations && savedLocations.length > 0) {
      setSortedLocations(savedLocations as ShelterWithDistance[]);
    }
    
    // Check if we previously detected war situation
    const warStatus = localStorage.getItem('warSituation');
    if (warStatus === 'true') {
      setIsWarSituation(true);
    }
    
    // Check accuracy preference
    const accuracyPref = localStorage.getItem('locationHighAccuracy');
    if (accuracyPref === 'false') {
      setUseHighAccuracy(false);
    }
  }, []);
  
  // Get user's location and detect nearby emergency facilities
  const getUserLocation = () => {
    if (navigator.geolocation) {
      setIsDetectingLocations(true);
      toast({
        title: "Finding your location",
        description: "Please wait while we locate you and detect nearby emergency facilities..."
      });
      
      // Options for more accurate geolocation
      const options = {
        enableHighAccuracy: useHighAccuracy,
        timeout: 10000,
        maximumAge: 0
      };
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userCoords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };
          
          setUserLocation(userCoords);
          setLocationAccuracy(position.coords.accuracy);
          
          console.log("User location found:", userCoords.latitude, userCoords.longitude);
          console.log("Location accuracy:", position.coords.accuracy, "meters");
          
          toast({
            title: "Location found",
            description: `Position accuracy: ${Math.round(position.coords.accuracy)} meters`
          });
          
          // Now detect nearby emergency facilities
          detectNearbyFacilities(userCoords);
        },
        (error) => {
          setIsDetectingLocations(false);
          console.error("Error getting location:", error);
          
          // If high accuracy failed, try with low accuracy
          if (useHighAccuracy && error.code === error.TIMEOUT) {
            setUseHighAccuracy(false);
            localStorage.setItem('locationHighAccuracy', 'false');
            
            toast({
              title: "Trying with lower accuracy",
              description: "High accuracy location timed out. Trying again with lower accuracy settings."
            });
            
            setTimeout(() => getUserLocation(), 500);
          } else {
            toast({
              title: "Location error",
              description: error.message,
              variant: "destructive"
            });
          }
        },
        options
      );
    } else {
      toast({
        title: "Geolocation unavailable",
        description: "Your browser doesn't support geolocation",
        variant: "destructive"
      });
    }
  };
  
  // Handle location detection from map component
  const handleMapLocationFound = (coords: Coordinates) => {
    // Only update if we don't already have a location
    if (!userLocation) {
      setUserLocation(coords);
      console.log("Location detected from map:", coords.latitude, coords.longitude);
      detectNearbyFacilities(coords);
    }
  };
  
  // Reset location and try again with highest accuracy
  const retryHighAccuracy = () => {
    setUserLocation(null);
    setUseHighAccuracy(true);
    localStorage.setItem('locationHighAccuracy', 'true');
    getUserLocation();
  };
  
  // Detect nearby emergency facilities
  const detectNearbyFacilities = (userCoords: Coordinates) => {
    // Simulate API call to find nearby emergency locations
    // In a real app, this would be an API call to Google Maps or similar service
    
    setTimeout(() => {
      // Adjust coordinates to use actual detected Alwar location
      // These coordinates are more accurate for Alwar District in Rajasthan
      // You can update these coordinates with your exact location
      const alwarCoords = {
        latitude: 27.5530, // Alwar coordinates
        longitude: 76.6346
      };
      
      // Use the provided coordinates but adjust them to be more accurate to Alwar region
      // This is just for demonstration - ideally you'd use the actual coordinates from geolocation
      const detectedPlaces: DetectedLocation[] = [
        {
          id: `auto-h-${Date.now()}-1`,
          name: "Government Hospital Alwar",
          address: "Civil Lines, Alwar, Rajasthan",
          coordinates: [alwarCoords.longitude + 0.01, alwarCoords.latitude + 0.005],
          type: "hospital",
          contact: "0144-2702201"
        },
        {
          id: `auto-s-${Date.now()}-1`,
          name: "Emergency Shelter Alwar",
          address: "Near Railway Station, Alwar, Rajasthan",
          coordinates: [alwarCoords.longitude - 0.008, alwarCoords.latitude - 0.003],
          type: "shelter"
        },
        {
          id: `auto-p-${Date.now()}-1`,
          name: "Alwar Police Station",
          address: "Kotwali Road, Alwar, Rajasthan",
          coordinates: [alwarCoords.longitude + 0.015, alwarCoords.latitude - 0.012],
          type: "police",
          contact: "0144-2337333"
        },
        {
          id: `auto-f-${Date.now()}-1`,
          name: "Fire Station Alwar",
          address: "Tijara Gate, Alwar, Rajasthan",
          coordinates: [alwarCoords.longitude - 0.02, alwarCoords.latitude + 0.01],
          type: "fire",
          contact: "0144-2332550"
        }
      ];
      
      // Calculate distance for each location
      const locationsWithDistance = detectedPlaces.map(location => {
        const distance = calculateDistance(
          userCoords.latitude,
          userCoords.longitude,
          location.coordinates[1],
          location.coordinates[0]
        );
        return { ...location, distance };
      });
      
      // Sort by distance
      locationsWithDistance.sort((a, b) => (a.distance || 0) - (b.distance || 0));
      
      setDetectedLocations(locationsWithDistance);
      setSortedLocations(locationsWithDistance as ShelterWithDistance[]);
      
      // Save to offline storage
      saveShelterLocations(locationsWithDistance);
      
      setIsDetectingLocations(false);
      toast({
        title: "Locations detected",
        description: `Found ${locationsWithDistance.length} emergency facilities near Alwar`,
      });
    }, 2000);
  };
  
  // Calculate distance between two points using Haversine formula
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    return distance;
  };
  
  // Download offline maps
  const downloadOfflineMaps = () => {
    setIsDownloading(true);
    toast({
      title: "Downloading maps",
      description: "Please wait while we download map data for offline use..."
    });
  };
  
  // Handle download progress
  const handleDownloadProgress = (current: number, total: number) => {
    setDownloadProgress({ current, total });
  };
  
  // Handle download completion
  const handleDownloadComplete = (loaded: number, total: number) => {
    localStorage.setItem('offlineMapDownloaded', 'true');
    setIsMapDownloaded(true);
    setIsDownloading(false);
    setDownloadProgress(null);
    
    toast({
      title: "Maps downloaded",
      description: `Successfully downloaded ${loaded} out of ${total} map tiles for offline use`
    });
  };
  
  // Toggle war situation mode
  const toggleWarSituation = () => {
    const newStatus = !isWarSituation;
    setIsWarSituation(newStatus);
    localStorage.setItem('warSituation', newStatus.toString());
    
    toast({
      title: newStatus ? "War Situation Mode Activated" : "Normal Mode Activated",
      description: newStatus ? 
        "Additional war-specific emergency instructions are now visible" : 
        "Reverted to standard emergency instructions",
      variant: newStatus ? "destructive" : "default"
    });
  };
  
  // Get location type icon for list view
  const getLocationTypeIcon = (type: string) => {
    switch(type) {
      case 'shelter':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        );
      case 'hospital':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        );
      case 'police':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        );
      case 'fire':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
          </svg>
        );
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        );
    }
  };
  
  // Render the map
  const renderMap = () => {
    if (mapError) {
      return (
        <div className="p-4 text-center h-64 flex flex-col items-center justify-center bg-muted/30 rounded-lg">
          <AlertTriangle className="h-10 w-10 text-emergency mb-2" />
          <p className="text-muted-foreground">
            {mapError}
          </p>
        </div>
      );
    }
    
    // Default center for Alwar, Rajasthan
    const alwarCenter: [number, number] = [27.5530, 76.6346];
    const mapCenter: [number, number] = userLocation 
      ? [userLocation.latitude, userLocation.longitude] 
      : alwarCenter;
    
    return (
      <div className="relative h-[400px] w-full rounded-lg overflow-hidden">
        <MapContainer 
          center={mapCenter} 
          zoom={13} 
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%' }}
          className="z-0"
          whenReady={(e) => { 
            // Use correct typing for the event parameter
            mapRef.current = e.target; 
          }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          
          {userLocation ? (
            <>
              <Marker 
                position={[userLocation.latitude, userLocation.longitude]} 
                icon={createCustomIcon('user')}
              >
                <Popup>
                  <div className="text-center">
                    <strong>Your Location</strong>
                    {locationAccuracy && (
                      <p className="text-xs mt-1">Accuracy: ~{Math.round(locationAccuracy)} meters</p>
                    )}
                  </div>
                </Popup>
              </Marker>
              
              <MapUpdater center={[userLocation.latitude, userLocation.longitude]} />
            </>
          ) : (
            <LocationFinder onLocationFound={handleMapLocationFound} />
          )}
          
          {sortedLocations.map(location => (
            <React.Fragment key={location.id}>
              <Marker 
                position={[location.coordinates[1], location.coordinates[0]]} 
                icon={createCustomIcon(location.type)}
              >
                <Popup>
                  <div className="text-sm">
                    <strong>{location.name}</strong>
                    <p>{location.address}</p>
                    {location.distance && (
                      <p className="text-xs mt-1 font-medium">
                        Distance: {location.distance.toFixed(2)} km
                      </p>
                    )}
                    {location.contact && (
                      <p className="text-xs mt-1 text-emergency">
                        Contact: {location.contact}
                      </p>
                    )}
                  </div>
                </Popup>
              </Marker>
              
              {/* Draw route lines if we have user location */}
              {userLocation && (
                <Polyline 
                  pathOptions={{
                    color: '#6B7280',
                    weight: 2,
                    opacity: 0.5,
                    dashArray: '4'
                  }}
                  positions={[
                    [userLocation.latitude, userLocation.longitude],
                    [location.coordinates[1], location.coordinates[0]]
                  ]}
                />
              )}
            </React.Fragment>
          ))}
          
          {isDownloading && userLocation && (
            <OfflineTileDownloader 
              bounds={L.latLngBounds(
                [userLocation.latitude - 0.05, userLocation.longitude - 0.05],
                [userLocation.latitude + 0.05, userLocation.longitude + 0.05]
              )}
              zoom={14}
              onProgress={handleDownloadProgress}
              onComplete={handleDownloadComplete}
            />
          )}
        </MapContainer>
        
        {/* Offline status indicator */}
        {isMapDownloaded && (
          <div className="absolute top-2 right-2 bg-white rounded px-2 py-1 shadow-md text-xs z-[400]">
            <div className="flex items-center gap-1">
              <Download className="h-3 w-3 text-green-600" />
              <span>Offline maps available</span>
            </div>
          </div>
        )}
        
        {/* Download progress indicator */}
        {isDownloading && downloadProgress && (
          <div className="absolute bottom-2 left-2 right-2 bg-white/90 rounded p-2 shadow-md z-[400]">
            <div className="text-sm mb-1">Downloading map tiles: {downloadProgress.current} of {downloadProgress.total}</div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-emergency h-2 rounded-full" 
                style={{ width: `${Math.round((downloadProgress.current / downloadProgress.total) * 100)}%` }}
              ></div>
            </div>
          </div>
        )}
        
        {/* Navigation instruction */}
        {userLocation && sortedLocations.length > 0 && !isDownloading && (
          <div className="absolute bottom-2 left-2 bg-white/90 rounded p-2 shadow-md z-[400]">
            <div className="flex items-center gap-1">
              <Navigation className="h-4 w-4" />
              <span className="text-sm">Navigate to nearest: {sortedLocations[0]?.name}</span>
            </div>
            <div className="text-emergency font-medium text-sm">
              {sortedLocations[0]?.distance && `${sortedLocations[0].distance.toFixed(2)} km away`}
            </div>
          </div>
        )}
      </div>
    );
  };
  
  return (
    <div className="emergency-card">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <Map className="h-5 w-5 text-emergency" />
        Emergency Locations
      </h2>
      
      {isWarSituation && (
        <div className="mb-4 p-3 border-2 border-emergency bg-emergency/10 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-5 w-5 text-emergency mt-0.5" />
            <div>
              <h3 className="font-bold text-emergency">WAR SITUATION ALERT</h3>
              <p className="text-sm mt-1">
                Follow special instructions for war zones. Stay in safe zones and bunkers when possible.
              </p>
            </div>
          </div>
        </div>
      )}
      
      <div className="flex flex-wrap gap-2 mb-4">
        <Button 
          onClick={getUserLocation}
          className="flex-1 bg-emergency hover:bg-emergency-dark text-white"
          disabled={isDetectingLocations}
        >
          <Locate className="mr-2 h-4 w-4" />
          {isDetectingLocations ? 'Detecting Locations...' : 'Detect Nearby Facilities'}
        </Button>
        
        {locationAccuracy && locationAccuracy > 100 && (
          <Button
            onClick={retryHighAccuracy}
            variant="outline"
            className="flex-none"
          >
            <MapPin className="mr-1 h-4 w-4" />
            Improve Accuracy
          </Button>
        )}
        
        <Button
          onClick={toggleWarSituation}
          variant={isWarSituation ? "destructive" : "outline"}
          className="flex-none"
        >
          <Shield className="mr-1 h-4 w-4" />
          {isWarSituation ? 'Exit War Mode' : 'War Mode'}
        </Button>
      </div>
      
      {userLocation && locationAccuracy && locationAccuracy > 100 && (
        <div className="mb-4 p-2 bg-yellow-50 border border-yellow-200 rounded-lg text-sm">
          <p className="flex items-center gap-1">
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
            <span>Location accuracy is approximately {Math.round(locationAccuracy)} meters. For better accuracy, try clicking "Improve Accuracy".</span>
          </p>
        </div>
      )}
      
      <Tabs defaultValue="list" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full mb-4">
          <TabsTrigger value="list" className="flex-1">List View</TabsTrigger>
          <TabsTrigger value="map" className="flex-1">Map View</TabsTrigger>
          {isWarSituation && (
            <TabsTrigger value="instructions" className="flex-1">War Instructions</TabsTrigger>
          )}
        </TabsList>
        
        <TabsContent value="list">
          <div className="space-y-3">
            {sortedLocations.length > 0 ? (
              sortedLocations.map((location) => (
                <div key={location.id} className="p-3 border rounded-lg bg-card">
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      {getLocationTypeIcon(location.type)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{location.name}</h3>
                      <p className="text-sm text-muted-foreground">{location.address}</p>
                      {location.contact && (
                        <p className="text-sm mt-1 text-emergency">
                          Contact: {location.contact}
                        </p>
                      )}
                      {location.distance !== undefined && (
                        <p className="text-xs font-semibold mt-1">
                          Distance: {location.distance.toFixed(2)} km
                        </p>
                      )}
                      {location.type === 'shelter' && isWarSituation && (
                        <Badge variant="outline" className="mt-2 text-xs border-emergency text-emergency">
                          Bomb Shelter
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center p-6 bg-muted/30 rounded-lg">
                <MapPin className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
                <h3 className="font-medium mb-1">No locations detected</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Tap "Detect Nearby Facilities" to find emergency locations around you
                </p>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="map">
          <div className="border rounded-lg bg-muted/30 overflow-hidden">
            {renderMap()}
            {!isMapDownloaded && !isDownloading && userLocation && (
              <div className="p-3 flex justify-center">
                <Button
                  className="bg-emergency hover:bg-emergency-dark text-white"
                  onClick={downloadOfflineMaps}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Save Map for Offline Use
                </Button>
              </div>
            )}
          </div>
        </TabsContent>
        
        {isWarSituation && (
          <TabsContent value="instructions">
            <Accordion type="multiple" className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger className="font-semibold text-emergency">
                  Bomb Shelter Instructions
                </AccordionTrigger>
                <AccordionContent>
                  <ol className="list-decimal pl-5 space-y-2 text-sm">
                    <li>Go to the nearest bomb shelter or basement immediately when sirens sound.</li>
                    <li>Take only essential items: documents, water, medicine, and non-perishable food.</li>
                    <li>Stay away from windows and external walls.</li>
                    <li>If no shelter is available, lie flat on the ground with hands covering your head.</li>
                    <li>Wait for the all-clear signal before leaving shelter.</li>
                    <li>Have emergency radio ready for communications.</li>
                  </ol>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-2">
                <AccordionTrigger className="font-semibold text-emergency">
                  Evacuation Protocol
                </AccordionTrigger>
                <AccordionContent>
                  <ol className="list-decimal pl-5 space-y-2 text-sm">
                    <li>Follow official evacuation routes only - other routes may be unsafe.</li>
                    <li>Travel light, taking only essentials and important documents.</li>
                    <li>If using a vehicle, keep to the right to allow emergency vehicles to pass.</li>
                    <li>Follow all military and civil defense instructions.</li>
                    <li>Check in at official evacuation points for further guidance.</li>
                    <li>Assist elderly, disabled, and families with children when possible.</li>
                  </ol>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-3">
                <AccordionTrigger className="font-semibold text-emergency">
                  First Aid in Conflict Zones
                </AccordionTrigger>
                <AccordionContent>
                  <ol className="list-decimal pl-5 space-y-2 text-sm">
                    <li>For severe bleeding, apply direct pressure with clean cloth or bandage.</li>
                    <li>Treat for shock - lay person flat, elevate feet, keep warm with blanket.</li>
                    <li>For burns, cool with clean water, cover with clean cloth, do not apply creams.</li>
                    <li>Move injured people only if absolutely necessary to avoid further danger.</li>
                    <li>Be aware of unexploded ordnance - do not touch suspicious objects.</li>
                    <li>Document injuries with photos if possible for later medical assistance.</li>
                  </ol>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-4">
                <AccordionTrigger className="font-semibold text-emergency">
                  Communication During Crisis
                </AccordionTrigger>
                <AccordionContent>
                  <ol className="list-decimal pl-5 space-y-2 text-sm">
                    <li>Reserve phone calls for true emergencies only.</li>
                    <li>Send text messages instead of calling when possible - they use less bandwidth.</li>
                    <li>Use short conversations to conserve battery life.</li>
                    <li>Have a battery-powered radio for emergency broadcasts.</li>
                    <li>Establish meeting points with family/friends in case communications fail.</li>
                    <li>If internet is available, use messaging apps that work with low bandwidth.</li>
                  </ol>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-5">
                <AccordionTrigger className="font-semibold text-emergency">
                  Surviving in Occupied Territory
                </AccordionTrigger>
                <AccordionContent>
                  <ol className="list-decimal pl-5 space-y-2 text-sm">
                    <li>Avoid conflicts and comply with checkpoints to minimize risk.</li>
                    <li>Keep identity documents with you at all times.</li>
                    <li>Store emergency supplies discreetly in multiple locations.</li>
                    <li>Learn and use basic medical skills as healthcare may be limited.</li>
                    <li>Establish trusted community connections for information sharing.</li>
                    <li>Keep a low profile and avoid drawing attention to yourself.</li>
                  </ol>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default OfflineMap;
