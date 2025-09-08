import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, MapPin, Clock, Users } from 'lucide-react';
import { Input } from '@/components/ui/input';

export interface RouteInfo {
  id: string;
  name: string;
  color: string;
  activeVehicles: number;
  nextArrival?: string;
  frequency: string;
}

interface RouteSearchProps {
  routes: RouteInfo[];
  selectedRoute?: string;
  onRouteSelect: (routeId: string | undefined) => void;
  className?: string;
}

const RouteSearch: React.FC<RouteSearchProps> = ({
  routes = [],
  selectedRoute,
  onRouteSelect,
  className = ""
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredRoutes = routes.filter(route =>
    route.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Search className="w-5 h-5" />
          <span>Find Route</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search routes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Clear Selection */}
        {selectedRoute && (
          <Button
            variant="outline"
            onClick={() => onRouteSelect(undefined)}
            className="w-full"
          >
            Show All Routes
          </Button>
        )}

        {/* Routes List */}
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {filteredRoutes.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No routes found
            </p>
          ) : (
            filteredRoutes.map((route) => (
              <Button
                key={route.id}
                variant={selectedRoute === route.id ? "default" : "ghost"}
                onClick={() => onRouteSelect(route.id)}
                className="w-full justify-start p-4 h-auto"
              >
                <div className="flex items-center space-x-3 w-full">
                  {/* Route Color Indicator */}
                  <div
                    className="w-4 h-4 rounded-full border-2 border-white"
                    style={{ backgroundColor: route.color }}
                  />
                  
                  <div className="flex-1 text-left">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">{route.name}</span>
                      <Badge variant={route.activeVehicles > 0 ? "default" : "secondary"}>
                        {route.activeVehicles} active
                      </Badge>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-xs text-muted-foreground mt-1">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>Every {route.frequency}</span>
                      </div>
                      {route.nextArrival && (
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-3 h-3" />
                          <span>Next: {route.nextArrival}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Button>
            ))
          )}
        </div>

        {/* Quick Stats */}
        <div className="pt-4 border-t border-border">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-primary">{routes.length}</p>
              <p className="text-xs text-muted-foreground">Total Routes</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-success">
                {routes.reduce((sum, route) => sum + route.activeVehicles, 0)}
              </p>
              <p className="text-xs text-muted-foreground">Active Vehicles</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RouteSearch;