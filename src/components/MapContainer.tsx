import React, { useEffect, useRef, useState } from 'react';
import { MapContainer as LeafletMap, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import { Icon, LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in React Leaflet
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import markerIconRetina from 'leaflet/dist/images/marker-icon-2x.png';

const DefaultIcon = new Icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIconRetina,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Custom bus icon
const BusIcon = new Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32">
      <rect width="20" height="14" x="2" y="5" rx="2" fill="#3b82f6" stroke="white" stroke-width="2"/>
      <circle cx="7" cy="17" r="2" fill="#3b82f6" stroke="white" stroke-width="2"/>
      <circle cx="17" cy="17" r="2" fill="#3b82f6" stroke="white" stroke-width="2"/>
      <rect width="4" height="2" x="10" y="8" fill="white"/>
      <rect width="4" height="2" x="6" y="8" fill="white"/>
      <rect width="4" height="2" x="14" y="8" fill="white"/>
    </svg>
  `),
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16]
});

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
  center = [40.7128, -74.0060], // Default to NYC
  zoom = 12,
  className = "h-full w-full"
}) => {
  const mapRef = useRef(null);
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>(vehicles);

  useEffect(() => {
    if (selectedRoute) {
      setFilteredVehicles(vehicles.filter(v => v.route === selectedRoute));
    } else {
      setFilteredVehicles(vehicles);
    }
  }, [vehicles, selectedRoute]);

  const getSelectedRouteData = () => {
    return routes.find(r => r.id === selectedRoute);
  };

  const selectedRouteData = getSelectedRouteData();

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
            key={vehicle.id}
            position={[vehicle.lat, vehicle.lng]}
            icon={BusIcon}
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

        {/* Route polylines and stops */}
        {selectedRouteData && (
          <React.Fragment key={`route-${selectedRouteData.id}`}>
            <Polyline
              positions={selectedRouteData.stops.map(stop => [stop.lat, stop.lng])}
              color={selectedRouteData.color}
              weight={4}
              opacity={0.7}
            />
            {selectedRouteData.stops.map((stop, index) => (
              <Marker
                key={`${selectedRouteData.id}-stop-${index}`}
                position={[stop.lat, stop.lng]}
                icon={DefaultIcon}
              >
                <Popup>
                  <div className="p-2">
                    <h4 className="font-semibold">{stop.name}</h4>
                    <p className="text-sm text-muted-foreground">Route: {selectedRouteData.name}</p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </React.Fragment>
        )}
      </LeafletMap>
    </div>
  );
};

export default MapContainer;