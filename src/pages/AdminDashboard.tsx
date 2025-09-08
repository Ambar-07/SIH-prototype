import React, { useState, useEffect } from 'react';
import NavigationBar from '@/components/NavigationBar';
import LoginForm from '@/components/LoginForm';
import MapContainer, { Vehicle, Route } from '@/components/MapContainer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3,
  Bus,
  Users,
  MapPin,
  AlertTriangle,
  TrendingUp,
  Clock,
  LogOut,
  Settings,
  Route as RouteIcon
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AdminSession {
  id: string;
  name: string;
  email: string;
  role: 'admin';
}

// Mock data
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
    lastUpdate: new Date(Date.now() - 300000).toISOString(),
    status: 'offline'
  },
  {
    id: 'bus-4',
    registration: 'NYC-2002',
    route: 'route-2',
    lat: 40.8021,
    lng: -73.9570,
    lastUpdate: new Date(Date.now() - 60000).toISOString(),
    status: 'maintenance'
  }
];

const AdminDashboard: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [adminSession, setAdminSession] = useState<AdminSession | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>(mockVehicles);
  const [selectedTab, setSelectedTab] = useState('overview');
  
  const { toast } = useToast();

  // Simulate real-time updates
  useEffect(() => {
    if (!isLoggedIn) return;

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
    }, 10000);

    return () => clearInterval(interval);
  }, [isLoggedIn]);

  const handleLogin = async (email: string, password: string) => {
    // Simulate authentication
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Check if admin credentials
    if (!email.includes('admin')) {
      throw new Error('Admin access required');
    }

    const session: AdminSession = {
      id: 'admin-1',
      name: 'Sarah Johnson',
      email,
      role: 'admin'
    };

    setAdminSession(session);
    setIsLoggedIn(true);
    toast({
      title: "Admin Access Granted",
      description: `Welcome back, ${session.name}`,
    });
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setAdminSession(null);
    toast({
      title: "Logged out",
      description: "Admin session ended",
    });
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-background">
        <NavigationBar />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-4">
          <LoginForm onLogin={handleLogin} userType="admin" />
        </div>
      </div>
    );
  }

  const activeVehicles = vehicles.filter(v => v.status === 'active');
  const offlineVehicles = vehicles.filter(v => v.status === 'offline');
  const maintenanceVehicles = vehicles.filter(v => v.status === 'maintenance');

  return (
    <div className="min-h-screen bg-background">
      <NavigationBar />
      
      <div className="container mx-auto p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Fleet Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, {adminSession?.name}</p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Bus className="w-8 h-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{vehicles.length}</p>
                  <p className="text-sm text-muted-foreground">Total Vehicles</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-8 h-8 text-success" />
                <div>
                  <p className="text-2xl font-bold">{activeVehicles.length}</p>
                  <p className="text-sm text-muted-foreground">Active Now</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-8 h-8 text-warning" />
                <div>
                  <p className="text-2xl font-bold">{offlineVehicles.length}</p>
                  <p className="text-sm text-muted-foreground">Offline</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Settings className="w-8 h-8 text-destructive" />
                <div>
                  <p className="text-2xl font-bold">{maintenanceVehicles.length}</p>
                  <p className="text-sm text-muted-foreground">Maintenance</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="overview">Live Map</TabsTrigger>
            <TabsTrigger value="vehicles">Manage Vehicles</TabsTrigger>
            <TabsTrigger value="routes">Manage Routes</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Vehicle List */}
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Vehicle Status</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {vehicles.map((vehicle) => (
                      <div key={vehicle.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div>
                          <p className="font-semibold text-sm">{vehicle.registration}</p>
                          <p className="text-xs text-muted-foreground">
                            Route: {mockRoutes.find(r => r.id === vehicle.route)?.name}
                          </p>
                        </div>
                        <Badge 
                          variant={
                            vehicle.status === 'active' ? 'default' :
                            vehicle.status === 'offline' ? 'destructive' : 'secondary'
                          }
                        >
                          {vehicle.status}
                        </Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Map */}
              <div className="lg:col-span-3">
                <Card className="h-[600px]">
                  <CardContent className="p-0 h-full">
                    <MapContainer
                      vehicles={vehicles}
                      routes={mockRoutes}
                      center={[40.7580, -73.9855]}
                      zoom={12}
                      className="h-full rounded-lg"
                    />
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="vehicles">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bus className="w-5 h-5" />
                  <span>Vehicle Management</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Bus className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Vehicle Management</h3>
                  <p className="text-muted-foreground mb-6">
                    Add, edit, and manage your fleet vehicles. Monitor driver assignments and vehicle status.
                  </p>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Features to implement:</p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Add/Remove vehicles</li>
                      <li>• Assign drivers to vehicles</li>
                      <li>• Vehicle maintenance scheduling</li>
                      <li>• Fuel tracking and reports</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="routes">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <RouteIcon className="w-5 h-5" />
                  <span>Route Management</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <MapPin className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Route Management</h3>
                  <p className="text-muted-foreground mb-6">
                    Create and manage bus routes. Define stops, schedules, and optimize routes for efficiency.
                  </p>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Features to implement:</p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Create/Edit routes</li>
                      <li>• Add/Remove bus stops</li>
                      <li>• Schedule management</li>
                      <li>• Route optimization</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5" />
                  <span>Analytics & Reports</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <BarChart3 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Analytics Dashboard</h3>
                  <p className="text-muted-foreground mb-6">
                    Monitor fleet performance, passenger analytics, and operational insights.
                  </p>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Reports available:</p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Fleet utilization rates</li>
                      <li>• Route performance metrics</li>
                      <li>• Passenger volume analytics</li>
                      <li>• Operational cost reports</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;