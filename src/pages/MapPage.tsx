
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import { ChevronLeftIcon, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { supabase } from '@/integrations/supabase/client';

// Fix Leaflet icon issues
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Create custom marker icons
const createMarkerIcon = (color: string) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 0 1px ${color}, 0 0 8px rgba(0,0,0,0.3);"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -10],
  });
};

// Mumbai, India coordinates
const MUMBAI_COORDINATES: [number, number] = [19.076, 72.8777];

// Example data - in a real app, this would come from Supabase
const mockReports = [
  {
    id: 1,
    type: 'noise',
    level: 85,
    lat: 40.712776,
    lng: -74.005974,
    timestamp: '2023-04-13T15:30:00Z',
  },
  {
    id: 2,
    type: 'garbage',
    level: 45,
    lat: 40.715076,
    lng: -74.015974,
    timestamp: '2023-04-13T14:20:00Z',
  },
  {
    id: 3,
    type: 'smoke',
    level: 65,
    lat: 40.710076,
    lng: -74.000974,
    timestamp: '2023-04-13T12:10:00Z',
  },
  {
    id: 4,
    type: 'noise',
    level: 75,
    lat: 40.708076,
    lng: -74.008974,
    timestamp: '2023-04-13T11:05:00Z',
  },
  {
    id: 5,
    type: 'garbage',
    level: 30,
    lat: 40.720076,
    lng: -74.003974,
    timestamp: '2023-04-13T09:45:00Z',
  },
];

const getMarkerProps = (type: string, level: number) => {
  switch (type) {
    case 'noise':
      return {
        color: level > 70 ? '#EF4444' : level > 40 ? '#F59E0B' : '#10B981',
        radius: 50 + level * 2,
      };
    case 'smoke':
      return {
        color: '#6366F1',
        radius: 100,
      };
    case 'garbage':
      return {
        color: '#8B5CF6',
        radius: 80,
      };
    default:
      return {
        color: '#94A3B8',
        radius: 70,
      };
  }
};

const getTypeBadgeColor = (type: string) => {
  switch (type) {
    case 'noise':
      return 'bg-red-500';
    case 'smoke':
      return 'bg-indigo-500';
    case 'garbage':
      return 'bg-purple-500';
    default:
      return 'bg-gray-500';
  }
};

const MapPage = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState<any[]>([]);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

  useEffect(() => {
    // Fetch initial reports
    const fetchReports = async () => {
      const { data, error } = await supabase
        .from('environmental_reports')
        .select('*')
        .order('timestamp', { ascending: false });

      if (data) setReports(data);
      if (error) console.error("Error fetching reports:", error);
    };

    // Get user's location
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation([position.coords.latitude, position.coords.longitude]);
      },
      (error) => {
        console.error("Error getting location:", error);
      }
    );

    fetchReports();

    // Set up real-time subscription
    const channel = supabase
      .channel('environmental_reports')
      .on(
        'postgres_changes',
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'environmental_reports' 
        },
        (payload) => {
          setReports((prevReports) => [payload.new, ...prevReports]);
        }
      )
      .subscribe();

    // Cleanup function
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Set initialPosition to Mumbai if userLocation is null
  const initialPosition: [number, number] = userLocation || MUMBAI_COORDINATES;

  return (
    <div className="h-screen flex flex-col">
      <div className="bg-white p-4 shadow-md z-10 flex items-center justify-between">
        <Button 
          variant="ghost" 
          className="p-2" 
          onClick={() => navigate('/')}
        >
          <ChevronLeftIcon className="h-5 w-5" />
        </Button>
        
        <h1 className="text-xl font-bold text-center flex-grow">Environment Reports</h1>
        
        <Button 
          variant="outline" 
          className="ml-auto"
          onClick={() => navigate('/scan')}
        >
          Add Report
        </Button>
      </div>
      
      <div className="flex-grow relative">
        <MapContainer 
          center={initialPosition} 
          zoom={12} 
          className="h-full w-full z-0"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {userLocation && (
            <Marker 
              position={userLocation}
              icon={L.divIcon({
                className: 'custom-user-marker',
                html: `<div style="background-color: #3B82F6; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 0 2px #3B82F6, 0 0 8px rgba(0,0,0,0.3);"></div>`,
                iconSize: [16, 16],
                iconAnchor: [8, 8],
              })}
            >
              <Popup>You are here</Popup>
            </Marker>
          )}
          
          {reports.map((report) => {
            const { color, radius } = getMarkerProps(report.type, report.level);
            return (
              <React.Fragment key={report.id}>
                <Circle 
                  center={[report.lat, report.lng]} 
                  radius={radius}
                  pathOptions={{ 
                    fillColor: color, 
                    fillOpacity: 0.2, 
                    color: color, 
                    weight: 1 
                  }}
                />
                <Marker 
                  position={[report.lat, report.lng]}
                  icon={createMarkerIcon(color)}
                >
                  <Popup>
                    <div className="p-1">
                      <div className="mb-2">
                        <Badge className={`${getTypeBadgeColor(report.type)} text-white`}>
                          {report.type.charAt(0).toUpperCase() + report.type.slice(1)}
                        </Badge>
                        {report.type === 'noise' && (
                          <span className="ml-2 text-sm font-semibold">
                            {report.level} dB
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatDate(report.timestamp)}
                      </div>
                    </div>
                  </Popup>
                </Marker>
              </React.Fragment>
            );
          })}
        </MapContainer>
        
        <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-4 z-10">
          <div className="flex items-center mb-2">
            <Info className="h-4 w-4 text-gray-500 mr-2" />
            <h3 className="font-semibold text-sm">Legend</h3>
          </div>
          
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-red-500 mr-1"></div>
              <span>Noise</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-indigo-500 mr-1"></div>
              <span>Smoke</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-purple-500 mr-1"></div>
              <span>Garbage</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapPage;
