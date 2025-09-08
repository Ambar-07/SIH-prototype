import React, { useState, useRef, useEffect } from 'react';
import NavigationBar from '@/components/NavigationBar';
import LoginForm from '@/components/LoginForm';
import SimpleMapContainer, { Vehicle } from '@/components/SimpleMapContainer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Play, 
  Square, 
  MapPin, 
  Clock, 
  Navigation,
  Wifi,
  WifiOff,
  LogOut,
  AlertTriangle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DriverSession {
  id: string;
  name: string;
  email: string;
  vehicleId: string;
  vehicleRegistration: string;
  routeId: string;
  routeName: string;
}

const DriverInterface: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [driverSession, setDriverSession] = useState<DriverSession | null>(null);
  const [isTripActive, setIsTripActive] = useState(false);
  const [currentPosition, setCurrentPosition] = useState<GeolocationPosition | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isLocationPermissionGranted, setIsLocationPermissionGranted] = useState(false);
  const [tripStartTime, setTripStartTime] = useState<Date | null>(null);
  const [locationHistory, setLocationHistory] = useState<Array<{lat: number, lng: number, timestamp: Date}>>([]);
  
  const watchIdRef = useRef<number | null>(null);
  const { toast } = useToast();

  // Check geolocation permissions on mount
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.permissions?.query({name: 'geolocation'}).then((result) => {
        setIsLocationPermissionGranted(result.state === 'granted');
      });
    }
  }, []);

  const handleLogin = async (email: string, password: string) => {
    // Simulate authentication - in real app this would use Supabase
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock driver session
    const session: DriverSession = {
      id: 'driver-1',
      name: 'John Smith',
      email,
      vehicleId: 'bus-1',
      vehicleRegistration: 'NYC-1001',
      routeId: 'route-1',
      routeName: 'Downtown Express'
    };

    setDriverSession(session);
    setIsLoggedIn(true);
    toast({
      title: "Welcome back!",
      description: `Logged in as ${session.name}`,
    });
  };

  const handleLogout = () => {
    if (isTripActive) {
      stopTrip();
    }
    setIsLoggedIn(false);
    setDriverSession(null);
    toast({
      title: "Logged out",
      description: "See you next time!",
    });
  };

  const requestLocationPermission = async () => {
    if (!('geolocation' in navigator)) {
      setLocationError('Geolocation is not supported by this browser');
      return false;
    }

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        });
      });

      setCurrentPosition(position);
      setLocationError(null);
      setIsLocationPermissionGranted(true);
      return true;
    } catch (error) {
      const err = error as GeolocationPositionError;
      let errorMessage = 'Location access denied';
      
      switch (err.code) {
        case err.PERMISSION_DENIED:
          errorMessage = 'Location access denied. Please enable location permissions.';
          break;
        case err.POSITION_UNAVAILABLE:
          errorMessage = 'Location information unavailable.';
          break;
        case err.TIMEOUT:
          errorMessage = 'Location request timed out.';
          break;
      }
      
      setLocationError(errorMessage);
      return false;
    }
  };

  const startTrip = async () => {
    if (!isLocationPermissionGranted) {
      const permissionGranted = await requestLocationPermission();
      if (!permissionGranted) return;
    }

    try {
      watchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          setCurrentPosition(position);
          setLocationHistory(prev => [
            ...prev,
            {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
              timestamp: new Date()
            }
          ].slice(-100)); // Keep last 100 positions

          // In real app, this would send to Supabase
          console.log('Location update:', {
            vehicleId: driverSession?.vehicleId,
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            timestamp: new Date().toISOString(),
            accuracy: position.coords.accuracy
          });
        },
        (error) => {
          console.error('Location watch error:', error);
          setLocationError('Failed to get location updates');
        },
        {
          enableHighAccuracy: true,
          timeout: 30000,
          maximumAge: 5000
        }
      );

      setIsTripActive(true);
      setTripStartTime(new Date());
      setLocationError(null);
      
      toast({
        title: "Trip Started",
        description: "Now sharing your location live",
      });
    } catch (error) {
      console.error('Start trip error:', error);
      setLocationError('Failed to start trip');
    }
  };

  const stopTrip = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    setIsTripActive(false);
    setTripStartTime(null);
    
    toast({
      title: "Trip Ended",
      description: "Location sharing stopped",
    });
  };

  const formatDuration = (start: Date) => {
    const duration = Math.floor((Date.now() - start.getTime()) / 1000);
    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor((duration % 3600) / 60);
    const seconds = duration % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-background">
        <NavigationBar />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-4">
          <LoginForm onLogin={handleLogin} userType="driver" />
        </div>
      </div>
    );
  }

  const mockVehicle: Vehicle = currentPosition ? {
    id: driverSession!.vehicleId,
    registration: driverSession!.vehicleRegistration,
    route: driverSession!.routeId,
    lat: currentPosition.coords.latitude,
    lng: currentPosition.coords.longitude,
    lastUpdate: new Date().toISOString(),
    status: isTripActive ? 'active' : 'offline'
  } : {
    id: driverSession!.vehicleId,
    registration: driverSession!.vehicleRegistration,
    route: driverSession!.routeId,
    lat: 40.7580,
    lng: -73.9855,
    lastUpdate: new Date().toISOString(),
    status: 'offline'
  };

  return (
    <div className="min-h-screen bg-background">
      <NavigationBar />
      
      <div className="container mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Driver Info & Controls */}
          <div className="lg:col-span-1 space-y-6">
            {/* Driver Profile */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Driver Profile</span>
                  <Button variant="outline" size="sm" onClick={handleLogout}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Driver</p>
                  <p className="font-semibold">{driverSession?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Vehicle</p>
                  <p className="font-semibold">{driverSession?.vehicleRegistration}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Route</p>
                  <p className="font-semibold">{driverSession?.routeName}</p>
                </div>
              </CardContent>
            </Card>

            {/* Trip Controls */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Navigation className="w-5 h-5" />
                  <span>Trip Control</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Location Error */}
                {locationError && (
                  <Alert variant="destructive">
                    <AlertTriangle className="w-4 h-4" />
                    <AlertDescription>{locationError}</AlertDescription>
                  </Alert>
                )}

                {/* Trip Status */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {isTripActive ? (
                      <Wifi className="w-4 h-4 text-success" />
                    ) : (
                      <WifiOff className="w-4 h-4 text-muted-foreground" />
                    )}
                    <span className="text-sm font-medium">
                      {isTripActive ? 'Trip Active' : 'Trip Inactive'}
                    </span>
                  </div>
                  <Badge variant={isTripActive ? 'default' : 'secondary'}>
                    {isTripActive ? 'Live' : 'Offline'}
                  </Badge>
                </div>

                {/* Trip Duration */}
                {tripStartTime && (
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Duration: {formatDuration(tripStartTime)}
                    </span>
                  </div>
                )}

                {/* Current Location */}
                {currentPosition && (
                  <div className="text-sm">
                    <div className="flex items-center space-x-2 mb-1">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">Current Location</span>
                    </div>
                    <p className="text-muted-foreground pl-6">
                      {currentPosition.coords.latitude.toFixed(6)}, {currentPosition.coords.longitude.toFixed(6)}
                    </p>
                    <p className="text-xs text-muted-foreground pl-6">
                      Accuracy: ±{Math.round(currentPosition.coords.accuracy)}m
                    </p>
                  </div>
                )}

                {/* Controls */}
                <div className="pt-4">
                  {!isTripActive ? (
                    <Button
                      onClick={startTrip}
                      className="w-full"
                      disabled={!isLocationPermissionGranted && !locationError}
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Start Trip
                    </Button>
                  ) : (
                    <Button
                      onClick={stopTrip}
                      variant="destructive"
                      className="w-full"
                    >
                      <Square className="w-4 h-4 mr-2" />
                      End Trip
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Map */}
          <div className="lg:col-span-2">
            <Card className="h-[600px]">
              <CardContent className="p-0 h-full">
                <SimpleMapContainer
                  vehicles={[mockVehicle]}
                  routes={[]}
                  center={currentPosition ? [currentPosition.coords.latitude, currentPosition.coords.longitude] : [40.7580, -73.9855]}
                  zoom={15}
                  className="h-full rounded-lg"
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverInterface;