import React, { useEffect, useRef, useState } from 'react';
import { MapContainer as LeafletMap, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import { Icon, LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Simple default icon setup
const createDefaultIcon = () => {
  return new Icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
        <circle cx="12" cy="12" r="8" fill="#3b82f6" stroke="white" stroke-width="2"/>
      </svg>
    `),
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12]
  });
};

// Simple bus icon
const createBusIcon = () => {
  return new Icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="28" height="28">
        <rect x="4" y="6" width="16" height="10" rx="2" fill="#3b82f6" stroke="white" stroke-width="2"/>
        <circle cx="8" cy="18" r="1.5" fill="#3b82f6"/>
        <circle cx="16" cy="18" r="1.5" fill="#3b82f6"/>
        <rect x="7" y="9" width="2" height="2" fill="white"/>
        <rect x="11" y="9" width="2" height="2" fill="white"/>
        <rect x="15" y="9" width="2" height="2" fill="white"/>
      </svg>
    `),
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14]
  });
};

export interface Vehicle {
  id: string;
  registration: string;
  route: string;
  lat: number;
  lng: number;
  lastUpdate: string;
  status: 'active' | 'offline' | 'maintenance';
}

export interface Route {
  id: string;
  name: string;
  color: string;
  stops: Array<{
    name: string;
    lat: number;
    lng: number;
  }>;
}

interface MapContainerProps {
  vehicles: Vehicle[];
  routes: Route[];
  selectedRoute?: string;
  center?: LatLngExpression;
  zoom?: number;
  className?: string;
}

const MapContainer: React.FC<MapContainerProps> = ({
  vehicles = [],
  routes = [],
  selectedRoute,
  center = [40.7128, -74.0060],
  zoom = 12,
  className = "h-full w-full"
}) => {
  const mapRef = useRef(null);
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>(vehicles);
  const [defaultIcon, setDefaultIcon] = useState<Icon | null>(null);
  const [busIcon, setBusIcon] = useState<Icon | null>(null);

  // Initialize icons safely
  useEffect(() => {
    try {
      setDefaultIcon(createDefaultIcon());
      setBusIcon(createBusIcon());
    } catch (error) {
      console.error('Error creating icons:', error);
    }
  }, []);

  useEffect(() => {
    if (selectedRoute) {
      setFilteredVehicles(vehicles.filter(v => v.route === selectedRoute));
    } else {
      setFilteredVehicles(vehicles);
    }
  }, [vehicles, selectedRoute]);

  const selectedRouteData = routes.find(r => r.id === selectedRoute);

  // Don't render map until icons are ready
  if (!defaultIcon || !busIcon) {
    return (
      <div className={className}>
        <div className="h-full w-full bg-muted flex items-center justify-center">
          <div className="text-muted-foreground">Loading map...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <LeafletMap
        ref={mapRef}
        center={center}
        zoom={zoom}
        className="h-full w-full"
        zoomControl={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {/* Vehicle markers */}
        {filteredVehicles.map((vehicle) => (
          <Marker
            key={`vehicle-${vehicle.id}`}
            position={[vehicle.lat, vehicle.lng]}
            icon={busIcon}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-semibold text-primary">{vehicle.registration}</h3>
                <p className="text-sm text-muted-foreground">Route: {vehicle.route}</p>
                <p className="text-sm text-muted-foreground">
                  Status: <span className={`font-medium ${
                    vehicle.status === 'active' ? 'text-success' : 
                    vehicle.status === 'offline' ? 'text-destructive' : 'text-warning'
                  }`}>
                    {vehicle.status}
                  </span>
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Last update: {new Date(vehicle.lastUpdate).toLocaleTimeString()}
                </p>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Route polyline */}
        {selectedRouteData && (
          <Polyline
            key={`route-line-${selectedRouteData.id}`}
            positions={selectedRouteData.stops.map(stop => [stop.lat, stop.lng])}
            color={selectedRouteData.color}
            weight={4}
            opacity={0.7}
          />
        )}

        {/* Route stops */}
        {selectedRouteData && selectedRouteData.stops.map((stop, index) => (
          <Marker
            key={`route-stop-${selectedRouteData.id}-${index}`}
            position={[stop.lat, stop.lng]}
            icon={defaultIcon}
          >
            <Popup>
              <div className="p-2">
                <h4 className="font-semibold">{stop.name}</h4>
                <p className="text-sm text-muted-foreground">Route: {selectedRouteData.name}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </LeafletMap>
    </div>
  );
};

export default MapContainer;