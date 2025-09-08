import React, { useState, useEffect } from 'react';
import SimpleMapContainer, { Vehicle, Route } from '@/components/SimpleMapContainer';
import RouteSearch, { RouteInfo } from '@/components/RouteSearch';
import NavigationBar from '@/components/NavigationBar';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Wifi, WifiOff } from 'lucide-react';

// Mock data - in real app this would come from Supabase
const mockRoutes: Route[] = [
  {
    id: 'route-1',
    name: 'Downtown Express',
    color: '#3b82f6',
    stops: [
      { name: 'Central Station', lat: 40.7580, lng: -73.9855 },
      { name: 'City Hall', lat: 40.7589, lng: -73.9441 },
      { name: 'Financial District', lat: 40.7074, lng: -74.0113 },
    ]
  },
  {
    id: 'route-2',
    name: 'University Line',
    color: '#10b981',
    stops: [
      { name: 'Campus North', lat: 40.8075, lng: -73.9626 },
      { name: 'Student Center', lat: 40.8021, lng: -73.9570 },
      { name: 'Library Square', lat: 40.7967, lng: -73.9514 },
    ]
  }
];

const mockVehicles: Vehicle[] = [
  {
    id: 'bus-1',
    registration: 'NYC-1001',
    route: 'route-1',
    lat: 40.7580,
    lng: -73.9855,
    lastUpdate: new Date().toISOString(),
    status: 'active'
  },
  {
    id: 'bus-2',
    registration: 'NYC-1002',
    route: 'route-1',
    lat: 40.7589,
    lng: -73.9441,
    lastUpdate: new Date(Date.now() - 30000).toISOString(),
    status: 'active'
  },
  {
    id: 'bus-3',
    registration: 'NYC-2001',
    route: 'route-2',
    lat: 40.8075,
    lng: -73.9626,
    lastUpdate: new Date(Date.now() - 120000).toISOString(),
    status: 'offline'
  }
];

const PassengerView: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>(mockVehicles);
  const [selectedRoute, setSelectedRoute] = useState<string | undefined>();
  const [isConnected, setIsConnected] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setVehicles(prev => prev.map(vehicle => ({
        ...vehicle,
        // Simulate small movements for active vehicles
        lat: vehicle.status === 'active' 
          ? vehicle.lat + (Math.random() - 0.5) * 0.001 
          : vehicle.lat,
        lng: vehicle.status === 'active' 
          ? vehicle.lng + (Math.random() - 0.5) * 0.001 
          : vehicle.lng,
        lastUpdate: vehicle.status === 'active' 
          ? new Date().toISOString() 
          : vehicle.lastUpdate
      })));
      setLastUpdate(new Date());
    }, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, []);

  // Simulate connection status changes
  useEffect(() => {
    const interval = setInterval(() => {
      setIsConnected(prev => Math.random() > 0.1 ? true : prev); // 10% chance to disconnect
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const routeInfos: RouteInfo[] = mockRoutes.map(route => ({
    id: route.id,
    name: route.name,
    color: route.color,
    activeVehicles: vehicles.filter(v => v.route === route.id && v.status === 'active').length,
    nextArrival: '3 min',
    frequency: '5-10 min'
  }));

  return (
    <div className="min-h-screen bg-background">
      <NavigationBar />
      
      <div className="flex flex-col lg:flex-row h-[calc(100vh-4rem)]">
        {/* Sidebar */}
        <div className="lg:w-80 lg:min-w-80 p-4 border-r border-border bg-card/50">
          <div className="space-y-4">
            {/* Status Bar */}
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {isConnected ? (
                    <Wifi className="w-4 h-4 text-success" />
                  ) : (
                    <WifiOff className="w-4 h-4 text-destructive" />
                  )}
                  <span className="text-sm font-medium">
                    {isConnected ? 'Live Updates' : 'Offline'}
                  </span>
                </div>
                <Badge variant={isConnected ? 'default' : 'destructive'}>
                  {vehicles.filter(v => v.status === 'active').length} Active
                </Badge>
              </div>
              <div className="flex items-center space-x-1 mt-2 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                <span>Last update: {lastUpdate.toLocaleTimeString()}</span>
              </div>
            </Card>

            {/* Route Search */}
            <RouteSearch
              routes={routeInfos}
              selectedRoute={selectedRoute}
              onRouteSelect={setSelectedRoute}
            />
          </div>
        </div>

        {/* Map */}
        <div className="flex-1">
          <SimpleMapContainer
            vehicles={vehicles}
            routes={mockRoutes}
            selectedRoute={selectedRoute}
            center={[40.7580, -73.9855]}
            zoom={13}
          />
        </div>
      </div>
    </div>
  );
};

export default PassengerView;