import React, { useEffect, useRef } from 'react';
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';

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

interface SimpleMapContainerProps {
  vehicles: Vehicle[];
  routes: Route[];
  selectedRoute?: string;
  center?: [number, number];
  zoom?: number;
  className?: string;
}

const SimpleMapContainer: React.FC<SimpleMapContainerProps> = ({
  vehicles = [],
  routes = [],
  selectedRoute,
  center = [40.7128, -74.0060],
  zoom = 12,
  className = "h-full w-full"
}) => {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);
  const routesLayerRef = useRef<L.LayerGroup | null>(null);

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Create map
    mapRef.current = L.map(mapContainerRef.current).setView(center, zoom);

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mapRef.current);

    // Create layer groups
    markersRef.current = L.layerGroup().addTo(mapRef.current);
    routesLayerRef.current = L.layerGroup().addTo(mapRef.current);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Create custom icons
  const createBusIcon = () => {
    return L.divIcon({
      html: `
        <div style="
          width: 24px;
          height: 24px;
          background-color: #3b82f6;
          border: 2px solid white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        ">
          <div style="
            width: 12px;
            height: 8px;
            background-color: white;
            border-radius: 2px;
          "></div>
        </div>
      `,
      className: 'custom-div-icon',
      iconSize: [24, 24],
      iconAnchor: [12, 12],
      popupAnchor: [0, -12]
    });
  };

  const createStopIcon = () => {
    return L.divIcon({
      html: `
        <div style="
          width: 16px;
          height: 16px;
          background-color: #10b981;
          border: 2px solid white;
          border-radius: 50%;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        "></div>
      `,
      className: 'custom-div-icon',
      iconSize: [16, 16],
      iconAnchor: [8, 8],
      popupAnchor: [0, -8]
    });
  };

  // Update vehicles on map
  useEffect(() => {
    if (!mapRef.current || !markersRef.current) return;

    // Clear existing markers
    markersRef.current.clearLayers();

    // Filter vehicles by selected route
    const filteredVehicles = selectedRoute 
      ? vehicles.filter(v => v.route === selectedRoute)
      : vehicles;

    // Add vehicle markers
    filteredVehicles.forEach(vehicle => {
      if (!markersRef.current) return;

      const marker = L.marker([vehicle.lat, vehicle.lng], {
        icon: createBusIcon()
      });

      const statusColor = vehicle.status === 'active' ? '#10b981' : 
                         vehicle.status === 'offline' ? '#ef4444' : '#f59e0b';

      marker.bindPopup(`
        <div style="padding: 8px; font-family: system-ui, -apple-system, sans-serif;">
          <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #3b82f6;">
            ${vehicle.registration}
          </h3>
          <p style="margin: 0 0 4px 0; font-size: 14px; color: #6b7280;">
            Route: ${vehicle.route}
          </p>
          <p style="margin: 0 0 4px 0; font-size: 14px; color: #6b7280;">
            Status: <span style="color: ${statusColor}; font-weight: 500;">${vehicle.status}</span>
          </p>
          <p style="margin: 0; font-size: 12px; color: #9ca3af;">
            Last update: ${new Date(vehicle.lastUpdate).toLocaleTimeString()}
          </p>
        </div>
      `);

      markersRef.current.addLayer(marker);
    });
  }, [vehicles, selectedRoute]);

  // Update routes on map
  useEffect(() => {
    if (!mapRef.current || !routesLayerRef.current) return;

    // Clear existing routes
    routesLayerRef.current.clearLayers();

    if (selectedRoute) {
      const selectedRouteData = routes.find(r => r.id === selectedRoute);
      
      if (selectedRouteData && selectedRouteData.stops.length > 1) {
        // Add route polyline
        const polyline = L.polyline(
          selectedRouteData.stops.map(stop => [stop.lat, stop.lng]),
          {
            color: selectedRouteData.color,
            weight: 4,
            opacity: 0.7
          }
        );
        routesLayerRef.current.addLayer(polyline);

        // Add stop markers
        selectedRouteData.stops.forEach((stop, index) => {
          if (!routesLayerRef.current) return;

          const stopMarker = L.marker([stop.lat, stop.lng], {
            icon: createStopIcon()
          });

          stopMarker.bindPopup(`
            <div style="padding: 8px; font-family: system-ui, -apple-system, sans-serif;">
              <h4 style="margin: 0 0 4px 0; font-size: 14px; font-weight: 600;">
                ${stop.name}
              </h4>
              <p style="margin: 0; font-size: 12px; color: #6b7280;">
                Route: ${selectedRouteData.name}
              </p>
            </div>
          `);

          routesLayerRef.current.addLayer(stopMarker);
        });

        // Fit map to route bounds
        const group = L.featureGroup([polyline]);
        mapRef.current.fitBounds(group.getBounds(), { padding: [20, 20] });
      }
    }
  }, [routes, selectedRoute]);

  return <div ref={mapContainerRef} className={className} />;
};

export default SimpleMapContainer;