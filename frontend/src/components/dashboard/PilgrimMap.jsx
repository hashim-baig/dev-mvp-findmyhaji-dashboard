import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { MapPin, Users, Building, Plane } from 'lucide-react';
import { mockPilgrimLocations } from '../../mock/mockData';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons for different location types
const createCustomIcon = (type, count) => {
  const getIconConfig = (type) => {
    switch (type) {
      case 'mosque':
        return { color: '#10b981', icon: '🕌' };
      case 'hotel':
        return { color: '#3b82f6', icon: '🏨' };
      case 'airport':
        return { color: '#f59e0b', icon: '✈️' };
      default:
        return { color: '#6b7280', icon: '📍' };
    }
  };

  const config = getIconConfig(type);
  
  return L.divIcon({
    html: `
      <div style="
        background-color: ${config.color};
        width: 30px;
        height: 30px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: 16px;
        border: 3px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      ">
        ${config.icon}
      </div>
      <div style="
        background-color: ${config.color};
        color: white;
        padding: 2px 6px;
        border-radius: 10px;
        font-size: 10px;
        font-weight: bold;
        margin-top: 2px;
        text-align: center;
        box-shadow: 0 1px 2px rgba(0,0,0,0.2);
      ">
        ${count}
      </div>
    `,
    className: 'custom-div-icon',
    iconSize: [30, 50],
    iconAnchor: [15, 50],
  });
};

const MapController = ({ locations }) => {
  const map = useMap();
  
  useEffect(() => {
    if (locations.length > 0) {
      const group = new L.featureGroup(
        locations.map(location => 
          L.marker([location.lat, location.lng])
        )
      );
      map.fitBounds(group.getBounds().pad(0.1));
    }
  }, [locations, map]);

  return null;
};

const PilgrimMap = () => {
  const mapRef = useRef();
  
  const getLocationTypeIcon = (type) => {
    switch (type) {
      case 'mosque': return <Building className="w-4 h-4 text-emerald-600" />;
      case 'hotel': return <Building className="w-4 h-4 text-blue-600" />;
      case 'airport': return <Plane className="w-4 h-4 text-amber-600" />;
      default: return <MapPin className="w-4 h-4 text-slate-600" />;
    }
  };

  const getLocationTypeBadge = (type) => {
    switch (type) {
      case 'mosque': return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Holy Site</Badge>;
      case 'hotel': return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Hotel</Badge>;
      case 'airport': return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">Airport</Badge>;
      default: return <Badge variant="secondary">Location</Badge>;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
      {/* Map */}
      <Card className="lg:col-span-3 bg-white shadow-lg border-0">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-slate-800 flex items-center">
            <MapPin className="w-6 h-6 mr-2 text-amber-600" />
            Pilgrim Locations
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-0">
          <div className="h-96 w-full rounded-b-lg overflow-hidden">
            <MapContainer
              ref={mapRef}
              center={[22.5, 40]}
              zoom={6}
              style={{ height: '100%', width: '100%' }}
              className="z-0"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              
              <MapController locations={mockPilgrimLocations} />
              
              {mockPilgrimLocations.map((location) => (
                <Marker
                  key={location.id}
                  position={[location.lat, location.lng]}
                  icon={createCustomIcon(location.type, location.pilgrimCount)}
                >
                  <Popup className="custom-popup">
                    <div className="p-2">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold text-slate-800">{location.name}</h3>
                        {getLocationTypeBadge(location.type)}
                      </div>
                      <p className="text-sm text-slate-600 mb-2">{location.description}</p>
                      <div className="flex items-center space-x-1">
                        <Users className="w-4 h-4 text-slate-500" />
                        <span className="text-sm font-medium text-slate-700">
                          {location.pilgrimCount} pilgrims
                        </span>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </CardContent>
      </Card>
      
      {/* Location Summary */}
      <Card className="bg-white shadow-lg border-0">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-slate-800">Location Summary</CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            {mockPilgrimLocations.map((location) => (
              <div key={location.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                <div className="flex items-center space-x-3">
                  {getLocationTypeIcon(location.type)}
                  <div>
                    <p className="font-medium text-slate-800 text-sm">{location.name}</p>
                    <p className="text-xs text-slate-500">{location.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-800">{location.pilgrimCount}</p>
                  <p className="text-xs text-slate-500">pilgrims</p>
                </div>
              </div>
            ))}
            
            <div className="pt-4 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <span className="font-medium text-slate-700">Total Pilgrims</span>
                <span className="font-bold text-lg text-amber-600">
                  {mockPilgrimLocations.reduce((sum, location) => sum + location.pilgrimCount, 0)}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PilgrimMap;