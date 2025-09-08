import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Bus, MapPin, Shield, Menu } from 'lucide-react';

interface NavigationBarProps {
  className?: string;
}

const NavigationBar: React.FC<NavigationBarProps> = ({ className = "" }) => {
  const location = useLocation();

  const navItems = [
    {
      path: '/',
      label: 'Live Tracking',
      icon: MapPin,
      description: 'Track vehicles in real-time'
    },
    {
      path: '/driver',
      label: 'Driver Portal',
      icon: Bus,
      description: 'Driver interface'
    },
    {
      path: '/admin',
      label: 'Admin Dashboard',
      icon: Shield,
      description: 'Fleet management'
    }
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className={`bg-card border-b border-border ${className}`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Bus className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">TransitTracker</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.path} to={item.path}>
                  <Button 
                    variant={isActive(item.path) ? "default" : "ghost"}
                    className="flex items-center space-x-2"
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Button>
                </Link>
              );
            })}
          </div>

          {/* Mobile Navigation Button */}
          <Button variant="ghost" size="sm" className="md:hidden">
            <Menu className="w-5 h-5" />
          </Button>
        </div>

        {/* Mobile Navigation Menu */}
        <div className="md:hidden pb-4">
          <div className="grid gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.path} to={item.path}>
                  <Button 
                    variant={isActive(item.path) ? "default" : "ghost"}
                    className="w-full justify-start space-x-2"
                  >
                    <Icon className="w-4 h-4" />
                    <div className="flex flex-col items-start">
                      <span>{item.label}</span>
                      <span className="text-xs text-muted-foreground">{item.description}</span>
                    </div>
                  </Button>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavigationBar;