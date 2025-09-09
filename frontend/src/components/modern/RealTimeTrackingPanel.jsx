import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { 
  MapPin, 
  Users, 
  Battery, 
  Signal, 
  Clock, 
  AlertTriangle,
  RefreshCw,
  Filter
} from 'lucide-react';
import { mockPilgrimLocations, mockGroups, mockRealTimeTracking } from '../../mock/newMockData';
import 'leaflet/dist/leaflet.css';

// Fix for default markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const createPilgrimIcon = (status) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return '#10b981';
      case 'low_battery': return '#f59e0b';
      case 'emergency': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const color = getStatusColor(status);
  
  return L.divIcon({
    html: `
      <div style="
        background-color: ${color};
        width: 20px;
        height: 20px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          width: 8px;
          height: 8px;
          background-color: white;
          border-radius: 50%;
          ${status === 'emergency' ? 'animation: pulse 1s infinite;' : ''}
        "></div>
      </div>
    `,
    className: 'custom-pilgrim-marker',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
};

const MapController = ({ pilgrims }) => {
  const map = useMap();
  
  useEffect(() => {
    if (pilgrims.length > 0) {
      const group = new L.featureGroup(
        pilgrims.map(pilgrim => 
          L.marker([pilgrim.lat, pilgrim.lng])
        )
      );
      map.fitBounds(group.getBounds().pad(0.1));
    }
  }, [pilgrims, map]);

  return null;
};

const RealTimeTrackingPanel = () => {
  const [selectedGroup, setSelectedGroup] = useState('all');
  const [selectedStage, setSelectedStage] = useState('all');
  const [filteredPilgrims, setFilteredPilgrims] = useState(mockPilgrimLocations);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    let filtered = mockPilgrimLocations;
    
    if (selectedGroup !== 'all') {
      filtered = filtered.filter(p => p.group === selectedGroup);
    }
    
    if (selectedStage !== 'all') {
      filtered = filtered.filter(p => p.stage === selectedStage);
    }
    
    setFilteredPilgrims(filtered);
  }, [selectedGroup, selectedStage]);

  const refreshData = () => {
    setLastUpdate(new Date());
    // In real app, this would fetch fresh data
  };

  const getBatteryIcon = (level) => {
    if (level > 50) return '🔋';
    if (level > 20) return '🪫';
    return '🔴';
  };

  const getSignalBars = (strength) => {
    return '📶'.repeat(strength) + '📵'.repeat(5 - strength);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Active</Badge>;
      case 'low_battery':
        return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">Low Battery</Badge>;
      case 'emergency':
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Emergency</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Active Pilgrims</p>
                <p className="text-2xl font-bold text-green-900">{mockRealTimeTracking.totalActivePilgrims.toLocaleString()}</p>
              </div>
              <Users className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Active Groups</p>
                <p className="text-2xl font-bold text-blue-900">{mockRealTimeTracking.activeGroups}</p>
              </div>
              <MapPin className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-red-50 to-red-100 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">Emergency Alerts</p>
                <p className="text-2xl font-bold text-red-900">{mockRealTimeTracking.emergencyAlerts}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Last Updated</p>
                <p className="text-sm font-bold text-gray-900">{lastUpdate.toLocaleTimeString()}</p>
                <Button onClick={refreshData} size="sm" variant="ghost" className="text-xs mt-1 p-0 h-auto">
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Refresh
                </Button>
              </div>
              <Clock className="w-8 h-8 text-gray-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Map and Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Live Map */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-yellow-600" />
                <span>Live Pilgrim Locations</span>
              </CardTitle>
              
              <div className="flex items-center space-x-2">
                <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Groups</SelectItem>
                    {mockGroups.map(group => (
                      <SelectItem key={group.id} value={group.name}>{group.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={selectedStage} onValueChange={setSelectedStage}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Stages</SelectItem>
                    <SelectItem value="Tawaf">Tawaf</SelectItem>
                    <SelectItem value="Sa'i">Sa'i</SelectItem>
                    <SelectItem value="Jamarat">Jamarat</SelectItem>
                    <SelectItem value="Dua">Dua</SelectItem>
                    <SelectItem value="Rest">Rest</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-0">
            <div className="h-96 w-full rounded-b-lg overflow-hidden">
              <MapContainer
                center={[21.4225, 39.8262]}
                zoom={12}
                style={{ height: '100%', width: '100%' }}
                className="z-0"
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                
                <MapController pilgrims={filteredPilgrims} />
                
                {filteredPilgrims.map((pilgrim) => (
                  <Marker
                    key={pilgrim.id}
                    position={[pilgrim.lat, pilgrim.lng]}
                    icon={createPilgrimIcon(pilgrim.status)}
                  >
                    <Popup className="custom-popup">
                      <div className="p-2 min-w-48">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-bold text-gray-900">{pilgrim.name}</h3>
                          {getStatusBadge(pilgrim.status)}
                        </div>
                        <div className="space-y-1 text-sm">
                          <p><strong>Group:</strong> {pilgrim.group}</p>
                          <p><strong>Location:</strong> {pilgrim.location}</p>
                          <p><strong>Stage:</strong> {pilgrim.stage}</p>
                          <p><strong>Last Seen:</strong> {pilgrim.lastSeen}</p>
                          <div className="flex items-center space-x-4 mt-2 pt-2 border-t">
                            <span className="flex items-center space-x-1">
                              <Battery className="w-4 h-4" />
                              <span>{pilgrim.batteryLevel}%</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Signal className="w-4 h-4" />
                              <span>{pilgrim.signalStrength}/5</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          </CardContent>
        </Card>

        {/* Pilgrim List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Active Pilgrims</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {filteredPilgrims.map((pilgrim) => (
                <div key={pilgrim.id} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-sm text-gray-900">{pilgrim.name}</h4>
                    {getStatusBadge(pilgrim.status)}
                  </div>
                  <div className="text-xs text-gray-600 space-y-1">
                    <p><strong>Group:</strong> {pilgrim.group}</p>
                    <p><strong>Stage:</strong> {pilgrim.stage}</p>
                    <p><strong>Location:</strong> {pilgrim.location}</p>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200">
                      <span className="flex items-center space-x-1">
                        <span>{getBatteryIcon(pilgrim.batteryLevel)}</span>
                        <span className="text-xs">{pilgrim.batteryLevel}%</span>
                      </span>
                      <span className="text-xs">{pilgrim.lastSeen}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RealTimeTrackingPanel;