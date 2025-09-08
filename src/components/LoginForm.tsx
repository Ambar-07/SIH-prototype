import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, User, Lock } from 'lucide-react';

interface LoginFormProps {
  onLogin: (email: string, password: string) => Promise<void>;
  userType: 'driver' | 'admin';
  className?: string;
}

const LoginForm: React.FC<LoginFormProps> = ({
  onLogin,
  userType,
  className = ""
}) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await onLogin(formData.email, formData.password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: 'email' | 'password') => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
    // Clear error when user starts typing
    if (error) setError(null);
  };

  return (
    <Card className={`w-full max-w-md ${className}`}>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">
          {userType === 'driver' ? 'Driver Login' : 'Admin Login'}
        </CardTitle>
        <p className="text-muted-foreground">
          {userType === 'driver' 
            ? 'Access your driver dashboard' 
            : 'Access fleet management'
          }
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleInputChange('email')}
                className="pl-10"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleInputChange('password')}
                className="pl-10"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || !formData.email || !formData.password}
          >
            {isLoading && <Loader2 className="mr-2 w-4 h-4 animate-spin" />}
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        {/* Demo Credentials Info */}
        <div className="mt-6 p-4 bg-muted rounded-lg">
          <p className="text-sm font-medium text-muted-foreground mb-2">Demo Credentials:</p>
          <div className="space-y-1 text-sm">
            {userType === 'driver' ? (
              <>
                <p><strong>Email:</strong> driver@example.com</p>
                <p><strong>Password:</strong> driver123</p>
              </>
            ) : (
              <>
                <p><strong>Email:</strong> admin@example.com</p>
                <p><strong>Password:</strong> admin123</p>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LoginForm;